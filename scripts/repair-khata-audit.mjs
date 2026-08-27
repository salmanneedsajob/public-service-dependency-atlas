import { readFile, writeFile } from 'node:fs/promises';

const ledger = JSON.parse(await readFile('ledger/khata.json', 'utf8'));
const sourceAliases = {
  source_ind32_eaasthi_citizen_login: 'source_eaasthi_login',
  source_ind32_eaasthi_public_search: 'source_eaasthi_search',
  source_ind32_ekhata_status: 'source_eaasthi_status',
  source_ind32_old_owner_reapplication: 'source_citizen_old_owner_recovery',
};
for (const claim of ledger.claims) claim.sourceIds = claim.sourceIds.map((id) => sourceAliases[id] ?? id);
ledger.sources = ledger.sources.filter((source) => !sourceAliases[source.id]);
const duplicateClaims = new Set([
  'claim_ind32_missing_property_route', 'claim_ind32_public_search_inputs',
  'claim_ind32_ekhata_status_public_route', 'claim_ind32_pending_mutation_report_fields',
  'claim_ind32_automatic_mutation_entry', 'claim_ind32_payment_failure_recovery',
]);
ledger.claims = ledger.claims.filter((claim) => !duplicateClaims.has(claim.id));
for (const collection of [ledger.nodes, ledger.edges, ledger.roadblocks, ledger.journeys]) {
  for (const record of collection) {
    if (record.claimIds) record.claimIds = record.claimIds.filter((id) => !duplicateClaims.has(id));
    if (record.steps) for (const step of record.steps) step.claimIds = step.claimIds.filter((id) => !duplicateClaims.has(id));
    if (record.dependencies) for (const dep of record.dependencies) dep.claimIds = dep.claimIds.filter((id) => !duplicateClaims.has(id));
  }
}
for (const id of ['claim_ind32_reapplication_after_invalidating', 'claim_ind32_missing_document_reapply']) {
  const claim = ledger.claims.find((item) => item.id === id); if (claim) claim.contradictsClaimIds = [];
}
const lead = ledger.claims.find((item) => item.id === 'claim_ind32_manual_khata_not_automatic');
if (lead) lead.status = 'partial';
const legacy = ledger.claims.find((item) => item.id === 'claim_legacy_route_taxonomy');
if (legacy) { legacy.evidenceGrade = 'Unknown'; legacy.status = 'unknown'; legacy.sourceIds = []; }
const unsupportedEdges = new Set(['edge_sale_to_mutation','edge_mutation_to_final','edge_final_to_epid','edge_mapping_to_transfer','edge_ind32_sale_deed_to_mutation','edge_ind32_final_ekhata_to_epid','edge_ind32_mutation_to_status']);
ledger.edges = ledger.edges.filter((edge) => !unsupportedEdges.has(edge.id));
const conditional = ledger.edges.find((edge) => edge.id === 'edge_ind32_mutation_to_final_ekhata');
if (conditional) { conditional.status = 'verified'; conditional.label = 'After published notice, no objection, and certification, Rule 10(3) provides for Form 24; the live portal handoff is not verified.'; conditional.claimIds = ['claim_ind32_rule10_no_objection_form24']; }
const propertyRecovery = ledger.edges.find((edge) => edge.id === 'edge_ind32_property_search_to_missing_route');
if (propertyRecovery) { propertyRecovery.status = 'verified'; propertyRecovery.claimIds = ['claim_ekhata_search_recovery']; propertyRecovery.label = 'The public e-Aasthi search publishes the conditional Do Not Find My Property recovery route.'; }
const epidMapping = ledger.edges.find((edge) => edge.id === 'edge_epid_to_mapping');
if (epidMapping) epidMapping.status = 'partial';
const auditLimitations = [
  ['roadblock_audit_legacy_route', 'Audit limitation: legacy BESCOM route taxonomy', 'The prior legacy route claim is retained only as Unknown because the formerly cited endpoint could not be verified.', 'The historical route taxonomy is not a current instruction.'],
  ['roadblock_audit_authenticated_boundary', 'Audit limitation: authenticated municipal workflow', 'Public sources do not establish the authenticated mutation form, eligibility checks, or end-to-end processing sequence.', 'Treat login-gated steps as Unknown; do not infer a complete route from public labels.'],
  ['roadblock_audit_reported_edges', 'Audit limitation: reported versus officially documented dependencies', 'Some dependency edges remain partial or Unknown because public sources do not document the whole handoff.', 'Reported or conditional edges are visibly labelled; official silence is a documented gap, not proof that citizens did not encounter it.'],
];
for (const [id, title, symptom, recovery] of auditLimitations) if (!ledger.roadblocks.some((item) => item.id === id)) ledger.roadblocks.push({ id, title, category: 'documentation', symptom, likelyCause: 'Audit-recorded evidence boundary.', recovery, ownerAgencyIds: [], nodeIds: [], scenarioIds: ['scenario_clean_sale'], claimIds: [], status: 'unknown' });
const propertyMissing = ledger.roadblocks.find((item) => item.id === 'roadblock_property_missing'); if (propertyMissing) propertyMissing.status = 'partial';
for (const edge of ledger.edges) {
  const grades = edge.claimIds.map((id) => ledger.claims.find((claim) => claim.id === id)?.evidenceGrade);
  if (!grades.some((grade) => grade === 'A' || grade === 'B')) { edge.status = 'unknown'; edge.label = `${edge.label} Reported by citizens; not officially documented.`; }
}
await writeFile('ledger/khata.json', `${JSON.stringify(ledger, null, 2)}\n`);
console.log('Applied khata audit repairs.');
