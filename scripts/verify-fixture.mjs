import { readFile } from 'node:fs/promises';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import YAML from 'yaml';

const [rawFixture, rawSchema] = await Promise.all([
  readFile(new URL('../ledger/demo.synthetic.json', import.meta.url), 'utf8'),
  readFile(new URL('../ledger/schema.json', import.meta.url), 'utf8'),
]);
const ledger = JSON.parse(rawFixture);
const schema = JSON.parse(rawSchema);
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function validateDocument(document, label) {
  if (validate(document)) return;
  const errors = (validate.errors ?? [])
    .map((error) => `${error.instancePath || '/'} ${error.message}`)
    .join('\n');
  throw new Error(`${label} does not satisfy ledger schema v1.0.0:\n${errors}`);
}

validateDocument(ledger, 'Synthetic JSON fixture');
validateDocument(YAML.parse(YAML.stringify(ledger)), 'YAML round trip');

const expectedScenarioIds = new Set([
  'scenario_clean_sale',
  'scenario_draft_e_khata',
  'scenario_epid_mapping_failure',
  'scenario_tenant',
  'scenario_previous_consumer_deceased',
  'scenario_consent_unavailable',
]);
assert(ledger.scenarios.length === expectedScenarioIds.size, 'Fixture must contain exactly the six v1 scenarios.');
assert(ledger.scenarios.every((scenario) => expectedScenarioIds.has(scenario.id)), 'Fixture scenario IDs do not match the six v1 scenarios.');

const expectedGrades = new Set(['A', 'B', 'C', 'D', 'E', 'F', 'Unknown']);
const fixtureGrades = new Set(ledger.claims.map((claim) => claim.evidenceGrade));
assert([...expectedGrades].every((grade) => fixtureGrades.has(grade)), 'Fixture must exercise evidence grades A–F and Unknown.');

const expectedStatuses = new Set(['verified', 'partial', 'contested', 'unknown']);
const fixtureStatuses = new Set([
  ...ledger.scenarios,
  ...ledger.claims,
  ...ledger.nodes,
  ...ledger.edges,
  ...ledger.roadblocks,
  ...ledger.journeys,
].map((record) => record.status));
assert([...expectedStatuses].every((status) => fixtureStatuses.has(status)), 'Fixture must exercise every record status.');

const categories = new Set(ledger.roadblocks.map((roadblock) => roadblock.category));
assert(['documentation', 'process', 'infrastructure'].every((category) => categories.has(category)), 'Fixture must populate every roadblock category.');
assert(ledger.journeys.length === ledger.scenarios.length, 'Every scenario must have a populated journey.');
assert(ledger.nodes.every((node) => node.checks.length && node.failureSignals.length && node.recoveries.length), 'Every synthetic node must exercise checks, failure signals, and recoveries.');
assert(ledger.journeys.every((journey) => journey.steps.length && journey.dependencies.length && journey.failureRoadblockIds.length && journey.recoveryNotes.length && journey.documentationQualityNotes.length), 'Every journey must exercise steps, dependencies, failures, recovery, and documentation notes.');

const idsByCollection = Object.fromEntries(
  ['agencies', 'scenarios', 'sources', 'claims', 'nodes', 'edges', 'roadblocks', 'journeys']
    .map((collection) => [collection, new Set(ledger[collection].map((record) => record.id))]),
);
const allDetailIds = new Set();
for (const node of ledger.nodes) {
  for (const detail of [...node.checks, ...node.failureSignals, ...node.recoveries]) {
    assert(!allDetailIds.has(detail.id), `Duplicate detail ID: ${detail.id}`);
    allDetailIds.add(detail.id);
    detail.claimIds.forEach((id) => assert(idsByCollection.claims.has(id), `Unknown claim reference ${id} in ${detail.id}`));
  }
  node.scenarioIds.forEach((id) => assert(idsByCollection.scenarios.has(id), `Unknown scenario reference ${id} in ${node.id}`));
  node.claimIds.forEach((id) => assert(idsByCollection.claims.has(id), `Unknown claim reference ${id} in ${node.id}`));
  if (node.ownerAgencyId) assert(idsByCollection.agencies.has(node.ownerAgencyId), `Unknown agency reference ${node.ownerAgencyId} in ${node.id}`);
}

for (const scenario of ledger.scenarios) {
  scenario.pathNodeIds.forEach((id) => assert(idsByCollection.nodes.has(id), `Unknown path node ${id} in ${scenario.id}`));
  assert(ledger.journeys.some((journey) => journey.scenarioId === scenario.id), `Missing journey for ${scenario.id}`);
}
for (const claim of ledger.claims) {
  assert(claim.text.startsWith('[Synthetic placeholder]'), `${claim.id} must be clearly labelled synthetic.`);
  claim.scenarioIds.forEach((id) => assert(idsByCollection.scenarios.has(id), `Unknown scenario reference ${id} in ${claim.id}`));
  claim.nodeIds.forEach((id) => assert(idsByCollection.nodes.has(id), `Unknown node reference ${id} in ${claim.id}`));
  claim.sourceIds.forEach((id) => assert(idsByCollection.sources.has(id), `Unknown source reference ${id} in ${claim.id}`));
  claim.contradictsClaimIds.forEach((id) => {
    const opposite = ledger.claims.find((candidate) => candidate.id === id);
    assert(opposite, `Unknown contradictory claim ${id} in ${claim.id}`);
    assert(opposite.contradictsClaimIds.includes(claim.id), `Contradiction ${claim.id} ↔ ${id} must be reciprocal.`);
  });
}
assert(ledger.claims.some((claim) => claim.contradictsClaimIds.length), 'Fixture must contain a contradiction pair.');
assert(ledger.sources.every((source) => new URL(source.url).hostname.endsWith('example.invalid')), 'Synthetic sources must use example.invalid URLs.');

for (const edge of ledger.edges) {
  assert(idsByCollection.nodes.has(edge.fromNodeId), `Unknown fromNodeId in ${edge.id}`);
  assert(idsByCollection.nodes.has(edge.toNodeId), `Unknown toNodeId in ${edge.id}`);
  edge.scenarioIds.forEach((id) => assert(idsByCollection.scenarios.has(id), `Unknown scenario reference ${id} in ${edge.id}`));
  edge.claimIds.forEach((id) => assert(idsByCollection.claims.has(id), `Unknown claim reference ${id} in ${edge.id}`));
}
for (const roadblock of ledger.roadblocks) {
  roadblock.nodeIds.forEach((id) => assert(idsByCollection.nodes.has(id), `Unknown node reference ${id} in ${roadblock.id}`));
  roadblock.scenarioIds.forEach((id) => assert(idsByCollection.scenarios.has(id), `Unknown scenario reference ${id} in ${roadblock.id}`));
  roadblock.claimIds.forEach((id) => assert(idsByCollection.claims.has(id), `Unknown claim reference ${id} in ${roadblock.id}`));
  (roadblock.ownerAgencyIds ?? []).forEach((id) => assert(idsByCollection.agencies.has(id), `Unknown agency reference ${id} in ${roadblock.id}`));
}
for (const journey of ledger.journeys) {
  assert(idsByCollection.scenarios.has(journey.scenarioId), `Unknown scenario reference ${journey.scenarioId} in ${journey.id}`);
  journey.failureRoadblockIds.forEach((id) => assert(idsByCollection.roadblocks.has(id), `Unknown roadblock reference ${id} in ${journey.id}`));
  journey.steps.forEach((step) => {
    assert(idsByCollection.nodes.has(step.nodeId), `Unknown node reference ${step.nodeId} in ${step.id}`);
    step.claimIds.forEach((id) => assert(idsByCollection.claims.has(id), `Unknown claim reference ${id} in ${step.id}`));
  });
  journey.dependencies.forEach((dependency) => {
    assert(idsByCollection.nodes.has(dependency.fromNodeId), `Unknown fromNodeId in ${dependency.id}`);
    assert(idsByCollection.nodes.has(dependency.toNodeId), `Unknown toNodeId in ${dependency.id}`);
    dependency.claimIds.forEach((id) => assert(idsByCollection.claims.has(id), `Unknown claim reference ${id} in ${dependency.id}`));
  });
}

console.log('Synthetic ledger verified: schema, references, scenarios, grades, states, contradictions, roadblocks, and journeys.');
