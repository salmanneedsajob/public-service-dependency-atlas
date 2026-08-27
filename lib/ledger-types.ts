export type RecordStatus = 'verified' | 'partial' | 'contested' | 'unknown';
export type EvidenceGrade = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'Unknown';

export interface Detail {
  id: string;
  label: string;
  description: string;
  url?: string;
  actualError?: string;
  claimIds: string[];
  status: RecordStatus;
}

export interface Ledger {
  meta: { schemaVersion: '1.0.0'; title: string; jurisdiction: string; asOf: string; disclaimer: string };
  agencies: Array<{ id: string; name: string; shortName: string; officialUrl: string }>;
  scenarios: Array<{ id: string; label: string; summary: string; tags: string[]; pathNodeIds: string[]; status: RecordStatus }>;
  sources: Array<{ id: string; title: string; publisher: string; url: string; accessedAt: string; publishedAt?: string; type: string; notes?: string }>;
  claims: Array<{ id: string; text: string; jurisdiction: string; scenarioIds: string[]; nodeIds: string[]; sourceIds: string[]; evidenceGrade: EvidenceGrade; basis: 'observation' | 'inference' | 'mixed'; status: RecordStatus; contradictsClaimIds: string[]; notes?: string }>;
  nodes: Array<{ id: string; label: string; kind: string; ownerAgencyId?: string; summary: string; requiredState: string; checks: Detail[]; failureSignals: Detail[]; recoveries: Detail[]; scenarioIds: string[]; claimIds: string[]; status: RecordStatus; displayOrder: number }>;
  edges: Array<{ id: string; fromNodeId: string; toNodeId: string; relationship: string; label: string; scenarioIds: string[]; claimIds: string[]; status: RecordStatus }>;
  roadblocks: Array<{ id: string; title: string; category: 'documentation' | 'process' | 'infrastructure'; symptom: string; likelyCause: string; recovery: string; ownerAgencyIds?: string[]; nodeIds: string[]; scenarioIds: string[]; claimIds: string[]; status: RecordStatus }>;
  journeys: Array<{ id: string; title: string; scenarioId: string; context: string; steps: Array<{ id: string; label: string; nodeId: string; action: string; expectedResult: string; claimIds: string[]; status: RecordStatus }>; dependencies: Array<{ id: string; fromNodeId: string; toNodeId: string; description: string; claimIds: string[]; status: RecordStatus }>; failureRoadblockIds: string[]; recoveryNotes: string[]; documentationQualityNotes: string[]; status: RecordStatus }>;
}
