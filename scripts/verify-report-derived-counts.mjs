import { readFile } from 'node:fs/promises';
import { createReportTokens, parseChapterCopy, resolveReportTemplate } from '../lib/report-tokens.js';

const [page, reportSource, chapterCopy] = await Promise.all([
  readFile('app/report/page.tsx', 'utf8'),
  readFile('public/data/report.json', 'utf8'),
  readFile('report/chapter-copy.md', 'utf8'),
]);
const report = JSON.parse(reportSource);
const errors = [];
const tokens = createReportTokens(report);
const chapters = parseChapterCopy(chapterCopy);

// Factual totals in visible prose must be template tokens. Structural values in
// code, styles, dateTime attributes, and CSS counters are outside this check.
const jsxText = [...page.matchAll(/>([^<>{}]+)</gu)].map((match) => match[1]).join('\n');
const literalVisibleCount = /\b\d+\s+(?:services?|claims?|sources?|URLs?|scenarios?|steps?|roadblocks?|errors?|entries|links?|cells?|expectations?|nodes?|flags?|audits?|decisions?)\b/iu;
if (literalVisibleCount.test(jsxText)) errors.push('Report visible copy contains a literal factual count. Render it with a report prose token.');

for (const key of ['services.count', 'cost.servicesStated', 'owner.servicesStated', 'grid.mentioned', 'grid.reviewed', 'login.unknownStripped']) {
  if (!Object.hasOwn(tokens, key)) errors.push(`Report token map is missing ${key}.`);
}

for (const [section, template] of Object.entries(chapters)) {
  try {
    const rendered = resolveReportTemplate(template, tokens);
    if (/\{\{[a-zA-Z0-9.-]+\}\}/u.test(rendered)) errors.push(`Unresolved token remains in prose section ${section}.`);
  } catch (error) {
    errors.push(`Prose section ${section} failed to resolve: ${error.message}`);
  }
}

for (const section of ['hero-services-label', 'hero-fee-label', 'hero-owner-label', 'hero-mentioned-label', 'grid-caption', 'grid-human-review']) {
  if (!chapters[section]) errors.push(`Required prose section is missing: ${section}.`);
}

if (!report.totals.services || !report.totals.claims.total || !report.expectations.services.length) {
  errors.push('Report data unexpectedly contains an empty core total.');
}

if (errors.length) throw new Error(`Report derived-count check failed:\n${errors.join('\n')}`);
console.log(`Report prose tokens verified from report.json across ${tokens['services.count']} services.`);
