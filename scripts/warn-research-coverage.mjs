import { readFile, readdir } from 'node:fs/promises';

const ignored = new Set(['schema.json', 'example.json', 'demo.synthetic.json']);
const files = (await readdir('ledger')).filter((file) => file.endsWith('.json') && !ignored.has(file));
const fields = ['checks', 'failureSignals', 'recoveries'];
let warnings = 0;

for (const file of files) {
  const ledger = JSON.parse(await readFile(`ledger/${file}`, 'utf8'));
  for (const node of ledger.nodes) for (const field of fields) {
    if (node[field].length === 0 && !node.researchedNoSourceFound?.includes(field)) {
      console.warn(`Research coverage warning: ${file} ${node.id}.${field} is empty and not marked researched-silent (not yet researched, login-bound, or otherwise unresolved).`);
      warnings += 1;
    }
  }
}

console.log(`Research coverage warnings: ${warnings}. Empty unmarked fields do not count as researched.`);
