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
// This direct Census Act PDF predates the per-URL cap and is deliberately
// shared for the Act's individual sections; it is not a homepage exception.
const citationCapExemptSourceIds = new Set(['source_ind42_birth_rbd_act_pdf']);
const newPhaseTwoSource = (source) => /^source_ind(?:4[1-9]|[5-9]\d)_/.test(source.id) && !citationCapExemptSourceIds.has(source.id);
const homeLikePaths = new Set(['/', '/index.html', '/index.php', '/indiacode/', '/consumer', '/consumer/', '/citizen_core/', '/portal', '/portal/']);

const isBareOrigin = (url) => {
  const parsed = new URL(url);
  return parsed.pathname === '/' && !parsed.search && !parsed.hash;
};

// Agency homepages are allowed as directory metadata and journey starting
// points. They are not allowed to be ledger *sources*, which are citations.
const sourceRecords = ledgers.flatMap((ledger) => ledger.sources ?? []);
// IND-54 exhausted reproducible public lookups for these historical records.
// Each remains Grade C and explicitly says why no claim-specific page is shown.
const homepageCitationAllowlist = new Set([
  'source_ind32_birth_model_rules', 'source_ind32_birth_bbmp_citizen_services', 'source_ind32_birth_gba_home', 'source_ind32_birth_bbmp_reforms', 'source_ind32_birth_bbmp_it', 'source_ind32_birth_workflow_bbmp_index', 'source_ind32_birth_workflow_gba_home', 'source_ind32_birth_workflow_bbmp_reforms',
  'source_ind32_death_gba_home', 'source_ind32_death_bbmp_services', 'source_ind32_death_bbmp_manual', 'source_ind32_death_sakala_audit', 'source_ind32_death_workflow_gba', 'source_ind32_death_workflow_bbmp', 'source_ind32_death_workflow_manual', 'source_ind32_death_workflow_sakala',
  'source_ind32_bbmp_act_2020', 'source_ind32_bbmp_khatha_documents', 'source_ind32_bbmp_revenue_faq', 'source_ind32_gba_directory',
  'source_marriage_kar_act', 'source_ind32_property_bbmp_act', 'source_ind32_property_documents', 'source_ind32_property_faq', 'source_ind32_property_fee',
  'source_gba_directory', 'source_trade_kmc_act', 'source_trade_gba_home', 'source_trade_faq', 'source_trade_new_manual', 'source_trade_otls',
  'source_trade_w_gba', 'source_trade_w_manual', 'source_trade_w_otls', 'source_trade_w_faq', 'source_ind32_water_account_act',
  'source_ind32_eaasthi_citizen_home', 'source_ind32_property_workflow_citizen_home', 'source_ind32_water_account_consumer', 'source_ind40_water_public_entry',
  'source_ind32_birth_workflow_bbmp_it', 'source_building_kmc_299', 'source_building_gba_home', 'source_building_w_gba', 'source_ind32_property_act_index',
]);

// IND-54 will repair the inherited citation corpus. From IND-41 onward, do
// not allow a new source record to make the problem worse: new claims need a
// page, document, or form, rather than a home/portal entry point. A source
// URL already supporting many claims is likewise a discovery lead, not a new
// specific citation.
const sourceById = new Map(sourceRecords.map((source) => [source.id, source]));
const claimCountByUrl = new Map();
for (const ledger of ledgers) for (const claim of ledger.claims ?? []) for (const sourceId of claim.sourceIds ?? []) {
  const source = sourceById.get(sourceId);
  if (source && newPhaseTwoSource(source)) claimCountByUrl.set(source.url, (claimCountByUrl.get(source.url) ?? 0) + 1);
}
const homepageProblems = sourceRecords.filter((source) => {
  const path = new URL(source.url).pathname.toLowerCase();
  return (isBareOrigin(source.url) || homeLikePaths.has(path)) && !homepageCitationAllowlist.has(source.id);
}).map((source) => `${source.id}: homepage-level citation without an IND-54 allowlist entry (${source.url})`);
const newSourceProblems = sourceRecords.filter(newPhaseTwoSource).flatMap((source) => {
  const path = new URL(source.url).pathname.toLowerCase();
  const problems = [];
  if ((isBareOrigin(source.url) || homeLikePaths.has(path)) && !homepageCitationAllowlist.has(source.id)) problems.push(`homepage-like path ${path}`);
  if ((claimCountByUrl.get(source.url) ?? 0) > 5) problems.push(`already supports ${claimCountByUrl.get(source.url)} claims across the atlas`);
  return problems.map((problem) => `${source.id}: ${problem} (${source.url})`);
});
if (homepageProblems.length || newSourceProblems.length) throw new Error(`Homepage citations must be specific pages or explicitly documented IND-54 exceptions:\n${[...homepageProblems, ...newSourceProblems].join('\n')}`);

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
