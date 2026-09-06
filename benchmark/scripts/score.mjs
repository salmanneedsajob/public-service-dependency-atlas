import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

const columns = ['cost', 'documents', 'eligibility', 'time', 'owner', 'after-submission'];
const loginPattern = /\b(?:log(?:ged)?[- ]?in|login|sign[- ]?in|OTP|authenticat\w*|credentials?|password|CAPTCHA|user\s*ID)\b/i;

async function readJson(file) {
  return JSON.parse(await readFile(file, 'utf8'));
}

function isLoginRelated(claim, nodesById, sourcesById) {
  if (loginPattern.test(claim.text ?? '')) return true;
  if ((claim.nodeIds ?? []).some((id) => loginPattern.test(nodesById.get(id)?.requiredState ?? ''))) return true;
  const sources = (claim.sourceIds ?? []).map((id) => sourcesById.get(id)).filter(Boolean);
  return sources.length > 0 && sources.every((source) => loginPattern.test(`${source.title ?? ''} ${source.notes ?? ''}`));
}

function portalFriction(portals) {
  if (!portals) return null;
  const routes = portals.portals.flatMap((portal) => portal.routeObservations ?? []);
  const checked = routes.reduce((total, route) => total + (route.checkedLinkCount ?? 0), 0);
  const dead = routes.reduce((total, route) => total + (route.deadLinkCount ?? 0), 0);
  const portalText = portals.portals.flatMap((portal) => [portal.visibleVersionOrLastUpdated, ...(portal.routeObservations ?? []).flatMap((route) => [route.captchaDependencies, route.javascriptDependencies, route.publicProcedureVsCaseDataBoundary])]).join(' ');
  const languages = [...new Set(portals.portals.flatMap((portal) => portal.languages ?? []))].sort();
  return {
    deadLinkRate: checked ? dead / checked : 0,
    undated: portals.portals.some((portal) => !/\b(?:last[- ]updated|updated|dated|20\d{2})\b/i.test(portal.visibleVersionOrLastUpdated ?? '')),
    captcha: /\bCAPTCHA\b/i.test(portalText) && !/\bno CAPTCHA\b/i.test(portalText),
    jsOnly: /\b(?:javascript|required script|js-only)\b/i.test(portalText),
    appOnly: /\b(?:app-only|mobile app only|application only)\b/i.test(portalText),
    languages,
  };
}

function validateScorecard(scorecard, schema) {
  const expected = ['serviceId', 'jurisdiction', 'primaryScenarioId', 'asOf', 'cells', 'statedCount', 'loginStrippedUnknownShare', 'portalFriction', 'auditFile', 'benchmarkVersion', 'source'];
  const keys = Object.keys(scorecard).sort();
  if (JSON.stringify(keys) !== JSON.stringify([...expected].sort())) throw new Error('Scorecard does not match the schema field set.');
  if (scorecard.benchmarkVersion !== schema.properties.benchmarkVersion.const) throw new Error('Scorecard benchmarkVersion is invalid.');
  if (!['authored', 'reviewed-regex'].includes(scorecard.source)) throw new Error('Scorecard source is invalid.');
  if (!Number.isInteger(scorecard.statedCount) || scorecard.statedCount < 0 || scorecard.statedCount > 6) throw new Error('Scorecard statedCount is invalid.');
  if (typeof scorecard.loginStrippedUnknownShare !== 'number' || scorecard.loginStrippedUnknownShare < 0 || scorecard.loginStrippedUnknownShare > 1) throw new Error('Scorecard loginStrippedUnknownShare is invalid.');
  for (const column of columns) {
    const cell = scorecard.cells[column];
    if (!cell || !['stated', 'mentioned', 'absent'].includes(cell.state) || !Number.isInteger(cell.claimCount) || cell.claimCount < 0) throw new Error(`Scorecard cell ${column} is invalid.`);
  }
}

function score({ ledger, expectations, portals = null, jurisdiction, source = 'authored', auditFile = null, schema }) {
  const nodesById = new Map(ledger.nodes.map((node) => [node.id, node]));
  const sourcesById = new Map(ledger.sources.map((entry) => [entry.id, entry]));
  const unknown = ledger.claims.filter((claim) => claim.evidenceGrade === 'Unknown');
  const loginRelated = unknown.filter((claim) => isLoginRelated(claim, nodesById, sourcesById));
  const cells = Object.fromEntries(columns.map((column) => [column, {
    state: expectations.cells[column].state,
    claimCount: expectations.cells[column].claimIds.length,
  }]));
  const scorecard = {
    serviceId: expectations.serviceId,
    jurisdiction,
    primaryScenarioId: expectations.primaryScenarioId,
    asOf: ledger.meta.asOf,
    cells,
    statedCount: Object.values(cells).filter((cell) => cell.state === 'stated').length,
    loginStrippedUnknownShare: unknown.length ? (unknown.length - loginRelated.length) / unknown.length : 0,
    portalFriction: portalFriction(portals),
    auditFile,
    benchmarkVersion: '0.1',
    source,
  };
  validateScorecard(scorecard, schema);
  return scorecard;
}

function parseArgs(args) {
  if (args[0] === '--self-test') return { selfTest: true };
  const [ledgerPath, expectationsPath] = args;
  if (!ledgerPath || !expectationsPath) throw new Error('Usage: node benchmark/scripts/score.mjs <ledger.json> <expectations.json> [--portals <portals.json>] [--jurisdiction <string>]');
  const value = (flag) => {
    const index = args.indexOf(flag);
    return index === -1 ? null : args[index + 1] ?? null;
  };
  return { ledgerPath, expectationsPath, portalsPath: value('--portals'), jurisdiction: value('--jurisdiction'), source: value('--source') ?? 'authored', auditFile: value('--audit-file') };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.selfTest) {
    const schema = await readJson(new URL('../schemas/scorecard.json', import.meta.url));
    const fixture = { meta: { asOf: '2026-01-01' }, sources: [], nodes: [], claims: [{ evidenceGrade: 'Unknown', text: 'Login is required.', nodeIds: [], sourceIds: [] }] };
    const expectations = { serviceId: 'sample', primaryScenarioId: 'scenario_sample', cells: Object.fromEntries(columns.map((column) => [column, { state: column === 'cost' ? 'stated' : 'absent', claimIds: [] }])) };
    const result = score({ ledger: fixture, expectations, jurisdiction: 'Example', schema });
    if (result.statedCount !== 1 || result.loginStrippedUnknownShare !== 0) throw new Error('Score self-test failed.');
    console.log('Benchmark score self-test verified.');
    return;
  }
  if (!args.jurisdiction) throw new Error('--jurisdiction is required.');
  const [ledger, expectations, schema, portals] = await Promise.all([
    readJson(args.ledgerPath), readJson(args.expectationsPath), readJson(new URL('../schemas/scorecard.json', import.meta.url)), args.portalsPath ? readJson(args.portalsPath) : Promise.resolve(null),
  ]);
  console.log(JSON.stringify(score({ ledger, expectations, portals, jurisdiction: args.jurisdiction, source: args.source, auditFile: args.auditFile, schema }), null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) await main();

export { columns, score, validateScorecard };
