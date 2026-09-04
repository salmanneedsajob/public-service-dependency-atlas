import { readFile, writeFile } from 'node:fs/promises';

const read = async (path) => JSON.parse(await readFile(path, 'utf8'));
const ledger = await read('ledger/property-tax.json');
const handoffs = await Promise.all(['official', 'workflow', 'citizen'].map((pass) => read(`research/handoffs/ind-exceptions-property-tax-${pass}.json`)));
const byId = (items, id) => items.find((item) => item.id === id);
const unique = (items) => [...new Set(items.filter(Boolean))];
const scenarioMap = new Map([
  ['scenario_indexceptions_property_successor', 'scenario_property_successor_ind32'],
  ['scenario_indexceptions_property_missing_or_incorrect', 'scenario_property_missing_or_wrong_ind32'],
  ['scenario_indexceptions_property_not_found', 'scenario_property_missing_record_ind32'],
  ['scenario_indexceptions_property_payment_or_name_discrepancy', 'scenario_property_payment_or_correction_ind32'],
]);
const sourceByUrl = new Map(ledger.sources.map((source) => [source.url, source.id]));
const sourceMap = new Map();
for (const handoff of handoffs) for (const source of handoff.sources ?? []) {
  const id = sourceByUrl.get(source.url) ?? source.id;
  sourceMap.set(source.id, id);
  if (!sourceByUrl.has(source.url)) { ledger.sources.push(structuredClone(source)); sourceByUrl.set(source.url, id); }
}
const claimIds = new Set(ledger.claims.map((claim) => claim.id));
for (const handoff of handoffs) for (const raw of handoff.claims ?? []) {
  if (claimIds.has(raw.id)) continue;
  const claim = structuredClone(raw);
  claim.sourceIds = unique(claim.sourceIds.map((id) => sourceMap.get(id) ?? id));
  claim.scenarioIds = unique(claim.scenarioIds.map((id) => scenarioMap.get(id) ?? id).filter((id) => byId(ledger.scenarios, id)));
  claim.nodeIds = unique(claim.nodeIds.filter((id) => byId(ledger.nodes, id)));
  if (claim.scenarioIds.length && claim.nodeIds.length) { ledger.claims.push(claim); claimIds.add(claim.id); }
}
for (const handoff of handoffs) for (const incoming of handoff.nodes ?? []) {
  const node = byId(ledger.nodes, incoming.id);
  if (!node) continue;
  for (const field of ['checks', 'failureSignals', 'recoveries']) {
    const known = new Set(node[field].map((detail) => detail.id));
    for (const raw of incoming[field] ?? []) {
      const detail = structuredClone(raw);
      detail.claimIds = unique(detail.claimIds.filter((id) => claimIds.has(id)));
      if (!known.has(detail.id) && detail.claimIds.length) { node[field].push(detail); known.add(detail.id); }
    }
  }
  node.claimIds = unique([...node.claimIds, ...(incoming.claimIds ?? []).filter((id) => claimIds.has(id))]);
  node.researchedNoSourceFound = unique([...(node.researchedNoSourceFound ?? []), ...(incoming.researchedNoSourceFound ?? [])])
    .filter((field) => node[field].length === 0);
}
for (const handoff of handoffs) for (const raw of handoff.roadblocks ?? []) {
  if (byId(ledger.roadblocks, raw.id)) continue;
  const roadblock = structuredClone(raw);
  roadblock.ownerAgencyIds = unique((roadblock.ownerAgencyIds ?? []).filter((id) => byId(ledger.agencies, id)));
  if (!roadblock.ownerAgencyIds.length) roadblock.ownerAgencyIds = [ledger.agencies[0].id];
  roadblock.nodeIds = unique(roadblock.nodeIds.filter((id) => byId(ledger.nodes, id)));
  roadblock.scenarioIds = unique(roadblock.scenarioIds.map((id) => scenarioMap.get(id) ?? id).filter((id) => byId(ledger.scenarios, id)));
  roadblock.claimIds = unique(roadblock.claimIds.filter((id) => claimIds.has(id)));
  if (roadblock.nodeIds.length && roadblock.scenarioIds.length && roadblock.claimIds.length) ledger.roadblocks.push(roadblock);
}
ledger.meta.asOf = '2026-08-31';
await writeFile('ledger/property-tax.json', `${JSON.stringify(ledger, null, 2)}\n`);
console.log('Integrated property-tax exception handoffs.');
