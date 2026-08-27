import { readFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const files = ['app/page.tsx', 'ledger/research.json'];
const text = (await Promise.all(files.map((file) => readFile(file, 'utf8')))).join('\n');
const urls = [...new Set(text.match(/https?:\/\/[^"'\s,)]+/g) ?? [])]
  .filter((url) => !url.includes('example.') && !url.includes('buildwhatmovesindia.example'));

const failures = [];
for (const url of urls) {
  try {
    const { stdout } = await execFileAsync('curl', ['-sS', '-L', '--connect-timeout', '10', '--max-time', '30', '-A', 'Public-Service-Dependency-Atlas link checker', '-o', '/dev/null', '-w', '%{http_code}', url]);
    const status = Number(stdout.trim());
    if (status < 200 || status >= 400) failures.push(`${status || 'no status'} ${url}`);
  } catch (error) {
    failures.push(`${error instanceof Error ? error.message : String(error)} ${url}`);
  }
}
if (failures.length) throw new Error(`External citation check failed:\n${failures.join('\n')}`);
console.log(`External citation check passed: ${urls.length} URLs.`);
