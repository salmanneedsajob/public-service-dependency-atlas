import { readFile, writeFile } from 'node:fs/promises';

const ledger = JSON.parse(await readFile('ledger/building-plan.json', 'utf8'));
const byId = (items, id) => items.find((item) => item.id === id);
const unique = (items) => [...new Set(items)];

// A stale embedded audit is not service evidence. The external audit is preserved separately.
ledger.roadblocks = ledger.roadblocks.filter((roadblock) => roadblock.id !== 'roadblock_audit_building_plan');

// Consolidate duplicate URL records around the current IND-47 observations/documents.
const sourceReplacement = new Map([
  ['source_building_index', 'source_ind47_bpas_public_entry'],
  ['source_building_submission', 'source_ind47_bpas_public_entry'],
  ['source_building_w_submission', 'source_ind47_bpas_entry_live'],
  ['source_building_procedure', 'source_ind47_bpas_faq'],
  ['source_building_w_procedure', 'source_ind47_bpas_faq_live'],
  ['source_building_bpas', 'source_ind47_plan_approval_manual'],
  ['source_building_w_bpas', 'source_ind47_plan_approval_manual'],
]);
for (const claim of ledger.claims) claim.sourceIds = unique(claim.sourceIds.map((id) => sourceReplacement.get(id) ?? id));
ledger.sources = ledger.sources.filter((source) => !sourceReplacement.has(source.id));

// The cited FAQ does not reproduce the historical procedure-index route labels.
const historicRoute = byId(ledger.claims, 'claim_building_w_route');
if (historicRoute) {
  historicRoute.text = 'The earlier route-label index cited in this atlas could not be independently reproduced from the current public BPAS FAQ.';
  historicRoute.sourceIds = [];
  historicRoute.evidenceGrade = 'Unknown';
  historicRoute.basis = 'inference';
  historicRoute.status = 'unknown';
  historicRoute.notes = 'The prior route-label endpoint is unavailable. Sakala/manual/head-office labels and property applicability remain unverified.';
}
const statutory = byId(ledger.claims, 'claim_building_sec299');
if (statutory) {
  statutory.text = 'The atlas has not independently verified a claim-specific official text for the detailed Section 299 requirements previously summarised here.';
  statutory.sourceIds = [];
  statutory.evidenceGrade = 'Unknown';
  statutory.basis = 'inference';
  statutory.status = 'unknown';
  statutory.notes = 'The retained India Code entry point is not a claim-specific reproduction of the statutory text.';
}

// Observed public interfaces are verified observations; unknown live-case conclusions are inferences.
for (const id of [
  'claim_ind47_ekatha_mandatory_message', 'claim_ind47_online_professional_predcr_route',
  'claim_ind47_faq_document_leads', 'claim_ind47_noc_conditions',
  'claim_ind47_eight_permit_steps', 'claim_ind47_public_checklist_inputs',
  'claim_ind47_suvarna_document_leads', 'claim_ind47_suvarna_ten_working_days',
  'claim_ind47_citizen_search_fields', 'claim_ind47_online_only_payment_mode'
]) {
  const claim = byId(ledger.claims, id);
  if (claim) { claim.evidenceGrade = 'B'; claim.basis = 'observation'; claim.status = id === 'claim_ind47_online_only_payment_mode' ? 'contested' : 'verified'; }
}
for (const id of ['claim_ind47_live_case_boundary_unknown', 'claim_ind47_post_login_path_unknown', 'claim_ind47_case_specific_state_unknown']) {
  const claim = byId(ledger.claims, id);
  if (claim) claim.basis = 'inference';
}

// The Phase 2 citation gate limits a newly added public page to five atomic
// claims. Preserve the unverified remainder as Unknown rather than turning a
// generic page into a catch-all citation.
const limitCitation = (id) => {
  const claim = byId(ledger.claims, id);
  if (!claim) return;
  claim.sourceIds = [];
  claim.evidenceGrade = 'Unknown';
  claim.basis = 'inference';
  claim.status = 'unknown';
  claim.notes = `${claim.notes ?? ''} This broad statement is retained only as an unresolved lead after the source-specific citation cap.`.trim();
};
for (const id of [
  'claim_building_public_listing',
  'claim_building_route_labels', 'claim_ind47_caf_fields_and_noc_transfer',
  'claim_ind47_single_window_noc_recovery', 'claim_ind47_online_payment_and_demand_note',
  'claim_ind47_risk_matrix', 'claim_ind47_online_application_inputs',
  'claim_ind47_status_and_stages', 'claim_ind47_documents_nocs',
  'claim_ind47_rejection_signals', 'claim_ind47_fee_and_payment_guidance',
  'claim_ind47_faq_document_leads',
  'claim_building_bpas_architect', 'claim_building_bpas_docs',
  'claim_building_bpas_review', 'claim_building_bpas_fee_license'
]) limitCitation(id);
const recoveryClaim = byId(ledger.claims, 'claim_ind47_recovery_published');
if (recoveryClaim) recoveryClaim.sourceIds = ['source_ind47_helpdesk_ticket_live'];

// Keep the three incompatible current FAQ payment propositions visibly contested, without resolving them.
const paymentClaims = ['claim_ind47_fee_and_payment_guidance', 'claim_ind47_online_only_payment_do_guidance', 'claim_ind47_online_only_payment_mode'];
for (const id of paymentClaims) {
  const claim = byId(ledger.claims, id);
  if (!claim) continue;
  claim.status = 'contested';
  claim.contradictsClaimIds = paymentClaims.filter((other) => other !== id && byId(ledger.claims, other));
  claim.notes = `${claim.notes ?? ''} Public FAQ statements are retained as unreconciled guidance; no payment method was attempted.`.trim();
}

// A single unverified citizen account cannot establish a factual contradiction.
for (const id of ['claim_ind47_building_public_map_signal_reported', 'claim_ind47_building_builder_sanction_representation_reported']) {
  const claim = byId(ledger.claims, id);
  if (claim) { claim.status = 'partial'; claim.contradictsClaimIds = []; }
}
const dueDiligence = byId(ledger.roadblocks, 'roadblock_ind47_building_conflicting_representations');
if (dueDiligence) {
  dueDiligence.title = 'Unverified due-diligence lead about map and sanction representations';
  dueDiligence.status = 'partial';
}

// Make the current evidence reciprocal with nodes, so it is visible to the renderer.
for (const node of ledger.nodes) {
  node.claimIds = unique(ledger.claims.filter((claim) => claim.nodeIds.includes(node.id)).map((claim) => claim.id));
}

const addDetail = (nodeId, field, detail) => {
  const node = byId(ledger.nodes, nodeId);
  if (!node || node[field].some((entry) => entry.id === detail.id)) return;
  node[field].push(detail);
};
addDetail('node_building_w_inspection', 'checks', {
  id: 'check_ind47_inspection_schedule', label: 'Published inspection document lead',
  description: 'A current public BPAS page links an inspection procedure document; this pass did not observe a property inspection or appointment.',
  url: 'https://site.bbmp.gov.in/PDF/buildingplanapproval/Site%20Inspection%20For%20Plan.pdf',
  claimIds: ['claim_ind47_site_inspection_document_schedule'], status: 'partial'
});
addDetail('node_building_w_inspection', 'failureSignals', {
  id: 'failure_ind47_inspection_case_unknown', label: 'Inspection outcome not publicly observable',
  description: 'No project, visit, inspection remark or outcome was observed in this public-only pass.',
  url: 'https://bpas.bbmpgov.in/BPAMSClient4/CommonForms/FAQs.aspx',
  claimIds: ['claim_ind47_live_case_boundary_unknown'], status: 'unknown'
});
addDetail('node_building_w_inspection', 'recoveries', {
  id: 'recovery_ind47_inspection_helpdesk', label: 'Published support route',
  description: 'The public BPAS helpdesk exposes a New Ticket route, but acknowledgement and inspection resolution were not tested.',
  url: 'https://bpas.bbmpgov.in/HelpDesk/Tickets/New',
  claimIds: ['claim_ind47_recovery_published'], status: 'partial'
});
addDetail('node_building_w_license', 'checks', {
  id: 'check_ind47_license_stage_leads', label: 'Published sanction-stage leads',
  description: 'Public BPAS material describes permit stages and a Suvarna timing statement; it does not establish a live sanction for a property.',
  url: 'https://bpas.bbmpgov.in/BPAMSClient4/CommonForms/FAQs.aspx',
  claimIds: ['claim_ind47_eight_permit_steps', 'claim_ind47_suvarna_ten_working_days'], status: 'partial'
});
addDetail('node_building_w_license', 'failureSignals', {
  id: 'failure_ind47_license_case_unknown', label: 'Sanction output not publicly observable',
  description: 'No live sanction, licence, certificate or case-specific refusal was observed.',
  url: 'https://bpas.bbmpgov.in/BPAMSClient4/CitizenSearch/CitizenSearch.aspx?edFlag=MA%3D%3D&iVal=MQ%3D%3D&sName=QkJNUA%3D%3D',
  claimIds: ['claim_ind47_case_specific_state_unknown'], status: 'unknown'
});
addDetail('node_building_w_license', 'recoveries', {
  id: 'recovery_ind47_license_citizen_search', label: 'Published Citizen Search lead',
  description: 'BPAS publishes a Citizen Search surface; no case identifier was entered and no result was reviewed.',
  url: 'https://bpas.bbmpgov.in/BPAMSClient4/CitizenSearch/CitizenSearch.aspx?edFlag=MA%3D%3D&iVal=MQ%3D%3D&sName=QkJNUA%3D%3D',
  claimIds: ['claim_ind47_citizen_search_fields'], status: 'partial'
});

// The default scenario must include the public entry; the later order is explicitly unconfirmed.
for (const scenarioId of ['scenario_building_w_suvarna', 'scenario_building_w_general']) {
  const scenario = byId(ledger.scenarios, scenarioId);
  if (scenario && !scenario.pathNodeIds.includes('node_building_w_entry')) scenario.pathNodeIds.unshift('node_building_w_entry');
  if (scenario) scenario.summary = `${scenario.summary} The public evidence does not confirm this as an end-to-end current application sequence.`;
}
const inspectionFee = byId(ledger.edges, 'edge_building_w_inspection_fee');
if (inspectionFee) {
  inspectionFee.status = 'unknown';
  inspectionFee.label = 'Inspection and fee stages are both described, but their current order is not publicly confirmed';
  inspectionFee.claimIds = inspectionFee.claimIds.filter((id) => id !== 'claim_building_w_fee_license');
}

// Consolidate duplicate agency IDs; remove an unused BDA record carrying a BBMP URL.
const agencyReplacement = new Map([
  ['agency_gba_building_ind32_w', 'agency_gba_building_ind32'],
  ['agency_bpas_ind32_w', 'agency_bbmp_bpas_ind32'],
]);
for (const node of ledger.nodes) node.ownerAgencyId = agencyReplacement.get(node.ownerAgencyId) ?? node.ownerAgencyId;
for (const roadblock of ledger.roadblocks) roadblock.ownerAgencyIds = unique(roadblock.ownerAgencyIds.map((id) => agencyReplacement.get(id) ?? id));
ledger.agencies = ledger.agencies.filter((agency) => !agencyReplacement.has(agency.id) && agency.id !== 'agency_bda_ind32_building');
byId(ledger.agencies, 'agency_bbmp_bpas_ind32').officialUrl = 'https://bpas.bbmpgov.in/BPAMSClient4/NewDefault1.aspx';

const journey = byId(ledger.journeys, 'journey_building_w_public');
if (journey) {
  journey.context = 'A public-interface evidence map, not a confirmed end-to-end building-permission application route.';
  journey.documentationQualityNotes = unique([
    ...journey.documentationQualityNotes,
    'Current authenticated form sequence, validation, handoffs and case outcomes were not observed.',
    'Historic route labels could not be independently reproduced from a current procedure index.',
    'Inspection-to-fee ordering and payment guidance remain unresolved in public material.',
    'Citizen reports are leads only; they do not establish delays, legal status, sanction validity or utility requirements.',
    'Several broad source observations remain compound in the ledger and are retained as stated limitations pending a future atomisation pass.'
  ]);
}

ledger.meta.asOf = '2026-08-31';
await writeFile('ledger/building-plan.json', `${JSON.stringify(ledger, null, 2)}\n`);
console.log('Applied IND-47 audit.');
