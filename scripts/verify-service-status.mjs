import { readFile, readdir } from 'node:fs/promises';
import { deriveServiceStatus } from '../lib/service-status.ts';

const ignoredLedgers = new Set(['demo.synthetic.json', 'example.json', 'schema.json']);
const ledgerFiles = (await readdir('ledger')).filter((file) => file.endsWith('.json') && !ignoredLedgers.has(file));
const errors = [];
const statusCounts = { Mapped: 0, 'Partially mapped': 0 };

function expectedStatus(ledger) {
  const defaultScenario = ledger.scenarios[0];
  if (!defaultScenario || defaultScenario.pathNodeIds.length === 0) return 'Partially mapped';

  const nodes = defaultScenario.pathNodeIds.map((id) => ledger.nodes.find((node) => node.id === id));
  const nodesAreActionable = nodes.every((node) => node
    && node.status !== 'unknown'
    && node.checks.length > 0
    && node.failureSignals.length > 0
    && node.recoveries.length > 0);
  const handoffsAreSourced = defaultScenario.pathNodeIds.slice(1).every((toNodeId, index) => {
    const edge = ledger.edges.find((candidate) => candidate.scenarioIds.includes(defaultScenario.id)
      && candidate.fromNodeId === defaultScenario.pathNodeIds[index]
      && candidate.toNodeId === toNodeId);
    return edge && edge.claimIds.length > 0;
  });

  return nodesAreActionable && handoffsAreSourced ? 'Mapped' : 'Partially mapped';
}

for (const file of ledgerFiles) {
  const ledger = JSON.parse(await readFile(`ledger/${file}`, 'utf8'));
  const expected = expectedStatus(ledger);
  const derived = deriveServiceStatus(ledger);
  if (derived !== expected) errors.push(`${file}: expected ${expected}, got ${derived}.`);
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
if (!atlasData.includes('status: deriveServiceStatus(service.ledger)')) errors.push('Atlas services must derive their status from each ledger.');
if (!directory.includes('directory-status-rule')) errors.push('Directory must explain what earns Mapped.');
if (!entry.includes('deriveServiceStatus(ledger)')) errors.push('Entry pages must derive and show their service status.');
if (!explorerData.includes('status: service.status') || !explorer.includes('folder.status')) errors.push('Filing cabinet folders must receive and show the derived service status.');

if (errors.length) throw new Error(`Service-status check failed:\n${errors.join('\n')}`);
console.log(`Service status verified: ${ledgerFiles.length} ledgers derive from their default route; ${statusCounts.Mapped} Mapped, ${statusCounts['Partially mapped']} Partially mapped.`);
