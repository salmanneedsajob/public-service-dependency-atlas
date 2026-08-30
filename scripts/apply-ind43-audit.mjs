import { readFile, writeFile } from 'node:fs/promises';

const ledger = JSON.parse(await readFile('ledger/death-certificate.json', 'utf8'));
const byId = (items, id) => items.find((item) => item.id === id);
const claim = (id) => byId(ledger.claims, id);
const addUnique = (items, item) => { if (!byId(items, item.id)) items.push(item); };
const correctionScenario = 'scenario_ind32_death_correction';

// The audit artifact is not citizen-facing evidence.
ledger.roadblocks = ledger.roadblocks.filter((item) => item.id !== 'roadblock_audit_death_certificate');

// SmartNet was observed as a public page, not established as an authorised
// e-JanMa/BBMP route. Preserve the observation while removing that implication.
for (const id of [
  'claim_ind43_death_event_selector', 'claim_ind43_death_search_modes',
  'claim_ind43_death_registration_fields', 'claim_ind43_death_temporary_field',
  'claim_ind43_death_dod_fields', 'claim_ind43_death_public_controls',
]) {
  const item = claim(id);
  if (item) item.notes = 'Grade B direct observation of a publicly reachable SmartNet page only. This pass did not establish that page as an authorised e-JanMa/BBMP civil-registration route.';
}

// Keep each existing ID as one atomic assertion and add separately citable
// assertions for the other controls previously bundled into one claim.
const split = (id, text, extra = []) => {
  const item = claim(id);
  if (!item) return;
  item.text = text;
  for (const addition of extra) addUnique(ledger.claims, {
    ...item,
    id: addition.id,
    text: addition.text,
    nodeIds: addition.nodeIds ?? item.nodeIds,
    notes: addition.notes ?? item.notes,
  });
};
split('claim_ind43_death_public_search_fields', 'The current public eJanMa Birth/Death Search page displays a Birth/Death choice before search.', [
  { id: 'claim_ind43_death_public_search_registration_number', text: 'The current public eJanMa Birth/Death Search page displays a Registration No. field before search.' },
  { id: 'claim_ind43_death_public_search_event_date', text: 'The current public eJanMa Birth/Death Search page displays a Birth/Death Date field before search.' },
  { id: 'claim_ind43_death_public_search_captcha', text: 'The current public eJanMa Birth/Death Search page displays a CAPTCHA before search.' },
  { id: 'claim_ind43_death_public_search_legacy_link', text: 'The current public eJanMa Birth/Death Search page links to a separate ULB-data search for registration dates before 01/07/2018.' },
]);
split('claim_ind43_death_manual_lookup_modes', 'The linked Karnataka death-certificate manual describes lookup using a previously issued registration number.', [
  { id: 'claim_ind43_death_manual_lookup_without_registration_number', text: 'The linked Karnataka death-certificate manual describes a lookup without a registration number using date of death, deceased name, father name, and mother name.' },
]);
split('claim_ind43_death_manual_output_flow', 'The linked Karnataka death-certificate manual instructs a user to verify returned details before continuing.', [
  { id: 'claim_ind43_death_manual_copy_count', text: 'The linked Karnataka death-certificate manual instructs a user to choose the number of certificate copies.' },
  { id: 'claim_ind43_death_manual_submit_captcha', text: 'The linked Karnataka death-certificate manual instructs a user to submit a CAPTCHA before payment.' },
  { id: 'claim_ind43_death_manual_payment', text: 'The linked Karnataka death-certificate manual describes payment after certificate-copy selection.' },
  { id: 'claim_ind43_death_manual_acknowledgement', text: 'The linked Karnataka death-certificate manual instructs a user to retain the generated acknowledgement/reference.' },
  { id: 'claim_ind43_death_manual_tracking', text: 'The linked Karnataka death-certificate manual describes tracking an application after login.' },
  { id: 'claim_ind43_death_manual_download', text: 'The linked Karnataka death-certificate manual describes downloading the certificate once delivered.' },
]);
split('claim_ind43_death_act_search_certified_copy', 'Section 17(1) permits a person, subject to State rules, to cause a Registrar to search a death register.', [
  { id: 'claim_ind43_death_act_certificate_access', text: 'Section 17(1) permits a person, subject to State rules, to obtain a death certificate electronically or otherwise after a register search.' },
  { id: 'claim_ind43_death_act_certificate_certification', text: 'Section 17(2) requires certification of a death certificate by the Registrar or another State-authorised officer.' },
  { id: 'claim_ind43_death_act_cause_of_death_privacy', text: 'Section 17 provides that a death certificate must not disclose the recorded cause of death.' },
]);
split('claim_ind43_death_act_appeal', 'Section 25A allows a person aggrieved by a Registrar action or order to appeal to the District Registrar within thirty days in the prescribed form and manner.', [
  { id: 'claim_ind43_death_act_chief_registrar_appeal', text: 'Section 25A allows a person aggrieved by a District Registrar action or order to appeal to the Chief Registrar within thirty days in the prescribed form and manner.' },
  { id: 'claim_ind43_death_act_appeal_decision_period', text: 'Section 25A directs the deciding authority to decide an appeal within ninety days.' },
]);
split('claim_ind43_death_published_recovery', 'The BenSCL Contact Us page publishes phone 080-22200080 and email bsclnodal@gmail.com.', [
  { id: 'claim_ind43_death_public_navigation_controls', text: 'The observed public SmartNet page exposes a ContactUs link and a Back control; neither is evidence of a death-record resolution route.', nodeIds: ['node_death_public_tools'] },
]);

// Citizen correction accounts neither contradict each other nor establish a
// general copy route. Put them in their actual scenario as limited reports.
for (const id of ['claim_ind43_death_act_correction', 'claim_ind43_death_act_appeal', 'claim_ind43_death_act_rules_public_boundary', 'claim_ind43_death_correction_objection_unknown', 'claim_ind43_death_correction_office_request', 'claim_ind43_death_correction_court_pending']) {
  const item = claim(id);
  if (item) item.scenarioIds = [correctionScenario];
}
for (const id of ['claim_ind43_death_correction_office_request', 'claim_ind43_death_correction_court_pending']) {
  const item = claim(id);
  if (item) { item.status = 'partial'; item.contradictsClaimIds = []; item.notes = 'One citizen account. It is not evidence of a general current correction route or practice.'; }
}
const correctionRoadblock = byId(ledger.roadblocks, 'roadblock_ind43_death_correction_objection_documentation');
if (correctionRoadblock) correctionRoadblock.scenarioIds = [correctionScenario];

// Do not present generic contact or browser navigation as case recovery.
const genericContact = claim('claim_ind43_death_published_recovery');
if (genericContact) { genericContact.nodeIds = ['node_death_service_entry']; genericContact.sourceIds = ['source_ind43_death_contact']; }
const controls = claim('claim_ind43_death_public_controls');
if (controls) controls.nodeIds = ['node_death_public_tools'];
const boundary = byId(ledger.roadblocks, 'roadblock_ind43_death_identifier_boundary');
if (boundary) {
  boundary.ownerAgencyIds = [];
  boundary.recovery = 'Back is navigation only. A generic BenSCL contact is published, but no death-record-specific no-record or failed-lookup recovery was established.';
}

// Describe every edge at the strongest supported level—statutory or public
// boundary—not as an observed end-to-end production sequence.
const edges = new Map(ledger.edges.map((item) => [item.id, item]));
Object.assign(edges.get('edge_death_entry_classify'), {
  label: 'Planning boundary: the public record-search route requires knowing whether a record can be located; the live classification route was not observed.',
  claimIds: ['claim_ind43_death_public_search_fields', 'claim_ind43_death_record_result_unknown'],
});
Object.assign(edges.get('edge_death_classify_tools'), {
  label: 'Published search boundary: a known record can be searched through the public eJanMa page; live matching was not tested.',
  claimIds: ['claim_ind43_death_public_search_fields', 'claim_ind43_death_act_search_certified_copy'],
});
Object.assign(edges.get('edge_death_classify_registrar'), {
  label: 'Statutory boundary: a Registrar records events in the Registrar’s jurisdiction; this is not a demonstrated routing sequence for correction or delay.',
  claimIds: ['claim_ind43_death_act_registrar_jurisdiction'],
});
Object.assign(edges.get('edge_death_tools_outcome'), {
  label: 'Statutory boundary: a register search may support certificate access; the current result, fee, delivery and no-record behaviour were not observed.',
  claimIds: ['claim_ind43_death_act_certificate_access', 'claim_ind43_death_outcome_unknown'],
});
Object.assign(edges.get('edge_death_registrar_outcome'), {
  label: 'Statutory correction boundary: section 15 allows a Registrar to correct or cancel an erroneous entry; a current Bengaluru filing route and outcome are not publicly established here.',
  claimIds: ['claim_ind43_death_act_correction', 'claim_ind43_death_correction_objection_unknown'],
});

// The citation gate deliberately caps a new precise URL at five claims. Keep
// the most decision-useful atomic manual observations; the omitted controls
// are not needed to support the map and remain unclaimed rather than bundled.
const removedAtomicClaims = new Set([
  'claim_ind43_death_public_controls',
  'claim_ind43_death_public_navigation_controls',
  'claim_ind43_death_manual_copy_count',
  'claim_ind43_death_manual_submit_captcha',
  'claim_ind43_death_manual_payment',
  'claim_ind43_death_manual_download',
]);
// SmartNet is both unauthorised in this evidence set and already a heavily
// cited atlas URL. The tightened citation rule says not to add another service
// entry on that general page, so omit these interface observations entirely.
for (const item of ledger.claims) if (item.sourceIds.includes('source_ind43_death_lookup_live')) removedAtomicClaims.add(item.id);
ledger.claims = ledger.claims.filter((item) => !removedAtomicClaims.has(item.id));
for (const item of ledger.nodes) {
  item.claimIds = item.claimIds.filter((id) => !removedAtomicClaims.has(id));
  for (const field of ['checks', 'failureSignals', 'recoveries']) {
    item[field] = item[field].filter((detail) => {
      detail.claimIds = detail.claimIds.filter((id) => !removedAtomicClaims.has(id));
      return detail.claimIds.length > 0;
    });
  }
}
for (const item of ledger.edges) item.claimIds = item.claimIds.filter((id) => !removedAtomicClaims.has(id));
for (const item of ledger.roadblocks) item.claimIds = item.claimIds.filter((id) => !removedAtomicClaims.has(id));
for (const item of ledger.journeys) {
  for (const step of item.steps) step.claimIds = step.claimIds.filter((id) => !removedAtomicClaims.has(id));
  for (const dependency of item.dependencies) dependency.claimIds = dependency.claimIds.filter((id) => !removedAtomicClaims.has(id));
}
ledger.sources = ledger.sources.filter((item) => item.id !== 'source_ind43_death_lookup_live');

const journey = ledger.journeys.find((item) => item.scenarioId === 'scenario_ind32_death_copy');
if (journey) journey.documentationQualityNotes = [...new Set([
  ...(journey.documentationQualityNotes ?? []),
  'Stated limitation from the independent audit: this entry establishes statutory and published eJanMa boundaries, not a demonstrated authorised end-to-end municipal route; current live match, payment, delivery, no-record and recovery behaviour remain unobserved.',
])];
for (const item of ledger.journeys) if (item.scenarioId === correctionScenario) item.documentationQualityNotes = [...new Set([
  ...(item.documentationQualityNotes ?? []),
  'Stated limitation from the independent audit: statutory correction and appeal boundaries are documented, but no current Bengaluru public correction form, checklist, objection/hearing process or appeal filing channel was established.',
])];

await writeFile('ledger/death-certificate.json', `${JSON.stringify(ledger, null, 2)}\n`);
console.log('Applied IND-43 audit corrections.');
