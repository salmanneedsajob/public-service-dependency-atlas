/**
 * Build-time token support for the report's prose template. Keep values as
 * strings because the template is prose; page code can use tokenNumber where
 * a chart needs a numeric value.
 */
/** @returns {Record<string, string>} */
export function createReportTokens(report) {
  /** @type {Record<string, string>} */
  const tokens = {};
  const put = (key, value) => { tokens[key] = String(value ?? 0); };
  const expectationServices = report.expectations.services;
  const expectationColumns = report.expectations.columns;
  const cells = expectationServices.flatMap((service) => expectationColumns.map((column) => service.cells[column]));
  const stateCount = (state) => cells.filter((cell) => cell.state === state).length;

  put('services.count', report.totals.services);
  put('claims.total', report.totals.claims.total);
  put('grid.total', cells.length);
  put('grid.stated', stateCount('stated'));
  put('grid.mentioned', stateCount('mentioned'));
  put('grid.absent', stateCount('absent'));
  put('grid.reviewed', cells.filter((cell) => cell.reviewed).length);
  put('grid.unreviewed', cells.filter((cell) => cell.unreviewed).length);
  put('grid.stale', cells.filter((cell) => cell.stale).length);
  put('cost.servicesStated', expectationServices.filter((service) => service.cells.cost.state === 'stated').length);
  put('owner.servicesStated', expectationServices.filter((service) => service.cells.owner.state === 'stated').length);

  for (const [grade, count] of Object.entries(report.totals.claims.byGrade)) put(`claims.grade.${grade}`, count);
  for (const [status, count] of Object.entries(report.totals.claims.byStatus)) put(`claims.status.${status}`, count);
  for (const service of report.totals.byService) {
    put(`claims.service.${service.serviceId}.total`, service.claimTotal);
    for (const [grade, count] of Object.entries(service.claimsByGrade)) put(`claims.service.${service.serviceId}.grade.${grade}`, count);
  }

  for (const column of expectationColumns) {
    for (const [state, count] of Object.entries(report.expectations.countsByColumn[column])) put(`${column}.${state}`, count);
  }
  for (const service of expectationServices) {
    for (const column of expectationColumns) {
      const cell = service.cells[column];
      put(`grid.${service.serviceId}.${column}.statedClaims`, cell.supportingClaimIds.stated.length);
      put(`grid.${service.serviceId}.${column}.mentionedClaims`, cell.supportingClaimIds.mentioned.length);
    }
  }

  const login = report.loginClassification.comparison;
  put('login.claimsFull', login.claims.fullCount);
  put('login.claimsStripped', login.claims.loginStrippedCount);
  put('login.unknownFull', login.unknownClaims.fullCount);
  put('login.unknownRelated', login.unknownClaims.loginRelatedCount);
  put('login.unknownStripped', login.unknownClaims.loginStrippedCount);
  put('login.roadblocksFull', login.roadblocks.fullCount);
  put('login.roadblocksRelated', login.roadblocks.loginRelatedCount);
  put('login.roadblocksStripped', login.roadblocks.loginStrippedCount);
  for (const [category, count] of Object.entries(login.roadblocks.fullByCategory)) put(`roadblocks.full.${category}`, count);
  for (const [category, count] of Object.entries(login.roadblocks.loginStrippedByCategory)) put(`roadblocks.stripped.${category}`, count);

  put('scenarios.total', report.totals.scenarios.total);
  put('journeySteps.total', report.totals.journeySteps.total);
  for (const status of ['verified', 'partial', 'contested', 'unknown']) put(`scenarios.${status}`, report.totals.scenarios.byStatus[status] ?? 0);
  for (const [status, count] of Object.entries(report.totals.journeySteps.byStatus)) put(`journeySteps.${status}`, count);
  put('errors.count', report.publicErrors.length);
  put('shelf.entries', report.documentationShelf.deduplicatedEntryCount);
  for (const group of report.documentationShelf.groups) put(`shelf.${group.serviceId}.entries`, group.entries.length);
  put('audits.count', report.auditorExcerpts.length);
  put('nodes.anyEmpty', report.totals.nodesWithEmptyDetails.anyEmpty);
  put('nodes.allThreeEmpty', report.totals.nodesWithEmptyDetails.allThreeEmpty);
  put('sources.total', report.totals.sources.total);
  put('sources.distinctUrls', report.totals.sources.distinctUrls);
  for (const [type, count] of Object.entries(report.totals.sources.byType)) put(`sources.type.${type}`, count);
  for (const [category, count] of Object.entries(report.totals.roadblocks.byCategory)) put(`roadblocks.category.${category}`, count);

  return tokens;
}

/** @returns {Record<string, string>} */
export function parseChapterCopy(source) {
  const content = source.replace(/^<!--[\s\S]*?-->\s*/u, '');
  /** @type {Record<string, string>} */
  const sections = {};
  for (const match of content.matchAll(/^## ([a-z0-9-]+)\n([\s\S]*?)(?=^## |(?![\s\S]))/gmu)) sections[match[1]] = match[2].trim();
  return sections;
}

export function resolveReportTemplate(template, tokens) {
  return template.replace(/\{\{([a-zA-Z0-9.-]+)\}\}/gu, (whole, key) => {
    if (!Object.hasOwn(tokens, key)) throw new Error(`Unknown report prose token: ${key}`);
    return tokens[key];
  });
}

export function tokenNumber(tokens, key) {
  const value = Number(tokens[key]);
  if (!Number.isFinite(value)) throw new Error(`Report prose token is not numeric: ${key}`);
  return value;
}
