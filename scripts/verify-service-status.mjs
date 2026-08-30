import { readFile, readdir } from 'node:fs/promises';
import { deriveServiceMappingSummary, deriveServiceStatus } from '../lib/service-status.ts';

const ignoredLedgers = new Set(['demo.synthetic.json', 'example.json', 'schema.json']);
const ledgerFiles = (await readdir('ledger')).filter((file) => file.endsWith('.json') && !ignoredLedgers.has(file));
const errors = [];
const statusCounts = { Mapped: 0, 'Partially mapped': 0 };
const researchFields = ['checks', 'failureSignals', 'recoveries'];

function expectedScenario(ledger, scenario) {
  const nodes = scenario.pathNodeIds.map((id) => ledger.nodes.find((node) => node.id === id));
  const fullyDocumentedRecords = nodes.filter((node) => node
    && researchFields.every((field) => node[field].length > 0 || node.researchedNoSourceFound?.includes(field))).length;
  const unknownRecords = nodes.filter((node) => node?.status === 'unknown').length;
  const handoffsAreSourced = scenario.pathNodeIds.slice(1).every((toNodeId, index) => {
    const edge = ledger.edges.find((candidate) => candidate.scenarioIds.includes(scenario.id)
      && candidate.fromNodeId === scenario.pathNodeIds[index]
      && candidate.toNodeId === toNodeId);
    return edge && edge.claimIds.length > 0;
  });
  return {
    fullyDocumentedRecords,
    totalRecords: nodes.length,
    unknownRecords,
    status: nodes.length > 0 && fullyDocumentedRecords === nodes.length && handoffsAreSourced ? 'Mapped' : 'Partially mapped',
  };
}

for (const file of ledgerFiles) {
  const ledger = JSON.parse(await readFile('ledger/' + file, 'utf8'));
  const summary = deriveServiceMappingSummary(ledger);
  const expectedScenarios = ledger.scenarios.map((scenario) => expectedScenario(ledger, scenario));
  const expectedStatus = expectedScenarios.length > 0 && expectedScenarios.every((scenario) => scenario.status === 'Mapped')
    ? 'Mapped'
    : 'Partially mapped';

  if (deriveServiceStatus(ledger) !== expectedStatus) errors.push(file + ': expected service status ' + expectedStatus + '.');
  if (summary.status !== expectedStatus) errors.push(file + ': summary status is not derived from every scenario.');
  if (summary.totalScenarios !== ledger.scenarios.length) errors.push(file + ': total scenarios is incorrect.');
  if (summary.fullyResearchedScenarios !== expectedScenarios.filter((scenario) => scenario.status === 'Mapped').length) errors.push(file + ': fully researched scenario count is incorrect.');
  for (const [index, scenario] of expectedScenarios.entries()) {
    const actual = summary.scenarioSummaries.find((item) => item.scenarioId === ledger.scenarios[index].id);
    if (!actual) errors.push(file + ': scenario summary is missing.');
    else if (actual.fullyDocumentedRecords !== scenario.fullyDocumentedRecords || actual.totalRecords !== scenario.totalRecords || actual.unknownRecords !== scenario.unknownRecords || actual.status !== scenario.status) {
      errors.push(file + ': scenario summary is incorrect.');
    }
  }
  statusCounts[expectedStatus] += 1;
  if (/\b(?:mapped|unmapped)\b/i.test(ledger.meta.title)) errors.push(file + ': meta.title must be neutral about mapping status.');
}

const [atlasData, directory, entry, explorerData, explorer] = await Promise.all([
  readFile('lib/atlas-data.ts', 'utf8'),
  readFile('app/page.tsx', 'utf8'),
  readFile('components/LedgerEntry.tsx', 'utf8'),
  readFile('lib/explorer-data.ts', 'utf8'),
  readFile('components/ExplorerMode.tsx', 'utf8'),
]);
if (/status:\s*['"][^'"]+['"]/.test(atlasData)) errors.push('Atlas services must not contain a handwritten status value.');
if (!atlasData.includes('deriveServiceMappingSummary(service.ledger)') || !atlasData.includes('status: mappingSummary.status')) errors.push('Atlas services must derive their status from each ledger.');
if (!directory.includes('fullyResearchedScenarios') || !entry.includes('scenarioSummaries')) errors.push('Directory and entry pages must show route-aware completeness.');
if (!explorerData.includes('status: service.status') || !explorer.includes('folder.status')) errors.push('Filing cabinet folders must receive and show the derived service status.');

if (errors.length) throw new Error('Service-status check failed:\n' + errors.join('\n'));
console.log('Service status verified: ' + ledgerFiles.length + ' ledgers derive from every scenario; ' + statusCounts.Mapped + ' Mapped, ' + statusCounts['Partially mapped'] + ' Partially mapped.');
