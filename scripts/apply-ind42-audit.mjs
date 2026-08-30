import { readFile, writeFile } from 'node:fs/promises';

const ledger = JSON.parse(await readFile('ledger/birth-certificate.json', 'utf8'));
const scenarioId = 'scenario_ind32_birth_copy_workflow';
const sourceAct = 'source_ind42_birth_rbd_act_pdf';
const sourceContact = 'source_ind42_birth_contact';
const oldActUrls = new Set([
  'https://www.indiacode.nic.in/bitstream/123456789/1682/1/A1969-18.pdf',
  'https://www.indiacode.nic.in/bitstream/123456789/1682/1/A1969-18_english.pdf',
]);
const currentActUrl = 'https://censusindia.gov.in/nada/index.php/catalog/40408/download/44042/Act_03.pdf';
const byId = (items, id) => items.find((item) => item.id === id);
const claim = (id) => byId(ledger.claims, id);
const node = (id) => byId(ledger.nodes, id);
const addUnique = (items, item) => { if (!byId(items, item.id)) items.push(item); };
const replaceIds = (ids = [], replacements) => [...new Set(ids.map((id) => replacements.get(id) ?? id))];
const remapClaims = (replacements) => {
  for (const item of ledger.claims) item.contradictsClaimIds = replaceIds(item.contradictsClaimIds, replacements);
  for (const item of ledger.nodes) {
    item.claimIds = replaceIds(item.claimIds, replacements);
    for (const details of [item.checks, item.failureSignals, item.recoveries]) for (const detail of details) detail.claimIds = replaceIds(detail.claimIds, replacements);
  }
  for (const item of ledger.edges) item.claimIds = replaceIds(item.claimIds, replacements);
  for (const item of ledger.roadblocks) item.claimIds = replaceIds(item.claimIds, replacements);
  for (const item of ledger.journeys) {
    for (const step of item.steps) step.claimIds = replaceIds(step.claimIds, replacements);
    for (const dependency of item.dependencies) dependency.claimIds = replaceIds(dependency.claimIds, replacements);
  }
};

// Direct Act PDF replaces two inherited portal-level/compound statutory claims.
const reporting = claim('claim_ind32_birth_workflow_place_reporting');
reporting.sourceIds = [sourceAct]; reporting.evidenceGrade = 'A'; reporting.basis = 'observation'; reporting.status = 'verified';
reporting.text = 'Section 8 assigns reporting responsibility by place and circumstances, including the head of the house for a domiciliary birth and the medical officer in charge or authorised person for a hospital or similar institution birth.';
reporting.notes = 'Statutory allocation only; it does not identify a current Bengaluru office or portal screen.';
const certificate = claim('claim_ind32_birth_workflow_certificate');
certificate.sourceIds = [sourceAct]; certificate.evidenceGrade = 'A'; certificate.basis = 'observation'; certificate.status = 'verified';
certificate.text = 'Section 17(1) allows any person, subject to State rules including fees and postal charges, to cause a Registrar to search the register and obtain a birth certificate electronically or otherwise; section 17(2) requires certification.';
certificate.notes = 'Section 17 legal access only; current lookup fields, fee, delivery and certificate-download behaviour remain unobserved.';
const mergeStatutory = new Map([
  ['claim_ind42_birth_act_reporting_allocation', reporting.id],
  ['claim_ind42_birth_act_search_and_copy', certificate.id],
]);
remapClaims(mergeStatutory);
ledger.claims = ledger.claims.filter((item) => !mergeStatutory.has(item.id));

// Split three compound observations into atomic source-backed claims.
const capabilities = claim('claim_ind42_birth_ejanma_public_capabilities');
if (capabilities) {
  capabilities.text = 'The official Karnataka Chief Registrar/eJanMa public-site capture lists public links for Download Certificate, Birth/Death Verification, and Application Status.';
  capabilities.nodeIds = ['node_birth_public_entry', 'node_record_lookup', 'node_certificate_output'];
}
// The staff statement from the same capture is out of scope for this copy
// path and has no standalone handoff claim, so it is omitted rather than
// retaining a compound citation.

const copyRecovery = claim('claim_ind42_birth_ejanma_copy_recovery');
if (copyRecovery) {
  copyRecovery.text = 'The official Karnataka Chief Registrar/eJanMa public-site capture directs requests for additional birth/death certificate copies to data-entry operators of the concerned Nada Kacheri and respective birth-and-death registration centres.';
  copyRecovery.nodeIds = ['node_record_lookup', 'node_certificate_output'];
}
const outputRecovery = byId(node('node_certificate_output').recoveries, 'recovery_ind42_birth_copy_clarification');
if (outputRecovery && copyRecovery) { outputRecovery.label = 'Registration-centre copy handoff'; outputRecovery.description = 'The official eJanMa capture directs additional-copy requests to data-entry operators of the concerned Nada Kacheri and respective birth-and-death registration centres.'; outputRecovery.claimIds = [copyRecovery.id]; }
if (copyRecovery) node('node_certificate_output').claimIds = [...new Set([...node('node_certificate_output').claimIds, copyRecovery.id])];

const publishedRecovery = claim('claim_ind42_birth_published_recovery');
publishedRecovery.text = 'The BenSCL public Contact Us page publishes phone 080-22200080 and email bsclnodal@gmail.com.';
publishedRecovery.sourceIds = [sourceContact]; publishedRecovery.nodeIds = ['node_birth_public_entry', 'node_certificate_output'];
const back = byId(node('node_record_lookup').recoveries, 'recovery_ind42_birth_back_control');
if (back) back.claimIds = ['claim_ind42_birth_public_controls'];

// Keep one precise public-boundary unknown and one case-specific result unknown.
const outcomeUnknown = claim('claim_ind42_birth_outcome_unknown');
outcomeUnknown.text = 'The public pass did not establish post-identifier result, no-record message, fee, login requirement, certificate download, acknowledgement, status tracking, or recovery after a failed lookup.';
const liveResultUnknown = claim('claim_ind42_birth_live_record_result_unknown');
liveResultUnknown.text = 'A particular Bengaluru birth record’s found/not-found or error result was not determined because no case-specific identifier or search was entered.';
liveResultUnknown.basis = 'inference'; liveResultUnknown.nodeIds = ['node_record_lookup'];
const mergeUnknown = new Map([['claim_ind42_birth_current_copy_delivery_unknown', outcomeUnknown.id]]);
remapClaims(mergeUnknown);
ledger.claims = ledger.claims.filter((item) => !mergeUnknown.has(item.id));

// Citizen accounts belong to their actual name/correction journeys, not the
// default copy journey. They remain single-report, partial evidence.
const nameScenario = 'scenario_ind32_birth_name_workflow';
const correctionScenario = 'scenario_ind32_birth_correction_workflow';
for (const id of ['claim_ind42_birth_name_portal_field_unusable', 'claim_ind42_birth_registered_name_missing_output']) {
  const item = claim(id); item.scenarioIds = [nameScenario]; item.nodeIds = ['node_name_inclusion'];
  node('node_name_inclusion').claimIds = [...new Set([...node('node_name_inclusion').claimIds, id])];
}
addUnique(node('node_name_inclusion').failureSignals, { id: 'failure_ind42_birth_name_field_report', label: 'Reported name-entry field problem', description: 'One parent reported being unable to enter a child name in a Seva Sindhu field; this does not establish a general current portal defect.', claimIds: ['claim_ind42_birth_name_portal_field_unusable'], status: 'partial' });
addUnique(node('node_name_inclusion').failureSignals, { id: 'failure_ind42_birth_name_missing_output_report', label: 'Reported missing name in downloaded output', description: 'One parent reported an empty child-name field in a downloaded certificate despite a hospital-submitted name; the affected stage is not established.', claimIds: ['claim_ind42_birth_registered_name_missing_output'], status: 'partial' });
const correction = claim('claim_ind42_birth_correction_unreceipted_payment');
correction.scenarioIds = [correctionScenario]; correction.nodeIds = ['node_correction']; correction.status = 'partial'; correction.contradictsClaimIds = [];
correction.notes = 'One public allegation about a correction encounter. It does not establish an official payment requirement or general office practice.';
node('node_correction').claimIds = [...new Set([...node('node_correction').claimIds, correction.id])];
addUnique(node('node_correction').failureSignals, { id: 'failure_ind42_birth_correction_payment_report', label: 'Reported unreceipted-payment request', description: 'One parent alleged an unexpected unreceipted payment request in a correction encounter; it is not evidence of an official fee or universal practice.', claimIds: [correction.id], status: 'partial' });

// Remove unsupported workflow-boundary citations from existing edges; retain
// only statutory evidence for the legal dependencies.
for (const edgeId of ['edge_ind32_birth_public_jurisdiction', 'edge_ind32_birth_jurisdiction_lookup']) {
  const edge = byId(ledger.edges, edgeId);
  if (edge) {
    edge.claimIds = edge.claimIds.filter((id) => !['claim_ind42_birth_registration_identifier_boundary', outcomeUnknown.id].includes(id));
    edge.label = 'Statutory/planning dependency: identify the relevant local Registrar before directing a register search; this is not a demonstrated live UI sequence.';
  }
}
const lookupOutput = byId(ledger.edges, 'edge_ind32_birth_lookup_output');
if (lookupOutput) {
  lookupOutput.claimIds = [certificate.id];
  lookupOutput.label = 'Section 17 supports certificate access after a register search; the current delivery route was not observed.';
}

for (const target of [node('node_birth_public_entry'), node('node_event_jurisdiction'), node('node_record_lookup'), node('node_certificate_output')]) delete target.researchedNoSourceFound;
ledger.roadblocks = ledger.roadblocks.filter((item) => item.id !== 'roadblock_audit_birth_certificate');
const liveRoadblock = byId(ledger.roadblocks, 'roadblock_ind42_birth_live_copy_behavior_unknown');
if (liveRoadblock) {
  liveRoadblock.symptom = 'The Act provides legal search/certificate access, but the current Bengaluru public lookup fields, fee, delivery, status, and not-found response were not verified in this pass.';
  liveRoadblock.likelyCause = 'Current implementation was not taken past the case-specific identifier boundary; the official eJanMa capture is dated 2024 and implementation details sit in State rules.';
}
const directoryRoadblock = byId(ledger.roadblocks, 'roadblock_ind42_birth_directory_unreachable');
if (directoryRoadblock) directoryRoadblock.status = 'partial';
const boundaryRoadblock = byId(ledger.roadblocks, 'roadblock_ind42_birth_identifier_boundary');
if (boundaryRoadblock) boundaryRoadblock.recovery = 'Back is navigation only. The BenSCL contact may help clarify the route but does not promise a lookup recovery; no birth-specific no-record recovery was observed.';

ledger.sources = ledger.sources.filter((item) => item.id !== 'source_ind42_birth_faq');
const auditOnlyClaimIds = new Set(['claim_ind42_birth_ejanma_bbmp_registration_staff', 'claim_ind42_birth_ejanma_district_clarification', 'claim_ind42_birth_lookup_navigation_controls']);
ledger.claims = ledger.claims.filter((item) => !auditOnlyClaimIds.has(item.id));
for (const item of ledger.nodes) {
  item.claimIds = item.claimIds.filter((id) => !auditOnlyClaimIds.has(id));
  for (const details of [item.checks, item.failureSignals, item.recoveries]) for (const detail of details) detail.claimIds = detail.claimIds.filter((id) => !auditOnlyClaimIds.has(id));
}

// The citation gate found the captured eJanMa PDF and the legacy BBMP error
// page unavailable from a fresh external check. Do not ship claims that a
// reader cannot independently open. The remaining live SmartNet and Act
// evidence still makes the public boundary clear.
const unreliableClaims = new Set([
  'claim_ind42_birth_ejanma_public_capabilities',
  'claim_ind42_birth_ejanma_copy_recovery',
  'claim_ind42_birth_directory_failure',
]);
ledger.claims = ledger.claims.filter((item) => !unreliableClaims.has(item.id));
for (const item of ledger.nodes) {
  item.claimIds = item.claimIds.filter((id) => !unreliableClaims.has(id));
  for (const field of ['checks', 'failureSignals', 'recoveries']) {
    item[field] = item[field].filter((detail) => {
      detail.claimIds = detail.claimIds.filter((id) => !unreliableClaims.has(id));
      return detail.claimIds.length > 0;
    });
  }
}
for (const item of ledger.edges) item.claimIds = item.claimIds.filter((id) => !unreliableClaims.has(id));
ledger.roadblocks = ledger.roadblocks.filter((item) => item.id !== 'roadblock_ind42_birth_directory_unreachable');
for (const item of ledger.roadblocks) item.claimIds = item.claimIds.filter((id) => !unreliableClaims.has(id));
for (const item of ledger.journeys) {
  item.failureRoadblockIds = item.failureRoadblockIds.filter((id) => id !== 'roadblock_ind42_birth_directory_unreachable');
  for (const step of item.steps) step.claimIds = step.claimIds.filter((id) => !unreliableClaims.has(id));
  for (const dependency of item.dependencies) dependency.claimIds = dependency.claimIds.filter((id) => !unreliableClaims.has(id));
}
ledger.sources = ledger.sources.filter((item) => !['source_ind42_birth_faq', 'source_ind42_birth_ejanma_official_snapshot', 'source_ind42_birth_bbmp_directory_error'].includes(item.id));
ledger.agencies = ledger.agencies.filter((item) => item.id !== 'agency_bbmp_health_ind42');
for (const item of ledger.sources) if (item.id === sourceAct) item.url = currentActUrl;
for (const item of ledger.nodes) for (const field of ['checks', 'failureSignals', 'recoveries']) for (const detail of item[field]) if (oldActUrls.has(detail.url)) detail.url = currentActUrl;
const journey = ledger.journeys.find((item) => item.scenarioId === scenarioId);
if (journey) journey.documentationQualityNotes = [...new Set([
  ...journey.documentationQualityNotes.filter((note) => !note.startsWith('Stated limitation from the independent audit')),
  'Stated limitation from the independent audit: this pass establishes the public pre-identifier controls and statutory access, not current post-identifier lookup results, fees, delivery, status, or recovery.',
])];

await writeFile('ledger/birth-certificate.json', `${JSON.stringify(ledger, null, 2)}\n`);
console.log('Applied IND-42 audit corrections.');
