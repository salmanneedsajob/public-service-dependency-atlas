import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { promisify } from 'node:util';

const execute = promisify(execFile);
const pilotServices = new Set(['birth-certificate', 'property-tax-payment', 'water-connection']);

const [{ rows }, build] = await Promise.all([
  readFile('public/data/scorecards/jurisdiction-table.json', 'utf8').then(JSON.parse),
  execute(process.execPath, ['node_modules/next/dist/bin/next', 'build', '--webpack'], { maxBuffer: 10 * 1024 * 1024 }),
]);

if (build.stderr) process.stderr.write(build.stderr);
const html = await readFile('.next/server/app/benchmark.html', 'utf8');
const displayedRows = rows.filter((row) => pilotServices.has(row.serviceId) || row.jurisdictionSlug === '');
const errors = [];

for (const row of displayedRows) {
  const escapedService = row.serviceId.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
  const escapedSlug = row.jurisdictionSlug.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
  const matches = [...html.matchAll(new RegExp(`<tr[^>]*data-service-id="${escapedService}"[^>]*data-jurisdiction-slug="${escapedSlug}"[^>]*data-stated-count="(\\d+)"`, 'gu'))];
  const expectedOccurrences = Number(pilotServices.has(row.serviceId)) + Number(row.jurisdictionSlug === '');
  if (!matches.length) {
    errors.push(`Missing rendered row: ${row.serviceId}/${row.jurisdictionSlug || 'bengaluru-deep'} (${row.source}).`);
    continue;
  }
  if (matches.length !== expectedOccurrences) errors.push(`Rendered row count mismatch for ${row.serviceId}/${row.jurisdictionSlug || 'bengaluru-deep'}: ${matches.length} !== ${expectedOccurrences}.`);
  for (const match of matches) if (Number(match[1]) !== row.statedCount) errors.push(`Rendered stated count mismatch for ${row.serviceId}/${row.jurisdictionSlug || 'bengaluru-deep'}: ${match[1]} !== ${row.statedCount}.`);
}

const birthRows = rows.filter((row) => row.serviceId === 'birth-certificate' && row.jurisdiction.startsWith('Bengaluru'));
if (!birthRows.some((row) => row.comparable) || !birthRows.some((row) => !row.comparable)) errors.push('The table JSON does not contain both Bengaluru birth-certificate methods.');
if (!html.includes('The authored and reviewed-regex source values measure different things')) errors.push('The rendered Bengaluru method-comparison note is missing.');

if (errors.length) throw new Error(`Benchmark page verification failed:\n${errors.join('\n')}`);
console.log(`Benchmark page rendered ${displayedRows.reduce((total, row) => total + Number(pilotServices.has(row.serviceId)) + Number(row.jurisdictionSlug === ''), 0)} rows with stated counts verified against jurisdiction-table.json.`);
