import { readFile, writeFile } from 'node:fs/promises';
const read = (path) => readFile(path, 'utf8').then(JSON.parse);
const ledger = await read('ledger/marriage.json');
const handoffs = await Promise.all(['official', 'workflow', 'citizen'].map((pass) => read(`research/handoffs/ind48-marriage-${pass}.json`)));
const scenarioMap = new Map([['scenario_ind48_marriage_citizen_hma_or_unknown', 'scenario_marriage_w_hma']]);
const agencyMap = new Map([
  ['agency_kar_stamps_ind48_marriage_workflow', 'agency_kar_stamps_ind32_marriage_workflow'],
  ['agency_kaveri_ind48_marriage_workflow', 'agency_kaveri_ind32_marriage_workflow'],
]);
const by = (items, id) => items.find((item) => item.id === id);
const unique = (left = [], right = []) => [...new Set([...left, ...right])];
const sourceIds = new Set(ledger.sources.map((source) => source.id));
for (const handoff of handoffs) for (const source of handoff.sources ?? []) if (!sourceIds.has(source.id)) { ledger.sources.push(structuredClone(source)); sourceIds.add(source.id); }
const claimIds = new Set(ledger.claims.map((claim) => claim.id));
for (const handoff of handoffs) for (const raw of handoff.claims ?? []) {
  if (claimIds.has(raw.id)) continue;
  const claim = structuredClone(raw);
  claim.nodeIds = (claim.nodeIds ?? []).filter((id) => by(ledger.nodes, id));
  claim.scenarioIds = (claim.scenarioIds ?? []).map((id) => scenarioMap.get(id) ?? id).filter((id) => by(ledger.scenarios, id));
  if (!claim.scenarioIds.length) claim.scenarioIds = ['scenario_marriage_w_hma'];
  ledger.claims.push(claim); claimIds.add(claim.id);
}
for (const handoff of handoffs) for (const incoming of handoff.nodes ?? []) {
  const node = by(ledger.nodes, incoming.id); if (!node) continue;
  for (const field of ['checks', 'failureSignals', 'recoveries']) {
    const ids = new Set(node[field].map((entry) => entry.id));
    for (const raw of incoming[field] ?? []) {
      const entry = structuredClone(raw); entry.claimIds = entry.claimIds.filter((id) => claimIds.has(id));
      if (!ids.has(entry.id) && entry.claimIds.length) node[field].push(entry);
    }
  }
  node.claimIds = unique(node.claimIds, (incoming.claimIds ?? []).filter((id) => claimIds.has(id)));
  node.researchedNoSourceFound = unique(node.researchedNoSourceFound, incoming.researchedNoSourceFound);
}
for (const handoff of handoffs) for (const raw of handoff.roadblocks ?? []) {
  if (by(ledger.roadblocks, raw.id)) continue;
  const roadblock = structuredClone(raw);
  roadblock.ownerAgencyIds = (roadblock.ownerAgencyIds ?? []).map((id) => agencyMap.get(id) ?? id).filter((id) => by(ledger.agencies, id));
  if (roadblock.category === 'routing') roadblock.category = 'process';
  roadblock.nodeIds = (roadblock.nodeIds ?? []).filter((id) => by(ledger.nodes, id));
  roadblock.scenarioIds = (roadblock.scenarioIds ?? []).map((id) => scenarioMap.get(id) ?? id).filter((id) => by(ledger.scenarios, id));
  roadblock.claimIds = (roadblock.claimIds ?? []).filter((id) => claimIds.has(id));
  if (roadblock.nodeIds.length && roadblock.scenarioIds.length && roadblock.claimIds.length) ledger.roadblocks.push(roadblock);
}
ledger.meta.asOf = '2026-08-31';
await writeFile('ledger/marriage.json', `${JSON.stringify(ledger, null, 2)}\n`);
console.log('Integrated IND-48.');
