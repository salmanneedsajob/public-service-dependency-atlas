import type { Detail, Ledger, RecordStatus } from '@/lib/ledger-types';

export type DocumentationGap = {
  id: string;
  question: string;
  priority: number;
};

const isUnknown = (status: RecordStatus) => status === 'unknown';

function missingDetailQuestion(nodeLabel: string, field: 'checks' | 'failureSignals' | 'recoveries') {
  if (field === 'checks') return `How can someone check whether ${nodeLabel} is ready? — no public source answers this.`;
  if (field === 'failureSignals') return `What does it look like when ${nodeLabel} fails? — no public source answers this.`;
  return `What can someone do next when ${nodeLabel} fails? — no public source answers this.`;
}

function unknownDetailQuestion(nodeLabel: string, detail: Detail, field: string) {
  if (field === 'checks') return `How can someone ${detail.label.toLowerCase()} for ${nodeLabel}? — no public source answers this.`;
  if (field === 'failureSignals') return `What does “${detail.label}” mean when ${nodeLabel} goes wrong? — no public source answers this.`;
  return `How can someone use “${detail.label}” to move ${nodeLabel} forward? — no public source answers this.`;
}

/**
 * Builds citizen-facing questions from the published ledger at render/build time.
 * It deliberately does not add, infer, or alter any research record.
 */
export function collectUndocumentedQuestions(ledger: Ledger): DocumentationGap[] {
  const gaps: DocumentationGap[] = [];
  const add = (id: string, question: string, priority: number) => gaps.push({ id, question, priority });

  ledger.scenarios.filter((scenario) => isUnknown(scenario.status)).forEach((scenario) =>
    add(`scenario:${scenario.id}`, `What is the complete route for “${scenario.label}”? — no public source answers this.`, 2),
  );
  ledger.nodes.filter((node) => isUnknown(node.status)).forEach((node) =>
    add(`node:${node.id}`, `What must be true for ${node.label}, and who can fix it when it fails? — no public source answers this.`, 0),
  );
  ledger.edges.filter((edge) => isUnknown(edge.status)).forEach((edge) => {
    const from = ledger.nodes.find((node) => node.id === edge.fromNodeId)?.label ?? edge.fromNodeId;
    const to = ledger.nodes.find((node) => node.id === edge.toNodeId)?.label ?? edge.toNodeId;
    add(`edge:${edge.id}`, `How does ${from} connect to ${to}, and who fixes a failed handoff? — no public source answers this.`, 1);
  });
  ledger.claims.filter((claim) => isUnknown(claim.status)).forEach((claim) =>
    add(`claim:${claim.id}`, `What is known about this step: “${claim.text}” — no public source answers this.`, 3),
  );
  ledger.roadblocks.filter((roadblock) => isUnknown(roadblock.status)).forEach((roadblock) =>
    add(`roadblock:${roadblock.id}`, `What causes “${roadblock.title}”, and how can it be resolved? — no public source answers this.`, 2),
  );
  ledger.journeys.filter((journey) => isUnknown(journey.status)).forEach((journey) =>
    add(`journey:${journey.id}`, `What is the full path for “${journey.title}”? — no public source answers this.`, 2),
  );

  ledger.nodes.forEach((node) => {
    (['checks', 'failureSignals', 'recoveries'] as const).forEach((field) => {
      const details = node[field];
      if (!details.length) add(`missing:${node.id}:${field}`, missingDetailQuestion(node.label, field), 2);
      details.filter((detail) => isUnknown(detail.status)).forEach((detail) =>
        add(`detail:${detail.id}`, unknownDetailQuestion(node.label, detail, field), 2),
      );
    });
  });

  return gaps.sort((a, b) => a.priority - b.priority || a.question.localeCompare(b.question));
}
