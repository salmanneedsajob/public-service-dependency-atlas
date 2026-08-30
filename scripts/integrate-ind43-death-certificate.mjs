import { readFile, writeFile } from 'node:fs/promises';

const read = async (path) => JSON.parse(await readFile(path, 'utf8'));
const ledger = await read('ledger/death-certificate.json');
const handoffs = await Promise.all(['official', 'workflow', 'citizen'].map((pass) => read(`research/handoffs/ind43-death-certificate-${pass}.json`)));
const scenarioId = 'scenario_ind32_death_copy';
const currentActUrl = 'https://censusindia.gov.in/nada/index.php/catalog/40408/download/44042/Act_03.pdf';
const addUnique = (items, incoming) => { const ids = new Set(items.map((item) => item.id)); for (const item of incoming) if (!ids.has(item.id)) items.push(item); };
const union = (left = [], right = []) => [...new Set([...left, ...right])];
const excludedSources = new Set(['source_ind43_death_gba_home', 'source_ind43_death_bbmp_directory_error', 'source_ind43_death_faq']);
const excludedClaims = new Set(['claim_ind43_death_gba_public_entry', 'claim_ind43_death_directory_failure']);
const excludedRoadblocks = new Set(['roadblock_ind43_death_directory_unreachable']);
const workflowNodeMap = new Map([
  ['node_death_public_entry_ind43', 'node_death_service_entry'],
  ['node_death_search_mode_ind43', 'node_death_classify_record'],
  ['node_death_lookup_boundary_ind43', 'node_death_public_tools'],
  ['node_death_output_ind43', 'node_death_outcome'],
]);

for (const handoff of handoffs) {
  for (const source of handoff.sources ?? []) if (source.id === 'source_ind42_birth_rbd_act_pdf') source.url = currentActUrl;
  for (const claim of handoff.claims ?? []) {
    claim.scenarioIds = [...new Set((claim.scenarioIds ?? []).map(() => scenarioId))];
    claim.nodeIds = [...new Set((claim.nodeIds ?? []).map((id) => workflowNodeMap.get(id) ?? id))];
  }
  addUnique(ledger.sources, (handoff.sources ?? []).filter((source) => !excludedSources.has(source.id)));
  addUnique(ledger.claims, (handoff.claims ?? []).filter((claim) => !excludedClaims.has(claim.id)));
  for (const roadblock of handoff.roadblocks ?? []) {
    roadblock.scenarioIds = [...new Set((roadblock.scenarioIds ?? []).map(() => scenarioId))];
    roadblock.nodeIds = [...new Set((roadblock.nodeIds ?? []).map((id) => workflowNodeMap.get(id) ?? id))];
  }
  addUnique(ledger.roadblocks, (handoff.roadblocks ?? []).filter((roadblock) => !excludedRoadblocks.has(roadblock.id)));
}

for (const claim of ledger.claims) {
  if (claim.id.startsWith('claim_ind43_death_')) {
    claim.scenarioIds = [...new Set((claim.scenarioIds ?? []).map(() => scenarioId))];
    claim.nodeIds = [...new Set((claim.nodeIds ?? []).map((id) => workflowNodeMap.get(id) ?? id))];
  }
}
for (const roadblock of ledger.roadblocks) {
  if (roadblock.id.startsWith('roadblock_ind43_death_')) {
    roadblock.scenarioIds = [...new Set((roadblock.scenarioIds ?? []).map(() => scenarioId))];
    roadblock.nodeIds = [...new Set((roadblock.nodeIds ?? []).map((id) => workflowNodeMap.get(id) ?? id))];
  }
}
ledger.roadblocks = ledger.roadblocks.filter((roadblock) => !excludedRoadblocks.has(roadblock.id));

for (const handoff of handoffs) for (const incoming of handoff.nodes ?? []) {
  const target = ledger.nodes.find((item) => item.id === (workflowNodeMap.get(incoming.id) ?? incoming.id));
  if (!target) continue;
  for (const field of ['checks', 'failureSignals', 'recoveries']) addUnique(target[field], incoming[field] ?? []);
  target.claimIds = union(target.claimIds, incoming.claimIds);
  target.researchedNoSourceFound = union(target.researchedNoSourceFound, incoming.researchedNoSourceFound);
}

for (const target of ledger.nodes) {
  target.claimIds = target.claimIds.filter((id) => !excludedClaims.has(id));
  for (const field of ['checks', 'failureSignals', 'recoveries']) target[field] = target[field].filter((detail) => {
    detail.claimIds = detail.claimIds.filter((id) => !excludedClaims.has(id));
    return detail.claimIds.length > 0;
  });
}
for (const edge of ledger.edges) edge.claimIds = edge.claimIds.filter((id) => !excludedClaims.has(id));
await writeFile('ledger/death-certificate.json', `${JSON.stringify(ledger, null, 2)}\n`);
console.log('Integrated IND-43 death-certificate handoffs.');
