import { readFile } from 'node:fs/promises';
import { collectUndocumentedQuestions } from '../lib/undocumented.ts';

const page = await readFile('app/page.tsx', 'utf8');
const errors = [];
const ledgerFiles = [
  'research.json', 'birth-certificate.json', 'death-certificate.json',
  'water-connection.json', 'water-account.json', 'new-electricity.json',
  'property-tax.json', 'khata.json', 'trade-license.json', 'building-plan.json',
  'marriage.json', 'lpg.json',
];
const ledgers = await Promise.all(ledgerFiles.map(async (file) => JSON.parse(await readFile(`ledger/${file}`, 'utf8'))));

const metrics = {
  serviceCount: ledgers.length,
  curatedGapCount: ledgers.reduce((total, ledger) => total + collectUndocumentedQuestions(ledger).length, 0),
  claimCount: ledgers.reduce((total, ledger) => total + ledger.claims.length, 0),
  sourceCount: ledgers.reduce((total, ledger) => total + ledger.sources.length, 0),
  distinctUrlCount: new Set(ledgers.flatMap((ledger) => ledger.sources.map((source) => source.url))).size,
};

// Visible copy may use a number only through a build-time metric expression.
// This catches the specific nouns used for atlas-wide totals without objecting
// to structural labels such as the numbered failure layers.
const literalVisibleCount = /(?:^|[>{\s])\d+\s+(?:services|claims|sources|distinct URLs|records|steps|gaps)\b/i;
if (literalVisibleCount.test(page)) errors.push('Visible atlas-wide count is a numeric literal rather than a derived metric.');

for (const expression of ['atlasMetrics.serviceCount', 'atlasMetrics.curatedGapCount', 'exampleGaps.length']) {
  if (!page.includes(expression)) errors.push(`Home page does not render the required derived value: ${expression}.`);
}

if (!metrics.serviceCount || !metrics.curatedGapCount || !metrics.claimCount || !metrics.sourceCount || !metrics.distinctUrlCount) {
  errors.push('Derived atlas metrics unexpectedly include a zero total.');
}

if (errors.length) throw new Error(`Derived visible-count check failed:\n${errors.join('\n')}`);
console.log(`Derived visible counts verified: ${metrics.serviceCount} services, ${metrics.curatedGapCount} curated gaps, ${metrics.claimCount} claims, ${metrics.sourceCount} sources, ${metrics.distinctUrlCount} distinct URLs.`);
