import { readFile, writeFile } from 'node:fs/promises';

const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));
const ledger = await readJson('ledger/birth-certificate.json');
const handoffs = await Promise.all(['official', 'workflow', 'citizen'].map((pass) =>
  readJson(`research/handoffs/ind42-birth-certificate-${pass}.json`),
));

const addUnique = (items, additions) => {
  const known = new Set(items.map((item) => item.id));
  for (const item of additions) if (!known.has(item.id)) items.push(item);
};
const unionIds = (left = [], right = []) => [...new Set([...left, ...right])];

for (const handoff of handoffs) {
  // Handoffs use a temporary scenario identity to remain standalone. The
  // canonical ledger retains its established scenario identity.
  for (const claim of handoff.claims ?? []) claim.scenarioIds = (claim.scenarioIds ?? []).map(() => 'scenario_ind32_birth_copy_workflow');
  for (const node of handoff.nodes ?? []) node.scenarioIds = (node.scenarioIds ?? []).map(() => 'scenario_ind32_birth_copy_workflow');
  for (const edge of handoff.edges ?? []) edge.scenarioIds = (edge.scenarioIds ?? []).map(() => 'scenario_ind32_birth_copy_workflow');
  for (const roadblock of handoff.roadblocks ?? []) roadblock.scenarioIds = (roadblock.scenarioIds ?? []).map(() => 'scenario_ind32_birth_copy_workflow');
  for (const journey of handoff.journeys ?? []) journey.scenarioId = 'scenario_ind32_birth_copy_workflow';
  addUnique(ledger.agencies, handoff.agencies ?? []);
  addUnique(ledger.sources, handoff.sources ?? []);
  addUnique(ledger.claims, handoff.claims ?? []);
  addUnique(ledger.roadblocks, handoff.roadblocks ?? []);
}

for (const claim of ledger.claims) if (claim.id.startsWith('claim_ind42_birth_')) {
  claim.scenarioIds = unionIds(claim.scenarioIds.map(() => 'scenario_ind32_birth_copy_workflow'), []);
}
for (const roadblock of ledger.roadblocks) if (roadblock.id.startsWith('roadblock_ind42_birth_')) {
  roadblock.scenarioIds = unionIds(roadblock.scenarioIds.map(() => 'scenario_ind32_birth_copy_workflow'), []);
}

// Keep the existing scenario and record identities. The passes contribute
// evidence to those records, rather than creating a second parallel journey.
for (const handoff of handoffs) for (const incoming of handoff.nodes ?? []) {
  const target = ledger.nodes.find((node) => node.id === incoming.id);
  if (!target) continue;
  for (const field of ['checks', 'failureSignals', 'recoveries']) addUnique(target[field], incoming[field] ?? []);
  target.claimIds = unionIds(target.claimIds, incoming.claimIds);
  target.researchedNoSourceFound = unionIds(target.researchedNoSourceFound, incoming.researchedNoSourceFound);
}

// Existing route edges have the right citizen-path endpoints. Add the new
// atomic evidence rather than duplicating the handoff's equivalent edges.
const defaultScenarioId = 'scenario_ind32_birth_copy_workflow';
const matchingExistingEdge = (incoming) => ledger.edges.find((edge) =>
  edge.fromNodeId === incoming.fromNodeId
  && edge.toNodeId === incoming.toNodeId
  && edge.scenarioIds.includes(defaultScenarioId),
);
for (const handoff of handoffs) for (const incoming of handoff.edges ?? []) {
  const target = matchingExistingEdge(incoming);
  if (target) target.claimIds = unionIds(target.claimIds, incoming.claimIds);
  else ledger.edges.push(incoming);
}

// Preserve the direct unauthenticated observation as the canonical journey.
const workflowJourney = handoffs.find((handoff) => handoff._handoff?.pass === 'public-workflow')?.journeys?.[0];
if (workflowJourney) {
  const index = ledger.journeys.findIndex((journey) => journey.scenarioId === defaultScenarioId);
  if (index >= 0) ledger.journeys[index] = workflowJourney;
  else ledger.journeys.push(workflowJourney);
}

const journey = ledger.journeys.find((item) => item.scenarioId === defaultScenarioId);
if (journey) {
  journey.documentationQualityNotes = unionIds(journey.documentationQualityNotes, [
    'Stated limitation from the independent audit will be appended after its one permitted pass.',
  ]);
}

await writeFile('ledger/birth-certificate.json', `${JSON.stringify(ledger, null, 2)}\n`);
console.log('Integrated IND-42 birth-certificate handoffs.');
