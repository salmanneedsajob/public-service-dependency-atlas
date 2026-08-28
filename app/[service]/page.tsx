import { notFound } from 'next/navigation';
import LedgerEntry from '@/components/LedgerEntry';
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

const mappedServices = ['bescom', 'khata', 'property-tax', 'water-connection', 'birth-certificate', 'water-account', 'new-electricity', 'death-certificate', 'lpg', 'marriage', 'marriage-registration', 'trade-license', 'building-plan'] as const;
const ledgers: Record<string, Ledger> = {
  bescom: bescomLedger as Ledger,
  khata: khataLedger as Ledger,
  'property-tax': propertyTaxLedger as Ledger,
  'water-connection': waterConnectionLedger as Ledger,
  'birth-certificate': birthCertificateLedger as Ledger,
  'water-account': waterAccountLedger as Ledger,
  'new-electricity': newElectricityLedger as Ledger,
  'death-certificate': deathCertificateLedger as Ledger,
  lpg: lpgLedger as Ledger,
  marriage: marriageLedger as Ledger,
  'trade-license': tradeLicenseLedger as Ledger,
  'building-plan': buildingPlanLedger as Ledger,
};

export function generateStaticParams() {
  return mappedServices.map((service) => ({ service }));
}

export default async function ServicePage({ params }: { params: Promise<{ service: string }> }) {
  const { service } = await params;
  if (!mappedServices.includes(service as (typeof mappedServices)[number])) notFound();
  const ledgerService = service === 'marriage-registration' ? 'marriage' : service;
  return <LedgerEntry service={ledgerService} ledger={ledgers[ledgerService]} />;
}
