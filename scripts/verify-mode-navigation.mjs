import { readFile } from 'node:fs/promises';

const toggle = await readFile('components/ModeToggle.tsx', 'utf8');
const home = await readFile('app/page.tsx', 'utf8');

for (const forbidden of ['useRouter', 'useEffect', "router.replace('/explorer')", 'RestoreExplorerPreference']) {
  if (toggle.includes(forbidden)) throw new Error(`Mode toggle must not auto-navigate: found ${forbidden}.`);
}
if (home.includes('RestoreExplorerPreference')) throw new Error('The normal home page must not restore an explorer redirect.');
if (!toggle.includes("href={href}")) throw new Error('Mode toggle must retain explicit link navigation.');

console.log('Mode navigation verified: only explicit links choose between / and /explorer.');
