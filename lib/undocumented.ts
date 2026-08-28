import type { Ledger, RecordStatus } from '@/lib/ledger-types';

export type DocumentationGap = {
  id: string;
  situation: string;
  missing: string;
  priority: number;
};

const DISPLAY_LABELS: Record<string, string> = {
  'BESCOM mapping': 'Property-ID-to-account match (inside BESCOM’s system)',
};

const ROADBLOCK_SITUATIONS: Record<string, string> = {
  roadblock_ind32_birth_workflow_status_unknown: 'You have applied for a birth certificate, but cannot see an acknowledgement, status, rejection reason, or downloadable certificate.',
  roadblock_ind32_mutation_eligibility_unknown: 'You need to know whether your property can use automatic mutation, but the portal does not show that eligibility before a real case begins.',
  roadblock_ind32_post_login_boundary: 'You sign in to continue an e-Khata case, but the public guidance ends before the form, validation rules, and upload result.',
  roadblock_ind32_objection_handling_unknown: 'Your mutation is pending or has an objection, but the public view does not explain what happens after you file a response.',
  roadblock_workflow_post_login_unknown_ind32: 'You sign in to transfer a property-tax record, but the public guidance does not show the form, validation rules, or objection route that follows.',
};

const uncertaintyLanguage = /\b(unknown|unestablished|not established|not documented|not publicly|no public|not verified|unresolved|does not establish|remains unclear)\b/i;
const internalArtifact = /\b(audit|audit limitations|independent limitations|citizen evidence gap|no retained citizen)\b/i;

export function publicNodeLabel(label: string) {
  return DISPLAY_LABELS[label] ?? label;
}

function plain(text: string) {
  return text
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

function lowerFirst(text: string) {
  if (!text || (text.length > 1 && /[A-Z]/.test(text[1]))) return text;
  return `${text[0].toLowerCase()}${text.slice(1)}`;
}

function nodeImpact(kind: string, label: string) {
  if (/system|outcome/i.test(kind) || /match|status|approval|certificate|licen[cs]e|connection/i.test(label)) return 0;
  if (/service/i.test(kind) || /payment|inspection|fee/i.test(label)) return 1;
  return 2;
}

function roadblockImpact(text: string) {
  if (/can.?t|cannot|blocked|stuck|stall|error|not found|deducted|payment|status|outcome|match|prior holder/i.test(text)) return 0;
  if (/route|eligib|checklist|document|fee|jurisdiction|authority/i.test(text)) return 1;
  return 2;
}

function nodeGap(node: Ledger['nodes'][number]): DocumentationGap {
  const label = publicNodeLabel(node.label);
  if (node.id === 'node_bescom_mapping') {
    return {
      id: `node:${node.id}`,
      situation: 'Your paperwork is fine, but BESCOM’s system can’t match your property ID (EPID) to your electricity account.',
      missing: 'What the error means, who can fix it, and how long it takes — none of this is published anywhere.',
      priority: -1,
    };
  }

  let situation = `You have reached ${label}, but the public route stops here.`;
  if (node.kind === 'decision') situation = `You need to ${lowerFirst(label)} before you can move forward.`;
  if (node.kind === 'outcome') situation = `You are waiting for ${lowerFirst(label)}, but there is no public way to confirm what happens next.`;
  if (node.kind === 'record') situation = `Your application has reached ${lowerFirst(label)}, but the next decision is unclear.`;

  let missing = 'The decision rules, responsible team, and reliable recovery route are not fully published.';
  if (node.kind === 'record' && /document|plan|noc/i.test(label)) {
    situation = `You are preparing ${lowerFirst(label.replace(/^prepare\s+/i, ''))}, but cannot tell what will be accepted.`;
    missing = 'The current checklist, validation rules, and route for rejected files are not fully published.';
  } else if (/payment|fee|demand/i.test(label)) {
    situation = `You have reached ${lowerFirst(label)}, but cannot confirm the amount, payment state, or what happens if it goes wrong.`;
    missing = 'The case-specific amount, status, and payment-recovery route are not fully published.';
  } else if (/inspection|scrutiny|review/i.test(label)) {
    situation = `Your application is awaiting ${lowerFirst(label)}, but you cannot see who owns the review or how to resolve a return.`;
    missing = 'The review criteria, responsible official, and correction route are not fully published.';
  } else if (/buy application form/i.test(label)) {
    situation = 'You are asked to buy a BWSSB application form, but cannot confirm the current amount or working payment route.';
    missing = 'The current charge, payment handoff, and recovery route for a failed purchase are not fully published.';
  } else if (/route lead|solemnization/i.test(label)) {
    situation = `You are trying to follow ${lowerFirst(label.replace(/\s+lead$/i, ''))}, but the public guidance stops before a case-specific outcome.`;
    missing = 'The current route, responsible office, and recovery path are not fully published.';
  }

  return {
    id: `node:${node.id}`,
    situation,
    missing,
    priority: nodeImpact(node.kind, label),
  };
}

function edgeGap(edge: Ledger['edges'][number], ledger: Ledger): DocumentationGap {
  const from = publicNodeLabel(ledger.nodes.find((node) => node.id === edge.fromNodeId)?.label ?? 'one step');
  const to = publicNodeLabel(ledger.nodes.find((node) => node.id === edge.toNodeId)?.label ?? 'the next step');
  return {
    id: `edge:${edge.id}`,
    situation: `You finish ${lowerFirst(from)}, but it is not clear how your case reaches ${lowerFirst(to)}.`,
    missing: 'The handoff, responsible office, failure message, and recovery route are not publicly documented.',
    priority: 2,
  };
}

function roadblockGap(roadblock: Ledger['roadblocks'][number]): DocumentationGap {
  const uncertainCause = uncertaintyLanguage.test(roadblock.likelyCause);
  const uncertainRecovery = uncertaintyLanguage.test(roadblock.recovery);
  const missing = uncertainCause && uncertainRecovery
    ? 'No public source explains the cause, the responsible office, or a reliable route out.'
    : uncertainCause
      ? 'The underlying cause is not documented. The listed next step is a cautious workaround, not a published resolution.'
      : 'The public material does not say who owns the fix, what evidence resolves it, or how long resolution takes.';

  if (roadblock.id === 'roadblock_epid_mapping') {
    return {
      id: `roadblock:${roadblock.id}`,
      situation: 'Your paperwork is fine, but BESCOM’s system can’t match your property ID (EPID) to your electricity account.',
      missing: 'What the error means, who can fix it, and how long it takes — none of this is published anywhere.',
      priority: -1,
    };
  }

  return {
    id: `roadblock:${roadblock.id}`,
    situation: ROADBLOCK_SITUATIONS[roadblock.id] ?? plain(roadblock.symptom),
    missing,
    priority: roadblockImpact(`${roadblock.title} ${roadblock.symptom}`),
  };
}

function normalizedNodeKey(label: string) {
  return publicNodeLabel(label)
    .toLowerCase()
    .replace(/\b(choose|confirm|review|conceptually|stage|lead|final|current|registered|professional)\b/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/**
 * Curates only genuine, citizen-facing documentation gaps from existing ledger
 * statuses. It changes presentation only; no source record is inferred or edited.
 */
export function collectUndocumentedQuestions(ledger: Ledger): DocumentationGap[] {
  const eligibleRoadblocks = ledger.roadblocks.filter((roadblock) =>
    roadblock.status !== ('verified' as RecordStatus)
    && !internalArtifact.test(`${roadblock.id} ${roadblock.title}`)
    && uncertaintyLanguage.test(`${roadblock.likelyCause} ${roadblock.recovery}`),
  );
  const coveredNodeIds = new Set(eligibleRoadblocks.flatMap((roadblock) => roadblock.nodeIds));
  const gaps = eligibleRoadblocks.map(roadblockGap);

  const seenNodeKeys = new Set<string>();
  const unknownNodes = ledger.nodes.filter((node) =>
    node.status === 'unknown'
    && node.kind !== 'document'
    && !/_w_/.test(node.id)
    && !internalArtifact.test(`${node.id} ${node.label}`)
    && !coveredNodeIds.has(node.id),
  );
  for (const node of unknownNodes) {
    const key = normalizedNodeKey(node.label);
    if (!key || seenNodeKeys.has(key)) continue;
    seenNodeKeys.add(key);
    gaps.push(nodeGap(node));
  }

  const representedNodeIds = new Set([
    ...coveredNodeIds,
    ...unknownNodes.map((node) => node.id),
  ]);
  for (const edge of ledger.edges.filter((item) => item.status === 'unknown')) {
    if (/_w_/.test(edge.id)) continue;
    if (representedNodeIds.has(edge.fromNodeId) || representedNodeIds.has(edge.toNodeId)) continue;
    if (internalArtifact.test(`${edge.id} ${edge.label}`)) continue;
    gaps.push(edgeGap(edge, ledger));
  }

  const unique = new Map<string, DocumentationGap>();
  for (const gap of gaps) {
    const key = `${gap.situation.toLowerCase()}|${gap.missing.toLowerCase()}`;
    if (!unique.has(key)) unique.set(key, gap);
  }
  return [...unique.values()].sort((a, b) => a.priority - b.priority || a.situation.localeCompare(b.situation));
}
