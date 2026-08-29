import type { Ledger } from '@/lib/ledger-types';
import { deriveServiceStatus, type ServiceMappingStatus } from '@/lib/service-status';
import bescomLedger from '@/ledger/research.json';
import birthCertificateLedger from '@/ledger/birth-certificate.json';
import buildingPlanLedger from '@/ledger/building-plan.json';
import deathCertificateLedger from '@/ledger/death-certificate.json';
import khataLedger from '@/ledger/khata.json';
import lpgLedger from '@/ledger/lpg.json';
import marriageLedger from '@/ledger/marriage.json';
import newElectricityLedger from '@/ledger/new-electricity.json';
import propertyTaxLedger from '@/ledger/property-tax.json';
import tradeLicenseLedger from '@/ledger/trade-license.json';
import waterAccountLedger from '@/ledger/water-account.json';
import waterConnectionLedger from '@/ledger/water-connection.json';

export type AtlasService = {
  id: string;
  title: string;
  category: string;
  status: ServiceMappingStatus;
  href: string;
  ledger: Ledger;
};

const serviceDefinitions: Array<Omit<AtlasService, 'status'>> = [
  { id: 'bescom', title: 'Electricity name transfer', category: 'Utility account', href: '/bescom', ledger: bescomLedger as Ledger },
  { id: 'birth-certificate', title: 'Birth certificate', category: 'Civil record', href: '/birth-certificate', ledger: birthCertificateLedger as Ledger },
  { id: 'death-certificate', title: 'Death certificate', category: 'Civil record', href: '/death-certificate', ledger: deathCertificateLedger as Ledger },
  { id: 'water-connection', title: 'New water / sewer connection', category: 'BWSSB utility', href: '/water-connection', ledger: waterConnectionLedger as Ledger },
  { id: 'water-account', title: 'Water account name transfer', category: 'BWSSB utility', href: '/water-account', ledger: waterAccountLedger as Ledger },
  { id: 'new-electricity', title: 'New electricity connection', category: 'Electricity utility', href: '/new-electricity', ledger: newElectricityLedger as Ledger },
  { id: 'property-tax', title: 'Property tax name transfer', category: 'Municipal property', href: '/property-tax', ledger: propertyTaxLedger as Ledger },
  { id: 'khata', title: 'Khata transfer / mutation', category: 'Municipal property', href: '/khata', ledger: khataLedger as Ledger },
  { id: 'trade-license', title: 'Trade licence', category: 'Municipal business', href: '/trade-license', ledger: tradeLicenseLedger as Ledger },
  { id: 'building-plan', title: 'Building plan approval', category: 'Municipal planning', href: '/building-plan', ledger: buildingPlanLedger as Ledger },
  { id: 'marriage', title: 'Marriage registration', category: 'Civil record', href: '/marriage-registration', ledger: marriageLedger as Ledger },
  { id: 'lpg', title: 'LPG connection transfer', category: 'Household utility', href: '/lpg', ledger: lpgLedger as Ledger },
];

export const atlasServices: AtlasService[] = serviceDefinitions.map((service) => ({
  ...service,
  status: deriveServiceStatus(service.ledger),
}));
