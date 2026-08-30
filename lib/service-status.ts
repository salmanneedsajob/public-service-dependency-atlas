import type { Ledger } from '@/lib/ledger-types';

export type ServiceMappingStatus = 'Mapped' | 'Partially mapped';
const researchFields = ['checks', 'failureSignals', 'recoveries'] as const;

export type ServiceMappingSummary = {
  status: ServiceMappingStatus;
  fullyDocumentedRecords: number;
  totalRecords: number;
  unknownRecords: number;
};

/**
 * Mapped measures whether we researched each record and handoff on the first
 * citizen route — including where that research found no public procedure.
 */
export function deriveServiceMappingSummary(ledger: Ledger): ServiceMappingSummary {
  const defaultScenario = ledger.scenarios[0];
  if (!defaultScenario || defaultScenario.pathNodeIds.length === 0) {
    return { status: 'Partially mapped', fullyDocumentedRecords: 0, totalRecords: 0, unknownRecords: 0 };
  }

  const pathNodes = defaultScenario.pathNodeIds.map((nodeId) => ledger.nodes.find((node) => node.id === nodeId));
  const fullyDocumentedRecords = pathNodes.filter((node) => node &&
    researchFields.every((field) =>
      node[field].length > 0 || node.researchedNoSourceFound?.includes(field),
    )).length;
  const unknownRecords = pathNodes.filter((node) => node?.status === 'unknown').length;
  const everyRecordIsResearched = fullyDocumentedRecords === pathNodes.length;

  const pathEdges = defaultScenario.pathNodeIds.slice(1).map((toNodeId, index) => {
    const fromNodeId = defaultScenario.pathNodeIds[index];
    return ledger.edges.find((edge) =>
      edge.scenarioIds.includes(defaultScenario.id)
      && edge.fromNodeId === fromNodeId
      && edge.toNodeId === toNodeId,
    );
  });
  const everyHandoffIsSourced = pathEdges.every((edge) => edge && edge.claimIds.length > 0);

  return {
    status: everyRecordIsResearched && everyHandoffIsSourced ? 'Mapped' : 'Partially mapped',
    fullyDocumentedRecords,
    totalRecords: pathNodes.length,
    unknownRecords,
  };
}

export function deriveServiceStatus(ledger: Ledger): ServiceMappingStatus {
  return deriveServiceMappingSummary(ledger).status;
}
