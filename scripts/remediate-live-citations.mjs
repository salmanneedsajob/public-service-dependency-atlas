import { readFile, readdir, writeFile } from 'node:fs/promises';

const exact = new Map([
  ['https://bbmp.gov.in/ucc_file/KarnatakaAdministrativeReforms.pdf', 'https://bbmp.gov.in/'],
  ['https://www.amrut.mohua.gov.in/uploads/reform/ulb/BIRTHS-AND-DEATHS--OFFICE-OF-THE-CHIEF-REGISTRAR-OF-BIRTHS-AND-DEATHSpdf11.pdf', 'https://ejanma.karnataka.gov.in/'],
  ['https://bwssb.gov.in/', 'https://owcv2.bwssb.gov.in/consumer'],
  ['https://bwssb.gov.in/home', 'https://owcv2.bwssb.gov.in/consumer'],
  ['https://my.ebharatgas.com/bharatgas/Documents/UnifiedTransferRegularizationForm.pdf', 'https://www.bharatpetroleum.in/'],
  ['https://mylang.ebharatgas.com/bharatgas/LPGServices/Index', 'https://www.bharatpetroleum.in/'],
  ['https://mylang.ebharatgas.com/bharatgas/LPGServices/Declaration', 'https://www.bharatpetroleum.in/'],
  ['https://www.ebharatgas.com/ebharat/pdfs/LPGGASManual-042021.pdf', 'https://www.bharatpetroleum.in/'],
  ['https://bdabangalore.org/', 'https://bbmp.gov.in/'],
]);

const replacement = (url) => {
  if (exact.has(url)) return exact.get(url);
  if (url.startsWith('https://site.bbmp.gov.in/building')) return 'https://bpas.bbmpgov.in/';
  if (url.startsWith('https://site.bbmp.gov.in/')) return 'https://bbmp.gov.in/';
  if (url.startsWith('https://upload.indiacode.nic.in/')) return 'https://www.indiacode.nic.in/';
  if (url.startsWith('https://www.indiacode.nic.in/bitstream/') || url.startsWith('https://www.indiacode.nic.in/handle/')) return 'https://www.indiacode.nic.in/';
  if (url === 'https://www.bbmp.gov.in/') return 'https://bbmp.gov.in/';
  if (url.startsWith('https://owc.bwssb.gov.in/')) return 'https://owcv2.bwssb.gov.in/consumer';
  return null;
};

const files = (await readdir('ledger')).filter((name) => name.endsWith('.json') && !['schema.json', 'example.json', 'demo.synthetic.json'].includes(name));
for (const filename of files) {
  const path = `ledger/${filename}`;
  const ledger = JSON.parse(await readFile(path, 'utf8'));
  const affectedSourceIds = new Set();
  for (const source of ledger.sources) {
    const next = replacement(source.url);
    if (!next) continue;
    source.url = next;
    source.type = 'official_guidance';
    source.notes = `${source.notes ?? ''} Legacy official endpoint was unavailable in the 2026-08-28 citation check; this live official entry point identifies the responsible service but does not reproduce every captured detail.`.trim();
    affectedSourceIds.add(source.id);
  }
  for (const agency of ledger.agencies) {
    const next = replacement(agency.officialUrl);
    if (next) agency.officialUrl = next;
  }
  const replaceNestedUrls = (value) => {
    if (Array.isArray(value)) return value.forEach(replaceNestedUrls);
    if (!value || typeof value !== 'object') return;
    for (const [key, child] of Object.entries(value)) {
      if (key === 'url' && typeof child === 'string') {
        const next = replacement(child);
        if (next) value[key] = next;
      } else replaceNestedUrls(child);
    }
  };
  replaceNestedUrls(ledger);
  for (const claim of ledger.claims) {
    if (!claim.sourceIds.some((id) => affectedSourceIds.has(id))) continue;
    if (claim.evidenceGrade === 'A' || claim.evidenceGrade === 'B') claim.evidenceGrade = 'C';
    if (claim.status === 'verified') claim.status = 'partial';
    claim.notes = `${claim.notes ?? ''} The original official endpoint is currently unavailable; this claim is retained as incomplete historical/public evidence, not a current complete procedure.`.trim();
  }
  await writeFile(path, `${JSON.stringify(ledger, null, 2)}\n`);
}
console.log(`Remediated live citations in ${files.length} published ledgers.`);
