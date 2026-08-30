import { readFile, readdir } from 'node:fs/promises';
import { deriveServiceMappingSummary, deriveServiceStatus } from '../lib/service-status.ts';

const ignoredLedgers = new Set(['demo.synthetic.json', 'example.json', 'schema.json']);
const ledgerFiles = (await readdir('ledger')).filter((file) => file.endsWith('.json') && !ignoredLedgers.has(file));
const errors = [];
const statusCounts = { Mapped: 0, 'Partially mapped': 0 };
const researchFields = ['checks', 'failureSignals', 'recoveries'];

function expectedStatus(ledger) {
  const defaultScenario = ledger.scenarios[0];
  if (!defaultScenario || defaultScenario.pathNodeIds.length === 0) return 'Partially mapped';

  const nodes = defaultScenario.pathNodeIds.map((id) => ledger.nodes.find((node) => node.id === id));
  const nodesAreResearched = nodes.every((node) => node
    && researchFields.every((field) =>
      node[field].length > 0 || node.researchedNoSourceFound?.includes(field),
    ));
  const handoffsAreSourced = defaultScenario.pathNodeIds.slice(1).every((toNodeId, index) => {
    const edge = ledger.edges.find((candidate) => candidate.scenarioIds.includes(defaultScenario.id)
      && candidate.fromNodeId === defaultScenario.pathNodeIds[index]
      && candidate.toNodeId === toNodeId);
    return edge && edge.claimIds.length > 0;
  });

  return nodesAreResearched && handoffsAreSourced ? 'Mapped' : 'Partially mapped';
}

for (const file of ledgerFiles) {
  const ledger = JSON.parse(await readFile(`ledger/${file}`, 'utf8'));
  const expected = expectedStatus(ledger);
  const derived = deriveServiceStatus(ledger);
  const summary = deriveServiceMappingSummary(ledger);
  const defaultPathNodes = (ledger.scenarios[0]?.pathNodeIds ?? []).map((id) => ledger.nodes.find((node) => node.id === id));
  const expectedFullyDocumented = defaultPathNodes.filter((node) => node
    && researchFields.every((field) =>
      node[field].length > 0 || node.researchedNoSourceFound?.includes(field),
    )).length;
  const expectedUnknown = defaultPathNodes.filter((node) => node?.status === 'unknown').length;
  if (derived !== expected) errors.push(`${file}: expected ${expected}, got ${derived}.`);
  if (summary.status !== derived) errors.push(`${file}: summary status and status helper disagree.`);
  if (summary.totalRecords !== ledger.scenarios[0]?.pathNodeIds.length) errors.push(`${file}: summary total must equal default-route records.`);
  if (summary.fullyDocumentedRecords !== expectedFullyDocumented) errors.push(`${file}: summary fully documented count is incorrect.`);
  if (summary.unknownRecords !== expectedUnknown) errors.push(`${file}: summary Unknown count is incorrect.`);
  statusCounts[derived] += 1;
  if (/\b(?:mapped|unmapped)\b/i.test(ledger.meta.title)) errors.push(`${file}: meta.title must be neutral about mapping status.`);
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
if (!directory.includes('directory-status-rule')) errors.push('Directory must explain what earns Mapped.');
if (!directory.includes('fullyDocumentedRecords') || !entry.includes('deriveServiceMappingSummary(ledger)')) errors.push('Directory cards and entry pages must show the derived completeness summary.');
if (!explorerData.includes('status: service.status') || !explorer.includes('folder.status')) errors.push('Filing cabinet folders must receive and show the derived service status.');

if (errors.length) throw new Error(`Service-status check failed:\n${errors.join('\n')}`);
console.log(`Service status verified: ${ledgerFiles.length} ledgers derive from their default route; ${statusCounts.Mapped} Mapped, ${statusCounts['Partially mapped']} Partially mapped.`);
