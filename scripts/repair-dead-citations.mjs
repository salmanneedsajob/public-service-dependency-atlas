import { readFile, writeFile } from 'node:fs/promises';

const replacements = new Map([
  ['https://www.indiacode.nic.in/bitstream/123456789/20574/1/special_marriage_act.pdf', 'https://www.indiacode.nic.in/bitstream/123456789/15480/1/special_marriage_act.pdf'],
  ['https://mylang.ebharatgas.com/Documents/UnifiedTransferRegularizationForm.pdf', 'https://my.ebharatgas.com/bharatgas/Documents/UnifiedTransferRegularizationForm.pdf'],
  ['https://mylang.ebharatgas.com/LPGServices/DownloadSection', 'https://my.ebharatgas.com/bharatgas/LPGServices/DownloadSection'],
  ['https://mylang.ebharatgas.com/LPGServices/LocateDistributor', 'https://my.ebharatgas.com/bharatgas/LPGServices/LocateDistributor'],
  ['https://mylang.ebharatgas.com/LPGServices/OptForPortability', 'https://my.ebharatgas.com/bharatgas/LPGServices/OptForPortability'],
  ['https://mylang.ebharatgas.com/bharatgas/LPGServices/Declaration', 'https://my.ebharatgas.com/bharatgas/LPGServices/Declaration'],
  ['https://mylang.ebharatgas.com/bharatgas/User/Login?ReturnUrl=%2Fbharatgas%2FCustomerConsole%2FOptForPortability', 'https://my.ebharatgas.com/bharatgas/User/Login?ReturnUrl=%2Fbharatgas%2FCustomerConsole%2FOptForPortability'],
]);

const noteUpdates = new Map([
  ['source_marriage_ind48_sma', ' IND-55: corrected to the 15480 Act record; HTTP 200 was verified over IPv4 on 2026-08-31.'],
  ['source_ind49_bpcl_portability', ' IND-55: repointed from the unreachable mylang host to the equivalent public my.ebharatgas.com page; HTTP 200 verified on 2026-08-31.'],
  ['source_ind49_bpcl_declaration', ' IND-55: repointed from the unreachable mylang host to the equivalent public my.ebharatgas.com page; HTTP 200 verified on 2026-08-31.'],
  ['source_ind49_bpcl_form', ' IND-55: repointed from the unreachable mylang host to the equivalent public my.ebharatgas.com form; HTTP 200 verified on 2026-08-31.'],
  ['source_ind49_lpg_bharatgas_login', ' IND-55: repointed from the unreachable mylang host to the equivalent public my.ebharatgas.com login boundary; HTTP 200 verified on 2026-08-31.'],
  ['source_ind49_lpg_bharatgas_locator', ' IND-55: repointed from the unreachable mylang host to the equivalent public my.ebharatgas.com locator; HTTP 200 verified on 2026-08-31.'],
  ['source_ind49_lpg_bharatgas_downloads', ' IND-55: repointed from the unreachable mylang host to the equivalent public my.ebharatgas.com downloads page; HTTP 200 verified on 2026-08-31.'],
]);

for (const filename of ['ledger/lpg.json', 'ledger/marriage.json']) {
  let text = await readFile(filename, 'utf8');
  for (const [from, to] of replacements) text = text.replaceAll(from, to);
  for (const [sourceId, suffix] of noteUpdates) {
    const sourcePattern = new RegExp('("id": "' + sourceId + '"[\\s\\S]*?"notes": ")(.*?)(")');
    text = text.replace(sourcePattern, (_, start, notes, end) => notes.includes('IND-55:') ? start + notes + end : start + notes + suffix + end);
  }
  await writeFile(filename, text);
}

console.log('Repaired seven dead source URLs and their embedded citation references.');
