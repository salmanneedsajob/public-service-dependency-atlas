import { readFile, readdir } from 'node:fs/promises';

const fields = ['agencies', 'scenarios', 'sources', 'claims', 'nodes', 'edges', 'roadblocks', 'journeys'];
const services = {
  khata: 'khata',
  'property-tax': 'property',
  'water-connection': 'water',
  'birth-certificate': 'birth',
  'water-account': 'water-account',
  'new-electricity': 'new-electricity',
  'death-certificate': 'death',
  lpg: 'lpg',
  marriage: 'marriage',
  'trade-license': 'trade-license',
  'building-plan': 'building-plan',
};
const aliases = {
  'birth-certificate': {
    scenario_birth_registered_copy: 'scenario_ind32_birth_copy_workflow', scenario_birth_name_inclusion: 'scenario_ind32_birth_name_workflow',
    scenario_birth_record_correction: 'scenario_ind32_birth_correction_workflow', scenario_birth_delayed_or_missing: 'scenario_ind32_birth_delayed_workflow',
    scenario_birth_authenticity: 'scenario_ind32_birth_verify_workflow',
  },
  lpg: { scenario_lpg_same_area: 'scenario_lpg_workflow_same_area', scenario_lpg_same_town: 'scenario_lpg_workflow_same_town' },
  marriage: { scenario_marriage_hindu: 'scenario_marriage_w_hma', scenario_marriage_special_solemnization: 'scenario_marriage_w_sma', scenario_marriage_special_registration: 'scenario_marriage_w_sma' },
  'trade-license': { scenario_trade_new: 'scenario_trade_w_new', scenario_trade_renewal: 'scenario_trade_w_renewal' },
  'building-plan': { scenario_building_suvarna: 'scenario_building_w_suvarna', scenario_building_general: 'scenario_building_w_general' },
};
const read = async (path) => JSON.parse(await readFile(path, 'utf8'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

for (const [service, prefix] of Object.entries(services)) {
  const phase2Handoffs = (await readdir('research/handoffs'))
    // Phase 2 handoffs are additive evidence for an existing, isolated
    // service ledger. Accept any numbered IND handoff for this service's
    // stable prefix rather than baking IND-39 into the verifier.
    .filter((file) => new RegExp(`^ind\\d+-${prefix}-.*\\.json$`).test(file))
    .map((file) => `research/handoffs/${file}`);
  const [ledger, ...handoffs] = await Promise.all([
    read(`ledger/${service}.json`),
    ...['official', 'workflow', 'citizen'].map((role) => read(`research/handoffs/ind32-${prefix}-${role}.json`)),
    ...phase2Handoffs.map(read),
  ]);
  const alias = (id) => aliases[service]?.[id] ?? id;
  const allowed = Object.fromEntries(fields.map((field) => [field, new Set(handoffs.flatMap((handoff) => (handoff[field] ?? []).map((record) => field === 'scenarios' ? alias(record.id) : record.id)))]));
  allowed.roadblocks.add(`roadblock_audit_${service.replaceAll('-', '_')}`);

  for (const field of fields) {
    const ids = ledger[field].map((record) => record.id);
    assert(new Set(ids).size === ids.length, `${service}: duplicate ${field} IDs remain.`);
    for (const id of ids) assert(allowed[field].has(id), `${service}: ${field} record ${id} was not supplied by this service's handoffs.`);
  }
  const labels = ledger.scenarios.map((scenario) => scenario.label.trim().toLocaleLowerCase());
  assert(new Set(labels).size === labels.length, `${service}: duplicate scenario labels remain.`);
  const scenarioIds = new Set(ledger.scenarios.map((record) => record.id));
  const nodeIds = new Set(ledger.nodes.map((record) => record.id));
  const sourceIds = new Set(ledger.sources.map((record) => record.id));
  const claimIds = new Set(ledger.claims.map((record) => record.id));
  const roadblockIds = new Set(ledger.roadblocks.map((record) => record.id));
  for (const scenario of ledger.scenarios) scenario.pathNodeIds.forEach((id) => assert(nodeIds.has(id), `${service}: scenario ${scenario.id} points outside its nodes.`));
  for (const claim of ledger.claims) {
    claim.scenarioIds.forEach((id) => assert(scenarioIds.has(id), `${service}: claim ${claim.id} points outside its scenarios.`));
    claim.nodeIds.forEach((id) => assert(nodeIds.has(id), `${service}: claim ${claim.id} points outside its nodes.`));
    claim.sourceIds.forEach((id) => assert(sourceIds.has(id), `${service}: claim ${claim.id} points outside its sources.`));
  }
  for (const edge of ledger.edges) {
    assert(nodeIds.has(edge.fromNodeId) && nodeIds.has(edge.toNodeId), `${service}: edge ${edge.id} crosses an outside node.`);
    edge.scenarioIds.forEach((id) => assert(scenarioIds.has(id), `${service}: edge ${edge.id} points outside its scenarios.`));
    edge.claimIds.forEach((id) => assert(claimIds.has(id), `${service}: edge ${edge.id} points outside its claims.`));
  }
  for (const roadblock of ledger.roadblocks) {
    roadblock.nodeIds.forEach((id) => assert(nodeIds.has(id), `${service}: roadblock ${roadblock.id} points outside its nodes.`));
    roadblock.scenarioIds.forEach((id) => assert(scenarioIds.has(id), `${service}: roadblock ${roadblock.id} points outside its scenarios.`));
  }
  for (const journey of ledger.journeys) {
    assert(scenarioIds.has(journey.scenarioId), `${service}: journey ${journey.id} points outside its scenarios.`);
    journey.failureRoadblockIds.forEach((id) => assert(roadblockIds.has(id), `${service}: journey ${journey.id} points outside its roadblocks.`));
  }
}

console.log('Service-isolation verified: each non-BESCOM ledger contains only its own handoff records, with no duplicate scenario labels or cross-service references.');
