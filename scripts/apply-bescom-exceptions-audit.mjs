import { readFile, writeFile } from 'node:fs/promises';

const ledger = JSON.parse(await readFile('ledger/research.json', 'utf8'));
const byId = (items, id) => items.find((item) => item.id === id);
const unique = (items) => [...new Set(items.filter(Boolean))];
const replaceClaim = (ids, oldId, replacements) => unique(ids.flatMap((id) => id === oldId ? replacements : [id]));
const historicObligationClaims = [
  'claim_ind_exceptions_transfer_indemnity',
  'claim_ind_exceptions_no_arrears_condition',
  'claim_ind_exceptions_fresh_agreement_condition',
  'claim_ind_exceptions_no_consent_fresh_deposit',
];

const loginClaim = byId(ledger.claims, 'claim_ind_exceptions_bescom_login_boundary');
if (loginClaim) {
  loginClaim.text = 'The public BESCOM customer-login page displays User ID, Password and image CAPTCHA controls; no authenticated name-transfer fields were inspected in this pass.';
  loginClaim.notes = 'Direct public observation of the login controls. This does not establish when or how an applicant reaches account-specific name-transfer fields.';
}
const tenantCitizenClaim = byId(ledger.claims, 'claim_indexceptions_bescom_tenant_owner_cooperation_block_reported');
if (tenantCitizenClaim) tenantCitizenClaim.jurisdiction = 'India; Bengaluru location is not established by the retained public account.';

const helpClaimId = 'claim_ind_exceptions_bescom_1912_help_visible';
if (!byId(ledger.claims, helpClaimId)) ledger.claims.push({
  id: helpClaimId,
  text: 'BESCOM’s public Track Name Change page displays “Call 1912” for help.',
  jurisdiction: 'Bengaluru, Karnataka, India',
  scenarioIds: ['scenario_tenant', 'scenario_previous_consumer_deceased', 'scenario_consent_unavailable'],
  nodeIds: ['node_transfer_obligations', 'node_request_tracking'],
  sourceIds: ['source_bescom_tracker'],
  evidenceGrade: 'B',
  basis: 'observation',
  status: 'verified',
  contradictsClaimIds: [],
  notes: 'The visible help label does not establish that 1912 resolves a name-transfer exception.',
});
const obligations = byId(ledger.nodes, 'node_transfer_obligations');
if (obligations) {
  obligations.claimIds = replaceClaim(obligations.claimIds, 'claim_historic_transfer_obligations', historicObligationClaims);
  const recovery = obligations.recoveries.find((item) => item.id === 'recovery_ind_exceptions_1912_lead');
  if (recovery) recovery.claimIds = [helpClaimId, 'claim_ind_exceptions_bescom_current_exception_unknown'];
}

for (const edge of ledger.edges) edge.claimIds = replaceClaim(edge.claimIds, 'claim_historic_transfer_obligations', historicObligationClaims);
for (const roadblock of ledger.roadblocks) roadblock.claimIds = replaceClaim(roadblock.claimIds, 'claim_historic_transfer_obligations', historicObligationClaims);
for (const journey of ledger.journeys) {
  for (const step of journey.steps) step.claimIds = replaceClaim(step.claimIds, 'claim_historic_transfer_obligations', historicObligationClaims);
  for (const dependency of journey.dependencies) dependency.claimIds = replaceClaim(dependency.claimIds, 'claim_historic_transfer_obligations', historicObligationClaims);
}
ledger.claims = ledger.claims.filter((claim) => claim.id !== 'claim_historic_transfer_obligations');

const transferToTracking = byId(ledger.edges, 'edge_transfer_to_tracking');
const exceptionScenarios = ['scenario_tenant', 'scenario_previous_consumer_deceased', 'scenario_consent_unavailable'];
if (transferToTracking) {
  transferToTracking.scenarioIds = transferToTracking.scenarioIds.filter((id) => !exceptionScenarios.includes(id));
  transferToTracking.label = 'A standard successful submission returns a request ID for the public tracker.';
}
if (!byId(ledger.edges, 'edge_exception_transfer_to_tracking')) ledger.edges.push({
  id: 'edge_exception_transfer_to_tracking',
  fromNodeId: 'node_name_transfer',
  toNodeId: 'node_request_tracking',
  relationship: 'produces',
  label: 'If BESCOM accepts and submits an exception case, the documented standard route says a request ID can be retained for tracking; exception acceptance is not public.',
  scenarioIds: exceptionScenarios,
  claimIds: [
    'claim_standard_authenticated_route',
    'claim_request_tracker',
    'claim_ind_exceptions_bescom_current_exception_unknown',
  ],
  status: 'partial',
});

const authenticationRoadblock = byId(ledger.roadblocks, 'roadblock_ind_exceptions_authentication');
if (authenticationRoadblock) {
  authenticationRoadblock.likelyCause = 'The reviewed public login page shows authentication controls, while the unauthenticated direct name-change page showed no exception form or branching. What appears after authentication was not observed.';
}
for (const journey of ledger.journeys.filter((item) => exceptionScenarios.includes(item.scenarioId))) {
  journey.documentationQualityNotes = unique([
    ...(journey.documentationQualityNotes ?? []),
    'Stated limitation from the independent audit: the public standard route and tracker do not establish that an exception case is accepted or reaches a request ID.',
  ]);
}

await writeFile('ledger/research.json', `${JSON.stringify(ledger, null, 2)}\n`);
console.log('Applied BESCOM exception audit corrections.');
