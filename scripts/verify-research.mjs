import { readFile } from 'node:fs/promises';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const [rawSchema, rawLedger] = await Promise.all([
  readFile(new URL('../ledger/schema.json', import.meta.url), 'utf8'),
  readFile(new URL('../ledger/research.json', import.meta.url), 'utf8'),
]);

const schema = JSON.parse(rawSchema);
const ledger = JSON.parse(rawLedger);
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);

if (!validate(ledger)) {
  throw new Error((validate.errors ?? []).map((error) => `${error.instancePath || '/'} ${error.message}`).join('\n'));
}

const expectedScenarioIds = [
  'scenario_clean_sale',
  'scenario_draft_e_khata',
  'scenario_epid_mapping_failure',
  'scenario_tenant',
  'scenario_previous_consumer_deceased',
  'scenario_consent_unavailable',
];
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

assert(ledger.meta.dataKind === 'research', 'research.json must declare meta.dataKind as research.');
assert(ledger.meta.asOf === '2026-08-27', 'research.json must retain its audited asOf date.');
assert(ledger.meta.disclaimer.length > 0, 'research.json must retain its disclaimer.');
assert(ledger.scenarios.length === expectedScenarioIds.length, 'Research ledger must contain exactly the six v1 scenarios.');

for (const scenarioId of expectedScenarioIds) {
  const scenario = ledger.scenarios.find((item) => item.id === scenarioId);
  assert(scenario, `Missing v1 scenario: ${scenarioId}`);
  assert(scenario.pathNodeIds.length > 0, `${scenarioId} has no dependency path.`);
  assert(ledger.journeys.some((journey) => journey.scenarioId === scenarioId), `${scenarioId} has no journey.`);
}

const nocRoadblock = ledger.roadblocks.find((roadblock) => roadblock.id === 'roadblock_noc_conflict');
const oldNoc = ledger.claims.find((claim) => claim.id === 'claim_citizen_old_noc');
const noBuilderNoc = ledger.claims.find((claim) => claim.id === 'claim_citizen_no_builder_noc');
assert(nocRoadblock?.status === 'contested', 'NOC roadblock must remain contested.');
assert(nocRoadblock?.claimIds.includes('claim_citizen_old_noc') && nocRoadblock.claimIds.includes('claim_citizen_no_builder_noc'), 'NOC roadblock must surface both conflicting claims.');
assert(oldNoc?.contradictsClaimIds.includes('claim_citizen_no_builder_noc'), 'Old-NOC claim must reference its contradiction.');
assert(noBuilderNoc?.contradictsClaimIds.includes('claim_citizen_old_noc'), 'No-builder-NOC claim must reference its contradiction.');

console.log('Research ledger verified: six scenarios, dated disclaimer, and contested NOC evidence.');
