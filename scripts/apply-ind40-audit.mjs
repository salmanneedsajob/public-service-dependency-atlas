import { readFile, writeFile } from 'node:fs/promises';

const read = (file) => readFile(file, 'utf8').then(JSON.parse);
const ledger = await read('ledger/water-connection.json');
const official = await read('research/handoffs/ind40-water-connection-official.json');
const workflow = await read('research/handoffs/ind40-water-connection-workflow.json');

const handoffSources = new Map([...official.sources, ...workflow.sources].map((source) => [source.id, source]));
const canonicalByUrl = new Map([
  ['https://owcv2.bwssb.gov.in/consumer', 'source_ind40_water_public_entry'],
  ['https://owcv2.bwssb.gov.in/member/faq', 'source_ind40_water_faq'],
  ['https://owcv2.bwssb.gov.in/member/grievance-form', 'source_ind40_bwssb_grievance'],
  ['https://owc.bwssb.gov.in/docs/Consumer-Manual-English.pdf', 'source_ind40_water_consumer_manual'],
  ['https://www.indiacode.nic.in/bitstream/123456789/7908/1/36_of_1964%28e%29.pdf', 'source_ind40_water_act'],
  ['https://owcv2.bwssb.gov.in/member/register', 'source_ind40_bwssb_register'],
]);

// One artifact/current observation gets one source record. Claims, rather
// than duplicated source cards, preserve the different facts drawn from it.
const remapSourceId = new Map();
for (const source of ledger.sources) remapSourceId.set(source.id, canonicalByUrl.get(source.url) ?? source.id);
const canonicalSources = [];
const keptIds = new Set();
for (const source of ledger.sources) {
  const canonicalId = remapSourceId.get(source.id);
  if (keptIds.has(canonicalId)) continue;
  const replacement = handoffSources.get(canonicalId) ?? { ...source, id: canonicalId };
  canonicalSources.push(structuredClone(replacement));
  keptIds.add(canonicalId);
}
ledger.sources = canonicalSources;
for (const claim of ledger.claims) claim.sourceIds = [...new Set(claim.sourceIds.map((id) => remapSourceId.get(id) ?? id))];

const replaceClaimId = (oldId, newId) => {
  for (const node of ledger.nodes) {
    node.claimIds = node.claimIds.map((id) => id === oldId ? newId : id);
    for (const details of [node.checks, node.failureSignals, node.recoveries]) for (const detail of details) detail.claimIds = detail.claimIds.map((id) => id === oldId ? newId : id);
  }
  for (const edge of ledger.edges) edge.claimIds = edge.claimIds.map((id) => id === oldId ? newId : id);
  for (const roadblock of ledger.roadblocks) roadblock.claimIds = roadblock.claimIds.map((id) => id === oldId ? newId : id);
  for (const journey of ledger.journeys) {
    for (const step of journey.steps) step.claimIds = step.claimIds.map((id) => id === oldId ? newId : id);
    for (const dependency of journey.dependencies) dependency.claimIds = dependency.claimIds.map((id) => id === oldId ? newId : id);
  }
};

// Remove one overlapping public-instruction claim and retain its narrower,
// direct-observation counterpart.
replaceClaimId('claim_ind40_water_public_instructions', 'claim_ind40_water_public_entry');
ledger.claims = ledger.claims.filter((claim) => claim.id !== 'claim_ind40_water_public_instructions');

const claimById = new Map(ledger.claims.map((claim) => [claim.id, claim]));
claimById.get('claim_ind40_water_public_entry').text = 'The current BWSSB Jaladhare consumer page exposes a mobile-number login entry for a new connection.';
claimById.get('claim_ind40_water_public_entry').nodeIds = ['node_mobile_otp'];
claimById.get('claim_ind40_water_manual_upload_review').text = 'The BWSSB consumer manual describes uploads for building plan, building photograph with owner, lease-cum-sale deed, and khata, with up to five documents per type and a five-megabyte limit per file.';
claimById.get('claim_ind40_water_faq_demand_payment').text = 'BWSSB\'s FAQ says that after inspection and AEE approval, an applicant can view a demand note in payment history and make final online payment.';
for (const id of ['claim_ind40_water_case_unknown', 'claim_ind40_water_route_currentness_unknown']) claimById.get(id).basis = 'inference';
claimById.get('claim_ind32_water_faq_workflow').evidenceGrade = 'B';
claimById.get('claim_ind32_water_faq_workflow').notes = `${claimById.get('claim_ind32_water_faq_workflow').notes} Grade B: an official guidance page, not a binding legal instrument.`.trim();

// Login-bound fields are not evidence of a documented absence. They remain
// visibly not-yet-researched; only genuinely searched public silences remain.
for (const id of ['node_mobile_otp', 'node_documents_review', 'node_inspection_review']) {
  delete ledger.nodes.find((node) => node.id === id).researchedNoSourceFound;
}

// The IND-40 copies duplicate the original graph. Keep one edge per handoff
// and state the two unobserved transitions as unknown hypotheses.
ledger.edges = ledger.edges.filter((edge) => !edge.id.startsWith('edge_ind40_water_'));
for (const edge of ledger.edges) {
  if (edge.id === 'edge_ind32_water_application_to_forms') {
    edge.status = 'unknown';
    edge.label = 'Buying an application and reaching Consumer Details are separately documented; their live current-route transition was not observed.';
  }
  if (edge.id === 'edge_ind32_water_payment_to_rr') {
    edge.status = 'unknown';
    edge.label = 'The public materials expose payment and status/RR surfaces separately; a payment-to-RR transition was not observed.';
  }
}

ledger.roadblocks = ledger.roadblocks.filter((roadblock) => roadblock.id !== 'roadblock_audit_water_connection');
const residentialJourney = ledger.journeys.find((journey) => journey.scenarioId === 'scenario_ind32_water_residential');
residentialJourney.documentationQualityNotes = [...new Set([
  ...residentialJourney.documentationQualityNotes,
  'Stated limitation from the independent audit: public pages and guidance describe separate stages, but no authenticated case established the current transitions from purchase to form, review to inspection, payment to RR number, or physical completion.',
])];

await writeFile('ledger/water-connection.json', `${JSON.stringify(ledger, null, 2)}\n`);
console.log('Applied the single IND-40 audit corrections.');
