import { atlasServices } from '@/lib/atlas-data';
import { buildSourceGroups, type DisplaySource } from '@/lib/source-groups';
import { collectUndocumentedQuestions } from '@/lib/undocumented';

export type ExplorerDocument = DisplaySource;

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
  specificDocuments: ExplorerDocument[];
  generalReferences: ExplorerDocument[];
  citizenAccounts: ExplorerDocument[];
  missingFiles: ExplorerMissingFile[];
};

/** A presentation-only file listing derived from the existing service ledgers. */
export function buildExplorerFolders(): ExplorerFolder[] {
  return atlasServices.map((service) => {
    const groups = buildSourceGroups(service.ledger);
    return {
      id: service.id,
      title: service.title,
      category: service.category,
      href: service.href,
      ...groups,
      missingFiles: collectUndocumentedQuestions(service.ledger).map((gap) => ({
        id: gap.id,
        name: `${gap.situation}.missing-procedure`,
        situation: gap.situation,
        missing: gap.missing,
      })),
    };
  });
}
