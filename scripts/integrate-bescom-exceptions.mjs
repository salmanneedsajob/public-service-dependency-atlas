import { readFile, writeFile } from 'node:fs/promises';

const read = async (path) => JSON.parse(await readFile(path, 'utf8'));
const ledger = await read('ledger/research.json');
const handoffs = await Promise.all(['official', 'workflow', 'citizen'].map((pass) =>
  read(`research/handoffs/ind-exceptions-bescom-${pass}.json`),
));
const exceptionScenarios = new Set([
  'scenario_tenant',
  'scenario_previous_consumer_deceased',
  'scenario_consent_unavailable',
]);
const scenarioIdMap = new Map([
  ['scenario_indexceptions_bescom_tenant', 'scenario_tenant'],
  ['scenario_indexceptions_bescom_previous_consumer_deceased', 'scenario_previous_consumer_deceased'],
  ['scenario_indexceptions_bescom_consent_unavailable', 'scenario_consent_unavailable'],
]);
const byId = (items, id) => items.find((item) => item.id === id);
const unique = (items) => [...new Set(items.filter(Boolean))];
const sourceIdByUrl = new Map(ledger.sources.map((source) => [source.url, source.id]));
const sourceIdMap = new Map();

for (const handoff of handoffs) for (const source of handoff.sources ?? []) {
  const canonicalId = sourceIdByUrl.get(source.url) ?? source.id;
  sourceIdMap.set(source.id, canonicalId);
  if (!sourceIdByUrl.has(source.url)) {
    ledger.sources.push(structuredClone(source));
    sourceIdByUrl.set(source.url, canonicalId);
  }
}

// These current public observations repeat established canonical claims; keep
// one claim identity while retaining their refreshed source observation above.
const canonicalClaimIds = new Map([
  ['claim_ind_exceptions_generic_name_change_boundary', 'claim_standard_authenticated_route'],
  ['claim_ind_exceptions_tracker_request_id', 'claim_request_tracker'],
  ['claim_ind_exceptions_bescom_standard_route', 'claim_standard_authenticated_route'],
  ['claim_ind_exceptions_bescom_tracker', 'claim_request_tracker'],
]);
const claimIds = new Set(ledger.claims.map((claim) => claim.id));
const claimIdMap = new Map(canonicalClaimIds);

for (const handoff of handoffs) for (const rawClaim of handoff.claims ?? []) {
  const canonicalId = canonicalClaimIds.get(rawClaim.id) ?? rawClaim.id;
  claimIdMap.set(rawClaim.id, canonicalId);
  if (claimIds.has(canonicalId)) continue;
  const claim = structuredClone(rawClaim);
  claim.id = canonicalId;
  claim.sourceIds = unique(claim.sourceIds.map((sourceId) => sourceIdMap.get(sourceId) ?? sourceId));
  claim.scenarioIds = unique(claim.scenarioIds
    .map((id) => scenarioIdMap.get(id) ?? id)
    .filter((id) => exceptionScenarios.has(id)));
  claim.nodeIds = claim.nodeIds.filter((id) => byId(ledger.nodes, id));
  ledger.claims.push(claim);
  claimIds.add(canonicalId);
}

for (const claim of ledger.claims) {
  claim.scenarioIds = unique(claim.scenarioIds.map((id) => scenarioIdMap.get(id) ?? id));
}

// Repair an interrupted first integration that had already added the citizen
// claims before their handoff scenario aliases were mapped.
for (const handoff of handoffs) for (const rawClaim of handoff.claims ?? []) {
  const claim = byId(ledger.claims, claimIdMap.get(rawClaim.id) ?? rawClaim.id);
  if (claim?.scenarioIds.length === 0) {
    claim.scenarioIds = unique(rawClaim.scenarioIds
      .map((id) => scenarioIdMap.get(id) ?? id)
      .filter((id) => exceptionScenarios.has(id)));
  }
}

for (const handoff of handoffs) for (const incoming of handoff.nodes ?? []) {
  const target = byId(ledger.nodes, incoming.id);
  if (!target) continue;
  for (const field of ['checks', 'failureSignals', 'recoveries']) {
    const known = new Set(target[field].map((detail) => detail.id));
    for (const rawDetail of incoming[field] ?? []) {
      const detail = structuredClone(rawDetail);
      detail.claimIds = unique(detail.claimIds.map((id) => claimIdMap.get(id) ?? id).filter((id) => claimIds.has(id)));
      if (!known.has(detail.id) && detail.claimIds.length) {
        target[field].push(detail);
        known.add(detail.id);
      }
    }
  }
  target.claimIds = unique([
    ...target.claimIds,
    ...(incoming.claimIds ?? []).map((id) => claimIdMap.get(id) ?? id),
  ].filter((id) => claimIds.has(id)));
  target.researchedNoSourceFound = unique([
    ...(target.researchedNoSourceFound ?? []),
    ...(incoming.researchedNoSourceFound ?? []).filter((field) => target[field].length === 0),
  ]).filter((field) => target[field].length === 0);
}

for (const handoff of handoffs) for (const rawRoadblock of handoff.roadblocks ?? []) {
  if (byId(ledger.roadblocks, rawRoadblock.id)) continue;
  const roadblock = structuredClone(rawRoadblock);
  roadblock.ownerAgencyIds = unique((roadblock.ownerAgencyIds ?? []).filter((id) => byId(ledger.agencies, id)));
  if (!roadblock.ownerAgencyIds.length) roadblock.ownerAgencyIds = ['agency_bescom'];
  roadblock.nodeIds = unique(roadblock.nodeIds.filter((id) => byId(ledger.nodes, id)));
  roadblock.scenarioIds = unique(roadblock.scenarioIds
    .map((id) => scenarioIdMap.get(id) ?? id)
    .filter((id) => exceptionScenarios.has(id)));
  roadblock.claimIds = unique(roadblock.claimIds.map((id) => claimIdMap.get(id) ?? id).filter((id) => claimIds.has(id)));
  if (roadblock.nodeIds.length && roadblock.scenarioIds.length && roadblock.claimIds.length) ledger.roadblocks.push(roadblock);
}

ledger.meta.asOf = '2026-08-31';
await writeFile('ledger/research.json', `${JSON.stringify(ledger, null, 2)}\n`);
console.log('Integrated BESCOM exception handoffs.');
