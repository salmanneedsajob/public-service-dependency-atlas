import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { lintLedger } from './pre-audit-lint.mjs';
import { score } from './score.mjs';

const projectRoot = process.cwd();
const columns = ['cost', 'documents', 'eligibility', 'time', 'owner', 'after-submission'];

async function readJson(file) {
  return JSON.parse(await readFile(file, 'utf8'));
}

function formatErrors(errors = []) {
  return errors.map((error) => `${error.instancePath || '/'} ${error.message}`).join('; ');
}

function validateManifest(manifest) {
  if (!manifest || manifest.version !== 1 || !Array.isArray(manifest.entries)) throw new Error('Manifest must be {"version":1,"entries":[...]}.');
  const required = ['jurisdictionSlug', 'jurisdiction', 'serviceId', 'primaryScenarioId', 'ledgerFile', 'expectationsFile', 'auditFile', 'mode'];
  const seen = new Set();
  for (const entry of manifest.entries) {
    if (!entry || typeof entry !== 'object') throw new Error('Manifest entries must be objects.');
    for (const field of required) if (typeof entry[field] !== 'string' || !entry[field]) throw new Error(`Manifest entry is missing ${field}.`);
    if (!/^[a-z][a-z0-9-]*$/.test(entry.jurisdictionSlug)) throw new Error(`Invalid jurisdiction slug ${entry.jurisdictionSlug}.`);
    if (entry.mode !== 'grid-only') throw new Error(`${entry.jurisdictionSlug}/${entry.serviceId} must use mode grid-only.`);
    if (!/^[^,]+, [^,]+, India$/.test(entry.jurisdiction)) throw new Error(`${entry.jurisdictionSlug}/${entry.serviceId} jurisdiction must be "City, State, India".`);
    const key = `${entry.jurisdictionSlug}\u0000${entry.serviceId}`;
    if (seen.has(key)) throw new Error(`Duplicate manifest entry ${entry.jurisdictionSlug}/${entry.serviceId}.`);
    seen.add(key);
  }
}

function resolveEntryPath(manifestDirectory, value) {
  const root = /^(?:ledger|public)\//.test(value) ? projectRoot : manifestDirectory;
  const resolved = path.resolve(root, value);
  if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`)) throw new Error(`Manifest path escapes its directory: ${value}`);
  return resolved;
}

async function validateEntry(entry, manifestDirectory, validators) {
  const ledgerPath = resolveEntryPath(manifestDirectory, entry.ledgerFile);
  const expectationsPath = resolveEntryPath(manifestDirectory, entry.expectationsFile);
  const auditPath = resolveEntryPath(manifestDirectory, entry.auditFile);
  const correctionsPath = auditPath.replace(/\.md$/, '.corrections.json');
  const [ledger, expectations, corrections] = await Promise.all([readJson(ledgerPath), readJson(expectationsPath), readJson(correctionsPath)]);
  await access(auditPath);
  if (!validators.ledger(ledger)) throw new Error(`ledger schema: ${formatErrors(validators.ledger.errors)}`);
  if (!validators.expectations(expectations)) throw new Error(`expectations schema: ${formatErrors(validators.expectations.errors)}`);
  if (!validators.corrections(corrections)) throw new Error(`corrections schema: ${formatErrors(validators.corrections.errors)}`);
  if (ledger.meta.jurisdiction !== entry.jurisdiction) throw new Error(`ledger jurisdiction is ${ledger.meta.jurisdiction}, not ${entry.jurisdiction}.`);
  if (expectations.serviceId !== entry.serviceId) throw new Error(`expectations serviceId is ${expectations.serviceId}, not ${entry.serviceId}.`);
  if (expectations.primaryScenarioId !== entry.primaryScenarioId) throw new Error(`expectations primaryScenarioId is ${expectations.primaryScenarioId}, not ${entry.primaryScenarioId}.`);
  if (!ledger.scenarios.some((scenario) => scenario.id === entry.primaryScenarioId)) throw new Error(`ledger does not contain primary scenario ${entry.primaryScenarioId}.`);
  const claimIds = new Set(ledger.claims.map((claim) => claim.id));
  for (const column of columns) for (const claimId of expectations.cells[column].claimIds) if (!claimIds.has(claimId)) throw new Error(`${column} references unknown claim ${claimId}.`);
  const lint = lintLedger(ledger, { id: entry.serviceId, primaryScenarioId: entry.primaryScenarioId, branchScenarioIds: [] }, { lintWaivers: entry.lintWaivers ?? [] });
  const scorecard = score({ ledger, expectations, jurisdiction: entry.jurisdiction, source: 'authored', auditFile: entry.auditFile, schema: validators.scorecardSchema });
  if (!validators.scorecard(scorecard)) throw new Error(`scorecard schema: ${formatErrors(validators.scorecard.errors)}`);
  return { lint, scorecard };
}

async function createValidators() {
  const schemaDirectory = path.join(projectRoot, 'benchmark/schemas');
  const [ledger, expectations, corrections, scorecard] = await Promise.all(['ledger.json', 'expectations.json', 'corrections.json', 'scorecard.json'].map((name) => readJson(path.join(schemaDirectory, name))));
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  return { ledger: ajv.compile(ledger), expectations: ajv.compile(expectations), corrections: ajv.compile(corrections), scorecard: ajv.compile(scorecard), scorecardSchema: scorecard };
}

async function runSelfTest(validators) {
  const fixtureDirectory = path.join(projectRoot, 'benchmark/templates');
  const [ledger, expectations] = await Promise.all([readJson(path.join(fixtureDirectory, 'grid-only-ledger.json')), readJson(path.join(fixtureDirectory, 'grid-only-expectations.json'))]);
  if (!validators.ledger(ledger)) throw new Error(`fixture ledger schema: ${formatErrors(validators.ledger.errors)}`);
  if (!validators.expectations(expectations)) throw new Error(`fixture expectations schema: ${formatErrors(validators.expectations.errors)}`);
  if (!validators.corrections([])) throw new Error(`empty corrections schema: ${formatErrors(validators.corrections.errors)}`);
  const lint = lintLedger(ledger, { id: expectations.serviceId, primaryScenarioId: expectations.primaryScenarioId, branchScenarioIds: [] });
  if (lint.unwaived.length) throw new Error(`fixture pre-audit lint: ${lint.unwaived.map((finding) => finding.check).join(', ')}`);
  const waivedLedger = structuredClone(ledger);
  waivedLedger.claims[0].text = 'The fictional fee schedule lists a certificate fee; the counter route accepts the application.';
  const waived = lintLedger(waivedLedger, {
    id: expectations.serviceId,
    primaryScenarioId: expectations.primaryScenarioId,
    branchScenarioIds: [],
  }, {
    lintWaivers: [{ recordId: 'claim_example_fee', check: 'compound-claim', reason: 'Fixture covers a waiver for a regex-detected compound sentence.' }],
  });
  if (!waived.findings.some((finding) => finding.recordId === 'claim_example_fee' && finding.check === 'compound-claim' && finding.waived)) throw new Error('Fixture lint waiver self-test failed.');
  if (resolveEntryPath(fixtureDirectory, 'ledger/jurisdictions/manifest.json') !== path.join(projectRoot, 'ledger/jurisdictions/manifest.json')) throw new Error('Fixture repo-relative path self-test failed.');
  const scorecard = score({ ledger, expectations, jurisdiction: ledger.meta.jurisdiction, source: 'authored', auditFile: 'audits/birth-certificate.md', schema: validators.scorecardSchema });
  if (!validators.scorecard(scorecard)) throw new Error(`fixture scorecard schema: ${formatErrors(validators.scorecard.errors)}`);
  console.log(`Grid-only fixture self-test passed: ${scorecard.statedCount}/6 stated.`);
}

async function main() {
  const args = process.argv.slice(2);
  const validators = await createValidators();
  if (args[0] === '--self-test') return runSelfTest(validators);
  const manifestPath = args[0];
  const slugIndex = args.indexOf('--slug');
  const slug = slugIndex === -1 ? null : args[slugIndex + 1];
  if (!manifestPath || (slugIndex !== -1 && !slug)) throw new Error('Usage: node benchmark/scripts/validate-jurisdiction.mjs <manifest.json> [--slug <slug>] | --self-test');
  const manifest = await readJson(manifestPath);
  validateManifest(manifest);
  const entries = slug ? manifest.entries.filter((entry) => entry.jurisdictionSlug === slug) : manifest.entries;
  if (slug && !entries.length) throw new Error(`No manifest entries for slug ${slug}.`);
  const manifestDirectory = path.dirname(path.resolve(manifestPath));
  let failed = false;
  for (const entry of entries) {
    const label = `${entry.jurisdictionSlug}/${entry.serviceId}`;
    try {
      const { lint, scorecard } = await validateEntry(entry, manifestDirectory, validators);
      if (lint.unwaived.length) throw new Error(`pre-audit lint: ${lint.unwaived[0].recordId} ${lint.unwaived[0].check}`);
      const waived = lint.findings.filter((finding) => finding.waived);
      console.log(`${label}: ${scorecard.statedCount}/6 stated${waived.length ? `; waived: ${waived.map((finding) => `${finding.recordId} ${finding.check}`).join(', ')}` : ''}`);
    } catch (error) {
      failed = true;
      console.log(`${label}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  if (failed) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) await main();

export { validateEntry, validateManifest };
