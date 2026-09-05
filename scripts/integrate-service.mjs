import { mkdir, readFile, writeFile } from 'node:fs/promises';

const [service, ...files] = process.argv.slice(2);
if (!service || !files.length) throw new Error('Usage: node scripts/integrate-service.mjs <service> <handoff...>');

const manifest = JSON.parse(await readFile('ledger/services.manifest.json', 'utf8'));
const serviceManifest = manifest.services.find((entry) => entry.id === service);
if (!serviceManifest) throw new Error(`Service ${service} is not declared in ledger/services.manifest.json.`);

const fields = ['agencies', 'scenarios', 'sources', 'claims', 'nodes', 'edges', 'roadblocks', 'journeys'];
const readJson = async (file) => JSON.parse(await readFile(file, 'utf8'));
const sourceType = (source) => {
  if (source.type) return source.type;
  if ((source.evidenceGrade ?? source.grade) === 'E' || /citizen|forum|first-person/i.test(`${source.sourceType ?? ''} ${source.kind ?? ''}`)) return 'citizen_evidence';
  if (/form/i.test(source.sourceType ?? '')) return 'official_form';
  if (/portal|service page|service portal/i.test(source.sourceType ?? '')) return 'official_portal';
  return 'official_guidance';
};
const sourceNotes = (source) => [
  source.notes,
  source.visibleDateNote ? `Visible date: ${source.visibleDateNote}` : null,
  source.publishedAtNote,
  source.archiveNote,
  source.archive?.limitation,
  source.archive?.failure,
  source.archiveSnapshot?.limitation,
  source.archiveSnapshot?.failure,
  source.redaction,
  ...(source.limitations ?? []),
].filter(Boolean).join(' ');
const normalizeHandoff = (handoff) => {
  if (handoff.meta) return handoff;
  const handoffDate = handoff.asOf ?? handoff._handoff?.asOf ?? handoff._handoff?.generatedAt ?? handoff.sources?.[0]?.accessedAt?.slice(0, 10);
  const handoffJurisdiction = handoff.jurisdiction ?? handoff._handoff?.jurisdiction ?? 'Bengaluru, Karnataka, India';
  const agencyName = Array.isArray(handoff.sources?.[0]?.agencyNameDisplayed)
    ? handoff.sources[0].agencyNameDisplayed.join('; ')
    : handoff.sources?.[0]?.agencyNameDisplayed ?? handoff.sources?.[0]?.publisher ?? handoff.serviceTitle ?? service;
  const officialUrl = handoff.sources?.find((source) => /^https?:/u.test(source.url ?? ''))?.url ?? 'https://example.invalid/';
  const agencyId = `agency_${service.replaceAll('-', '_')}`;
  const encountered = [...new Set(handoff.encounteredBranchScenarioIds ?? [])].filter((id) => serviceManifest.branchScenarioIds.includes(id));
  const scenarioIds = [serviceManifest.primaryScenarioId, ...encountered];
  const genericNodeId = `node_${service.replaceAll('-', '_')}_public_route`;
  const scenarios = handoff.scenarios ?? scenarioIds.map((id) => ({
    id,
    label: id === serviceManifest.primaryScenarioId ? handoff.serviceTitle ?? serviceManifest.title : id.replace(/^scenario_/u, '').replaceAll('_', ' '),
    summary: id === serviceManifest.primaryScenarioId ? `Public evidence for ${handoff.serviceTitle ?? serviceManifest.title}.` : `Encountered published branch for ${handoff.serviceTitle ?? serviceManifest.title}.`,
    tags: id === serviceManifest.primaryScenarioId ? ['primary'] : ['branch'],
    pathNodeIds: [genericNodeId],
    status: 'partial',
  }));
  return {
    _handoff: {
      pass: handoff.pass ?? handoff.assignedPass ?? handoff.handoffType ?? 'unknown',
      expectations: handoff.expectations,
    },
    meta: {
      jurisdiction: handoffJurisdiction,
      asOf: handoffDate,
    },
    agencies: (handoff.agencies?.length ? handoff.agencies : [{ id: agencyId, name: agencyName }]).map((agency) => ({
      id: agency.id,
      name: agency.name,
      shortName: agency.shortName ?? agency.name.slice(0, 80),
      officialUrl: agency.officialUrl ?? officialUrl,
    })),
    scenarios,
    sources: (handoff.sources ?? []).map((source) => ({
      id: source.id,
      title: source.title,
      publisher: source.publisher ?? (Array.isArray(source.agencyNameDisplayed) ? source.agencyNameDisplayed.join('; ') : source.agencyNameDisplayed) ?? agencyName,
      url: source.url,
      accessedAt: (source.accessedAt ?? handoffDate).slice(0, 10),
      ...(source.publishedAt ? { publishedAt: source.publishedAt } : {}),
      type: sourceType(source),
      ...(sourceNotes(source) ? { notes: sourceNotes(source) } : {}),
    })),
    claims: (handoff.claims ?? []).map((claim) => ({
      id: claim.id,
      text: claim.text ?? claim.statement ?? claim.claim,
      jurisdiction: claim.jurisdiction ?? handoffJurisdiction,
      scenarioIds: claim.scenarioIds ?? [serviceManifest.primaryScenarioId],
      nodeIds: claim.nodeIds ?? [genericNodeId],
      sourceIds: claim.sourceIds ?? [],
      evidenceGrade: claim.evidenceGrade ?? claim.grade ?? 'Unknown',
      basis: claim.basis ?? 'observation',
      status: claim.status === 'reported' ? 'partial' : claim.status ?? 'partial',
      contradictsClaimIds: claim.contradictsClaimIds ?? [],
      notes: [claim.notes, claim.limitations, claim.limitation, claim.use, claim.branch ? `Quarantine branch: ${claim.branch}.` : null].filter(Boolean).join(' '),
    })),
    nodes: handoff.nodes ?? [],
    edges: handoff.edges ?? [],
    roadblocks: (handoff.roadblocks ?? []).filter((roadblock) => Array.isArray(roadblock.nodeIds) && Array.isArray(roadblock.scenarioIds)),
    journeys: (handoff.journeys ?? []).filter((journey) => typeof journey.scenarioId === 'string' && Array.isArray(journey.steps) && Array.isArray(journey.dependencies)),
    portalRecords: handoff.portalRecords ?? handoff.portals,
  };
};
const handoffs = (await Promise.all(files.map(readJson))).map(normalizeHandoff);
const handoffMeta = handoffs.find((handoff) => handoff.meta)?.meta;
if (!handoffMeta) throw new Error(`No ledger metadata found for ${service}.`);

// Official and public-workflow passes sometimes describe the same journey with
// different IDs. Keep a single rendered scenario and attach both evidence sets.
const scenarioAliases = {
  'birth-certificate': {
    scenario_birth_registered_copy: 'scenario_ind32_birth_copy_workflow',
    scenario_birth_name_inclusion: 'scenario_ind32_birth_name_workflow',
    scenario_birth_record_correction: 'scenario_ind32_birth_correction_workflow',
    scenario_birth_delayed_or_missing: 'scenario_ind32_birth_delayed_workflow',
    scenario_birth_authenticity: 'scenario_ind32_birth_verify_workflow',
  },
  lpg: {
    scenario_lpg_same_area: 'scenario_lpg_workflow_same_area',
    scenario_lpg_same_town: 'scenario_lpg_workflow_same_town',
  },
  marriage: {
    scenario_marriage_hindu: 'scenario_marriage_w_hma',
    scenario_marriage_special_solemnization: 'scenario_marriage_w_sma',
    scenario_marriage_special_registration: 'scenario_marriage_w_sma',
  },
  'trade-license': {
    scenario_trade_new: 'scenario_trade_w_new',
    scenario_trade_renewal: 'scenario_trade_w_renewal',
  },
  'building-plan': {
    scenario_building_suvarna: 'scenario_building_w_suvarna',
    scenario_building_general: 'scenario_building_w_general',
  },
}[service] ?? {};
const canonicalScenario = (id) => scenarioAliases[id] ?? id;

const ledger = {
  meta: {
    schemaVersion: '1.0.0',
    title: `Bengaluru ${service.replaceAll('-', ' ')} evidence ledger v1`,
    jurisdiction: handoffMeta.jurisdiction,
    asOf: handoffMeta.asOf,
    dataKind: 'research',
    disclaimer: 'Independent research, not official advice. Public sources and known gaps are shown together; do not submit personal data through this ledger.',
  },
};

for (const field of fields) {
  const records = new Map();
  for (const handoff of handoffs) for (const record of handoff[field] ?? []) {
    if (field === 'agencies' && records.has(record.id)) continue;
    records.set(record.id, structuredClone(record));
  }
  ledger[field] = [...records.values()];
}

// The v2 handoff contract permits a pass to supply evidence without a
// presentation graph. Preserve those claims by creating one explicitly
// marked public-route node during integration rather than discarding links.
if (!ledger.nodes.length) {
  const nodeId = `node_${service.replaceAll('-', '_')}_public_route`;
  const agencyId = ledger.agencies[0]?.id;
  ledger.nodes.push({
    id: nodeId,
    label: 'Public service route',
    kind: 'service',
    ...(agencyId ? { ownerAgencyId: agencyId } : {}),
    summary: 'Publicly observable route and published guidance; personal and case-specific stages remain outside this research.',
    requiredState: 'Use only the published public route; do not enter personal, case, or payment data.',
    checks: [],
    failureSignals: [],
    recoveries: [],
    scenarioIds: ledger.scenarios.map((scenario) => scenario.id),
    claimIds: ledger.claims.map((claim) => claim.id),
    status: 'partial',
    displayOrder: 1,
  });
  for (const claim of ledger.claims) if (!claim.nodeIds?.length) claim.nodeIds = [nodeId];
  for (const scenario of ledger.scenarios) if (!scenario.pathNodeIds?.length) scenario.pathNodeIds = [nodeId];
}

// Independent passes may observe the same public page on the same day using
// different source IDs. Keep one source record and retarget all claim links.
const canonicalSourceIds = new Map();
const duplicateSourceIds = new Map();
for (const source of ledger.sources) {
  const key = `${source.url}\u0000${source.accessedAt}`;
  const canonical = canonicalSourceIds.get(key);
  if (canonical) duplicateSourceIds.set(source.id, canonical);
  else canonicalSourceIds.set(key, source.id);
}
if (duplicateSourceIds.size) {
  for (const claim of ledger.claims) claim.sourceIds = [...new Set(claim.sourceIds.map((id) => duplicateSourceIds.get(id) ?? id))];
  ledger.sources = ledger.sources.filter((source) => !duplicateSourceIds.has(source.id));
}

for (const scenario of ledger.scenarios) scenario.id = canonicalScenario(scenario.id);
ledger.scenarios = [...new Map(ledger.scenarios.map((scenario) => [scenario.id, scenario])).values()];
if (serviceManifest.stratum === 'deep') {
  const declaredScenarioIds = new Set([serviceManifest.primaryScenarioId, ...serviceManifest.branchScenarioIds]);
  const undeclaredScenarioIds = ledger.scenarios.map((scenario) => scenario.id).filter((id) => !declaredScenarioIds.has(id));
  if (undeclaredScenarioIds.length) throw new Error(`Wave 2 service ${service} has undeclared scenario IDs: ${undeclaredScenarioIds.join(', ')}.`);
  if (!ledger.scenarios.some((scenario) => scenario.id === serviceManifest.primaryScenarioId)) throw new Error(`Wave 2 service ${service} is missing primary scenario ${serviceManifest.primaryScenarioId}.`);
}

const ids = (field) => new Set(ledger[field].map((record) => record.id));
const onlyKnown = (values, known) => [...new Set((values ?? []).filter((value) => known.has(value)))];
for (const field of ['claims', 'nodes', 'edges', 'roadblocks']) for (const record of ledger[field]) record.scenarioIds = (record.scenarioIds ?? []).map(canonicalScenario);
for (const journey of ledger.journeys) journey.scenarioId = canonicalScenario(journey.scenarioId);

const nodeKinds = new Set(['record', 'document', 'service', 'decision', 'system', 'outcome']);
const relationships = new Set(['requires', 'produces', 'maps_to', 'blocks', 'alternative']);
const sourceTypes = new Set(['law', 'regulation', 'order', 'official_guidance', 'official_form', 'official_portal', 'secondary', 'citizen_evidence', 'firsthand_observation']);
const researchedDetailFields = new Set(['checks', 'failureSignals', 'recoveries']);
for (const node of ledger.nodes) if (!nodeKinds.has(node.kind)) node.kind = 'record';
for (const edge of ledger.edges) if (!relationships.has(edge.relationship)) edge.relationship = 'requires';
for (const roadblock of ledger.roadblocks) if (!['documentation', 'process', 'infrastructure'].includes(roadblock.category)) roadblock.category = 'documentation';
for (const source of ledger.sources) if (!sourceTypes.has(source.type)) source.type = source.type.includes('citizen') ? 'citizen_evidence' : 'official_guidance';

const scenarioIds = ids('scenarios');
const sourceIds = ids('sources');
const claimIds = ids('claims');
const nodeIds = ids('nodes');
const agencyIds = ids('agencies');
for (const claim of ledger.claims) {
  claim.scenarioIds = onlyKnown(claim.scenarioIds, scenarioIds);
  claim.nodeIds = onlyKnown(claim.nodeIds, nodeIds);
  claim.sourceIds = onlyKnown(claim.sourceIds, sourceIds);
  claim.contradictsClaimIds = onlyKnown(claim.contradictsClaimIds, claimIds);
  if (!claim.scenarioIds.length) claim.scenarioIds = [ledger.scenarios[0].id];
  if (claim.evidenceGrade !== 'Unknown' && !claim.sourceIds.length) {
    claim.evidenceGrade = 'Unknown';
    claim.status = 'unknown';
    claim.notes = `${claim.notes ?? ''} The referenced source was not retained in this service-isolated ledger.`.trim();
  }
}
for (const node of ledger.nodes) {
  node.scenarioIds = onlyKnown(node.scenarioIds, scenarioIds);
  node.claimIds = onlyKnown(node.claimIds, claimIds);
  if (node.researchedNoSourceFound) {
    node.researchedNoSourceFound = onlyKnown(node.researchedNoSourceFound, researchedDetailFields);
    if (!node.researchedNoSourceFound.length) delete node.researchedNoSourceFound;
  }
  if (node.ownerAgencyId && !agencyIds.has(node.ownerAgencyId)) delete node.ownerAgencyId;
  for (const details of [node.checks, node.failureSignals, node.recoveries]) for (const detail of details) detail.claimIds = onlyKnown(detail.claimIds, claimIds);
}
ledger.edges = ledger.edges.filter((edge) => nodeIds.has(edge.fromNodeId) && nodeIds.has(edge.toNodeId));
for (const edge of ledger.edges) { edge.scenarioIds = onlyKnown(edge.scenarioIds, scenarioIds); edge.claimIds = onlyKnown(edge.claimIds, claimIds); }
ledger.roadblocks = ledger.roadblocks.filter((roadblock) => roadblock.nodeIds.some((id) => nodeIds.has(id)) && roadblock.scenarioIds.some((id) => scenarioIds.has(id)));
for (const roadblock of ledger.roadblocks) {
  roadblock.nodeIds = onlyKnown(roadblock.nodeIds, nodeIds);
  roadblock.scenarioIds = onlyKnown(roadblock.scenarioIds, scenarioIds);
  roadblock.claimIds = onlyKnown(roadblock.claimIds, claimIds);
  roadblock.ownerAgencyIds = onlyKnown(roadblock.ownerAgencyIds, agencyIds);
}
const roadblockIds = ids('roadblocks');
ledger.journeys = ledger.journeys.filter((journey) => scenarioIds.has(journey.scenarioId));
for (const journey of ledger.journeys) {
  journey.steps = journey.steps.filter((step) => nodeIds.has(step.nodeId));
  for (const step of journey.steps) step.claimIds = onlyKnown(step.claimIds, claimIds);
  journey.dependencies = journey.dependencies.filter((dependency) => nodeIds.has(dependency.fromNodeId) && nodeIds.has(dependency.toNodeId));
  for (const dependency of journey.dependencies) dependency.claimIds = onlyKnown(dependency.claimIds, claimIds);
  journey.failureRoadblockIds = onlyKnown(journey.failureRoadblockIds, roadblockIds);
}

await writeFile(`ledger/${service}.json`, `${JSON.stringify(ledger, null, 2)}\n`);
const officialHandoff = handoffs.find((handoff) => handoff._handoff?.pass === 'official-source');
if (officialHandoff?._handoff?.expectations) {
  const authored = officialHandoff._handoff.expectations;
  const cells = Object.fromEntries(['cost', 'documents', 'eligibility', 'time', 'owner', 'after-submission'].map((column) => {
    const cell = authored[column] ?? {};
    return [column, {
      state: cell.state,
      claimIds: cell.claimIds ?? [],
      searchedRoutes: cell.searchedRoutes ?? [],
      note: cell.note ?? '',
    }];
  }));
  await mkdir('ledger/expectations', { recursive: true });
  await writeFile(`ledger/expectations/${service}.json`, `${JSON.stringify({ schemaVersion: '1.0.0', serviceId: service, primaryScenarioId: authored.scenarioId ?? serviceManifest.primaryScenarioId, cells }, null, 2)}\n`);
}
const workflowHandoff = handoffs.find((handoff) => handoff._handoff?.pass === 'public-workflow');
if (workflowHandoff?.portalRecords) {
  const portals = structuredClone(workflowHandoff.portalRecords).map((portal) => ({
    portalId: portal.portalId,
    host: portal.host,
    observedAt: portal.observedAt,
    serviceId: portal.serviceId ?? service,
    serviceOwner: portal.serviceOwner,
    portalOperator: portal.portalOperator,
    agencyNamingShown: Array.isArray(portal.agencyNamingShown) ? portal.agencyNamingShown.join('; ') : portal.agencyNamingShown ?? '',
    languages: portal.languages ?? portal.languagesShown ?? [],
    visibleVersionOrLastUpdated: portal.visibleVersionOrLastUpdated ?? '',
    evidenceSourceIds: portal.evidenceSourceIds ?? [],
    routeObservations: (portal.routeObservations ?? []).map((route) => {
      const limitations = Array.isArray(route.limitations) ? route.limitations : route.limitations ? [route.limitations] : [];
      return {
      routeId: route.routeId,
      serviceId: route.serviceId ?? service,
      scenarioIds: route.scenarioIds ?? (route.scenarioId ? [route.scenarioId] : [serviceManifest.primaryScenarioId]),
      entryUrl: route.entryUrl,
      finalUrl: route.finalUrl,
      redirects: route.redirects ?? [],
      finalStatus: route.finalStatus ?? 200,
      checkedLinkCount: route.checkedLinkCount ?? 0,
      deadLinkCount: route.deadLinkCount ?? 0,
      authenticationPrerequisites: route.authenticationPrerequisites ?? '',
      publicProcedureVsCaseDataBoundary: route.publicProcedureVsCaseDataBoundary ?? '',
      captchaDependencies: route.captchaDependencies ?? route.captchaJavaScriptOrAppDependencies ?? '',
      javascriptDependencies: route.javascriptDependencies ?? route.captchaJavaScriptOrAppDependencies ?? '',
      publicGuidanceSurfaces: route.publicGuidanceSurfaces ?? [],
      trackingSurfaces: route.trackingSurfaces ?? [],
      errorSurfaces: route.errorSurfaces ?? [],
      recoverySurfaces: route.recoverySurfaces ?? [],
      evidenceIds: (route.evidenceIds ?? []).filter((id) => id.startsWith('source_') || id.startsWith('citizen_source_')),
      limitations,
    };
    }),
  }));
  for (const portal of portals) {
    portal.evidenceSourceIds = portal.evidenceSourceIds.map((id) => duplicateSourceIds.get(id) ?? id);
    for (const route of portal.routeObservations) route.evidenceIds = route.evidenceIds.map((id) => duplicateSourceIds.get(id) ?? id);
  }
  await mkdir('ledger/portals', { recursive: true });
  await writeFile(`ledger/portals/${service}.json`, `${JSON.stringify({ schemaVersion: '1.0.0', serviceId: service, portals }, null, 2)}\n`);
}
console.log(`Integrated isolated ${service} ledger from ${files.length} handoffs.`);
