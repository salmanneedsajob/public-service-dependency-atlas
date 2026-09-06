import { notFound } from 'next/navigation';
import LedgerEntry from '@/components/LedgerEntry';
import type { Ledger } from '@/lib/ledger-types';
import aadhaarAddressUpdateLedger from '@/ledger/aadhaar-address-update.json';
import bescomLedger from '@/ledger/research.json';
import birthCertificateLedger from '@/ledger/birth-certificate.json';
import buildingPlanLedger from '@/ledger/building-plan.json';
import deathCertificateLedger from '@/ledger/death-certificate.json';
import khataLedger from '@/ledger/khata.json';
import lpgLedger from '@/ledger/lpg.json';
import marriageLedger from '@/ledger/marriage.json';
import newElectricityLedger from '@/ledger/new-electricity.json';
import occupancyCertificateLedger from '@/ledger/occupancy-certificate.json';
import passportLedger from '@/ledger/passport.json';
import propertyTaxPaymentLedger from '@/ledger/property-tax-payment.json';
import propertyTaxLedger from '@/ledger/property-tax.json';
import saleDeedRegistrationLedger from '@/ledger/sale-deed-registration.json';
import tradeLicenseLedger from '@/ledger/trade-license.json';
import waterAccountLedger from '@/ledger/water-account.json';
import waterConnectionLedger from '@/ledger/water-connection.json';

const mappedServices = ['bescom', 'khata', 'property-tax', 'water-connection', 'birth-certificate', 'water-account', 'new-electricity', 'death-certificate', 'lpg', 'marriage', 'marriage-registration', 'trade-license', 'building-plan', 'passport', 'aadhaar-address-update', 'property-tax-payment', 'sale-deed-registration', 'occupancy-certificate'] as const;
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
  passport: passportLedger as Ledger,
  'aadhaar-address-update': aadhaarAddressUpdateLedger as Ledger,
  'property-tax-payment': propertyTaxPaymentLedger as Ledger,
  'sale-deed-registration': saleDeedRegistrationLedger as Ledger,
  'occupancy-certificate': occupancyCertificateLedger as Ledger,
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
