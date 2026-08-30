import { readFile, writeFile } from 'node:fs/promises';

const read = (file) => readFile(file, 'utf8').then(JSON.parse);
const ledger = await read('ledger/water-account.json');
const official = await read('research/handoffs/ind41-water-account-official.json');
const workflow = await read('research/handoffs/ind41-water-account-workflow.json');
const citizen = await read('research/handoffs/ind41-water-account-citizen.json');
const sourceMap = new Map([
  ['source_ind41_water_account_public_entry', 'source_ind32_water_account_consumer'], ['source_ind41_v2_consumer', 'source_ind32_water_account_consumer'],
  ['source_ind41_water_account_faq', 'source_ind32_water_account_faq'], ['source_ind41_v2_faq', 'source_ind32_water_account_faq'],
  ['source_ind41_water_account_grievance', 'source_ind32_water_account_bwssb_contact'], ['source_ind41_grievance', 'source_ind32_water_account_bwssb_contact'],
  ['source_ind41_water_account_act', 'source_ind32_water_account_act'],
  ['source_ind41_water_account_citizen_office_amount_and_recovery', 'source_ind32_water_account_citizen_name_change_quote'], ['source_ind41_water_account_citizen_prior_holder_barrier', 'source_ind32_water_account_citizen_old_owner_unavailable'],
]);
const nodeMap = new Map([['node_ind41_v2_public_entry','node_water_account_public_entry'],['node_ind41_transfer_route_check','node_water_account_route_check'],['node_ind41_alternate_portal_check','node_water_account_route_check'],['node_ind41_status_boundary','node_water_account_case_documents'],['node_ind41_support_recovery','node_water_account_support'],['node_ind41_transfer_outcome','node_water_account_outcome']]);
const sourceIds = new Set(ledger.sources.map((source) => source.id));
for (const source of [...official.sources, ...workflow.sources, ...citizen.sources]) {
  if (!sourceMap.has(source.id) && !sourceIds.has(source.id)) { ledger.sources.push(structuredClone(source)); sourceIds.add(source.id); }
}
const scenarioId = 'scenario_ind32_water_account_sale';
const claimIds = new Set(ledger.claims.map((claim) => claim.id));
for (const handoff of [official, workflow, citizen]) for (const raw of handoff.claims) {
  if (claimIds.has(raw.id)) continue;
  const claim = structuredClone(raw);
  claim.sourceIds = claim.sourceIds.map((id) => sourceMap.get(id) ?? id);
  claim.scenarioIds = [scenarioId];
  claim.nodeIds = [...new Set(claim.nodeIds.map((id) => nodeMap.get(id) ?? id).filter((id) => ledger.nodes.some((node) => node.id === id)))];
  ledger.claims.push(claim); claimIds.add(claim.id);
}
const node = (id) => ledger.nodes.find((candidate) => candidate.id === id);
for (const claim of ledger.claims) {
  claim.scenarioIds = [...new Set(claim.scenarioIds)];
  claim.nodeIds = [...new Set(claim.nodeIds)];
}
const publicEntry = node('node_water_account_public_entry');
publicEntry.researchedNoSourceFound = ['failureSignals', 'recoveries'];
const route = node('node_water_account_route_check');
route.checks = [{id:'check_ind41_public_route_scope',label:'Public route scope',description:'The public Jaladhare page and FAQ describe new/additional connections, not an existing-account transfer service.',url:'https://owcv2.bwssb.gov.in/consumer',claimIds:['claim_ind41_water_account_public_scope','claim_ind41_water_account_faq_new_route'],status:'verified'}];
route.failureSignals = [{id:'failure_ind41_no_public_transfer',label:'No public transfer control',description:'No transfer, name-change, or existing-account mutation control was visible on the public surfaces inspected.',url:'https://owcv2.bwssb.gov.in/consumer',claimIds:['claim_ind41_water_account_no_public_transfer_control','claim_ind41_no_public_transfer_control'],status:'partial'}];
route.recoveries = [{id:'recovery_ind41_contact_for_route',label:'Ask for the RR-specific route',description:'Use BWSSB’s published enquiry or grievance contact before sending documents or paying.',url:'https://owcv2.bwssb.gov.in/member/grievance-form',claimIds:['claim_ind41_water_account_grievance_support','claim_ind41_grievance_recovery'],status:'partial'}];
route.claimIds = [...new Set([...route.claimIds,...route.checks[0].claimIds,...route.failureSignals[0].claimIds,...route.recoveries[0].claimIds])];
const docs = node('node_water_account_case_documents');
docs.checks = [{id:'check_ind41_no_transfer_checklist',label:'No public transfer checklist',description:'The public FAQ and manual do not establish documents, fee, venue, or arrears treatment for an existing-account transfer.',url:'https://owcv2.bwssb.gov.in/member/faq',claimIds:['claim_ind41_water_account_faq_no_transfer_procedure','claim_ind41_water_account_rr_field_is_new_connection'],status:'partial'}];
docs.recoveries = [{id:'recovery_ind41_confirm_before_upload',label:'Confirm before uploading',description:'Obtain BWSSB’s authorised RR-specific checklist before providing documents or payment.',url:'https://owcv2.bwssb.gov.in/member/grievance-form',claimIds:['claim_ind41_water_account_grievance_support'],status:'partial'}];
docs.claimIds = [...new Set([...docs.claimIds,...docs.checks[0].claimIds,...docs.recoveries[0].claimIds])];
if (!ledger.roadblocks.some((roadblock) => roadblock.id === official.roadblocks[0].id)) {
  ledger.roadblocks.push({...official.roadblocks[0], ownerAgencyIds:['agency_bwssb_ind32_water_account'], claimIds:official.roadblocks[0].claimIds, status:'unknown'});
}
ledger.meta.asOf = '2026-08-30';
ledger.roadblocks = [...new Map(ledger.roadblocks.map((roadblock) => [roadblock.id, roadblock])).values()];
await writeFile('ledger/water-account.json', `${JSON.stringify(ledger,null,2)}\n`);
console.log('Integrated IND-41 handoffs.');
