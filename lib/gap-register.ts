import { atlasServices, registerOpenedOn, type AtlasService } from '@/lib/atlas-data';
import type { Detail, Ledger } from '@/lib/ledger-types';
import { gapRegisterSlug } from '@/lib/gap-slug';
import { collectUndocumentedQuestions, type DocumentationGap, publicNodeLabel } from '@/lib/undocumented';

type Authority = { id: string; name: string; url: string };
type Escalation = { text: string; source?: { title: string; url: string; accessedAt: string } };

export type GapRegisterRecord = {
  number: number;
  id: string;
  slug: string;
  service: Pick<AtlasService, 'id' | 'title' | 'href'>;
  statement: DocumentationGap;
  authorities: Authority[];
  status: 'Open';
  openedOn: string;
  evidenceHref: string;
  escalation: Escalation;
  systemicFix: string;
};

function recordForGap(ledger: Ledger, gap: DocumentationGap) {
  const [kind, entityId] = gap.id.split(':');
  if (kind === 'node') return { kind, entity: ledger.nodes.find((node) => node.id === entityId) };
  if (kind === 'roadblock') return { kind, entity: ledger.roadblocks.find((roadblock) => roadblock.id === entityId) };
  return { kind: 'edge', entity: ledger.edges.find((edge) => edge.id === entityId) };
}

function gradeBSource(ledger: Ledger, claimIds: string[]) {
  const claim = claimIds
    .map((id) => ledger.claims.find((item) => item.id === id))
    .find((item) => item?.evidenceGrade === 'B');
  const source = claim?.sourceIds
    .map((id) => ledger.sources.find((item) => item.id === id))
    .find(Boolean);
  return source ? { title: source.title, url: source.url, accessedAt: source.accessedAt } : undefined;
}

function routeFromDetails(ledger: Ledger, details: Detail[]) {
  const detail = details.find((item) => gradeBSource(ledger, item.claimIds));
  if (!detail) return undefined;
  const source = gradeBSource(ledger, detail.claimIds);
  return source ? { text: detail.description, source } : undefined;
}

function authoritiesFor(ledger: Ledger, kind: string, entity: unknown) {
  let agencyIds: string[] = [];
  if (kind === 'node') agencyIds = [(entity as Ledger['nodes'][number])?.ownerAgencyId].filter(Boolean) as string[];
  if (kind === 'roadblock') {
    const roadblock = entity as Ledger['roadblocks'][number] | undefined;
    agencyIds = roadblock?.ownerAgencyIds ?? [];
    if (!agencyIds.length && roadblock) {
      agencyIds = roadblock.nodeIds
        .map((id) => ledger.nodes.find((node) => node.id === id)?.ownerAgencyId)
        .filter(Boolean) as string[];
    }
  }
  if (kind === 'edge') {
    const edge = entity as Ledger['edges'][number] | undefined;
    agencyIds = edge
      ? [edge.fromNodeId, edge.toNodeId]
        .map((id) => ledger.nodes.find((node) => node.id === id)?.ownerAgencyId)
        .filter(Boolean) as string[]
      : [];
  }
  if (!agencyIds.length) agencyIds = ledger.agencies.slice(0, 1).map((agency) => agency.id);
  return [...new Set(agencyIds)]
    .map((id) => ledger.agencies.find((agency) => agency.id === id))
    .filter((agency): agency is Ledger['agencies'][number] => Boolean(agency))
    .map((agency) => ({ id: agency.id, name: agency.shortName, url: agency.officialUrl }));
}

function escalationFor(ledger: Ledger, kind: string, entity: unknown): Escalation {
  if (kind === 'roadblock') {
    const roadblock = entity as Ledger['roadblocks'][number] | undefined;
    const source = roadblock && gradeBSource(ledger, roadblock.claimIds);
    if (roadblock && source && /support|contact|help|office|authority|registrar|aro|bescom|bwssb|corporation/i.test(roadblock.recovery)) {
      return { text: roadblock.recovery, source };
    }
  }
  if (kind === 'node') {
    const node = entity as Ledger['nodes'][number] | undefined;
    const route = node && routeFromDetails(ledger, node.recoveries);
    if (route) return route;
  }
  if (kind === 'edge') {
    const edge = entity as Ledger['edges'][number] | undefined;
    const destination = edge && ledger.nodes.find((node) => node.id === edge.toNodeId);
    const route = destination && routeFromDetails(ledger, destination.recoveries);
    if (route) return route;
  }
  return { text: 'Not yet recorded. This register does not invent an escalation route where the dated evidence does not contain one.' };
}

function systemicFixFor(ledger: Ledger, kind: string, entity: unknown) {
  if (kind === 'node') {
    const node = entity as Ledger['nodes'][number] | undefined;
    const label = publicNodeLabel(node?.label ?? 'this step');
    return `Publish a current procedure for ${label}: who is eligible, what the record must contain, who owns the decision, the expected response, and the correction route.`;
  }
  if (kind === 'edge') {
    const edge = entity as Ledger['edges'][number] | undefined;
    const from = publicNodeLabel(ledger.nodes.find((node) => node.id === edge?.fromNodeId)?.label ?? 'the previous step');
    const to = publicNodeLabel(ledger.nodes.find((node) => node.id === edge?.toNodeId)?.label ?? 'the next step');
    return `Publish the handoff procedure from ${from} to ${to}: the triggering state, the responsible authority, visible errors, how to correct them, and expected timing.`;
  }
  const roadblock = entity as Ledger['roadblocks'][number] | undefined;
  return `Publish a current procedure for “${roadblock?.title ?? 'this problem'}”: why it occurs, what evidence is needed, which office owns the fix, the steps to resolve it, and expected timing.`;
}

function evidenceHrefFor(service: AtlasService, kind: string, entity: unknown) {
  if (kind === 'roadblock') return `${service.href}#${(entity as Ledger['roadblocks'][number])?.id}`;
  if (kind === 'node') return `${service.href}#${(entity as Ledger['nodes'][number])?.id}`;
  return `${service.href}#map`;
}

export function buildGapRegister(): GapRegisterRecord[] {
  const records = atlasServices.flatMap((service) =>
    collectUndocumentedQuestions(service.ledger).map((statement) => {
      const { kind, entity } = recordForGap(service.ledger, statement);
      return {
        id: statement.id,
        slug: gapRegisterSlug(service.id, statement.id),
        service: { id: service.id, title: service.title, href: service.href },
        statement,
        authorities: authoritiesFor(service.ledger, kind, entity),
        status: 'Open' as const,
        openedOn: registerOpenedOn,
        evidenceHref: evidenceHrefFor(service, kind, entity),
        escalation: escalationFor(service.ledger, kind, entity),
        systemicFix: systemicFixFor(service.ledger, kind, entity),
      };
    }),
  );
  return records
    .sort((a, b) => a.statement.priority - b.statement.priority || a.statement.situation.localeCompare(b.statement.situation))
    .map((record, index) => ({ ...record, number: index + 1 }));
}
