import type { Ledger } from '@/lib/ledger-types';

export type ServiceMappingStatus = 'Mapped' | 'Partially mapped';
const researchFields = ['checks', 'failureSignals', 'recoveries'] as const;

export type ServiceMappingSummary = {
  status: ServiceMappingStatus;
  fullyResearchedScenarios: number;
  totalScenarios: number;
  scenarioSummaries: ScenarioMappingSummary[];
};

export type ScenarioMappingSummary = {
  scenarioId: string;
  fullyDocumentedRecords: number;
  totalRecords: number;
  unknownRecords: number;
  status: ServiceMappingStatus;
};

function deriveScenarioMappingSummary(ledger: Ledger, scenario: Ledger['scenarios'][number]): ScenarioMappingSummary {
  const pathNodes = scenario.pathNodeIds.map((nodeId) => ledger.nodes.find((node) => node.id === nodeId));
  const fullyDocumentedRecords = pathNodes.filter((node) => node &&
    researchFields.every((field) =>
      node[field].length > 0 || node.researchedNoSourceFound?.includes(field),
    )).length;
  const unknownRecords = pathNodes.filter((node) => node?.status === 'unknown').length;
  const pathEdges = scenario.pathNodeIds.slice(1).map((toNodeId, index) => {
    const fromNodeId = scenario.pathNodeIds[index];
    return ledger.edges.find((edge) =>
      edge.scenarioIds.includes(scenario.id)
      && edge.fromNodeId === fromNodeId
      && edge.toNodeId === toNodeId,
    );
  });
  const fullyResearched = pathNodes.length > 0
    && fullyDocumentedRecords === pathNodes.length
    && pathEdges.every((edge) => edge && edge.claimIds.length > 0);

  return {
    scenarioId: scenario.id,
    fullyDocumentedRecords,
    totalRecords: pathNodes.length,
    unknownRecords,
    status: fullyResearched ? 'Mapped' : 'Partially mapped',
  };
}

/**
 * Mapped measures whether every citizen route has researched records and
 * sourced handoffs — including where research found no public procedure.
 */
export function deriveServiceMappingSummary(ledger: Ledger): ServiceMappingSummary {
  const scenarioSummaries = ledger.scenarios.map((scenario) => deriveScenarioMappingSummary(ledger, scenario));
  const fullyResearchedScenarios = scenarioSummaries.filter((scenario) => scenario.status === 'Mapped').length;
  const totalScenarios = scenarioSummaries.length;

  return {
    status: totalScenarios > 0 && fullyResearchedScenarios === totalScenarios ? 'Mapped' : 'Partially mapped',
    fullyResearchedScenarios,
    totalScenarios,
    scenarioSummaries,
  };
}

export function deriveServiceStatus(ledger: Ledger): ServiceMappingStatus {
  return deriveServiceMappingSummary(ledger).status;
}
