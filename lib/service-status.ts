import type { Ledger } from '@/lib/ledger-types';

export type ServiceMappingStatus = 'Mapped' | 'Partially mapped';

/**
 * A service earns Mapped only when its first (default) citizen route is usable
 * end-to-end from the evidence currently held in the ledger.
 */
export function deriveServiceStatus(ledger: Ledger): ServiceMappingStatus {
  const defaultScenario = ledger.scenarios[0];
  if (!defaultScenario || defaultScenario.pathNodeIds.length === 0) return 'Partially mapped';

  const pathNodes = defaultScenario.pathNodeIds.map((nodeId) => ledger.nodes.find((node) => node.id === nodeId));
  const everyNodeIsActionable = pathNodes.every((node) =>
    node
    && node.status !== 'unknown'
    && node.checks.length > 0
    && node.failureSignals.length > 0
    && node.recoveries.length > 0,
  );

  const pathEdges = defaultScenario.pathNodeIds.slice(1).map((toNodeId, index) => {
    const fromNodeId = defaultScenario.pathNodeIds[index];
    return ledger.edges.find((edge) =>
      edge.scenarioIds.includes(defaultScenario.id)
      && edge.fromNodeId === fromNodeId
      && edge.toNodeId === toNodeId,
    );
  });
  const everyHandoffIsSourced = pathEdges.every((edge) => edge && edge.claimIds.length > 0);

  return everyNodeIsActionable && everyHandoffIsSourced ? 'Mapped' : 'Partially mapped';
}
