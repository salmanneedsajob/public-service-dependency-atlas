import { readFile, writeFile } from 'node:fs/promises';

const [service, ...files] = process.argv.slice(2);
if (!service || !files.length) throw new Error('Usage: node scripts/integrate-service.mjs <service> <handoff...>');

const fields = ['agencies', 'scenarios', 'sources', 'claims', 'nodes', 'edges', 'roadblocks', 'journeys'];
const readJson = async (file) => JSON.parse(await readFile(file, 'utf8'));
const handoffs = await Promise.all(files.map(readJson));
const handoffMeta = handoffs.find((handoff) => handoff.meta)?.meta;
if (!handoffMeta) throw new Error(`No ledger metadata found for ${service}.`);

// Official and public-workflow passes sometimes describe the same journey with
// different IDs. Keep a single rendered scenario and attach both evidence sets.
const scenarioAliases = {
  'birth-certificate': {
    scenario_birth_registered_copy: 'scenario_ind32_birth_copy_workflow',
    scenario_birth_name_inclusion: 'scenario_ind32_birth_name_workflow',
    scenario_birth_record_correction: 'scenario_ind32_birth_correction_workflow',
    scenario_birth_delayed_or_missing: 'scenario_ind32_birth_delayed_workflow',
    scenario_birth_authenticity: 'scenario_ind32_birth_verify_workflow',
  },
  lpg: {
    scenario_lpg_same_area: 'scenario_lpg_workflow_same_area',
    scenario_lpg_same_town: 'scenario_lpg_workflow_same_town',
  },
  marriage: {
    scenario_marriage_hindu: 'scenario_marriage_w_hma',
    scenario_marriage_special_solemnization: 'scenario_marriage_w_sma',
    scenario_marriage_special_registration: 'scenario_marriage_w_sma',
  },
  'trade-license': {
    scenario_trade_new: 'scenario_trade_w_new',
    scenario_trade_renewal: 'scenario_trade_w_renewal',
  },
  'building-plan': {
    scenario_building_suvarna: 'scenario_building_w_suvarna',
    scenario_building_general: 'scenario_building_w_general',
  },
}[service] ?? {};
const canonicalScenario = (id) => scenarioAliases[id] ?? id;

const ledger = {
  meta: {
    schemaVersion: '1.0.0',
    title: `Bengaluru ${service.replaceAll('-', ' ')} evidence ledger — partially mapped v1`,
    jurisdiction: handoffMeta.jurisdiction,
    asOf: '2026-08-28',
    dataKind: 'research',
    disclaimer: 'Independent research, not official advice. Public sources and known gaps are shown together; do not submit personal data through this ledger.',
  },
};

for (const field of fields) {
  const records = new Map();
  for (const handoff of handoffs) for (const record of handoff[field] ?? []) records.set(record.id, structuredClone(record));
  ledger[field] = [...records.values()];
}

for (const scenario of ledger.scenarios) scenario.id = canonicalScenario(scenario.id);
ledger.scenarios = [...new Map(ledger.scenarios.map((scenario) => [scenario.id, scenario])).values()];

const ids = (field) => new Set(ledger[field].map((record) => record.id));
const onlyKnown = (values, known) => [...new Set((values ?? []).filter((value) => known.has(value)))];
for (const field of ['claims', 'nodes', 'edges', 'roadblocks']) for (const record of ledger[field]) record.scenarioIds = (record.scenarioIds ?? []).map(canonicalScenario);
for (const journey of ledger.journeys) journey.scenarioId = canonicalScenario(journey.scenarioId);

const nodeKinds = new Set(['record', 'document', 'service', 'decision', 'system', 'outcome']);
const relationships = new Set(['requires', 'produces', 'maps_to', 'blocks', 'alternative']);
const sourceTypes = new Set(['law', 'regulation', 'order', 'official_guidance', 'official_form', 'official_portal', 'secondary', 'citizen_evidence', 'firsthand_observation']);
const researchedDetailFields = new Set(['checks', 'failureSignals', 'recoveries']);
for (const node of ledger.nodes) if (!nodeKinds.has(node.kind)) node.kind = 'record';
for (const edge of ledger.edges) if (!relationships.has(edge.relationship)) edge.relationship = 'requires';
for (const roadblock of ledger.roadblocks) if (!['documentation', 'process', 'infrastructure'].includes(roadblock.category)) roadblock.category = 'documentation';
for (const source of ledger.sources) if (!sourceTypes.has(source.type)) source.type = source.type.includes('citizen') ? 'citizen_evidence' : 'official_guidance';

const scenarioIds = ids('scenarios');
const sourceIds = ids('sources');
const claimIds = ids('claims');
const nodeIds = ids('nodes');
const agencyIds = ids('agencies');
for (const claim of ledger.claims) {
  claim.scenarioIds = onlyKnown(claim.scenarioIds, scenarioIds);
  claim.nodeIds = onlyKnown(claim.nodeIds, nodeIds);
  claim.sourceIds = onlyKnown(claim.sourceIds, sourceIds);
  claim.contradictsClaimIds = onlyKnown(claim.contradictsClaimIds, claimIds);
  if (!claim.scenarioIds.length) claim.scenarioIds = [ledger.scenarios[0].id];
  if (claim.evidenceGrade !== 'Unknown' && !claim.sourceIds.length) {
    claim.evidenceGrade = 'Unknown';
    claim.status = 'unknown';
    claim.notes = `${claim.notes ?? ''} The referenced source was not retained in this service-isolated ledger.`.trim();
  }
}
for (const node of ledger.nodes) {
  node.scenarioIds = onlyKnown(node.scenarioIds, scenarioIds);
  node.claimIds = onlyKnown(node.claimIds, claimIds);
  if (node.researchedNoSourceFound) {
    node.researchedNoSourceFound = onlyKnown(node.researchedNoSourceFound, researchedDetailFields);
    if (!node.researchedNoSourceFound.length) delete node.researchedNoSourceFound;
  }
  if (node.ownerAgencyId && !agencyIds.has(node.ownerAgencyId)) delete node.ownerAgencyId;
  for (const details of [node.checks, node.failureSignals, node.recoveries]) for (const detail of details) detail.claimIds = onlyKnown(detail.claimIds, claimIds);
}
ledger.edges = ledger.edges.filter((edge) => nodeIds.has(edge.fromNodeId) && nodeIds.has(edge.toNodeId));
for (const edge of ledger.edges) { edge.scenarioIds = onlyKnown(edge.scenarioIds, scenarioIds); edge.claimIds = onlyKnown(edge.claimIds, claimIds); }
ledger.roadblocks = ledger.roadblocks.filter((roadblock) => roadblock.nodeIds.some((id) => nodeIds.has(id)) && roadblock.scenarioIds.some((id) => scenarioIds.has(id)));
for (const roadblock of ledger.roadblocks) {
  roadblock.nodeIds = onlyKnown(roadblock.nodeIds, nodeIds);
  roadblock.scenarioIds = onlyKnown(roadblock.scenarioIds, scenarioIds);
  roadblock.claimIds = onlyKnown(roadblock.claimIds, claimIds);
  roadblock.ownerAgencyIds = onlyKnown(roadblock.ownerAgencyIds, agencyIds);
}
const roadblockIds = ids('roadblocks');
ledger.journeys = ledger.journeys.filter((journey) => scenarioIds.has(journey.scenarioId));
for (const journey of ledger.journeys) {
  journey.steps = journey.steps.filter((step) => nodeIds.has(step.nodeId));
  for (const step of journey.steps) step.claimIds = onlyKnown(step.claimIds, claimIds);
  journey.dependencies = journey.dependencies.filter((dependency) => nodeIds.has(dependency.fromNodeId) && nodeIds.has(dependency.toNodeId));
  for (const dependency of journey.dependencies) dependency.claimIds = onlyKnown(dependency.claimIds, claimIds);
  journey.failureRoadblockIds = onlyKnown(journey.failureRoadblockIds, roadblockIds);
}

await writeFile(`ledger/${service}.json`, `${JSON.stringify(ledger, null, 2)}\n`);
console.log(`Integrated isolated ${service} ledger from ${files.length} handoffs.`);
