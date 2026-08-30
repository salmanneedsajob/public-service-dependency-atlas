import { readFile, writeFile } from 'node:fs/promises';

const read = (path) => readFile(path, 'utf8').then(JSON.parse);
const ledger = await read('ledger/building-plan.json');
const handoffs = await Promise.all(['official', 'workflow', 'citizen'].map((pass) => read(`research/handoffs/ind47-building-plan-${pass}.json`)));
const nodeMap = new Map([
  ['node_ind47_public_entry', 'node_building_w_entry'],
  ['node_ind47_route_check', 'node_building_w_route'],
  ['node_ind47_documents_nocs', 'node_building_w_docs'],
  ['node_ind47_scrutiny_status', 'node_building_w_scrutiny'],
  ['node_ind47_fee_output', 'node_building_w_fee'],
]);
const scenarioMap = new Map([
  ['scenario_ind47_default_building_plan', 'scenario_building_w_suvarna'],
  ['scenario_ind47_building_citizen', 'scenario_building_w_suvarna'],
]);
const agencyMap = new Map([
  ['agency_ind47_gba_bpas', 'agency_gba_building_ind32_w'],
  ['agency_ind47_bpas_helpdesk', 'agency_bpas_ind32_w'],
]);
const byId = (items, id) => items.find((item) => item.id === id);
const unique = (left = [], right = []) => [...new Set([...left, ...right])];

const sourceIds = new Set(ledger.sources.map((source) => source.id));
for (const handoff of handoffs) {
  for (const source of handoff.sources ?? []) {
    if (!sourceIds.has(source.id)) {
      ledger.sources.push(structuredClone(source));
      sourceIds.add(source.id);
    }
  }
}

const claimIds = new Set(ledger.claims.map((claim) => claim.id));
for (const handoff of handoffs) {
  for (const rawClaim of handoff.claims ?? []) {
    if (claimIds.has(rawClaim.id)) continue;
    const claim = structuredClone(rawClaim);
    claim.nodeIds = (claim.nodeIds ?? []).map((id) => nodeMap.get(id) ?? id).filter((id) => byId(ledger.nodes, id));
    claim.scenarioIds = (claim.scenarioIds ?? []).map((id) => scenarioMap.get(id) ?? id).filter((id) => byId(ledger.scenarios, id));
    if (!claim.scenarioIds.length) claim.scenarioIds = ['scenario_building_w_suvarna'];
    ledger.claims.push(claim);
    claimIds.add(claim.id);
  }
}

for (const handoff of handoffs) {
  for (const incoming of handoff.nodes ?? []) {
    const node = byId(ledger.nodes, nodeMap.get(incoming.id) ?? incoming.id);
    if (!node) continue;
    for (const field of ['checks', 'failureSignals', 'recoveries']) {
      const ids = new Set(node[field].map((entry) => entry.id));
      for (const entry of incoming[field] ?? []) {
        const next = structuredClone(entry);
        next.claimIds = next.claimIds.filter((id) => claimIds.has(id));
        if (!ids.has(next.id) && next.claimIds.length) node[field].push(next);
      }
    }
    node.claimIds = unique(node.claimIds, (incoming.claimIds ?? []).filter((id) => claimIds.has(id)));
    node.researchedNoSourceFound = unique(node.researchedNoSourceFound, incoming.researchedNoSourceFound);
  }
}

for (const handoff of handoffs) {
  for (const rawRoadblock of handoff.roadblocks ?? []) {
    if (byId(ledger.roadblocks, rawRoadblock.id)) continue;
    const roadblock = structuredClone(rawRoadblock);
    roadblock.ownerAgencyIds = (roadblock.ownerAgencyIds ?? []).map((id) => agencyMap.get(id) ?? id).filter((id) => byId(ledger.agencies, id));
    roadblock.nodeIds = (roadblock.nodeIds ?? []).map((id) => nodeMap.get(id) ?? id).filter((id) => byId(ledger.nodes, id));
    roadblock.scenarioIds = (roadblock.scenarioIds ?? []).map((id) => scenarioMap.get(id) ?? id).filter((id) => byId(ledger.scenarios, id));
    roadblock.claimIds = (roadblock.claimIds ?? []).filter((id) => claimIds.has(id));
    if (roadblock.nodeIds.length && roadblock.scenarioIds.length && roadblock.claimIds.length) ledger.roadblocks.push(roadblock);
  }
}

ledger.meta.asOf = '2026-08-31';
await writeFile('ledger/building-plan.json', `${JSON.stringify(ledger, null, 2)}\n`);
console.log('Integrated IND-47.');
