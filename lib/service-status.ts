import type { Ledger } from '@/lib/ledger-types';

export type ServiceMappingStatus = 'Mapped' | 'Partially mapped';

export type ServiceMappingSummary = {
  status: ServiceMappingStatus;
  fullyDocumentedRecords: number;
  totalRecords: number;
  unknownRecords: number;
};

/**
 * A service earns Mapped only when its first (default) citizen route is usable
 * end-to-end from the evidence currently held in the ledger.
 */
export function deriveServiceMappingSummary(ledger: Ledger): ServiceMappingSummary {
  const defaultScenario = ledger.scenarios[0];
  if (!defaultScenario || defaultScenario.pathNodeIds.length === 0) {
    return { status: 'Partially mapped', fullyDocumentedRecords: 0, totalRecords: 0, unknownRecords: 0 };
  }

  const pathNodes = defaultScenario.pathNodeIds.map((nodeId) => ledger.nodes.find((node) => node.id === nodeId));
  const fullyDocumentedRecords = pathNodes.filter((node) =>
    node
    && node.checks.length > 0
    && node.failureSignals.length > 0
    && node.recoveries.length > 0,
  ).length;
  const unknownRecords = pathNodes.filter((node) => node?.status === 'unknown').length;
  const everyNodeIsActionable = fullyDocumentedRecords === pathNodes.length && unknownRecords === 0;

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
    status: everyNodeIsActionable && everyHandoffIsSourced ? 'Mapped' : 'Partially mapped',
    fullyDocumentedRecords,
    totalRecords: pathNodes.length,
    unknownRecords,
  };
}

export function deriveServiceStatus(ledger: Ledger): ServiceMappingStatus {
  return deriveServiceMappingSummary(ledger).status;
}
