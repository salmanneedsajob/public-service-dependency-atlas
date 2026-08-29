import { readFile, readdir, writeFile } from 'node:fs/promises';

const ledgerDir = 'ledger';
const excluded = new Set(['schema.json', 'example.json', 'demo.synthetic.json']);

// Each destination was directly checked with curl on 2026-08-29. These are the
// only source-specific replacements in this pass; every other legacy landing
// reference remains explicitly labelled as indirect.
const replacements = {
  source_lpg_transfer_form: {
    url: 'https://my.ebharatgas.com/bharatgas/Documents/UnifiedTransferRegularizationForm.pdf',
    title: 'Format for Transfer of Domestic LPG Connection Ver.1-BPC/14',
    notes: 'Direct official transfer-form PDF, verified reachable on 2026-08-29. It names the transfer categories; it does not establish eligibility or a complete current procedure.'
  },
  source_lpg_w_form: {
    url: 'https://my.ebharatgas.com/bharatgas/Documents/UnifiedTransferRegularizationForm.pdf',
    title: 'Format for Transfer of Domestic LPG Connection',
    notes: 'Direct official transfer-form PDF, verified reachable on 2026-08-29. Blank form only; no authenticated flow or case outcome was inspected.'
  },
  source_lpg_manual: {
    url: 'https://www.ebharatgas.com/ebharat/pdfs/LPGGASManual-042021.pdf',
    title: 'LPG Gas Manual — transfer FAQ',
    notes: 'Direct official manual PDF, verified reachable on 2026-08-29. Dated April 2021; current distributor practice and accepted proof list remain unknown.'
  },
  source_lpg_w_manual: {
    url: 'https://www.ebharatgas.com/ebharat/pdfs/LPGGASManual-042021.pdf',
    title: 'LPG Gas Manual — transfer FAQ',
    notes: 'Direct official manual PDF, verified reachable on 2026-08-29. Dated April 2021; it does not verify the current authenticated workflow.'
  },
  source_lpg_services: {
    url: 'https://www.ebharatgas.com/ebharat/forHome/LPGServices',
    title: 'Bharatgas LPG Services',
    notes: 'Official LPG services page, verified reachable on 2026-08-29. No account state or submission flow was inspected.'
  },
  source_lpg_w_services: {
    url: 'https://www.ebharatgas.com/ebharat/forHome/LPGServices',
    title: 'Bharatgas LPG Services',
    notes: 'Official LPG services page, verified reachable on 2026-08-29. It is a public starting point, not proof of a completed transfer flow.'
  },
  source_lpg_declaration: {
    url: 'https://www.ebharatgas.com/ebharat/forHome/LPGServices',
    title: 'General-site reference — Bharatgas LPG Services',
    notes: 'General-site reference only, verified reachable on 2026-08-29. The former declaration endpoint could not be verified, so this page does not independently support the claimed declaration wording.'
  },
  source_building_index: {
    url: 'https://bpas.bbmpgov.in/BPAMSClient4/NewDefault1.aspx',
    title: 'BPAS public entry page',
    notes: 'Direct BPAS public entry page, verified reachable on 2026-08-29. It establishes a public BPAS entry point, but does not verify every historic route label or workflow step.'
  },
  source_building_procedure: {
    url: 'https://bpas.bbmpgov.in/BPAMSClient4/CommonForms/FAQs.aspx',
    title: 'BPAS FAQs',
    notes: 'Direct BPAS FAQ page, verified reachable on 2026-08-29. It is public guidance, not a complete procedure or proof of an authenticated submission flow.'
  },
  source_building_w_procedure: {
    url: 'https://bpas.bbmpgov.in/BPAMSClient4/CommonForms/FAQs.aspx',
    title: 'BPAS FAQs',
    notes: 'Direct BPAS FAQ page, verified reachable on 2026-08-29. It does not verify the full authenticated workflow.'
  },
  source_building_submission: {
    url: 'https://bpas.bbmpgov.in/BPAMSClient4/NewDefault1.aspx',
    title: 'BPAS public entry page',
    notes: 'Direct BPAS public entry page, verified reachable on 2026-08-29. No login or submission was attempted.'
  },
  source_building_w_submission: {
    url: 'https://bpas.bbmpgov.in/BPAMSClient4/NewDefault1.aspx',
    title: 'BPAS public entry page',
    notes: 'Direct BPAS public entry page, verified reachable on 2026-08-29. No login or submission was attempted.'
  },
  source_building_bpas: {
    url: 'https://bpas.bbmpgov.in/BPAMSClient4/Downloads/PlanApprovalManual.pdf',
    title: 'BPAS Plan Approval Manual',
    notes: 'Direct BPAS manual PDF, verified reachable on 2026-08-29. It is dated guidance and not proof that every described step is current.'
  },
  source_building_w_bpas: {
    url: 'https://bpas.bbmpgov.in/BPAMSClient4/Downloads/PlanApprovalManual.pdf',
    title: 'BPAS Plan Approval Manual',
    notes: 'Direct BPAS manual PDF, verified reachable on 2026-08-29. Dated workflow description; current authenticated behaviour was not observed.'
  },
  source_ind32_birth_workflow_ejanma: {
    url: 'https://bengaluruurban.nic.in/en/service/birth-certificate/',
    title: 'General-site reference — Bengaluru Urban birth-certificate service',
    notes: 'Official district service page, verified reachable on 2026-08-29. It links to eJanMa and describes rural routing; it does not establish a BBMP municipal public workflow.'
  },
  source_ind32_death_ejanma_official: {
    url: 'https://bengaluruurban.nic.in/en/service/birth-certificate/',
    title: 'General-site reference — Bengaluru Urban birth-certificate service',
    notes: 'Official district service page, verified reachable on 2026-08-29. It links to eJanMa but does not document the municipal death-certificate workflow or public portal controls.'
  },
  source_ind32_death_workflow_ejanma: {
    url: 'https://bengaluruurban.nic.in/en/service/birth-certificate/',
    title: 'General-site reference — Bengaluru Urban birth-certificate service',
    notes: 'Official district service page, verified reachable on 2026-08-29. It links to eJanMa but does not document a municipal death-certificate workflow or public portal controls.'
  }
};

const fallbackByHost = {
  'bbmp.gov.in': 'https://bbmp.gov.in/index.html',
  'www.indiacode.nic.in': 'https://www.indiacode.nic.in/indiacode/',
  'ejanma.karnataka.gov.in': 'https://bengaluruurban.nic.in/en/service/birth-certificate/',
  'bpas.bbmpgov.in': 'https://bpas.bbmpgov.in/BPAMSClient4/NewDefault1.aspx',
  'www.bharatpetroleum.in': 'https://www.ebharatgas.com/ebharat/forHome/LPGServices',
  'bescom.co.in': 'https://bescom.co.in/bescom/main/home'
};

const isBareOrigin = (url) => {
  const parsed = new URL(url);
  return parsed.pathname === '/' && !parsed.search && !parsed.hash;
};

const wasGeneric = (url) => {
  const parsed = new URL(url);
  return isBareOrigin(url) || /\/(home|landing-page|main|index(?:\.html)?)\/?$/i.test(parsed.pathname);
};

const indirectNote = 'This is a general-site reference, not claim-specific evidence. A more specific public document or endpoint was not verified on 2026-08-29; wording that depends only on this source is retained at Grade C or Unknown.';

const files = (await readdir(ledgerDir)).filter((file) => file.endsWith('.json') && !excluded.has(file));
const summary = { beforeUrls: new Set(), afterUrls: new Set(), repointed: 0, indirect: 0, downgraded: [] };

for (const file of files) {
  const path = `${ledgerDir}/${file}`;
  const ledger = JSON.parse(await readFile(path, 'utf8'));
  const indirectSourceIds = new Set();

  for (const source of ledger.sources ?? []) {
    summary.beforeUrls.add(source.url);
    const originallyGeneric = wasGeneric(source.url);
    const replacement = replacements[source.id];
    if (replacement) {
      if (source.url !== replacement.url) summary.repointed += 1;
      Object.assign(source, replacement);
    } else if (isBareOrigin(source.url)) {
      const replacementUrl = fallbackByHost[new URL(source.url).host];
      if (!replacementUrl) throw new Error(`No verified fallback for bare source ${source.id}: ${source.url}`);
      source.url = replacementUrl;
      summary.repointed += 1;
    }

    // Preserve the original paper trail: an existing generic source that has
    // not been replaced with a claim-specific page is visibly indirect.
    if (originallyGeneric && !replacements[source.id]) {
      indirectSourceIds.add(source.id);
      if (!source.title.startsWith('General-site reference — ')) {
        source.title = `General-site reference — ${source.title}`;
      }
      if (!source.notes.includes(indirectNote)) {
        source.notes = `${source.notes} ${indirectNote}`.trim();
      }
      summary.indirect += 1;
    }
    summary.afterUrls.add(source.url);
  }

  for (const claim of ledger.claims ?? []) {
    const cited = claim.sourceIds ?? [];
    if (cited.length && cited.every((id) => indirectSourceIds.has(id)) && ['A', 'B'].includes(claim.evidenceGrade)) {
      const previous = claim.evidenceGrade;
      claim.evidenceGrade = 'C';
      claim.notes = `${claim.notes} Downgraded from Grade ${previous} on 2026-08-29: the available citation is a general-site reference rather than claim-specific evidence.`.trim();
      summary.downgraded.push(`${file}:${claim.id} (${previous}→C)`);
    }
  }

  await writeFile(path, `${JSON.stringify(ledger, null, 2)}\n`);
}

console.log(JSON.stringify({
  distinctUrlsBefore: summary.beforeUrls.size,
  distinctUrlsAfter: summary.afterUrls.size,
  sourceRecordsRepointed: summary.repointed,
  generalSiteReferences: summary.indirect,
  claimsDowngraded: summary.downgraded
}, null, 2));
