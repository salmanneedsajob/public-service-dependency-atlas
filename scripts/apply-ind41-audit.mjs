import { readFile, writeFile } from 'node:fs/promises';
const ledger = JSON.parse(await readFile('ledger/water-account.json', 'utf8'));
const claim = (id) => ledger.claims.find((item) => item.id === id);
const source = (id) => ledger.sources.find((item) => item.id === id);

// The grievance form is a specific public page, unlike the inherited contact
// homepage. Retain it as a clarification lead, not a transfer application.
if (!source('source_ind41_water_account_grievance')) ledger.sources.push({id:'source_ind41_water_account_grievance',title:'BWSSB Jaladhare Grievance Form',publisher:'Bangalore Water Supply and Sewerage Board',url:'https://owcv2.bwssb.gov.in/member/grievance-form',accessedAt:'2026-08-30',type:'official_form',notes:'Public 2026-08-30 observation of consumer/application/address/remarks fields, 1916, and enquiry email. It is not labelled as an existing-account transfer form.'});
for (const id of ['claim_ind41_water_account_grievance_support','claim_ind41_grievance_recovery']) if (claim(id)) claim(id).sourceIds=['source_ind41_water_account_grievance'];

// One narrow, auditable negative finding replaces several overlapping compound
// claims. The more granular unanswered questions remain in the stated
// limitation rather than masquerading as five independent claims.
const canonicalUnknown = 'claim_ind41_transfer_requirements_unknown';
const canonical = claim(canonicalUnknown);
canonical.text = 'The public material reviewed does not establish a current BWSSB existing-account name-transfer route.';
canonical.basis = 'inference';
canonical.status = 'unknown';
canonical.sourceIds = ['source_ind32_water_account_consumer', 'source_ind32_water_account_faq', 'source_ind41_water_account_consumer_manual'];
canonical.notes = 'This is the boundary of the unauthenticated public pass, not proof that an authenticated, office-based, or unindexed route does not exist.';
const duplicateUnknownClaims = new Map([
  ['claim_ind32_water_account_transfer_unknown', canonicalUnknown],
  ['claim_ind32_water_account_workflow_case_unknown', canonicalUnknown],
  ['claim_ind41_water_account_faq_no_transfer_procedure', canonicalUnknown],
  ['claim_ind41_water_account_official_route_unestablished', canonicalUnknown],
]);
const rewriteClaims = (ids) => [...new Set(ids.map((id) => duplicateUnknownClaims.get(id) ?? id))];
for (const node of ledger.nodes) {
  node.claimIds = rewriteClaims(node.claimIds);
  for (const details of [node.checks, node.failureSignals, node.recoveries]) {
    for (const detail of details) detail.claimIds = rewriteClaims(detail.claimIds);
  }
}
for (const edge of ledger.edges) edge.claimIds = rewriteClaims(edge.claimIds);
for (const roadblock of ledger.roadblocks) roadblock.claimIds = rewriteClaims(roadblock.claimIds);
for (const journeyItem of ledger.journeys) {
  for (const step of journeyItem.steps) step.claimIds = rewriteClaims(step.claimIds);
  for (const dependency of journeyItem.dependencies) dependency.claimIds = rewriteClaims(dependency.claimIds);
}
ledger.claims = ledger.claims.filter((item) => !duplicateUnknownClaims.has(item.id));

// New sources must be specific pages under the tightened citation gate. The
// two root-only observation records are retained in the handoff but not
// shipped as sources; the precise V2 page, More Information page, and manual
// support the narrower public-boundary findings.
const nonSpecificSources = new Set(['source_ind41_owc_consumer', 'source_ind41_owc_status_dialog', 'source_ind41_official_public_search', 'source_ind41_water_account_consumer_manual']);
for (const item of ledger.claims) {
  item.sourceIds = item.sourceIds.filter((id) => !nonSpecificSources.has(id));
  if (item.id === 'claim_ind41_no_public_transfer_control') {
    item.text = 'No transfer, name-change, or existing-account mutation control was visible on the inspected unauthenticated Jaladhare consumer page.';
    item.sourceIds = ['source_ind32_water_account_consumer'];
  }
}
ledger.claims = ledger.claims.filter((item) => !['claim_ind41_owc_status_error', 'claim_ind41_water_account_rr_field_is_new_connection'].includes(item.id));
for (const node of ledger.nodes) {
  node.claimIds = node.claimIds.filter((id) => !['claim_ind41_owc_status_error', 'claim_ind41_water_account_rr_field_is_new_connection'].includes(id));
  for (const details of [node.checks, node.failureSignals, node.recoveries]) {
    for (const detail of details) detail.claimIds = detail.claimIds.filter((id) => !['claim_ind41_owc_status_error', 'claim_ind41_water_account_rr_field_is_new_connection'].includes(id));
  }
}
ledger.sources = ledger.sources.filter((item) => !nonSpecificSources.has(item.id));
for (const node of ledger.nodes) delete node.researchedNoSourceFound;
ledger.roadblocks = ledger.roadblocks.filter((item) => item.id !== 'roadblock_audit_water_account');

for (const edge of ledger.edges) {
  if (edge.id === 'edge_water_account_entry_route') { edge.relationship='alternative'; edge.status='unknown'; edge.label='Research boundary: public entry was inspected before checking for a transfer route; this is not a demonstrated service dependency.'; }
  if (edge.id === 'edge_water_account_evidence_outcome') { edge.relationship='alternative'; edge.status='unknown'; edge.label='Research boundary: no public evidence connects transfer documents to an account-name outcome.'; }
  if (edge.id === 'edge_water_account_route_support') { edge.status='partial'; edge.label='Where no public transfer control is visible, the published grievance/contact surface is a clarification lead—not a verified transfer route.'; for (const id of edge.claimIds) if (claim(id)) claim(id).basis='mixed'; }
}

// Do not present duplicate IND-41 citizen claims as independent evidence.
const replacements = new Map([
 ['claim_ind41_water_account_citizen_reported_area_linked_amount','claim_ind32_water_account_citizen_name_change_quote'],
 ['claim_ind41_water_account_citizen_prior_holder_barrier','claim_ind32_water_account_citizen_prior_holder_barrier'],
]);
for (const node of ledger.nodes) { node.claimIds=node.claimIds.map((id)=>replacements.get(id)??id); for(const details of [node.checks,node.failureSignals,node.recoveries]) for(const detail of details) detail.claimIds=detail.claimIds.map((id)=>replacements.get(id)??id); }
for (const edge of ledger.edges) edge.claimIds=edge.claimIds.map((id)=>replacements.get(id)??id);
for (const roadblock of ledger.roadblocks) roadblock.claimIds=roadblock.claimIds.map((id)=>replacements.get(id)??id);
ledger.claims=ledger.claims.filter((item)=>!replacements.has(item.id));

// Equivalent inherited sources were seeded in earlier research. Keep one
// canonical record per URL and rewrite references so the evidence register is
// not inflated by duplicates.
const canonicalSourceByUrl = new Map();
const duplicateSources = new Map();
for (const item of ledger.sources) {
  const existing = canonicalSourceByUrl.get(item.url);
  if (existing) duplicateSources.set(item.id, existing);
  else canonicalSourceByUrl.set(item.url, item.id);
}
for (const item of ledger.claims) item.sourceIds = [...new Set(item.sourceIds.map((id) => duplicateSources.get(id) ?? id))];
ledger.sources = ledger.sources.filter((item) => !duplicateSources.has(item.id));
const journey=ledger.journeys.find((item)=>item.scenarioId==='scenario_ind32_water_account_sale');
journey.documentationQualityNotes=[...new Set([...journey.documentationQualityNotes,'Stated limitation from the independent audit: no public material verified an existing-account transfer route, eligibility, documents, prior-holder or succession treatment, arrears/deposit handling, fee, venue, status, decision, or timing.'])];
await writeFile('ledger/water-account.json',`${JSON.stringify(ledger,null,2)}\n`);
console.log('Applied IND-41 audit corrections.');
