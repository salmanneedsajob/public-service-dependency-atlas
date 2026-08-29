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

const isBareOrigin = (url) => {
  const parsed = new URL(url);
  return parsed.pathname === '/' && !parsed.search && !parsed.hash;
};

// Agency homepages are allowed as directory metadata and journey starting
// points. They are not allowed to be ledger *sources*, which are citations.
const sourceUrls = ledgers.flatMap((ledger) => (ledger.sources ?? []).map((source) => source.url));
const bareOrigins = [...new Set(sourceUrls.filter(isBareOrigin))];
if (bareOrigins.length) {
  throw new Error(`Bare-origin citations are not allowed; use a verified document or explicitly marked general-site reference instead:\n${bareOrigins.join('\n')}`);
}

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
