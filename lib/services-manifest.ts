import manifest from '@/ledger/services.manifest.json';

export type ServiceManifestEntry = {
  id: string;
  reportServiceId?: string;
  title: string;
  category: string;
  href: string;
  ledgerFile: string;
  primaryScenarioId: string;
  branchScenarioIds: string[];
  stratum: 'existing' | 'deep' | 'breadth';
  lifeEvent: string;
  serviceKind: string;
  agencyTier: string;
  published: boolean;
  reportIncluded: boolean;
};

export const serviceManifest = manifest as { version: number; services: ServiceManifestEntry[] };
export const publishedServiceManifest = serviceManifest.services.filter((service) => service.published);
export const reportServiceManifest = serviceManifest.services.filter((service) => service.reportIncluded);

export function getServiceManifestEntry(id: string) {
  return serviceManifest.services.find((service) => service.id === id);
}
