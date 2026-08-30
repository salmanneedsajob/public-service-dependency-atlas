import { readFile, writeFile } from 'node:fs/promises';

const read = (file) => readFile(file, 'utf8').then(JSON.parse);
const ledger = await read('ledger/new-electricity.json');
const handoffs = await Promise.all(['official', 'workflow', 'citizen'].map((pass) => read(`research/handoffs/ind44-new-electricity-${pass}.json`)));
const scenarioId = 'scenario_ind32_electricity_jvs';
const sourceMap = new Map([
  ['source_ind44_bescom_home_live', 'source_ind32_new_electricity_home'],
  ['source_ind44_bescom_faq_live', 'source_ind32_new_electricity_faq'],
  ['source_ind44_bescom_eligibility_live', 'source_ind32_new_electricity_eligibility'],
  ['source_ind44_bescom_jvs_form_live', 'source_ind32_new_electricity_form'],
  ['source_ind44_bescom_normal_form_live', 'source_ind44_bescom_normal_form'],
  ['source_ind44_bescom_tracker_live', 'source_ind44_bescom_tracker'],
]);
const nodeMap = new Map([
  ['node_ind44_public_route', 'node_electricity_route'],
  ['node_ind44_jvs_eligibility', 'node_electricity_route'],
  ['node_ind44_jvs_form', 'node_electricity_public_form'],
  ['node_ind44_normal_form', 'node_electricity_public_form'],
  ['node_ind44_jvs_documents', 'node_electricity_documents'],
  ['node_ind44_demand_payment', 'node_electricity_demand'],
  ['node_ind44_tracking', 'node_electricity_tracking'],
]);
const byId = (items, id) => items.find((item) => item.id === id);
const union = (left = [], right = []) => [...new Set([...left, ...right])];
const addUnique = (items, incoming) => { const ids = new Set(items.map((item) => item.id)); for (const item of incoming) if (!ids.has(item.id)) { items.push(item); ids.add(item.id); } };

const sourceIds = new Set(ledger.sources.map((source) => source.id));
for (const handoff of handoffs) for (const raw of handoff.sources ?? []) {
  const source = structuredClone(raw);
  const id = sourceMap.get(source.id) ?? source.id;
  if (id === source.id && !sourceIds.has(id)) { ledger.sources.push(source); sourceIds.add(id); }
}

const claimIds = new Set(ledger.claims.map((claim) => claim.id));
for (const handoff of handoffs) for (const raw of handoff.claims ?? []) {
  if (claimIds.has(raw.id)) continue;
  const item = structuredClone(raw);
  item.sourceIds = [...new Set((item.sourceIds ?? []).map((id) => sourceMap.get(id) ?? id))];
  item.nodeIds = [...new Set((item.nodeIds ?? []).map((id) => nodeMap.get(id) ?? id).filter((id) => byId(ledger.nodes, id)))];
  item.scenarioIds = [...new Set((item.scenarioIds ?? []).map((id) => id === 'scenario_ind44_new_electricity_default' ? scenarioId : id).filter((id) => byId(ledger.scenarios, id)))];
  ledger.claims.push(item); claimIds.add(item.id);
}

for (const handoff of handoffs) for (const incoming of handoff.nodes ?? []) {
  const target = byId(ledger.nodes, nodeMap.get(incoming.id) ?? incoming.id);
  if (!target) continue;
  for (const field of ['checks', 'failureSignals', 'recoveries']) addUnique(target[field], structuredClone(incoming[field] ?? []));
  target.claimIds = union(target.claimIds, incoming.claimIds);
  target.researchedNoSourceFound = union(target.researchedNoSourceFound, incoming.researchedNoSourceFound);
}

for (const target of ledger.nodes) {
  target.claimIds = [...new Set(target.claimIds ?? [])];
  for (const field of ['checks', 'failureSignals', 'recoveries']) for (const detail of target[field]) detail.claimIds = [...new Set(detail.claimIds ?? [])];
}

// The existing default edges are the canonical display chain. Add the new
// record-level evidence to those rather than creating duplicate parallel edges.
const edgeClaims = new Map([
  ['edge_electricity_route_form', ['claim_ind44_electricity_jvs_default_route', 'claim_ind44_electricity_normal_form_fields', 'claim_ind44_jvs_stage_controls']],
  ['edge_electricity_form_documents', ['claim_ind44_electricity_document_upload_boundary', 'claim_ind44_jvs_document_controls']],
  ['edge_electricity_docs_demand', ['claim_ind44_electricity_demand_calculator_inputs']],
  ['edge_electricity_demand_tracking', ['claim_ind44_electricity_tracker_inputs', 'claim_ind44_kerc_existing_network_timing']],
]);
for (const [edgeId, ids] of edgeClaims) {
  const edge = byId(ledger.edges, edgeId);
  if (edge) edge.claimIds = union(edge.claimIds, ids);
}

for (const handoff of handoffs) for (const raw of handoff.roadblocks ?? []) {
  const item = structuredClone(raw);
  item.nodeIds = [...new Set((item.nodeIds ?? []).map((id) => nodeMap.get(id) ?? id).filter((id) => byId(ledger.nodes, id)))];
  item.scenarioIds = [...new Set((item.scenarioIds ?? []).map((id) => id === 'scenario_ind44_new_electricity_default' ? scenarioId : id).filter((id) => byId(ledger.scenarios, id)))];
  item.claimIds = [...new Set((item.claimIds ?? []).filter((id) => claimIds.has(id)))];
  if (item.nodeIds.length && item.scenarioIds.length && item.claimIds.length) addUnique(ledger.roadblocks, [item]);
}

ledger.meta.asOf = '2026-08-30';
await writeFile('ledger/new-electricity.json', `${JSON.stringify(ledger, null, 2)}\n`);
console.log('Integrated IND-44 new-electricity handoffs.');
