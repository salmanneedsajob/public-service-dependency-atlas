import type { Ledger } from '@/lib/ledger-types';
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
  status: 'Mapped' | 'Partially mapped';
  href: string;
  ledger: Ledger;
};

export const registerOpenedOn = '2026-08-28';

export const atlasServices: AtlasService[] = [
  { id: 'bescom', title: 'Electricity name transfer', category: 'Utility account', status: 'Mapped', href: '/bescom', ledger: bescomLedger as Ledger },
  { id: 'birth-certificate', title: 'Birth certificate', category: 'Civil record', status: 'Partially mapped', href: '/birth-certificate', ledger: birthCertificateLedger as Ledger },
  { id: 'death-certificate', title: 'Death certificate', category: 'Civil record', status: 'Partially mapped', href: '/death-certificate', ledger: deathCertificateLedger as Ledger },
  { id: 'water-connection', title: 'New water / sewer connection', category: 'BWSSB utility', status: 'Partially mapped', href: '/water-connection', ledger: waterConnectionLedger as Ledger },
  { id: 'water-account', title: 'Water account name transfer', category: 'BWSSB utility', status: 'Partially mapped', href: '/water-account', ledger: waterAccountLedger as Ledger },
  { id: 'new-electricity', title: 'New electricity connection', category: 'Electricity utility', status: 'Partially mapped', href: '/new-electricity', ledger: newElectricityLedger as Ledger },
  { id: 'property-tax', title: 'Property tax name transfer', category: 'Municipal property', status: 'Partially mapped', href: '/property-tax', ledger: propertyTaxLedger as Ledger },
  { id: 'khata', title: 'Khata transfer / mutation', category: 'Municipal property', status: 'Mapped', href: '/khata', ledger: khataLedger as Ledger },
  { id: 'trade-license', title: 'Trade licence', category: 'Municipal business', status: 'Partially mapped', href: '/trade-license', ledger: tradeLicenseLedger as Ledger },
  { id: 'building-plan', title: 'Building plan approval', category: 'Municipal planning', status: 'Partially mapped', href: '/building-plan', ledger: buildingPlanLedger as Ledger },
  { id: 'marriage', title: 'Marriage registration', category: 'Civil record', status: 'Partially mapped', href: '/marriage-registration', ledger: marriageLedger as Ledger },
  { id: 'lpg', title: 'LPG connection transfer', category: 'Household utility', status: 'Partially mapped', href: '/lpg', ledger: lpgLedger as Ledger },
];
