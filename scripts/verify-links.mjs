import { readFile, readdir } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const ledgerFiles = (await readdir('ledger'))
  .filter((file) => file.endsWith('.json') && !['schema.json', 'example.json', 'demo.synthetic.json'].includes(file))
  .map((file) => `ledger/${file}`);
const files = ['app/page.tsx', ...ledgerFiles];
const text = (await Promise.all(files.map((file) => readFile(file, 'utf8')))).join('\n');
const urls = [...new Set(text.match(/https?:\/\/[^"'\s,)]+/g) ?? [])]
  .filter((url) => !url.includes('example.') && !url.includes('buildwhatmovesindia.example'));
const ledgers = await Promise.all(ledgerFiles.map(async (file) => JSON.parse(await readFile(file, 'utf8'))));
// These records predate the IND-41 citation gate. They remain in scope for
// IND-54’s corpus repair, but must not turn a later service integration into
// a false failure merely because it reuses an already-grandfathered source.
const grandfatheredSourceIds = new Set([
  'source_ind42_birth_rbd_act_pdf',
  'source_ind42_birth_lookup_live',
]);
const newPhaseTwoSource = (source) => /^source_ind(?:4[1-9]|[5-9]\d)_/.test(source.id) && !grandfatheredSourceIds.has(source.id);
const homeLikePaths = new Set(['/', '/index.html', '/index.php', '/indiacode/', '/consumer', '/consumer/', '/citizen_core/', '/portal', '/portal/']);

const isBareOrigin = (url) => {
  const parsed = new URL(url);
  return parsed.pathname === '/' && !parsed.search && !parsed.hash;
};

// Agency homepages are allowed as directory metadata and journey starting
// points. They are not allowed to be ledger *sources*, which are citations.
const sourceRecords = ledgers.flatMap((ledger) => ledger.sources ?? []);

// IND-54 will repair the inherited citation corpus. From IND-41 onward, do
// not allow a new source record to make the problem worse: new claims need a
// page, document, or form, rather than a home/portal entry point. A source
// URL already supporting many claims is likewise a discovery lead, not a new
// specific citation.
const sourceById = new Map(sourceRecords.map((source) => [source.id, source]));
const claimCountByUrl = new Map();
for (const ledger of ledgers) for (const claim of ledger.claims ?? []) for (const sourceId of claim.sourceIds ?? []) {
  const source = sourceById.get(sourceId);
  if (source) claimCountByUrl.set(source.url, (claimCountByUrl.get(source.url) ?? 0) + 1);
}
const newSourceProblems = sourceRecords.filter(newPhaseTwoSource).flatMap((source) => {
  const path = new URL(source.url).pathname.toLowerCase();
  const problems = [];
  if (isBareOrigin(source.url) || homeLikePaths.has(path)) problems.push(`homepage-like path ${path}`);
  if ((claimCountByUrl.get(source.url) ?? 0) > 5) problems.push(`already supports ${claimCountByUrl.get(source.url)} claims across the atlas`);
  return problems.map((problem) => `${source.id}: ${problem} (${source.url})`);
});
if (newSourceProblems.length) throw new Error(`New Phase 2 citations must be specific pages or documents:\n${newSourceProblems.join('\n')}`);

const check = async (url) => {
  try {
    const { stdout } = await execFileAsync('curl', ['-sS', '-L', '--connect-timeout', '10', '--max-time', '30', '-A', 'Public-Service-Dependency-Atlas link checker', '-o', '/dev/null', '-w', '%{http_code}', url]);
    const status = Number(stdout.trim());
    return status >= 200 && status < 400 ? null : `${status || 'no status'} ${url}`;
  } catch (error) {
    return `${error instanceof Error ? error.message : String(error)} ${url}`;
  }
};

const concurrency = 64;
const failures = [];
for (let index = 0; index < urls.length; index += concurrency) {
  const batch = await Promise.all(urls.slice(index, index + concurrency).map(check));
  failures.push(...batch.filter(Boolean));
}
if (failures.length) throw new Error(`External citation check failed:\n${failures.join('\n')}`);
console.log(`External citation check passed: ${urls.length} URLs.`);
