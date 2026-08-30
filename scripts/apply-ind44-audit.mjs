import { readFile, writeFile } from 'node:fs/promises';

const ledger = JSON.parse(await readFile('ledger/new-electricity.json', 'utf8'));
const byId = (items, id) => items.find((item) => item.id === id);
const claim = (id) => byId(ledger.claims, id);
const normal = 'scenario_ind32_electricity_normal';
const network = 'scenario_ind32_electricity_network';
const jvs = 'scenario_ind32_electricity_jvs';

// Normal-form observations belong to the normal route, rather than being
// silently presented as evidence for the JVS default path.
for (const id of [
  'claim_ind44_electricity_normal_form_fields', 'claim_ind44_electricity_document_upload_boundary',
  'claim_ind44_normal_form_controls', 'claim_ind44_normal_faq_route', 'claim_ind44_normal_payment_boundary',
]) {
  const item = claim(id);
  if (item) item.scenarioIds = [normal];
}
for (const id of [
  'claim_ind44_kerc_application_ack', 'claim_ind44_kerc_existing_network_timing',
  'claim_ind44_kerc_network_extension_timing', 'claim_ind44_kerc_default_escalation',
]) {
  const item = claim(id);
  if (item) item.scenarioIds = [jvs, normal, network];
}

for (const roadblock of ledger.roadblocks) {
  roadblock.ownerAgencyIds = (roadblock.ownerAgencyIds ?? []).map((id) => id === 'agency_bescom_ind44_new_electricity' ? 'agency_bescom_ind32_new_electricity' : id);
}

// The published normal-form categories and the regulation’s statutory minimum
// conflict. Preserve both claims, visibly contested, without reconciling them.
for (const id of ['claim_ind44_electricity_document_upload_boundary', 'claim_ind44_kerc_two_documents_150kw']) {
  const item = claim(id);
  if (item) item.status = 'contested';
}
const documentConflict = byId(ledger.roadblocks, 'roadblock_ind44_electricity_document_conflict');
if (documentConflict) {
  documentConflict.status = 'contested';
  documentConflict.recovery = 'Do not assume the portal categories reconcile with the statutory two-document rule. Confirm the applicable route and document list with BESCOM before upload or payment.';
}

// The marker is valid only for an empty field; this record has an explicit
// published guidance recovery, so it must not carry a researched-silent mark.
delete byId(ledger.nodes, 'node_electricity_documents').researchedNoSourceFound;

// The available public material does not establish the order between demand,
// payment, field work and tracking. Keep the edge as an explicitly unknown
// reported handoff, not a demonstrated sequence.
const demandTracking = byId(ledger.edges, 'edge_electricity_demand_tracking');
if (demandTracking) {
  demandTracking.label = 'Undocumented handoff: a registration number may follow an online submission, but public material does not establish whether demand, payment or field work comes before tracking.';
  demandTracking.status = 'unknown';
  demandTracking.claimIds = ['claim_ind44_kerc_application_ack', 'claim_ind44_electricity_tracker_inputs'];
}

// Keep aggregates as explicitly partial control inventories rather than
// overstating every listed interface label as an independently verified rule.
for (const id of [
  'claim_ind44_electricity_jvs_default_route', 'claim_ind44_electricity_normal_form_fields',
  'claim_ind44_normal_form_controls', 'claim_ind44_jvs_detail_controls',
  'claim_ind44_jvs_misc_controls', 'claim_ind44_jvs_document_controls',
  'claim_ind44_kerc_default_escalation',
]) {
  const item = claim(id);
  if (item) {
    item.status = 'partial';
    item.notes = `${item.notes} This is a grouped control inventory, not proof that every listed item is required, available in every case, or completes an end-to-end route.`;
  }
}

// Retain only the specific FAQ timing observation. The general-home labels
// are intentionally not used as claim-level route/timing evidence.
const timing = claim('claim_ind44_public_timing_text');
if (timing) {
  timing.text = 'BESCOM’s public FAQ displays `3 working days (24 hours) after registration and payment made.` for FTNC.';
  timing.sourceIds = ['source_ind32_new_electricity_faq'];
  timing.evidenceGrade = 'B';
  timing.notes = 'Specific FAQ observation only; it does not establish a case clock or supply outcome.';
}
const paymentRecovery = claim('claim_ind44_payment_error_recovery');
if (paymentRecovery) {
  paymentRecovery.text = 'BESCOM’s public FAQ says that if money is debited but payment acknowledgement is not generated, do not pay again for the same bill; wait 24 hours for Bill Desk to confirm with the bank and update payment, or use the published Bill Desk telephone 080-25586664 and Customer Care 1912.';
  paymentRecovery.notes = 'Published recovery text; the FAQ’s email transcription was incomplete and is intentionally not presented as a usable address. No payment was attempted.';
}

// The new-source citation gate caps a newly added URL at five claims across
// the atlas. The longstanding BESCOM ledger already relies on this KERC PDF,
// so retain only the two decision-critical IND-44 assertions instead of
// padding this entry with additional timing/escalation paraphrases.
const removedKercClaims = new Set([
  'claim_ind44_kerc_existing_network_timing',
  'claim_ind44_kerc_network_extension_timing',
  'claim_ind44_kerc_default_escalation',
]);
ledger.claims = ledger.claims.filter((item) => !removedKercClaims.has(item.id));
for (const item of ledger.nodes) {
  item.claimIds = item.claimIds.filter((id) => !removedKercClaims.has(id));
  for (const field of ['checks', 'failureSignals', 'recoveries']) {
    item[field] = item[field].filter((detail) => {
      detail.claimIds = detail.claimIds.filter((id) => !removedKercClaims.has(id));
      return detail.claimIds.length > 0;
    });
  }
}
for (const item of ledger.edges) item.claimIds = item.claimIds.filter((id) => !removedKercClaims.has(id));
for (const item of ledger.roadblocks) item.claimIds = item.claimIds.filter((id) => !removedKercClaims.has(id));
ledger.roadblocks = ledger.roadblocks.filter((item) => item.id !== 'roadblock_ind44_electricity_network_clock');
for (const item of ledger.journeys) {
  item.failureRoadblockIds = item.failureRoadblockIds.filter((id) => id !== 'roadblock_ind44_electricity_network_clock');
  for (const step of item.steps) step.claimIds = step.claimIds.filter((id) => !removedKercClaims.has(id));
  for (const dependency of item.dependencies) dependency.claimIds = dependency.claimIds.filter((id) => !removedKercClaims.has(id));
}

const journey = byId(ledger.journeys, 'journey_ind32_electricity_public');
if (journey) journey.documentationQualityNotes = [...new Set([
  ...(journey.documentationQualityNotes ?? []),
  'Stated limitation from the independent audit: normal-route, network-clock, document-conflict, acknowledgement and escalation material is evidence attached to records, not a verified end-to-end normal or network journey.',
])];

await writeFile('ledger/new-electricity.json', `${JSON.stringify(ledger, null, 2)}\n`);
console.log('Applied IND-44 audit corrections.');
