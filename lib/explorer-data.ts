import { atlasServices } from '@/lib/atlas-data';
import { buildSourceGroups, type DisplaySource } from '@/lib/source-groups';
import { collectUndocumentedQuestions } from '@/lib/undocumented';
import type { ServiceMappingStatus } from '@/lib/service-status';

export type ExplorerDocument = DisplaySource;

export type ExplorerMissingFile = {
  id: string;
  name: string;
  situation: string;
  missing: string;
};

export type ExplorerResearchCoverage = {
  researchedSilent: number;
  notYetResearched: number;
};

export type ExplorerFolder = {
  id: string;
  title: string;
  category: string;
  status: ServiceMappingStatus;
  href: string;
  specificDocuments: ExplorerDocument[];
  generalReferences: ExplorerDocument[];
  citizenAccounts: ExplorerDocument[];
  missingFiles: ExplorerMissingFile[];
  researchCoverage: ExplorerResearchCoverage;
};

/** A presentation-only file listing derived from the existing service ledgers. */
export function buildExplorerFolders(): ExplorerFolder[] {
  return atlasServices.map((service) => {
    const groups = buildSourceGroups(service.ledger);
    const fields = ['checks', 'failureSignals', 'recoveries'] as const;
    const emptyFields = service.ledger.nodes.flatMap((node) => fields
      .filter((field) => node[field].length === 0)
      .map((field) => ({ node, field })));
    return {
      id: service.id,
      title: service.title,
      category: service.category,
      status: service.status,
      href: service.href,
      ...groups,
      missingFiles: collectUndocumentedQuestions(service.ledger).map((gap) => ({
        id: gap.id,
        name: `${gap.situation}.missing-procedure`,
        situation: gap.situation,
        missing: gap.missing,
      })),
      researchCoverage: {
        researchedSilent: emptyFields.filter(({ node, field }) => node.researchedNoSourceFound?.includes(field)).length,
        notYetResearched: emptyFields.filter(({ node, field }) => !node.researchedNoSourceFound?.includes(field)).length,
      },
    };
  });
}
