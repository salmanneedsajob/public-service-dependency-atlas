'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { Detail, EvidenceGrade, Ledger, RecordStatus } from '@/lib/ledger-types';
import { collectUndocumentedQuestions, publicNodeLabel } from '@/lib/undocumented';

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
    footer: 'This ledger is a deliberately synthetic fixture for interface testing. Its publishers, links, claims, errors, and recovery routes are invented placeholders; they are not BESCOM instructions or findings about Bengaluru.',
  },
  template: {
    label: 'Research template',
    summary: 'This ledger is incomplete. Unknowns show where audited research still needs to land.',
    footer: 'This ledger is a research template, not a completed finding. Empty and Unknown records are intentionally visible so missing evidence cannot be mistaken for a clear path.',
  },
  research: {
    label: 'Independent research',
    summary: 'This view renders the dated evidence ledger below. Check each claim’s source and status before acting.',
    footer: 'This ledger contains independent, dated research rather than official guidance. Use the claim-level source, access date, evidence grade, and status to judge each step, and verify current requirements with the responsible agency.',
  },
} as const;

function publicNote(note = '') {
  return note
    .replace(/Canonical source for [^.]+\.\s*/g, '')
    .replace(/Reconciles IND-[0-9]+(?:, IND-[0-9]+)*(?: duplicate [^.]+)?\.\s*/g, 'Cross-verified across independent research passes. ')
    .replace(/IND-[0-9]+ /g, '')
    .trim();
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
          .filter((source): source is Ledger['sources'][number] => Boolean(source));
        const contradictions = claim.contradictsClaimIds
          .map((claimId) => ledger.claims.find((item) => item.id === claimId))
          .filter((item): item is Ledger['claims'][number] => Boolean(item));

        return (
          <article className={`claim-card claim-${claim.status}`} key={claim.id} id={claim.id}>
            <div className="claim-topline">
              <EvidenceBadge grade={claim.evidenceGrade} />
              <StatusBadge status={claim.status} compact />
            </div>
            <p className="claim-text">{claim.text}</p>
            <div className="claim-meta">
              <span>{claim.basis} basis</span>
              <span>{claim.jurisdiction}</span>
            </div>
            {claim.notes && <p className="claim-note">{publicNote(claim.notes)}</p>}
            {contradictions.length > 0 && (
              <div className="contradiction-note">
                <b>Contested evidence</b>
                <span>Conflicts with {contradictions.map((item) => item.text).join(' · ')}</span>
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

function DetailGroup({
  eyebrow,
  title,
  details,
  ledger,
}: {
  eyebrow: string;
  title: string;
  details: Detail[];
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
                <h5>{detail.label}</h5>
                <StatusBadge status={detail.status} compact />
              </div>
              <p>{detail.description}</p>
              {detail.actualError && (
                <p className="error-example"><span>Failure signal</span> “{detail.actualError}”</p>
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
          <p className="empty-note">Nothing recorded yet — absence is not evidence that no step exists.</p>
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
    .filter((roadblock): roadblock is Ledger['roadblocks'][number] => Boolean(roadblock)) ?? [];
  const scenarioClaims = ledger.claims.filter((claim) => claim.scenarioIds.includes(selectedScenario.id));
  const scenarioRoadblocks = ledger.roadblocks.filter((roadblock) => roadblock.scenarioIds.includes(selectedScenario.id));
  const roadblocks = ledger.roadblocks.filter((roadblock) => {
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
  const officialSources = ledger.sources.filter((source) => source.type !== 'citizen_evidence');
  const entryNames: Record<string, string> = {
    bescom: 'BESCOM transfer', khata: 'khata transfer', 'property-tax': 'property-tax transfer',
    'water-connection': 'water / sewer connection', 'birth-certificate': 'birth certificate',
    'water-account': 'water-account transfer', 'new-electricity': 'new electricity connection',
    'death-certificate': 'death certificate', lpg: 'LPG connection transfer', marriage: 'marriage registration',
    'trade-license': 'trade licence', 'building-plan': 'building plan approval',
  };
  const entryName = entryNames[service] ?? 'public-service journey';
  const isBescom = service === 'bescom';
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
  const recordType = selectedNode?.kind ? selectedNode.kind.toLowerCase().replaceAll('_', ' ') : 'record';
  const ownerName = agency?.shortName ?? 'an agency not named in the evidence held';

  function selectScenario(id: string) {
    const scenario = ledger.scenarios.find((item) => item.id === id);
    if (!scenario) return;
    setSelectedScenarioId(id);
    setSelectedNodeId(scenario.pathNodeIds[0] ?? '');
    setShowAllRoadblocks(false);
  }

  return (
    <main>
      <header className="site-header">
        <Link className="wordmark" href="/">Public service dependency atlas</Link>
        <nav aria-label="Page navigation">
          <a href="#scenarios">Find my path</a>
          <a href="#map">Find where it breaks</a>
          <a href="#roadblocks">What goes wrong</a>
        </nav>
        <span className="schema-pill">Evidence-led research</span>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">Bengaluru · Evidence-led pathfinder</p>
          <h1>{isBescom ? 'Why is my BESCOM transfer blocked?' : `Your ${entryName} journey`}</h1>
          <p className="ledger-subtitle">{ledger.meta.title}</p>
          <p className="lede">{isBescom ? 'Follow the records that affect an electricity name transfer, the places the route can stall, and the gaps no public source currently explains.' : `Follow the published route for ${entryName}, the places it can stall, and the questions the available public record does not answer.`}</p>
          {isBescom && <p className="term-glossary"><b>Key terms:</b> EPID (Electronic Property Identification number) · e-Khata (Bengaluru’s digital property record) · mutation (the municipal update that records a property transfer) · NOC (No Objection Certificate)</p>}
          <a className="primary-link" href="#scenarios">Find my path <span>↓</span></a>
        </div>
        <aside className="hero-aside" aria-label="Route verdict">
          <div className={`fixture-flag fixture-${ledger.meta.dataKind}`}>{datasetNotice.label}</div>
          <p className="verdict-label">For “{selectedScenario.label}”</p>
          <p className="route-verdict">{verdict}</p>
        </aside>
      </section>

      <section className="gap-section" aria-labelledby="gap-heading">
        <div>
          <p className="step-label">The atlas’s central finding</p>
          <h2 id="gap-heading">What nobody has documented</h2>
          <p>These are the Unknown handoffs and unresolved roadblocks that can leave a citizen stuck. Routine empty fields and research artifacts are not counted.</p>
        </div>
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
      </section>

      <section className="reading-key" aria-label="How to read this map">
        <div className="reading-key-intro"><b>How to read this map</b><span>A status tells you how complete a record is. A letter tells you what kind of source supports it.</span></div>
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
              <strong>{scenario.label}</strong>
              <span className="scenario-summary">{scenario.summary}</span>
              <span className="tag-row">{scenario.tags.map((tag) => <small key={tag}>{tag}</small>)}</span>
              <StatusBadge status={scenario.status} compact />
            </button>
          ))}
        </div>
        <div className={`selection-summary selection-${selectedScenario.status}`}>
          <div>
            <p className="eyebrow">Selected path</p>
            <h3>{selectedScenario.label}</h3>
            <p>{selectedScenario.summary}</p>
          </div>
          <StatusBadge status={selectedScenario.status} />
        </div>
      </section>

      <section className="section map-section" id="map" aria-labelledby="map-heading">
        <div className="section-heading split-heading light-heading">
          <div>
            <p className="step-label">02 · Find where it breaks</p>
            <h2 id="map-heading">The records your {entryName} depends on</h2>
          </div>
          <p>Tap a record to see what it needs to say, how to check it, what failure looks like, and where this information comes from.</p>
        </div>

        {worstPathNode && worstPathNode.status !== 'verified' && (
          <aside className={`blocker-callout status-border-${worstPathNode.status}`}>
            <div><p className="eyebrow">The first place to investigate</p><h3>{publicNodeLabel(worstPathNode.label)}</h3></div>
            <p>{worstPathNode.summary} This record is marked <StatusBadge status={worstPathNode.status} compact />.</p>
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
                  className={`node status-border-${node.status} ${selectedNode?.id === node.id ? 'focused' : ''}`}
                  onClick={() => setSelectedNodeId(node.id)}
                  aria-pressed={selectedNode?.id === node.id}
                >
                  <span className="node-topline">
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <StatusBadge status={node.status} compact />
                  </span>
                  <strong>{publicNodeLabel(node.label)}</strong>
                  <small>{node.kind}</small>
                </button>
                {nextNode && (
                  <div className="edge" aria-label={edge?.label ?? 'The next record'}>
                    <span aria-hidden="true">→</span>
                    <small>{edge?.relationship.replace('_', ' ') ?? 'then'}</small>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <section className="relationship-register" aria-labelledby="relationship-heading">
          <div className="relationship-heading">
            <div>
              <p className="eyebrow">How the records connect</p>
              <h3 id="relationship-heading">How these records depend on each other</h3>
            </div>
            <p>These links show the handoffs held in the evidence for this situation. A dashed card is reported by citizens or not officially documented.</p>
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

              return (
                <article className={`relationship status-border-${edge.status} ${undocumentedEdge ? 'relationship-undocumented' : ''}`} key={edge.id}>
                  <div className="relationship-topline">
                    <span>{edge.relationship.replaceAll('_', ' ')}</span>
                    <StatusBadge status={edge.status} compact />
                  </div>
                  <div className="relationship-nodes">
                    <b>{fromNode ? publicNodeLabel(fromNode.label) : edge.fromNodeId}</b>
                    <span aria-hidden="true">→</span>
                    <b>{toNode ? publicNodeLabel(toNode.label) : edge.toNodeId}</b>
                  </div>
                  <p>{edge.label}</p>
                  {undocumentedEdge && <small className="edge-evidence-note">{onlyCitizenEvidence ? 'Reported by citizens; not officially documented.' : 'Not officially documented in the evidence held.'}</small>}
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

        {selectedNode && (
          <article className="node-detail" aria-live="polite">
            <header className="node-detail-header">
              <div>
                <p className="eyebrow">You’re looking at: {publicNodeLabel(selectedNode.label)} — a {recordType} held by {ownerName}</p>
                <h3>{publicNodeLabel(selectedNode.label)}</h3>
                <p>{selectedNode.summary}</p>
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
              <p>{selectedNode.requiredState}</p>
            </div>

            <div className="detail-columns">
              <DetailGroup eyebrow="Check" title="How can I check it?" details={selectedNode.checks} ledger={ledger} />
              <DetailGroup eyebrow="Failure" title="What does failure look like?" details={selectedNode.failureSignals} ledger={ledger} />
              <DetailGroup eyebrow="Recovery" title="What can I do next?" details={selectedNode.recoveries} ledger={ledger} />
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
      </section>

      {selectedJourney && (
        <section className="section journey-section" id="journey" aria-labelledby="journey-heading">
          <div className="section-heading split-heading">
            <div>
              <p className="step-label">03 · The steps, as far as the evidence goes</p>
              <h2 id="journey-heading">{selectedJourney.title}</h2>
            </div>
            <div>
              <StatusBadge status={selectedJourney.status} />
              <p>{selectedJourney.context}</p>
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
                    <h3>{step.label}</h3>
                    <p>{step.action}</p>
                    <div className="expected-result"><span>Expected result</span>{step.expectedResult}</div>
                    <StatusBadge status={step.status} compact />
                  </div>
                </li>
              );
            })}
          </ol>
          <div className="journey-support">
            <article>
              <span>Recorded handoffs</span>
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
                      <p>{dependency.description}</p>
                    </div>
                  );
                })}
              </div>
            </article>
            <article>
              <span>Failure roadblocks on this journey</span>
              <div className="journey-roadblock-list">
                {selectedJourneyRoadblocks.map((roadblock) => (
                  <a href={`#${roadblock.id}`} key={roadblock.id}>
                    <span className={`category category-${roadblock.category}`}>{roadblock.category}</span>
                    <b>{roadblock.title}</b>
                    <small>{roadblock.symptom}</small>
                  </a>
                ))}
              </div>
            </article>
          </div>
          <div className="journey-notes">
            <article>
              <span>Recovery notes</span>
              <ul>{selectedJourney.recoveryNotes.map((note) => <li key={note}>{note}</li>)}</ul>
            </article>
            <article>
              <span>Documentation quality</span>
              <ul>{selectedJourney.documentationQualityNotes.map((note) => <li key={note}>{note}</li>)}</ul>
            </article>
          </div>
        </section>
      )}

      <section className="section roadblock-section" id="roadblocks" aria-labelledby="roadblock-heading">
        <div className="section-heading split-heading">
          <div>
            <p className="step-label">04 · What goes wrong, and why</p>
            <h2 id="roadblock-heading">Roadblock register</h2>
          </div>
            <p>{scenarioRoadblocks.length} recorded problems are linked to this path. Conflicting accounts stay visible so a generic error can be traced back to the record that may be causing it.</p>
        </div>
        {nocConflict && (
          <aside className="contradiction-callout" aria-labelledby="noc-conflict-heading">
            <div className="contradiction-label">Prominent contested finding</div>
            <div>
              <div className="roadblock-topline">
                <span className="category category-documentation">documentation</span>
                <StatusBadge status="contested" compact />
              </div>
              <h3 id="noc-conflict-heading">{nocConflict.title}</h3>
              <p>{nocConflict.symptom}</p>
            </div>
            <div className="contradiction-copy">
              <p><code>claim_citizen_old_noc</code> ↔ <code>claim_citizen_no_builder_noc</code></p>
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
                  <h3>{roadblock.title}</h3>
                  <p className="roadblock-symptom">{roadblock.symptom}</p>
                </div>
                <dl className="roadblock-resolution">
                  <div><dt>Likely cause</dt><dd>{roadblock.likelyCause}</dd></div>
                  <div><dt>Recovery</dt><dd>{roadblock.recovery}</dd></div>
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
            <h2 id="evidence-heading">Sources for {selectedScenario.label}</h2>
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
          <p>These documents and public routes are evidence, not a promise that their handoffs form a complete journey. The gap is shown against what is actually published.</p>
        </div>
        <details className="source-details">
          <summary>Show the sources</summary>
          <div className="official-source-grid">
            {officialSources.map((source) => (
              <article key={source.id}>
                <a href={source.url} rel="noreferrer" target="_blank">{source.title} ↗</a>
                <small>{source.publisher} · accessed {source.accessedAt}</small>
                <p><b>What it covers:</b> A published {source.type.replaceAll('_', ' ')} used in this entry’s evidence ledger.</p>
                <p><b>Where it stops:</b> {publicNote(source.notes) || 'Its relationship to the other systems in this journey is not established here.'}</p>
              </article>
            ))}
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
          <small>Snapshot {ledger.meta.asOf} · {ledger.meta.jurisdiction} · Schema {ledger.meta.schemaVersion}</small>
        </div>
      </footer>
    </main>
  );
}
