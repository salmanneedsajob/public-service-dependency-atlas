import type { EvidenceGrade, Ledger, RecordStatus } from '@/lib/ledger-types';
import { atlasServices, type AtlasService } from '@/lib/atlas-data';
import { getServiceManifestEntry } from '@/lib/services-manifest';

/**
 * Before You Apply reads the published ledgers and renders one situation at a time.
 * Every sentence it shows resolves to a claim id, a source URL and a date already on
 * disk. Nothing here generates language about a service; it only selects and orders
 * what the ledger already records, including what the ledger records as unresolved.
 */

export type BriefSource = {
  id: string;
  title: string;
  publisher: string;
  url: string;
  accessedAt: string;
  publishedAt?: string;
  type: string;
  notes?: string;
};

export type BriefClaim = {
  id: string;
  text: string;
  status: RecordStatus;
  grade: EvidenceGrade;
  basis: 'observation' | 'inference' | 'mixed';
  notes?: string;
  sources: BriefSource[];
  contradicts: string[];
  /** How many situations this claim is scoped to. Fewer means more specific to the one being read. */
  scenarioCount: number;
};

export type BriefRoadblock = {
  id: string;
  title: string;
  category: 'documentation' | 'process' | 'infrastructure';
  symptom: string;
  likelyCause: string;
  recovery: string;
  status: RecordStatus;
  owners: BriefAgency[];
};

export type BriefAgency = { id: string; name: string; shortName: string; officialUrl: string };

export type BriefNextAction = {
  kind: 'clarify' | 'proceed' | 'unmapped';
  headline: string;
  detail: string;
  owners: BriefAgency[];
};

export type Brief = {
  service: { id: string; title: string; category: string; href: string };
  scenario: { id: string; slug: string; label: string; summary: string; status: RecordStatus; isPrimary: boolean };
  jurisdiction: string;
  asOf: string;
  disclaimer: string;
  established: BriefClaim[];
  contested: BriefClaim[];
  unresolved: BriefClaim[];
  roadblocks: BriefRoadblock[];
  sources: BriefSource[];
  agencies: BriefAgency[];
  nextAction: BriefNextAction;
};

export type BriefScenarioRef = {
  serviceId: string;
  serviceTitle: string;
  serviceCategory: string;
  serviceHref: string;
  scenarioId: string;
  scenarioSlug: string;
  label: string;
  summary: string;
  isPrimary: boolean;
  claimCount: number;
  unresolvedCount: number;
  roadblockCount: number;
  href: string;
};

const statusRank: Record<RecordStatus, number> = { verified: 0, partial: 1, contested: 2, unknown: 3 };
const gradeRank: Record<string, number> = { A: 0, B: 1, C: 2, D: 3, E: 4, F: 5, Unknown: 6 };

export function scenarioSlug(scenarioId: string) {
  return scenarioId.replace(/^scenario_/u, '').replaceAll('_', '-');
}

function serviceById(id: string): AtlasService | undefined {
  return atlasServices.find((service) => service.id === id);
}

/** The manifest decides which situations a service offers; it is the same list the atlas publishes. */
function manifestScenarioIds(serviceId: string): string[] {
  const entry = getServiceManifestEntry(serviceId);
  if (!entry) return [];
  return [entry.primaryScenarioId, ...entry.branchScenarioIds];
}

function toSource(ledger: Ledger, id: string): BriefSource | undefined {
  const source = ledger.sources.find((candidate) => candidate.id === id);
  if (!source) return undefined;
  return {
    id: source.id,
    title: source.title,
    publisher: source.publisher,
    url: source.url,
    accessedAt: source.accessedAt,
    publishedAt: source.publishedAt,
    type: source.type,
    notes: source.notes,
  };
}

function toClaim(ledger: Ledger, claim: Ledger['claims'][number]): BriefClaim {
  return {
    id: claim.id,
    text: claim.text,
    status: claim.status,
    grade: claim.evidenceGrade,
    basis: claim.basis,
    notes: claim.notes,
    contradicts: claim.contradictsClaimIds,
    scenarioCount: claim.scenarioIds.length,
    sources: claim.sourceIds.map((id) => toSource(ledger, id)).filter((source): source is BriefSource => Boolean(source)),
  };
}

function toAgency(ledger: Ledger, id: string): BriefAgency | undefined {
  return ledger.agencies.find((agency) => agency.id === id);
}

/**
 * A reader wants the statements that bear on their own situation first, not the ones
 * that happen to be best evidenced. Order by how narrowly a claim is scoped, then by
 * evidence strength — but never let a single first-person account (grade E or F) open
 * the brief ahead of the documentary record.
 */
function sortClaims(claims: BriefClaim[]) {
  const weak = (claim: BriefClaim) => (claim.grade === 'E' || claim.grade === 'F' ? 1 : 0);
  return [...claims].sort(
    (left, right) =>
      weak(left) - weak(right) ||
      left.scenarioCount - right.scenarioCount ||
      (gradeRank[left.grade] ?? 9) - (gradeRank[right.grade] ?? 9) ||
      statusRank[left.status] - statusRank[right.status] ||
      left.id.localeCompare(right.id),
  );
}

export function getBrief(serviceId: string, scenarioIdOrSlug: string): Brief | undefined {
  const service = serviceById(serviceId);
  if (!service) return undefined;
  const allowed = manifestScenarioIds(serviceId);
  const scenario = service.ledger.scenarios.find(
    (candidate) => allowed.includes(candidate.id) && (candidate.id === scenarioIdOrSlug || scenarioSlug(candidate.id) === scenarioIdOrSlug),
  );
  if (!scenario) return undefined;

  const scenarioClaims = service.ledger.claims.filter((claim) => claim.scenarioIds.includes(scenario.id)).map((claim) => toClaim(service.ledger, claim));
  const established = sortClaims(scenarioClaims.filter((claim) => claim.status === 'verified' || claim.status === 'partial'));
  const contested = sortClaims(scenarioClaims.filter((claim) => claim.status === 'contested'));
  const unresolved = sortClaims(scenarioClaims.filter((claim) => claim.status === 'unknown'));

  const roadblocks: BriefRoadblock[] = service.ledger.roadblocks
    .filter((roadblock) => roadblock.scenarioIds.includes(scenario.id))
    .map((roadblock) => ({
      id: roadblock.id,
      title: roadblock.title,
      category: roadblock.category,
      symptom: roadblock.symptom,
      likelyCause: roadblock.likelyCause,
      recovery: roadblock.recovery,
      status: roadblock.status,
      owners: (roadblock.ownerAgencyIds ?? []).map((id) => toAgency(service.ledger, id)).filter((agency): agency is BriefAgency => Boolean(agency)),
    }));

  const sourceIndex = new Map<string, BriefSource>();
  for (const claim of scenarioClaims) for (const source of claim.sources) sourceIndex.set(source.id, source);

  const roadblockOwners = roadblocks.flatMap((roadblock) => roadblock.owners);
  const agencyIndex = new Map<string, BriefAgency>();
  for (const owner of roadblockOwners) agencyIndex.set(owner.id, owner);
  if (agencyIndex.size === 0) for (const agency of service.ledger.agencies) agencyIndex.set(agency.id, agency);
  const agencies = [...agencyIndex.values()];

  return {
    service: { id: service.id, title: service.title, category: service.category, href: service.href },
    scenario: {
      id: scenario.id,
      slug: scenarioSlug(scenario.id),
      label: scenario.label,
      summary: scenario.summary,
      status: scenario.status,
      isPrimary: allowed[0] === scenario.id,
    },
    jurisdiction: service.ledger.meta.jurisdiction,
    asOf: service.ledger.meta.asOf,
    disclaimer: service.ledger.meta.disclaimer,
    established,
    contested,
    unresolved,
    roadblocks,
    sources: [...sourceIndex.values()].sort((left, right) => left.id.localeCompare(right.id)),
    agencies,
    nextAction: deriveNextAction(established, unresolved, contested, roadblocks, agencies),
  };
}

/**
 * The next action is derived, never authored per service.
 *
 * A situation with nothing recorded against it must never read as reassurance: saying
 * "the record covers this" when we hold no statement at all would be the one lie this
 * page cannot afford. So absence of evidence gets its own answer, ahead of the other two.
 */
function deriveNextAction(
  established: BriefClaim[],
  unresolved: BriefClaim[],
  contested: BriefClaim[],
  roadblocks: BriefRoadblock[],
  agencies: BriefAgency[],
): BriefNextAction {
  const owners = (roadblocks.flatMap((roadblock) => roadblock.owners).length ? roadblocks.flatMap((roadblock) => roadblock.owners) : agencies).filter(
    (agency, index, list) => list.findIndex((candidate) => candidate.id === agency.id) === index,
  );

  if (established.length === 0) {
    return {
      kind: 'unmapped',
      headline: 'We have not mapped this situation.',
      detail:
        'Our research holds no statement scoped to this situation, so this brief cannot tell you what to expect. That is a gap in our work, not a finding about the service. Start from the full atlas entry, or from one of the situations we did map.',
      owners,
    };
  }

  if (unresolved.length || contested.length) {
    const count = unresolved.length + contested.length;
    return {
      kind: 'clarify',
      headline: 'Ask before you apply.',
      detail: `Our research left ${count === 1 ? 'one requirement' : `${count} requirements`} for this situation unresolved in the public record. Take the clarification below to the responsible office and get the current position in writing before you submit anything.`,
      owners,
    };
  }

  return {
    kind: 'proceed',
    headline: 'The published record covers this route.',
    detail:
      'For this situation our research did not find an unresolved requirement. Read the evidence below, check the source dates against today, and confirm anything that looks out of date before you rely on it.',
    owners,
  };
}

export function listBriefScenarios(): BriefScenarioRef[] {
  const refs: BriefScenarioRef[] = [];
  for (const service of atlasServices) {
    const allowed = manifestScenarioIds(service.id);
    for (const scenarioId of allowed) {
      const scenario = service.ledger.scenarios.find((candidate) => candidate.id === scenarioId);
      if (!scenario) continue;
      const claims = service.ledger.claims.filter((claim) => claim.scenarioIds.includes(scenarioId));
      refs.push({
        serviceId: service.id,
        serviceTitle: service.title,
        serviceCategory: service.category,
        serviceHref: service.href,
        scenarioId,
        scenarioSlug: scenarioSlug(scenarioId),
        label: scenario.label,
        summary: scenario.summary,
        isPrimary: allowed[0] === scenarioId,
        claimCount: claims.length,
        unresolvedCount: claims.filter((claim) => claim.status === 'unknown').length,
        roadblockCount: service.ledger.roadblocks.filter((roadblock) => roadblock.scenarioIds.includes(scenarioId)).length,
        href: `/before-you-apply/${service.id}/${scenarioSlug(scenarioId)}`,
      });
    }
  }
  return refs;
}

export function briefCorpusTotals() {
  const refs = listBriefScenarios();
  return {
    serviceCount: atlasServices.length,
    scenarioCount: refs.length,
    claimCount: atlasServices.reduce((total, service) => total + service.ledger.claims.length, 0),
    unresolvedCount: atlasServices.reduce((total, service) => total + service.ledger.claims.filter((claim) => claim.status === 'unknown').length, 0),
    roadblockCount: atlasServices.reduce((total, service) => total + service.ledger.roadblocks.length, 0),
    sourceCount: atlasServices.reduce((total, service) => total + service.ledger.sources.length, 0),
  };
}

function sourceLine(source: BriefSource) {
  const published = source.publishedAt ? `published ${source.publishedAt}, ` : '';
  return `${source.title} — ${source.publisher} (${published}checked ${source.accessedAt})\n    ${source.url}`;
}

/**
 * Our own audit's limitations describe our research, not the service. They belong on the
 * page, where they qualify what we found, but not in a letter to a public office.
 */
const auditLimitationTitle = 'Independent audit limitations';

/**
 * A packet a person can paste into an email or carry to a counter.
 *
 * Three rules make it sendable. It carries no personal data: where a case detail is
 * needed it leaves a labelled blank for the sender to fill in. It lists only documentary
 * sources under "what I have already read", because citing a forum thread to the office
 * that publishes the rule weakens the sender. And it quotes each unresolved point as our
 * finding rather than rewriting it into a question, so nothing is asserted on the
 * sender's behalf that our research did not actually record.
 */
export function buildClarificationPacket(brief: Brief): string {
  const documentary = brief.sources.filter((source) => source.type !== 'citizen_evidence');
  const conditions = brief.roadblocks.filter((roadblock) => roadblock.title !== auditLimitationTitle).slice(0, 6);
  const lines: string[] = [];

  lines.push(`Subject: Clarification request — ${brief.service.title.toLowerCase()}, ${brief.scenario.label.toLowerCase()}`);
  lines.push('');
  lines.push(`To: ${brief.agencies.map((agency) => agency.name).join(' / ') || 'the responsible office'}`);
  lines.push(`Jurisdiction: ${brief.jurisdiction}`);
  lines.push('');
  lines.push('[ Fill in before sending: your name, contact details, and any account, application or property reference. ]');
  lines.push('');
  lines.push(`My situation: ${brief.scenario.summary}`);
  lines.push('');

  if (documentary.length) {
    lines.push('I have already read the following published material:');
    lines.push('');
    for (const source of documentary) lines.push(`  - ${sourceLine(source)}`);
    lines.push('');
  }

  if (brief.unresolved.length) {
    lines.push('These points are not settled by that material. They are quoted as our reading recorded them.');
    lines.push('Some record where our reading stopped — for example at a step behind a login we did not cross.');
    lines.push('We include those because the published material does not describe that step either.');
    lines.push('For each point, please confirm the position that applies now and which office decides it.');
    lines.push('');
    brief.unresolved.forEach((claim, index) => {
      lines.push(`  ${index + 1}. "${claim.text}"`);
      if (claim.notes) lines.push(`     Our note: ${claim.notes}`);
      lines.push('');
    });
  }

  if (brief.contested.length) {
    lines.push('I also found accounts that disagree with each other. Please confirm which is correct today:');
    lines.push('');
    brief.contested.forEach((claim, index) => {
      lines.push(`  ${brief.unresolved.length + index + 1}. "${claim.text}"`);
      if (claim.notes) lines.push(`     Our note: ${claim.notes}`);
      lines.push('');
    });
  }

  if (conditions.length) {
    lines.push('If your answer depends on any of the following, please say so:');
    for (const roadblock of conditions) lines.push(`  - ${roadblock.title}: ${roadblock.symptom}`);
    lines.push('');
  }

  lines.push('I am asking before applying so that I submit the right thing once, rather than correcting it later.');
  lines.push('');
  lines.push('---');
  lines.push(`Prepared from the Public Service Dependency Atlas, ${brief.service.title} / ${brief.scenario.label}.`);
  lines.push(`Independent desk research, not official guidance. Evidence as of ${brief.asOf}.`);
  return lines.join('\n');
}

/**
 * The same record, shaped for an assistant. It carries the evidence grades, the source
 * dates and the unresolved questions, and states that it authorises nothing.
 */
export function buildAgentBrief(brief: Brief): string {
  const lines: string[] = [];
  lines.push(`# Service brief — ${brief.service.title} — ${brief.scenario.label}`);
  lines.push('');
  lines.push(`Jurisdiction: ${brief.jurisdiction}`);
  lines.push(`Situation: ${brief.scenario.summary}`);
  lines.push(`Evidence as of: ${brief.asOf}`);
  lines.push(`Source: Public Service Dependency Atlas — independent desk research, not official guidance.`);
  lines.push('');
  lines.push('## Handling rules');
  lines.push('- Read-only. This brief does not authorise submitting an application, paying a fee, or acting on the holder\'s behalf.');
  lines.push('- Do not present an unresolved item below as a requirement, a permission, or a completed answer.');
  lines.push('- Historic guidance is marked as such. Do not state that it applies now.');
  lines.push('- Every statement carries an evidence grade and a date. Check the date against today before relying on it.');
  lines.push('');
  lines.push(`## Supported by the published record (${brief.established.length})`);
  lines.push('');
  for (const claim of brief.established) {
    lines.push(`- [${claim.status}, grade ${claim.grade}, ${claim.basis}] ${claim.text}`);
    if (claim.notes) lines.push(`  Qualification: ${claim.notes}`);
    for (const source of claim.sources) lines.push(`  Source: ${source.url} (checked ${source.accessedAt})`);
    lines.push('');
  }
  if (brief.contested.length) {
    lines.push(`## Contested — the record disagrees with itself (${brief.contested.length})`);
    lines.push('');
    for (const claim of brief.contested) {
      lines.push(`- [contested, grade ${claim.grade}] ${claim.text}`);
      if (claim.notes) lines.push(`  Qualification: ${claim.notes}`);
      for (const source of claim.sources) lines.push(`  Source: ${source.url} (checked ${source.accessedAt})`);
      lines.push('');
    }
  }
  lines.push(`## Not established by the public record (${brief.unresolved.length})`);
  lines.push('');
  if (brief.unresolved.length === 0) lines.push('- None recorded for this situation. That is not proof the record is complete.');
  for (const claim of brief.unresolved) {
    lines.push(`- [unknown] ${claim.text}`);
    if (claim.notes) lines.push(`  Scope of the gap: ${claim.notes}`);
    for (const source of claim.sources) lines.push(`  Searched: ${source.url} (checked ${source.accessedAt})`);
    lines.push('');
  }
  if (brief.roadblocks.length) {
    lines.push(`## Known failure points (${brief.roadblocks.length})`);
    lines.push('');
    for (const roadblock of brief.roadblocks) {
      lines.push(`- ${roadblock.title} [${roadblock.category}]`);
      lines.push(`  Symptom: ${roadblock.symptom}`);
      lines.push(`  Likely cause: ${roadblock.likelyCause}`);
      lines.push(`  Recovery: ${roadblock.recovery}`);
      if (roadblock.owners.length) lines.push(`  Owner: ${roadblock.owners.map((owner) => owner.name).join(', ')}`);
      lines.push('');
    }
  }
  lines.push('## Next action');
  lines.push('');
  lines.push(`${brief.nextAction.headline} ${brief.nextAction.detail}`);
  lines.push('');
  lines.push('## Sources');
  lines.push('');
  for (const source of brief.sources) lines.push(`- ${sourceLine(source)}`);
  return lines.join('\n');
}
