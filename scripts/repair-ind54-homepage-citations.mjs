import { readFile, readdir, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

const replacements = {
  'birth-certificate.json': {
    source_ind32_birth_rbd_act: 'https://censusindia.gov.in/nada/index.php/catalog/40408/download/44042/Act_03.pdf',
    source_ind32_birth_workflow_act: 'https://censusindia.gov.in/nada/index.php/catalog/40408/download/44042/Act_03.pdf',
  },
  'death-certificate.json': {
    source_ind32_death_rbd_act: 'https://censusindia.gov.in/nada/index.php/catalog/40408/download/44042/Act_03.pdf',
  },
  'khata.json': {
    source_ind32_bbmp_rules_2024: 'https://updates.bbmpgov.in/v1/api/file/604205683683-53of2020BBMP%28PropertyTaxassessmentRecoveryandManagement%29Rules%2C2024_watermark.pdf',
    source_ind32_bbmp_form24: 'https://updates.bbmpgov.in/v1/api/file/604205683683-53of2020BBMP%28PropertyTaxassessmentRecoveryandManagement%29Rules%2C2024_watermark.pdf',
  },
  'property-tax.json': {
    source_ind32_property_rules_2024: 'https://updates.bbmpgov.in/v1/api/file/604205683683-53of2020BBMP%28PropertyTaxassessmentRecoveryandManagement%29Rules%2C2024_watermark.pdf',
    source_ind32_property_rules_sop: 'https://updates.bbmpgov.in/v1/api/file/604205683683-53of2020BBMP%28PropertyTaxassessmentRecoveryandManagement%29Rules%2C2024_watermark.pdf',
  },
};
const retainGeneralHomepage = new Set([
  'source_ind32_birth_bbmp_citizen_services', 'source_ind32_birth_gba_home',
  'source_ind32_birth_workflow_bbmp_index', 'source_ind32_birth_workflow_gba_home',
  'source_ind32_death_gba_home', 'source_ind32_death_bbmp_services',
  'source_ind32_death_workflow_gba', 'source_ind32_death_workflow_bbmp',
]);
const restoreSourceIds = {
  'birth-certificate.json': new Set(['source_ind32_birth_workflow_bbmp_it']),
  'building-plan.json': new Set(['source_building_kmc_299', 'source_building_gba_home', 'source_building_w_gba']),
  'property-tax.json': new Set(['source_ind32_property_act_index']),
};
const unresolvedHomepage = new Set([
  'source_ind32_birth_model_rules', 'source_ind32_birth_bbmp_citizen_services', 'source_ind32_birth_gba_home', 'source_ind32_birth_bbmp_reforms', 'source_ind32_birth_bbmp_it', 'source_ind32_birth_workflow_bbmp_index', 'source_ind32_birth_workflow_gba_home', 'source_ind32_birth_workflow_bbmp_reforms',
  'source_ind32_death_gba_home', 'source_ind32_death_bbmp_services', 'source_ind32_death_bbmp_manual', 'source_ind32_death_sakala_audit', 'source_ind32_death_workflow_gba', 'source_ind32_death_workflow_bbmp', 'source_ind32_death_workflow_manual', 'source_ind32_death_workflow_sakala',
  'source_ind32_bbmp_act_2020', 'source_ind32_bbmp_khatha_documents', 'source_ind32_bbmp_revenue_faq', 'source_ind32_gba_directory',
  'source_marriage_kar_act', 'source_ind32_property_bbmp_act', 'source_ind32_property_documents', 'source_ind32_property_faq', 'source_ind32_property_fee',
  'source_gba_directory', 'source_trade_kmc_act', 'source_trade_gba_home', 'source_trade_faq', 'source_trade_new_manual', 'source_trade_otls',
  'source_trade_w_gba', 'source_trade_w_manual', 'source_trade_w_otls', 'source_trade_w_faq', 'source_ind32_water_account_act',
  'source_ind32_eaasthi_citizen_home', 'source_ind32_property_workflow_citizen_home', 'source_ind32_water_account_consumer', 'source_ind40_water_public_entry',
  'source_ind32_birth_workflow_bbmp_it', 'source_building_kmc_299', 'source_building_gba_home', 'source_building_w_gba', 'source_ind32_property_act_index',
]);

for (const filename of await readdir('ledger')) {
  if (!filename.endsWith('.json') || ['schema.json', 'example.json', 'demo.synthetic.json'].includes(filename)) continue;
  const path = `ledger/${filename}`;
  const ledger = JSON.parse(await readFile(path, 'utf8'));
  const original = JSON.parse(execFileSync('git', ['show', `HEAD:${path}`], { encoding: 'utf8' }));
  const originalSources = new Map((original.sources ?? []).map((source) => [source.id, source]));
  for (const sourceId of restoreSourceIds[filename] ?? []) {
    if (!ledger.sources.some((source) => source.id === sourceId)) ledger.sources.push(originalSources.get(sourceId));
  }
  const changed = replacements[filename] ?? {};
  for (const source of ledger.sources) {
    const verifiedSuffix = ' IND-54: this specific public document/page was verified with HTTP 200 on 2026-08-31; the claim remains at its existing grade.';
    source.notes = source.notes.split(verifiedSuffix)[0];
    if (retainGeneralHomepage.has(source.id)) {
      source.url = 'https://bbmp.gov.in/index.html';
      source.accessedAt = '2026-08-31';
    }
    const url = changed[source.id];
    if (!url) continue;
    source.url = url;
    source.accessedAt = '2026-08-31';
    source.notes = `${source.notes}${verifiedSuffix}`;
  }
  for (const source of ledger.sources) {
    if (!unresolvedHomepage.has(source.id) || source.notes.includes('IND-54: no claim-specific public URL')) continue;
    source.notes = `${source.notes} IND-54: no claim-specific public URL could be located and verified on 2026-08-31; retained solely as a Grade C general-site reference.`;
  }
  await writeFile(path, `${JSON.stringify(ledger, null, 2)}\n`);
}
console.log('Repaired IND-54 homepage citations where a verified specific source exists.');
