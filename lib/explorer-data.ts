import { atlasServices } from '@/lib/atlas-data';
import { collectUndocumentedQuestions } from '@/lib/undocumented';

export type ExplorerDocument = {
  id: string;
  title: string;
  publisher: string;
  url: string;
  accessedAt: string;
  evidenceGrade: string;
  type: string;
};

export type ExplorerMissingFile = {
  id: string;
  name: string;
  situation: string;
  missing: string;
};

export type ExplorerFolder = {
  id: string;
  title: string;
  category: string;
  href: string;
  documents: ExplorerDocument[];
  missingFiles: ExplorerMissingFile[];
};

const gradeRank: Record<string, number> = { A: 0, B: 1, C: 2, D: 3, E: 4, F: 5, Unknown: 6 };

function sourceGrade(sourceId: string, ledger: (typeof atlasServices)[number]['ledger']) {
  const grades = ledger.claims
    .filter((claim) => claim.sourceIds.includes(sourceId))
    .map((claim) => claim.evidenceGrade);
  return grades.sort((left, right) => (gradeRank[left] ?? 7) - (gradeRank[right] ?? 7))[0] ?? 'Unknown';
}

/** A presentation-only file listing derived from the existing service ledgers. */
export function buildExplorerFolders(): ExplorerFolder[] {
  return atlasServices.map((service) => ({
    id: service.id,
    title: service.title,
    category: service.category,
    href: service.href,
    documents: service.ledger.sources
      .filter((source) => source.type !== 'citizen_evidence')
      .map((source) => ({
        id: source.id,
        title: source.title,
        publisher: source.publisher,
        url: source.url,
        accessedAt: source.accessedAt,
        evidenceGrade: sourceGrade(source.id, service.ledger),
        type: source.type.replaceAll('_', ' '),
      })),
    missingFiles: collectUndocumentedQuestions(service.ledger).map((gap) => ({
      id: gap.id,
      name: `${gap.situation}.missing-procedure`,
      situation: gap.situation,
      missing: gap.missing,
    })),
  }));
}
