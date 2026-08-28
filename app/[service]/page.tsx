import { notFound } from 'next/navigation';
import LedgerEntry from '@/components/LedgerEntry';

const mappedServices = ['bescom', 'khata', 'property-tax', 'water-connection', 'birth-certificate', 'water-account', 'new-electricity', 'death-certificate', 'lpg', 'marriage', 'marriage-registration', 'trade-license', 'building-plan'] as const;

export function generateStaticParams() {
  return mappedServices.map((service) => ({ service }));
}

export default async function ServicePage({ params }: { params: Promise<{ service: string }> }) {
  const { service } = await params;
  if (!mappedServices.includes(service as (typeof mappedServices)[number])) notFound();
  return <LedgerEntry service={service === 'marriage-registration' ? 'marriage' : service} />;
}
