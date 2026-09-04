import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const protocolChecks = [
  'compound-claim',
  'duplicate-source',
  'grade-b-secondary',
  'grade-c-observed-form',
  'source-date-quality',
  'login-boundary-overclaim',
  'declared-scenario',
  'researched-no-source-route',
];

const visibleDateNote = /\b(?:visible[- ]date|published(?: on)?|dated|last[- ]updated)\b/i;
const datedOrArchived = /\b(?:stale|undated|outdated|archiv(?:e|ed))\b/i;
const limitation = /\b(?:limitation|not current|may be outdated|historical only)\b/i;
const archiveFailure = /\b(?:archive|wayback|internet archive)[^.]{0,80}\b(?:failed|failure|timed out|rejected|unsafe|http \d{3}|did not complete)\b/i;
const uncertainty = /\b(?:unknown|unclear|unobserved|not (?:publicly |fully )?(?:shown|known|verified|observed|established|attempted|opened|selected|entered)|not an? (?:observed|verified) (?:result|failure|outcome|signal)|cannot (?:be )?(?:checked|observed|verified)|outside (?:this )?scope|without (?:a )?(?:login|sign-in|authentication)|no (?:login|account|case data|personal data)[^.]{0,80}(?:was|were) (?:used|entered|requested)|no [^.]{0,80}case-specific (?:selection|determination)[^.]{0,80}(?:was|were) attempted|no [^.]{0,80}(?:was|were) selected)\b/i;
const loginBoundary = /\b(?:log ?in|sign ?in|authenticated|OTP|case[- ]specific|personal (?:data|account))\b/i;
const compoundList = /\b(?:documents?|proofs?|requirements?|includes?|requires?)\b[^.]{0,120},[^.]{0,120}(?:,|\band\b|\bor\b)/i;

function findService(manifest, ledgerPath, explicitService) {
  if (explicitService) return manifest.services.find((service) => service.id === explicitService);
  const basename = path.basename(ledgerPath);
  return manifest.services.find((service) => service.ledgerFile === basename);
}

function lintLedger(ledger, service, handoff = {}) {
  const findings = [];
  const add = (check, recordId, message) => findings.push({ check, recordId, message });
  const sourcesById = new Map(ledger.sources.map((source) => [source.id, source]));

  for (const claim of ledger.claims) {
    if (compoundList.test(claim.text)) add('compound-claim', claim.id, 'Claim appears to list multiple requirements; split it into atomic claims.');
    const sources = claim.sourceIds.map((id) => sourcesById.get(id)).filter(Boolean);
    if (claim.evidenceGrade === 'B' && sources.some((source) => source.type === 'secondary')) add('grade-b-secondary', claim.id, 'Grade B claim cites a secondary source.');
    if (claim.evidenceGrade === 'C' && claim.basis === 'observation' && sources.some((source) => source.type === 'official_form' && !datedOrArchived.test(source.notes ?? ''))) add('grade-c-observed-form', claim.id, 'Observed current official form must be Grade B, not C.');
    if (service) {
      const declared = new Set([service.primaryScenarioId, ...service.branchScenarioIds]);
      const unknown = claim.scenarioIds.filter((id) => !declared.has(id));
      if (unknown.length) add('declared-scenario', claim.id, `Claim uses undeclared scenario IDs: ${unknown.join(', ')}.`);
    }
    if (loginBoundary.test(`${claim.text} ${claim.notes ?? ''}`) && claim.status !== 'unknown' && !uncertainty.test(`${claim.text} ${claim.notes ?? ''}`)) add('login-boundary-overclaim', claim.id, 'Claim crosses a login or case-data boundary without recording uncertainty.');
  }

  const duplicateKeys = new Map();
  for (const source of ledger.sources) {
    const key = `${source.url}\u0000${source.accessedAt}`;
    const previous = duplicateKeys.get(key);
    if (previous) add('duplicate-source', source.id, `Duplicates ${previous} by URL and access date.`);
    else duplicateKeys.set(key, source.id);
    const notes = source.notes ?? '';
    if (!source.publishedAt && !visibleDateNote.test(notes)) add('source-date-quality', source.id, 'Source lacks publishedAt and a visible-date note.');
    if (datedOrArchived.test(notes) && !limitation.test(notes) && !archiveFailure.test(notes)) add('source-date-quality', source.id, 'Stale, undated, or archived source lacks a stated limitation.');
  }

  const searches = handoff.routeSearches ?? [];
  for (const node of ledger.nodes) {
    for (const field of node.researchedNoSourceFound ?? []) {
      const routeSearch = searches.find((search) => search.nodeId === node.id && search.field === field && (search.routeId || search.url) && search.searchNote);
      if (!routeSearch) add('researched-no-source-route', node.id, `${field} has researchedNoSourceFound without a matching documented public-route search.`);
    }
  }

  for (const scenario of ledger.scenarios) {
    if (!service) continue;
    const declared = new Set([service.primaryScenarioId, ...service.branchScenarioIds]);
    if (!declared.has(scenario.id)) add('declared-scenario', scenario.id, `Scenario is not declared for ${service.id} in the manifest.`);
  }

  const waivers = handoff.lintWaivers ?? [];
  const annotated = findings.map((finding) => {
    const waiver = waivers.find((item) => item.recordId === finding.recordId && item.check === finding.check && item.reason?.trim());
    return waiver ? { ...finding, waived: true, waiverReason: waiver.reason } : { ...finding, waived: false };
  });
  return { checks: protocolChecks, findings: annotated, unwaived: annotated.filter((finding) => !finding.waived) };
}

async function readJson(file) {
  return JSON.parse(await readFile(file, 'utf8'));
}

async function runSelfTest() {
  const manifest = { services: [{ id: 'sample', ledgerFile: 'sample.json', primaryScenarioId: 'scenario_primary', branchScenarioIds: [] }] };
  const ledger = {
    sources: [{ id: 'source_sample', url: 'https://example.test/a', accessedAt: '2026-09-04', type: 'secondary', notes: 'Visible date: 2026-09-04.' }],
    claims: [{ id: 'claim_sample', text: 'The route requires identity proof, address proof, and a photo.', sourceIds: ['source_sample'], evidenceGrade: 'B', basis: 'observation', status: 'verified', scenarioIds: ['scenario_primary'], notes: '' }],
    nodes: [],
    scenarios: [{ id: 'scenario_primary' }],
  };
  const result = lintLedger(ledger, manifest.services[0]);
  if (!result.unwaived.some((finding) => finding.check === 'compound-claim') || !result.unwaived.some((finding) => finding.check === 'grade-b-secondary')) throw new Error('Pre-audit lint self-test did not detect required findings.');
  console.log('Pre-audit lint self-test verified.');
}

const args = process.argv.slice(2);
if (args[0] === '--self-test') await runSelfTest();
else {
  const [ledgerPath] = args;
  const serviceIndex = args.indexOf('--service');
  const handoffIndex = args.indexOf('--handoff');
  if (!ledgerPath) throw new Error('Usage: node scripts/pre-audit-lint.mjs <ledger.json> [--service <serviceId>] [--handoff <handoff.json>]');
  const [manifest, ledger, handoff] = await Promise.all([
    readJson('ledger/services.manifest.json'),
    readJson(ledgerPath),
    handoffIndex === -1 ? Promise.resolve({}) : readJson(args[handoffIndex + 1]),
  ]);
  const service = findService(manifest, ledgerPath, serviceIndex === -1 ? undefined : args[serviceIndex + 1]);
  if (!service) throw new Error(`No manifest service matches ${ledgerPath}; pass --service to select one.`);
  const result = lintLedger(ledger, service, handoff);
  console.log(JSON.stringify({ serviceId: service.id, ...result }, null, 2));
  if (result.unwaived.length) process.exitCode = 1;
}

export { lintLedger };
