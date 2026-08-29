import { readFile } from 'node:fs/promises';
import { serviceGuides } from '../lib/service-copy.ts';

const services = {
  bescom: 'research.json',
  khata: 'khata.json',
  'property-tax': 'property-tax.json',
  'water-connection': 'water-connection.json',
  'birth-certificate': 'birth-certificate.json',
  'water-account': 'water-account.json',
  'new-electricity': 'new-electricity.json',
  'death-certificate': 'death-certificate.json',
  lpg: 'lpg.json',
  marriage: 'marriage.json',
  'trade-license': 'trade-license.json',
  'building-plan': 'building-plan.json',
};

const normalize = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '');
const internalJargon = /\b(?:ledger|schema|node|edge|dependency|handoff|relationship)\b/i;
const errors = [];

if (Object.keys(serviceGuides).length !== Object.keys(services).length) {
  errors.push(`Expected ${Object.keys(services).length} service guides; found ${Object.keys(serviceGuides).length}.`);
}

for (const [service, file] of Object.entries(services)) {
  const guide = serviceGuides[service];
  if (!guide) {
    errors.push(`${service}: missing guide.`);
    continue;
  }
  if (guide.terms.length < 3) errors.push(`${service}: expected at least three defined terms.`);
  if (!guide.processSummary || guide.processSummary.length < 180) errors.push(`${service}: process summary is missing or too thin.`);
  if (internalJargon.test(guide.processSummary)) errors.push(`${service}: process summary contains internal research jargon.`);

  const ledgerText = normalize(await readFile(`ledger/${file}`, 'utf8'));
  for (const item of guide.terms) {
    if (!item.definition.trim()) errors.push(`${service}: ${item.term} has no definition.`);
    if (!ledgerText.includes(normalize(item.term))) errors.push(`${service}: ${item.term} does not appear in that service's research.`);
  }
}

if (errors.length) throw new Error(`Comprehension copy check failed:\n${errors.join('\n')}`);
console.log('Comprehension copy verified: all 12 entries have service-specific terms and process summaries.');
