'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import type { Detail, EvidenceGrade, Ledger, RecordStatus } from '@/lib/ledger-types';
import { buildSourceGroups, sourceGroupSummary, type DisplaySource, type SourceGroupKind } from '@/lib/source-groups';
import { collectUndocumentedQuestions, publicNodeLabel } from '@/lib/undocumented';
import { serviceGuides } from '@/lib/service-copy';
import { SlopfolioBadge } from '@/components/SlopfolioBadge';
import { deriveServiceMappingSummary } from '@/lib/service-status';

const statusCopy: Record<RecordStatus, string> = {
  verified: 'Supported by evidence at the stated grade',
  partial: 'Some of this record is supported; important gaps remain',
  contested: 'Sources or observed states disagree',
  unknown: 'No usable source yet; do not infer the answer',
};

const gradeCopy: Record<EvidenceGrade, string> = {
  A: 'Binding rule',
  B: 'Current official source',
  C: 'Official but incomplete or older',
  D: 'Attributable secondary source',
  E: 'Citizen evidence',
  F: 'Uncorroborated lead',
  Unknown: 'No usable source',
};

const datasetCopy = {
  synthetic: {
    label: 'Synthetic data',
    summary: 'This preview tests the interface, not the real BESCOM process.',
    footer: 'This is deliberately synthetic material for interface testing. Its publishers, links, statements, errors, and recovery routes are invented placeholders; they are not BESCOM instructions or findings about Bengaluru.',
  },
  template: {
    label: 'Research template',
    summary: 'This research is incomplete. Unknowns show where more checked sources are still needed.',
    footer: 'This is a research template, not a completed finding. Empty and Unknown records are intentionally visible so missing evidence cannot be mistaken for a clear path.',
  },
  research: {
    label: 'Independent research',
    summary: 'This page uses dated public-source research. Check each statement’s source and status before acting.',
    footer: 'This page contains independent, dated research rather than official guidance. Use each statement’s source, access date, source grade, and status to judge the steps, and verify current requirements with the responsible agency.',
  },
} as const;

const basisCopy: Record<Ledger['claims'][number]['basis'], string> = {
  observation: 'Read directly in a source',
  inference: 'Interpretation from sources',
  mixed: 'Direct source plus interpretation',
};

const relationshipCopy: Record<string, string> = {
  alternative: 'another possible route',
  maps_to: 'must match',
  produces: 'leads to',
  requires: 'needs',
};

const nodeKindCopy: Record<string, string> = {
  decision: 'choice',
  document: 'document',
  outcome: 'result',
  record: 'official record',
  service: 'service step',
  system: 'system step',
};

function publicNote(note = '') {
  return note
    .replace(/Canonical source for [^.]+\.\s*/g, '')
    .replace(/Reconciles IND-[0-9]+(?:, IND-[0-9]+)*(?: duplicate [^.]+)?\.\s*/g, 'Cross-verified across independent research passes. ')
    .replace(/IND-[0-9]+ /g, '')
    .trim();
}

function publicCopy(text = '') {
  return text
    .replace(/evidence-backed state/gi, 'publicly supported condition')
    .replace(/validation rule/gi, 'published check')
    .replace(/end-to-end dependency/gi, 'complete connection between steps')
    .replace(/\bdependencies\b/gi, 'links between steps')
    .replace(/\bdependency\b/gi, 'link between steps')
    .replace(/\bhandoffs\b/gi, 'next steps')
    .replace(/\bhandoff\b/gi, 'next step')
    .replace(/\brelationships\b/gi, 'connections')
    .replace(/\brelationship\b/gi, 'connection')
    .replace(/\*\*/g, '')
    .replace(/`([^`]+)`/g, '$1');
}

function isInternalResearchArtifact(roadblock: Ledger['roadblocks'][number]) {
  return /audit|independent review limitations/i.test(`${roadblock.id} ${roadblock.title}`);
}

type RoadblockCategory = 'documentation' | 'process' | 'infrastructure';

function StatusBadge({ status, compact = false }: { status: RecordStatus; compact?: boolean }) {
  return (
    <span className={`status-badge status-${status} ${compact ? 'compact' : ''}`} title={statusCopy[status]}>
      <span className="status-indicator" aria-hidden="true" />
      {status}
    </span>
  );
}

function EvidenceBadge({ grade }: { grade: EvidenceGrade }) {
  return (
    <span className={`evidence-badge grade-${grade.toLowerCase()}`} title={gradeCopy[grade]}>
      <b>{grade}</b>
      <span>{gradeCopy[grade]}</span>
    </span>
  );
}

function ClaimCards({ claimIds, ledger }: { claimIds: string[]; ledger: Ledger }) {
  const uniqueIds = [...new Set(claimIds)];
  const claims = uniqueIds
    .map((id) => ledger.claims.find((claim) => claim.id === id))
    .filter((claim): claim is Ledger['claims'][number] => Boolean(claim));

  if (!claims.length) {
    return <p className="empty-note">No sourced statement is linked to this record yet.</p>;
  }

  return (
    <div className="claim-list">
      {claims.map((claim) => {
        const sources = claim.sourceIds
          .map((sourceId) => ledger.sources.find((source) => source.id === sourceId))
          .filter((source): source is Ledger['sources'][number] => Boolean(source))
          .filter((source, index, allSources) => allSources.findIndex((candidate) => candidate.url === source.url) === index);
        const contradictions = claim.contradictsClaimIds
          .map((claimId) => ledger.claims.find((item) => item.id === claimId))
          .filter((item): item is Ledger['claims'][number] => Boolean(item));

        return (
          <article className={`claim-card claim-${claim.status}`} key={claim.id} id={claim.id}>
            <div className="claim-topline">
              <EvidenceBadge grade={claim.evidenceGrade} />
              <StatusBadge status={claim.status} compact />
            </div>
            <p className="claim-text">{publicCopy(claim.text)}</p>
            <div className="claim-meta">
              <span>{basisCopy[claim.basis]}</span>
              <span>{claim.jurisdiction}</span>
            </div>
            {claim.notes && <p className="claim-note">{publicCopy(publicNote(claim.notes))}</p>}
            {contradictions.length > 0 && (
              <div className="contradiction-note">
                <b>Contested evidence</b>
                <span>Conflicts with {contradictions.map((item) => publicCopy(item.text)).join(' · ')}</span>
              </div>
            )}
            <div className="source-list">
              {sources.length ? (
                sources.map((source) => (
                  <a href={source.url} key={source.id} rel="noreferrer" target="_blank">
                    <span>{source.title}</span>
                    <small>{source.publisher} · accessed {source.accessedAt} ↗</small>
                  </a>
                ))
              ) : (
                <span className="unknown-source">No source is linked to this statement. It is explicitly marked Unknown.</span>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}

function SourceShelfGroup({ title, kind, sources }: { title: string; kind: SourceGroupKind; sources: DisplaySource[] }) {
  return (
    <section className={`official-source-group official-source-group-${kind}`} aria-label={title}>
      <div className="official-source-group-heading"><span aria-hidden="true">{kind === 'specific' ? '▤' : kind === 'general' ? '⌂' : '◌'}</span><h3>{title}</h3><b>{sources.length}</b></div>
      {sources.length ? <div className="official-source-grid">{sources.map((source) => (
        <article key={source.id}>
          <a href={source.url} rel="noreferrer" target="_blank">{source.title} ↗</a>
          <small>{source.publisher} · accessed {source.accessedAt} · Grade {source.evidenceGrade}</small>
          {kind === 'general' && <p><b>General reference:</b> This is a starting point, not a source specific to one step.</p>}
          {kind === 'citizen' && <p><b>Reported experience:</b> This is a public first-person account, not an official document.</p>}
          {kind === 'specific' && <p><b>What it covers:</b> A specific public document or page used to support this entry.</p>}
          {source.citedFor.length > 0 && <p><b>Cited for:</b> {publicCopy(source.citedFor.slice(0, 2).join(' · '))}{source.citedFor.length > 2 ? ` · +${source.citedFor.length - 2} more statements` : ''}</p>}
          <p><b>Where it stops:</b> {publicCopy(publicNote(source.notes)) || 'The public source does not show how this step connects to the other systems in the journey.'}</p>
        </article>
      ))}</div> : <p className="empty-note">None recorded for this service.</p>}
    </section>
  );
}

function DetailGroup({
  eyebrow,
  title,
  details,
  researchedNoSourceFound,
  ledger,
}: {
  eyebrow: string;
  title: string;
  details: Detail[];
  researchedNoSourceFound: boolean;
  ledger: Ledger;
}) {
  return (
    <section className="detail-group">
      <div className="detail-group-heading">
        <span>{eyebrow}</span>
        <h4>{title}</h4>
      </div>
      <div className="detail-items">
        {details.length ? (
          details.map((detail) => (
            <article className="detail-item" key={detail.id}>
              <div className="detail-title-row">
                <h5>{publicCopy(detail.label)}</h5>
                <StatusBadge status={detail.status} compact />
              </div>
              <p>{publicCopy(detail.description)}</p>
              {detail.actualError && (
                <p className="error-example"><span>Failure signal</span> “{publicCopy(detail.actualError)}”</p>
              )}
              {detail.url && (
                <a className="text-link" href={detail.url} rel="noreferrer" target="_blank">
                  Open linked check ↗
                </a>
              )}
              <ClaimCards claimIds={detail.claimIds} ledger={ledger} />
            </article>
          ))
        ) : (
          <p className={`empty-note ${researchedNoSourceFound ? 'researched-silent' : 'not-yet-researched'}`}>
            {researchedNoSourceFound
              ? 'No public source explains this — we looked.'
              : 'Not yet researched.'}
          </p>
        )}
      </div>
    </section>
  );
}

export default function LedgerEntry({ service, ledger }: { service: string; ledger: Ledger }) {
  const [selectedScenarioId, setSelectedScenarioId] = useState(ledger.scenarios[0]?.id ?? '');
  const [selectedNodeId, setSelectedNodeId] = useState(ledger.scenarios[0]?.pathNodeIds[0] ?? '');
  const [roadblockCategory, setRoadblockCategory] = useState<'all' | RoadblockCategory>('all');
  const [showAllRoadblocks, setShowAllRoadblocks] = useState(false);
  const nodeDetailRef = useRef<HTMLElement>(null);
  const shouldRevealSelectedNode = useRef(false);

  useEffect(() => {
    if (!shouldRevealSelectedNode.current) return;
    shouldRevealSelectedNode.current = false;

    const frame = window.requestAnimationFrame(() => {
      const detail = nodeDetailRef.current;
      if (!detail) return;

      const { top, bottom } = detail.getBoundingClientRect();
      if (top >= 0 && bottom <= window.innerHeight) return;

      detail.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'start',
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [selectedNodeId]);

  const selectedScenario = useMemo(
    () => ledger.scenarios.find((scenario) => scenario.id === selectedScenarioId),
    [ledger, selectedScenarioId],
  );

  if (!selectedScenario) return <main className="state-page"><h1>This entry has no published route yet.</h1></main>;

  const activeNodeIds = new Set(selectedScenario.pathNodeIds);
  const activeEdges = ledger.edges.filter(
    (edge) => edge.scenarioIds.includes(selectedScenario.id) && activeNodeIds.has(edge.fromNodeId) && activeNodeIds.has(edge.toNodeId),
  );
  const selectedPathNodes = selectedScenario.pathNodeIds
    .map((nodeId) => ledger.nodes.find((node) => node.id === nodeId))
    .filter((node): node is Ledger['nodes'][number] => Boolean(node));
  const selectedNode = ledger.nodes.find((node) => node.id === selectedNodeId) ?? selectedPathNodes[0];
  const agency = ledger.agencies.find((item) => item.id === selectedNode?.ownerAgencyId);
  const selectedJourney = ledger.journeys.find((journey) => journey.scenarioId === selectedScenario.id);
  const selectedJourneyRoadblocks = selectedJourney?.failureRoadblockIds
    .map((roadblockId) => ledger.roadblocks.find((roadblock) => roadblock.id === roadblockId))
    .filter((roadblock): roadblock is Ledger['roadblocks'][number] => roadblock !== undefined && !isInternalResearchArtifact(roadblock)) ?? [];
  const scenarioClaims = ledger.claims.filter((claim) => claim.scenarioIds.includes(selectedScenario.id));
  const scenarioRoadblocks = ledger.roadblocks.filter((roadblock) => roadblock.scenarioIds.includes(selectedScenario.id) && !isInternalResearchArtifact(roadblock));
  const roadblocks = ledger.roadblocks.filter((roadblock) => {
    if (isInternalResearchArtifact(roadblock)) return false;
    const categoryMatch = roadblockCategory === 'all' || roadblock.category === roadblockCategory;
    const scenarioMatch = showAllRoadblocks || roadblock.scenarioIds.includes(selectedScenario.id);
    return categoryMatch && scenarioMatch;
  });
  const nocConflict = ledger.roadblocks.find((roadblock) => roadblock.id === 'roadblock_noc_conflict');
  const statusCounts = ledger.claims.reduce(
    (counts, claim) => ({ ...counts, [claim.status]: counts[claim.status] + 1 }),
    { verified: 0, partial: 0, contested: 0, unknown: 0 } as Record<RecordStatus, number>,
  );
  const datasetNotice = datasetCopy[ledger.meta.dataKind];
  const mappingSummary = deriveServiceMappingSummary(ledger);
  const serviceStatus = mappingSummary.status;
  const completeness = `${mappingSummary.fullyDocumentedRecords} of ${mappingSummary.totalRecords} records fully documented`;
  const unknownCopy = mappingSummary.unknownRecords > 0 ? ` · ${mappingSummary.unknownRecords} ${mappingSummary.unknownRecords === 1 ? 'record' : 'records'} unknown` : '';
  const sourceGroups = buildSourceGroups(ledger);
  const entryNames: Record<string, string> = {
    bescom: 'BESCOM transfer', khata: 'khata transfer', 'property-tax': 'property-tax transfer',
    'water-connection': 'water / sewer connection', 'birth-certificate': 'birth certificate',
    'water-account': 'water-account transfer', 'new-electricity': 'new electricity connection',
    'death-certificate': 'death certificate', lpg: 'LPG connection transfer', marriage: 'marriage registration',
    'trade-license': 'trade licence', 'building-plan': 'building plan approval',
  };
  const entryName = entryNames[service] ?? 'public-service journey';
  const isBescom = service === 'bescom';
  const guide = serviceGuides[service];
  const gaps = collectUndocumentedQuestions(ledger);
  const topGaps = gaps.slice(0, 5);
  const remainingGaps = gaps.slice(5);
  const statusRank: Record<RecordStatus, number> = { verified: 0, partial: 1, contested: 2, unknown: 3 };
  const worstPathNode = selectedPathNodes.reduce<Ledger['nodes'][number] | undefined>(
    (worst, node) => !worst || statusRank[node.status] > statusRank[worst.status] ? node : worst,
    undefined,
  );
  const verdict = worstPathNode && worstPathNode.status !== 'verified'
    ? `The clearest documented gap on this route is ${publicNodeLabel(worstPathNode.label)}: it is marked ${worstPathNode.status}. That is where this journey can stall.`
    : 'The records on this route are supported by the evidence held. Check the sources below for limits and case-specific requirements.';
  const recordType = selectedNode?.kind ? nodeKindCopy[selectedNode.kind] ?? 'record' : 'record';
  const ownerName = agency?.shortName ?? 'an agency not named in the evidence held';

  function selectScenario(id: string) {
    const scenario = ledger.scenarios.find((item) => item.id === id);
    if (!scenario) return;
    setSelectedScenarioId(id);
    setSelectedNodeId(scenario.pathNodeIds[0] ?? '');
    setShowAllRoadblocks(false);
  }

  function selectNode(id: string) {
    shouldRevealSelectedNode.current = true;
    setSelectedNodeId(id);
  }

  return (
    <main>
      <header className="site-header">
        <Link className="wordmark" href="/"><span className="wordmark-accent">BLR</span><span>Public Service Dependency Atlas</span></Link>
        <nav aria-label="Page navigation">
          <a href="#scenarios">Find my path</a>
          <a href="#map">Trace the records</a>
          <a href="#roadblocks">What goes wrong</a>
        </nav>
        <span className="schema-pill">Sources shown</span>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">Bengaluru · Independent public-source guide</p>
          <h1>{isBescom ? 'Why is my BESCOM transfer blocked?' : `Your ${entryName} journey`}</h1>
          <p className="ledger-subtitle">Independent research snapshot · checked {ledger.meta.asOf} · <span className={`service-map-status service-${serviceStatus.toLowerCase().replaceAll(' ', '-')}`}>Map status: {serviceStatus} · {completeness}{unknownCopy}</span></p>
          <p className="lede">{isBescom ? 'Follow the records that affect an electricity name transfer, the places the route can stall, and the gaps no public source currently explains.' : `Follow the published route for ${entryName}, the places it can stall, and the questions the available public record does not answer.`}</p>
          {guide && (
            <div className="key-terms" aria-label={`Key terms for ${entryName}`}>
              <b>Key terms</b>
              <dl>
                {guide.terms.map(({ term, definition }) => <div key={term}><dt>{term}</dt><dd>{definition}</dd></div>)}
              </dl>
            </div>
          )}
          {guide && <div className="process-summary"><b>How this usually works</b><p>{guide.processSummary}</p></div>}
          <a className="primary-link" href="#scenarios">Find my path <span>↓</span></a>
        </div>
        <aside className="hero-aside" aria-label="Route verdict">
          <div className={`fixture-flag fixture-${ledger.meta.dataKind}`}>{datasetNotice.label}</div>
          <p className="verdict-label">For “{publicCopy(selectedScenario.label)}”</p>
          <p className="route-verdict">{verdict}</p>
        </aside>
      </section>

      <section className="gap-section" id="what-nobody-has-documented" aria-labelledby="gap-heading">
        <div className="gap-intro">
          <p className="step-label">The atlas’s central finding</p>
          <h2 id="gap-heading">What nobody has documented</h2>
          <p>These are unresolved steps and problems that can leave a citizen stuck because no usable public procedure was found. Routine empty fields and internal research notes are not counted.</p>
        </div>
        <div className="gap-list-area">
          <ol className="gap-list">
            {topGaps.map((gap) => <li key={gap.id}><strong>{gap.situation}</strong><span>{gap.missing}</span></li>)}
          </ol>
          {remainingGaps.length > 0 && (
            <details className="gap-more">
              <summary>Show all {gaps.length} gaps</summary>
              <ol className="gap-list" style={{ counterReset: `gap ${topGaps.length}` }}>
                {remainingGaps.map((gap) => <li key={gap.id}><strong>{gap.situation}</strong><span>{gap.missing}</span></li>)}
              </ol>
            </details>
          )}
        </div>
      </section>

      <section className="reading-key" aria-label="How to read this page">
        <div className="reading-key-intro"><b>How to read this page</b><span>A status tells you how much of a step is publicly supported. A letter tells you what kind of source supports it.</span></div>
        <div className="uncertainty-strip" aria-label="Status key">
        {(Object.keys(statusCounts) as RecordStatus[]).map((status) => (
          <div key={status}>
            <StatusBadge status={status} />
            <span>{statusCopy[status]}</span>
          </div>
        ))}
        </div>
        <div className="grade-key reading-grade-key" aria-label="Source-strength key">
          {(Object.keys(gradeCopy) as EvidenceGrade[]).map((grade) => <EvidenceBadge grade={grade} key={grade} />)}
        </div>
      </section>

      <section className="section scenario-section" id="scenarios" aria-labelledby="scenario-heading">
        <div className="section-heading split-heading">
          <div>
            <p className="step-label">01 · Start here</p>
            <h2 id="scenario-heading">Which of these is you?</h2>
          </div>
          <p>Choose the closest match. Everything below updates for the path you pick.</p>
        </div>
        <div className="scenario-grid" role="radiogroup" aria-label="Choose your situation">
          {ledger.scenarios.map((scenario, index) => (
            <button
              className={`scenario-card ${scenario.id === selectedScenario.id ? 'selected' : ''}`}
              key={scenario.id}
              onClick={() => selectScenario(scenario.id)}
              role="radio"
              aria-checked={scenario.id === selectedScenario.id}
            >
              <span className="scenario-number">{String(index + 1).padStart(2, '0')}</span>
              <strong>{publicCopy(scenario.label)}</strong>
              <span className="scenario-summary">{publicCopy(scenario.summary)}</span>
              <span className="tag-row">{scenario.tags.map((tag) => <small key={tag}>{tag}</small>)}</span>
              <StatusBadge status={scenario.status} compact />
            </button>
          ))}
        </div>
      </section>

      <section className="section map-section" id="map" aria-labelledby="map-heading">
        <div className="section-heading split-heading light-heading">
          <div>
            <p className="step-label">02 · Trace the records</p>
            <h2 id="map-heading">The records that need to line up for your {entryName}</h2>
          </div>
          <p>Choose a record to see what it must show, how you can check it, what can go wrong, and which public sources support the explanation.</p>
        </div>

        {worstPathNode && worstPathNode.status !== 'verified' && (
          <aside className={`blocker-callout status-border-${worstPathNode.status}`}>
            <div><p className="eyebrow">The first place to investigate</p><h3>{publicNodeLabel(worstPathNode.label)}</h3></div>
            <p>{publicCopy(worstPathNode.summary)} This record is marked <StatusBadge status={worstPathNode.status} compact />.</p>
          </aside>
        )}

        <div className="chain" role="list" aria-label={`Record path for ${selectedScenario.label}`}>
          {selectedPathNodes.map((node, index) => {
            const nextNode = selectedPathNodes[index + 1];
            const edge = nextNode
              ? activeEdges.find((item) => item.fromNodeId === node.id && item.toNodeId === nextNode.id)
              : undefined;
            return (
              <div className="chain-item" key={node.id} role="listitem">
                <button
                  id={node.id}
                  className={`node status-border-${node.status} ${selectedNode?.id === node.id ? 'focused' : ''}`}
                  onClick={() => selectNode(node.id)}
                  aria-pressed={selectedNode?.id === node.id}
                >
                  <span className="node-topline">
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <StatusBadge status={node.status} compact />
                  </span>
                  <strong>{publicNodeLabel(node.label)}</strong>
                  <small>{nodeKindCopy[node.kind] ?? 'record'}</small>
                </button>
                {nextNode && (
                  <div className="edge" aria-label={edge?.label ?? 'The next record'}>
                    <span aria-hidden="true">→</span>
                    <small>{edge ? relationshipCopy[edge.relationship] ?? 'then' : 'then'}</small>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {selectedNode && (
          <article className="node-detail" aria-live="polite" ref={nodeDetailRef}>
            <header className="node-detail-header">
              <div>
                <p className="eyebrow">You’re looking at: {publicNodeLabel(selectedNode.label)} — a {recordType} held by {ownerName}</p>
                <h3>{publicNodeLabel(selectedNode.label)}</h3>
                <p>{publicCopy(selectedNode.summary)}</p>
              </div>
              <div className="owner-card">
                <span>Record owner</span>
                {agency ? (
                  <a href={agency.officialUrl} rel="noreferrer" target="_blank">
                    <b>{agency.shortName}</b>
                    <small>{agency.name} ↗</small>
                  </a>
                ) : (
                  <b>Owner not recorded</b>
                )}
                <StatusBadge status={selectedNode.status} />
              </div>
            </header>

            <div className="required-state">
              <span>What this must say before your next step can work</span>
              <p>{publicCopy(selectedNode.requiredState)}</p>
            </div>

            <div className="detail-columns">
              <DetailGroup eyebrow="Check" title="How can I check it?" details={selectedNode.checks} researchedNoSourceFound={selectedNode.researchedNoSourceFound?.includes('checks') ?? false} ledger={ledger} />
              <DetailGroup eyebrow="Failure" title="What does failure look like?" details={selectedNode.failureSignals} researchedNoSourceFound={selectedNode.researchedNoSourceFound?.includes('failureSignals') ?? false} ledger={ledger} />
              <DetailGroup eyebrow="Recovery" title="What can I do next?" details={selectedNode.recoveries} researchedNoSourceFound={selectedNode.researchedNoSourceFound?.includes('recoveries') ?? false} ledger={ledger} />
            </div>

            <section className="node-claims">
              <div className="subsection-heading">
                <p className="eyebrow">Where this comes from</p>
                <h4>Every statement above, with its source and how strong that source is</h4>
              </div>
              <details className="source-details">
                <summary>Show the sources for this record</summary>
                <ClaimCards claimIds={selectedNode.claimIds} ledger={ledger} />
              </details>
            </section>
          </article>
        )}

        <section className="relationship-chain" aria-labelledby="relationship-heading">
          <div className="relationship-heading">
            <div>
              <p className="eyebrow">How one step leads to the next</p>
              <h3 id="relationship-heading">What has to happen before the next step</h3>
            </div>
            <p>These links show how the available sources connect the records for this situation. A dashed card means the link comes from citizen reports or has no published official procedure.</p>
          </div>
          <div className="relationship-list">
            {activeEdges.map((edge) => {
              const fromNode = ledger.nodes.find((node) => node.id === edge.fromNodeId);
              const toNode = ledger.nodes.find((node) => node.id === edge.toNodeId);
              const grades = [...new Set(edge.claimIds
                .map((claimId) => ledger.claims.find((claim) => claim.id === claimId)?.evidenceGrade)
                .filter((grade): grade is EvidenceGrade => Boolean(grade)))];
              const onlyCitizenEvidence = grades.length > 0 && grades.every((grade) => grade === 'E' || grade === 'F');
              const undocumentedEdge = edge.status === 'unknown' || onlyCitizenEvidence;
              const involvesSelectedNode = selectedNode && (edge.fromNodeId === selectedNode.id || edge.toNodeId === selectedNode.id);

              return (
                <article className={`relationship status-border-${edge.status} ${undocumentedEdge ? 'relationship-undocumented' : ''} ${involvesSelectedNode ? 'relationship-active' : 'relationship-muted'}`} key={edge.id}>
                  <div className="relationship-topline">
                    <span>{relationshipCopy[edge.relationship] ?? 'next step'}</span>
                    <StatusBadge status={edge.status} compact />
                  </div>
                  <div className="relationship-nodes">
                    <b>{fromNode ? publicNodeLabel(fromNode.label) : edge.fromNodeId}</b>
                    <span aria-hidden="true">→</span>
                    <b>{toNode ? publicNodeLabel(toNode.label) : edge.toNodeId}</b>
                  </div>
                  <p>{publicCopy(edge.label)}</p>
                  {undocumentedEdge && <small className="edge-evidence-note">{onlyCitizenEvidence ? 'Reported by citizens; no official procedure found.' : 'No official procedure found in the public sources checked.'}</small>}
                  <div className="relationship-grades" aria-label="Source strength for this link">
                    {grades.length
                      ? grades.map((grade) => <EvidenceBadge grade={grade} key={grade} />)
                      : <span>No source record linked yet</span>}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </section>

      {selectedJourney && (
        <section className="section journey-section" id="journey" aria-labelledby="journey-heading">
          <div className="section-heading split-heading">
            <div>
              <p className="step-label">03 · The steps, as far as the evidence goes</p>
              <h2 id="journey-heading">{publicCopy(selectedJourney.title)}</h2>
            </div>
            <div>
              <StatusBadge status={selectedJourney.status} />
              <p>{publicCopy(selectedJourney.context)}</p>
            </div>
          </div>
          <ol className="journey-steps">
            {selectedJourney.steps.map((step, index) => {
              const node = ledger.nodes.find((item) => item.id === step.nodeId);
              return (
                <li key={step.id}>
                  <span className="journey-number">{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <span className="journey-node">{node ? publicNodeLabel(node.label) : 'Unknown record'}</span>
                    <h3>{publicCopy(step.label)}</h3>
                    <p>{publicCopy(step.action)}</p>
                    <div className="expected-result"><span>Expected result</span>{publicCopy(step.expectedResult)}</div>
                    <StatusBadge status={step.status} compact />
                  </div>
                </li>
              );
            })}
          </ol>
          <div className="journey-support">
            <article>
              <span>Where one step passes into another</span>
              <div className="journey-dependency-list">
                {selectedJourney.dependencies.map((dependency) => {
                  const fromNode = ledger.nodes.find((node) => node.id === dependency.fromNodeId);
                  const toNode = ledger.nodes.find((node) => node.id === dependency.toNodeId);
                  return (
                    <div key={dependency.id}>
                      <div>
                        <b>{fromNode ? publicNodeLabel(fromNode.label) : dependency.fromNodeId} → {toNode ? publicNodeLabel(toNode.label) : dependency.toNodeId}</b>
                        <StatusBadge status={dependency.status} compact />
                      </div>
                      <p>{publicCopy(dependency.description)}</p>
                    </div>
                  );
                })}
              </div>
            </article>
            <article>
              <span>Problems linked to this route</span>
              <div className="journey-roadblock-list">
                {selectedJourneyRoadblocks.map((roadblock) => (
                  <a href={`#${roadblock.id}`} key={roadblock.id}>
                    <span className={`category category-${roadblock.category}`}>{roadblock.category}</span>
                    <b>{publicCopy(roadblock.title)}</b>
                    <small>{publicCopy(roadblock.symptom)}</small>
                  </a>
                ))}
              </div>
            </article>
          </div>
          <div className="journey-notes">
            <article>
              <span>Recovery notes</span>
              <ul>{selectedJourney.recoveryNotes.map((note) => <li key={note}>{publicCopy(note)}</li>)}</ul>
            </article>
            <article>
              <span>What the public instructions leave unclear</span>
              <ul>{selectedJourney.documentationQualityNotes.map((note) => <li key={note}>{publicCopy(note)}</li>)}</ul>
            </article>
          </div>
        </section>
      )}

      <section className="section roadblock-section" id="roadblocks" aria-labelledby="roadblock-heading">
        <div className="section-heading split-heading">
          <div>
            <p className="step-label">04 · What goes wrong, and why</p>
              <h2 id="roadblock-heading">Problems found in the public route</h2>
          </div>
            <p>{scenarioRoadblocks.length} researched problems are linked to this path. Conflicting accounts stay visible so a generic error can be traced back to the record that may be causing it.</p>
        </div>
        {nocConflict && (
          <aside className="contradiction-callout" aria-labelledby="noc-conflict-heading">
            <div className="contradiction-label">Prominent contested finding</div>
            <div>
              <div className="roadblock-topline">
                <span className="category category-documentation">documentation</span>
                <StatusBadge status="contested" compact />
              </div>
              <h3 id="noc-conflict-heading">{publicCopy(nocConflict.title)}</h3>
              <p>{publicCopy(nocConflict.symptom)}</p>
            </div>
            <div className="contradiction-copy">
              <p><b>One citizen account says an older case needed a builder NOC. Another says a 2026 case did not.</b></p>
              <p>These are conflicting citizen accounts, not a checklist. Do not infer that an NOC is either required or unnecessary.</p>
              <a href={`#${nocConflict.id}`}>Open both sources and recovery guidance ↓</a>
            </div>
          </aside>
        )}
        <div className="roadblock-controls">
          <div className="segmented-control" aria-label="Filter by roadblock category">
            {(['all', 'documentation', 'process', 'infrastructure'] as const).map((category) => (
              <button
                key={category}
                onClick={() => setRoadblockCategory(category)}
                aria-pressed={roadblockCategory === category}
              >
                {category}
              </button>
            ))}
          </div>
          <label className="toggle-control">
            <input
              type="checkbox"
              checked={showAllRoadblocks}
              onChange={(event) => setShowAllRoadblocks(event.target.checked)}
            />
            <span>Show every scenario</span>
          </label>
        </div>
        {roadblocks.length ? (
          <div className="roadblock-list">
            {roadblocks.map((roadblock, index) => (
              <article className="roadblock" key={roadblock.id} id={roadblock.id}>
                <div className="roadblock-index">R{String(index + 1).padStart(2, '0')}</div>
                <div className="roadblock-main">
                  <div className="roadblock-topline">
                    <span className={`category category-${roadblock.category}`}>{roadblock.category}</span>
                    <StatusBadge status={roadblock.status} compact />
                  </div>
                  <h3>{publicCopy(roadblock.title)}</h3>
                  <p className="roadblock-symptom">{publicCopy(roadblock.symptom)}</p>
                </div>
                <dl className="roadblock-resolution">
                  <div><dt>Likely cause</dt><dd>{publicCopy(roadblock.likelyCause)}</dd></div>
                  <div><dt>What you can try next</dt><dd>{publicCopy(roadblock.recovery)}</dd></div>
                </dl>
                <details className="roadblock-evidence">
                  <summary>See evidence</summary>
                  <ClaimCards claimIds={roadblock.claimIds} ledger={ledger} />
                </details>
              </article>
            ))}
          </div>
        ) : (
          <p className="empty-panel">No roadblocks match this filter. That does not mean the path is clear.</p>
        )}
      </section>

      <section className="section evidence-section" id="evidence" aria-labelledby="evidence-heading">
        <div className="section-heading split-heading light-heading">
          <div>
            <p className="step-label">05 · Check our sources</p>
            <h2 id="evidence-heading">Sources for {publicCopy(selectedScenario.label)}</h2>
          </div>
          <p>The letter shows source strength, not whether a statement will apply to every case.</p>
        </div>
        <details className="source-details">
          <summary>Show the sources</summary>
          <ClaimCards claimIds={scenarioClaims.map((claim) => claim.id)} ledger={ledger} />
        </details>
      </section>

      <section className="section official-shelf" aria-labelledby="official-shelf-heading">
        <div className="section-heading split-heading">
          <div>
            <p className="step-label">What official documentation exists — and where it stops</p>
            <h2 id="official-shelf-heading">What official documentation exists — and where it stops</h2>
          </div>
          <p>{sourceGroupSummary(sourceGroups, gaps.length)}. Sources are grouped by specificity: each URL appears once; general references are starting points, and citizen accounts are reported experience.</p>
        </div>
        <details className="source-details">
          <summary>Show the sources</summary>
          <div className="official-source-groups">
            <SourceShelfGroup title="Specific documents" kind="specific" sources={sourceGroups.specificDocuments} />
            <SourceShelfGroup title="General references" kind="general" sources={sourceGroups.generalReferences} />
            <SourceShelfGroup title="Citizen accounts" kind="citizen" sources={sourceGroups.citizenAccounts} />
          </div>
        </details>
      </section>

      <footer className="footer">
        <div className="footer-title">
          <span>Method & limits</span>
          <h2>Show the chain.<br />Keep the gaps.</h2>
        </div>
        <div className="footer-copy">
          <p>
            This page shows {ledger.scenarios.length} situations, {ledger.nodes.length} records, and {ledger.claims.length} sourced statements. Unknown,
            Partial, and Contested items are never turned into a confident answer.
          </p>
          <p>{datasetNotice.footer}</p>
          <div className="footer-meta">
            <span>{ledger.meta.disclaimer}</span>
          </div>
          <small>Snapshot {ledger.meta.asOf} · {ledger.meta.jurisdiction} · Research format {ledger.meta.schemaVersion}</small>
          <SlopfolioBadge />
        </div>
      </footer>
    </main>
  );
}
