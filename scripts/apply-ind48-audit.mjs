import { readFile, writeFile } from 'node:fs/promises';
const ledger = JSON.parse(await readFile('ledger/marriage.json', 'utf8'));
const by = (items, id) => items.find((item) => item.id === id);
const unique = (items) => [...new Set(items)];
ledger.roadblocks = ledger.roadblocks.filter((roadblock) => roadblock.id !== 'roadblock_audit_marriage');
for (const node of ledger.nodes) delete node.researchedNoSourceFound;
for (const id of ['claim_marriage_department_mandate', 'claim_marriage_w_route', 'claim_ind48_department_routes_kaveri']) {
  const claim = by(ledger.claims, id); if (claim) { claim.evidenceGrade = 'C'; claim.status = 'partial'; claim.notes = `${claim.notes ?? ''} Annual-report context is not a current service procedure.`.trim(); }
}
const sourceMap = new Map([
  ['source_marriage_hma', 'source_ind48_hma_act'], ['source_marriage_w_hma', 'source_ind48_hma_act'],
  ['source_marriage_sma', 'source_ind48_sma_act'], ['source_marriage_w_sma', 'source_ind48_sma_act'],
]);
for (const claim of ledger.claims) claim.sourceIds = unique(claim.sourceIds.map((id) => sourceMap.get(id) ?? id));
ledger.sources = ledger.sources.filter((source) => !sourceMap.has(source.id));
const citationCapped = ['claim_marriage_sma_notice', 'claim_marriage_sma_certificate', 'claim_marriage_w_sma', 'claim_ind48_department_routes_kaveri'];
for (const id of citationCapped) {
  const claim = by(ledger.claims, id); if (!claim) continue;
  claim.sourceIds = [];
  claim.evidenceGrade = 'Unknown';
  claim.basis = 'inference';
  claim.status = 'unknown';
  claim.notes = `${claim.notes ?? ''} Retained as an unresolved lead after the source-specific citation cap.`.trim();
}
const reportScenario = { id: 'scenario_marriage_w_kaveri_reported', label: 'Unclassified Kaveri reports', summary: 'First-person reports whose statutory route is unknown; they are not evidence for either HMA or SMA.', tags: ['marriage', 'citizen-evidence', 'route-unknown'], pathNodeIds: ['node_marriage_w_kaveri', 'node_marriage_w_outcome'], status: 'partial' };
if (!by(ledger.scenarios, reportScenario.id)) ledger.scenarios.push(reportScenario);
const citizenClaims = ['claim_ind48_marriage_reported_digital_certificate', 'claim_ind48_marriage_reported_repeated_objections', 'claim_ind48_marriage_reported_rejection_then_certificate', 'claim_ind48_marriage_reported_witness_save_error', 'claim_ind48_marriage_reported_pending_non_sma'];
for (const id of citizenClaims) { const claim = by(ledger.claims, id); if (claim) { claim.scenarioIds = ['scenario_marriage_w_kaveri_reported']; claim.status = 'partial'; claim.contradictsClaimIds = []; } }
for (const id of ['claim_ind32_marriage_citizen_online_success', 'claim_ind32_marriage_citizen_objection_reset']) { const claim = by(ledger.claims, id); if (claim) { claim.contradictsClaimIds = []; claim.status = 'partial'; } }
for (const roadblock of ledger.roadblocks) {
  if (roadblock.id.startsWith('roadblock_ind48_marriage_')) roadblock.scenarioIds = ['scenario_marriage_w_kaveri_reported'];
}
for (const journey of ledger.journeys) {
  journey.documentationQualityNotes = unique([...(journey.documentationQualityNotes ?? []), 'This entry establishes selected statutory text and public-interface observations, not a couple-specific application result.', 'Kaveri blank-render and FAQ/dashboard observations are not yet reconciled; form fields, appointment, payment, review and certificate outcomes remain Unknown.', 'Citizen accounts are route-unknown leads, not proof of requirements, timelines or recoveries.']);
}
ledger.meta.asOf = '2026-08-31';
await writeFile('ledger/marriage.json', `${JSON.stringify(ledger, null, 2)}\n`);
console.log('Applied IND-48 audit.');
