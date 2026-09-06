import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

const execute = promisify(execFile);
const bengaluruServices = ['passport', 'aadhaar-address-update', 'property-tax-payment', 'sale-deed-registration', 'occupancy-certificate'];
const manifest = JSON.parse(await readFile('ledger/jurisdictions/manifest.json', 'utf8'));
const routes = [
  ...manifest.entries.map((entry) => ({ jurisdictionSlug: entry.jurisdictionSlug, serviceId: entry.serviceId, root: `public/data/jurisdictions/${entry.jurisdictionSlug}` })),
  ...bengaluruServices.map((serviceId) => ({ jurisdictionSlug: 'bengaluru', serviceId, root: 'public/data' })),
];

await execute(process.execPath, ['node_modules/next/dist/bin/next', 'build', '--webpack'], { maxBuffer: 10 * 1024 * 1024 });
const errors = [];
const htmlEscape = (value) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

for (const route of routes) {
  const gridOnly = route.jurisdictionSlug !== 'bengaluru';
  const [ledger, expectations, scorecard, html] = await Promise.all([
    readFile(gridOnly ? `${route.root}/${route.serviceId}.json` : `${route.root}/${route.serviceId}.json`, 'utf8').then(JSON.parse),
    readFile(gridOnly ? `${route.root}/expectations/${route.serviceId}.json` : `${route.root}/expectations/${route.serviceId}.json`, 'utf8').then(JSON.parse),
    readFile(gridOnly ? `public/data/scorecards/${route.jurisdictionSlug}/${route.serviceId}.json` : `public/data/scorecards/${route.serviceId}.json`, 'utf8').then(JSON.parse),
    readFile(path.join('.next/server/app/benchmark', route.jurisdictionSlug, `${route.serviceId}.html`), 'utf8'),
  ]);
  const label = `${route.jurisdictionSlug}/${route.serviceId}`;
  const count = new RegExp(`data-stated-count="${scorecard.statedCount}"`, 'u');
  if (!count.test(html)) errors.push(`${label}: rendered stated count does not equal ${scorecard.statedCount}.`);
  for (const cell of Object.values(expectations.cells)) for (const claimId of cell.claimIds) if (!html.includes(`id="claim-${claimId}"`)) errors.push(`${label}: missing rendered claim ${claimId}.`);
  for (const source of ledger.sources) if (!html.includes(htmlEscape(source.url))) errors.push(`${label}: missing rendered source URL ${source.id}.`);
}

if (errors.length) throw new Error(`Evidence page verification failed:\n${errors.join('\n')}`);
console.log(`Evidence pages verified: ${routes.length} static pages, scorecard counts, sidecar claims, and ledger sources.`);
