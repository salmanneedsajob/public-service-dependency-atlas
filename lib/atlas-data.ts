import type { Ledger } from '@/lib/ledger-types';
import { deriveServiceMappingSummary, type ServiceMappingSummary, type ServiceMappingStatus } from '@/lib/service-status';
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
import { publishedServiceManifest } from '@/lib/services-manifest';

export type AtlasService = {
  id: string;
  title: string;
  category: string;
  status: ServiceMappingStatus;
  mappingSummary: ServiceMappingSummary;
  href: string;
  ledger: Ledger;
};

const ledgersByServiceId: Record<string, Ledger> = {
  bescom: bescomLedger as Ledger,
  'birth-certificate': birthCertificateLedger as Ledger,
  'death-certificate': deathCertificateLedger as Ledger,
  'water-connection': waterConnectionLedger as Ledger,
  'water-account': waterAccountLedger as Ledger,
  'new-electricity': newElectricityLedger as Ledger,
  'property-tax': propertyTaxLedger as Ledger,
  khata: khataLedger as Ledger,
  'trade-license': tradeLicenseLedger as Ledger,
  'building-plan': buildingPlanLedger as Ledger,
  marriage: marriageLedger as Ledger,
  lpg: lpgLedger as Ledger,
  passport: passportLedger as Ledger,
  'aadhaar-address-update': aadhaarAddressUpdateLedger as Ledger,
  'property-tax-payment': propertyTaxPaymentLedger as Ledger,
  'sale-deed-registration': saleDeedRegistrationLedger as Ledger,
  'occupancy-certificate': occupancyCertificateLedger as Ledger,
};

const serviceDefinitions: Array<Omit<AtlasService, 'status' | 'mappingSummary'>> = publishedServiceManifest.map((service) => {
  const ledger = ledgersByServiceId[service.id];
  if (!ledger) throw new Error(`Published service ${service.id} has no loaded ledger.`);
  return { id: service.id, title: service.title, category: service.category, href: service.href, ledger };
});

export const atlasServices: AtlasService[] = serviceDefinitions.map((service) => {
  const mappingSummary = deriveServiceMappingSummary(service.ledger);
  return { ...service, status: mappingSummary.status, mappingSummary };
});
