import type { EvidenceGrade, Ledger } from '@/lib/ledger-types';

type Source = Ledger['sources'][number];

export type SourceGroupKind = 'specific' | 'general' | 'citizen';

export type DisplaySource = {
  id: string;
  sourceIds: string[];
  title: string;
  publisher: string;
  url: string;
  accessedAt: string;
  evidenceGrade: EvidenceGrade;
  kind: SourceGroupKind;
  notes: string;
  citedFor: string[];
};

export type SourceGroups = {
  specificDocuments: DisplaySource[];
  generalReferences: DisplaySource[];
  citizenAccounts: DisplaySource[];
};

const gradeRank: Record<EvidenceGrade, number> = { A: 0, B: 1, C: 2, D: 3, E: 4, F: 5, Unknown: 6 };

function isCitizenSource(source: Source) {
  return source.type === 'citizen_evidence' || /(?:^|\.)reddit\.com$/i.test(new URL(source.url).hostname);
}

function isGeneralReference(source: Source) {
  if (/^General-site reference\b/i.test(source.title)) return true;

  const path = new URL(source.url).pathname.replace(/\/$/, '');
  return !path || /\/(?:home|landing-page|main|index(?:\.html)?)$/i.test(path);
}

function bestGrade(sourceIds: string[], ledger: Ledger): EvidenceGrade {
  const grades = ledger.claims
    .filter((claim) => claim.sourceIds.some((sourceId) => sourceIds.includes(sourceId)))
    .map((claim) => claim.evidenceGrade);
  return grades.sort((left, right) => gradeRank[left] - gradeRank[right])[0] ?? 'Unknown';
}

function preferredTitle(sources: Source[]) {
  return sources.find((source) => !/^General-site reference\b/i.test(source.title))?.title ?? sources[0]?.title ?? 'Untitled source';
}

function primarySource(sources: Source[]) {
  return sources.find((source) => !/^General-site reference\b/i.test(source.title)) ?? sources[0];
}

/** Presentation-only grouping: one displayed file per URL, with every source ID retained. */
export function buildSourceGroups(ledger: Ledger): SourceGroups {
  const byUrl = new Map<string, Source[]>();
  for (const source of ledger.sources) {
    const entries = byUrl.get(source.url) ?? [];
    entries.push(source);
    byUrl.set(source.url, entries);
  }

  const groups: SourceGroups = { specificDocuments: [], generalReferences: [], citizenAccounts: [] };
  for (const [url, sources] of byUrl) {
    const citizen = sources.every(isCitizenSource);
    const general = !citizen && sources.every(isGeneralReference);
    const kind: SourceGroupKind = citizen ? 'citizen' : general ? 'general' : 'specific';
    const sourceIds = sources.map((source) => source.id);
    const primary = primarySource(sources);
    const displaySource: DisplaySource = {
      id: sourceIds[0],
      sourceIds,
      title: preferredTitle(sources),
      publisher: primary?.publisher ?? 'publisher not recorded',
      url,
      accessedAt: [...new Set(sources.map((source) => source.accessedAt))].sort().at(-1) ?? 'date not recorded',
      evidenceGrade: bestGrade(sourceIds, ledger),
      kind,
      notes: primary?.notes ?? '',
      citedFor: [...new Set(ledger.claims
        .filter((claim) => claim.sourceIds.some((sourceId) => sourceIds.includes(sourceId)))
        .map((claim) => claim.text))],
    };

    if (kind === 'citizen') groups.citizenAccounts.push(displaySource);
    else if (kind === 'general') groups.generalReferences.push(displaySource);
    else groups.specificDocuments.push(displaySource);
  }
  return groups;
}

export function sourceGroupSummary(groups: SourceGroups, missingProcedures = 0) {
  const parts = [
    `${groups.specificDocuments.length} ${groups.specificDocuments.length === 1 ? 'document' : 'documents'}`,
    `${groups.generalReferences.length} general ${groups.generalReferences.length === 1 ? 'reference' : 'references'}`,
    `${groups.citizenAccounts.length} citizen ${groups.citizenAccounts.length === 1 ? 'account' : 'accounts'}`,
  ];
  if (missingProcedures >= 0) parts.push(`${missingProcedures} missing ${missingProcedures === 1 ? 'procedure' : 'procedures'}`);
  return parts.join(' · ');
}
