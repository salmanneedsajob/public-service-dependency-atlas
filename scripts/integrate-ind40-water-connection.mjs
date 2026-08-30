import { readFile, writeFile } from 'node:fs/promises';

const read = (file) => readFile(file, 'utf8').then(JSON.parse);
const ledger = await read('ledger/water-connection.json');
const official = await read('research/handoffs/ind40-water-connection-official.json');
const workflow = await read('research/handoffs/ind40-water-connection-workflow.json');
const citizen = await read('research/handoffs/ind40-water-connection-citizen.json');
const handoffs = [official, workflow, citizen];

// Keep the existing service ledger and add only distinct, newly observed
// evidence. Sources are canonicalised by URL so a refreshed observation does
// not create a second citation for the same public page.
const sourceById = new Map(ledger.sources.map((source) => [source.id, source]));
const sourceIdByUrl = new Map(ledger.sources.map((source) => [source.url, source.id]));
const canonicalSourceId = new Map();
for (const handoff of handoffs) for (const source of handoff.sources ?? []) {
  const existingId = sourceIdByUrl.get(source.url);
  if (existingId) {
    canonicalSourceId.set(source.id, existingId);
    const existing = sourceById.get(existingId);
    if (source.accessedAt > existing.accessedAt) existing.accessedAt = source.accessedAt;
  } else {
    ledger.sources.push(structuredClone(source));
    sourceById.set(source.id, ledger.sources.at(-1));
    sourceIdByUrl.set(source.url, source.id);
    canonicalSourceId.set(source.id, source.id);
  }
}

const claimById = new Map(ledger.claims.map((claim) => [claim.id, claim]));
for (const handoff of handoffs) for (const rawClaim of handoff.claims ?? []) {
  const claim = structuredClone(rawClaim);
  claim.sourceIds = (claim.sourceIds ?? []).map((id) => canonicalSourceId.get(id) ?? id);
  const existingIndex = ledger.claims.findIndex((candidate) => candidate.id === claim.id);
  if (existingIndex === -1) ledger.claims.push(claim);
  else ledger.claims[existingIndex] = claim;
  claimById.set(claim.id, claim);
}

const nodeById = new Map(ledger.nodes.map((node) => [node.id, node]));
for (const candidate of official.nodeEvidence) {
  const node = nodeById.get(candidate.nodeId);
  if (!node) throw new Error(`Unknown IND-40 node ${candidate.nodeId}`);
  node.checks = structuredClone(candidate.checks);
  node.failureSignals = structuredClone(candidate.failureSignals);
  node.recoveries = structuredClone(candidate.recoveries);
  node.claimIds = [...new Set([...node.claimIds, ...candidate.checks.flatMap((detail) => detail.claimIds), ...candidate.failureSignals.flatMap((detail) => detail.claimIds), ...candidate.recoveries.flatMap((detail) => detail.claimIds)])];
}

// A researched-silent marker is evidence of a completed public-interface
// search, not a substitute for an Unknown claim. The workflow pass identifies
// the narrow fields where the official UI disclosed no usable public answer.
for (const candidate of workflow.pathNodes) {
  const node = nodeById.get(candidate.nodeId);
  const fields = candidate.researchedNoSourceFound ?? [];
  if (!fields.length) continue;
  for (const field of fields) {
    const documented = node[field].some((detail) => detail.status !== 'unknown' && detail.claimIds.some((id) => {
      const claim = claimById.get(id);
      return claim && claim.evidenceGrade !== 'Unknown' && claim.sourceIds.length > 0;
    }));
    if (documented) {
      node.researchedNoSourceFound = (node.researchedNoSourceFound ?? []).filter((marker) => marker !== field);
    } else {
      node[field] = [];
      node.researchedNoSourceFound = [...new Set([...(node.researchedNoSourceFound ?? []), field])];
    }
  }
  if (!node.researchedNoSourceFound?.length) delete node.researchedNoSourceFound;
}

// The RR-number result has a published citizen report of an unresolved
// physical-completion gap. It is visibly Grade E and must not be promoted to
// an official procedure or a general failure state.
const rrStatus = nodeById.get('node_rr_status');
rrStatus.failureSignals = [{
  id: 'failure_ind40_water_citizen_connection_gap',
  label: 'Reported connection still incomplete after RR assignment',
  description: 'One citizen reported that, after RR-number and meter assignment, the physical line was still not connected. This is one account, not a general service state.',
  url: 'https://voxya.com/consumer-complaints/not-getting-bwssb-cauvery-water-connection/112100',
  claimIds: ['claim_ind40_water_citizen_physical_connection_not_completed_after_assignment'],
  status: 'partial',
}];
rrStatus.researchedNoSourceFound = (rrStatus.researchedNoSourceFound ?? []).filter((field) => field !== 'failureSignals');
if (!rrStatus.researchedNoSourceFound.length) delete rrStatus.researchedNoSourceFound;
rrStatus.claimIds = [...new Set([...rrStatus.claimIds, 'claim_ind40_water_citizen_physical_connection_not_completed_after_assignment'])];

const edgeIds = new Set(ledger.edges.map((edge) => edge.id));
for (const edge of official.edges ?? []) if (!edgeIds.has(edge.id)) {
  ledger.edges.push(structuredClone(edge));
  edgeIds.add(edge.id);
}
const roadblockIds = new Set(ledger.roadblocks.map((roadblock) => roadblock.id));
for (const roadblock of official.roadblocks ?? []) if (!roadblockIds.has(roadblock.id)) {
  ledger.roadblocks.push(structuredClone(roadblock));
  roadblockIds.add(roadblock.id);
}

ledger.meta.asOf = '2026-08-30';
await writeFile('ledger/water-connection.json', `${JSON.stringify(ledger, null, 2)}\n`);
console.log('Integrated IND-40 official, workflow, and citizen evidence into water-connection ledger.');
