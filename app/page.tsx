'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Detail, EvidenceGrade, Ledger, RecordStatus } from '@/lib/ledger-types';

const statusCopy: Record<RecordStatus, string> = {
  verified: 'Supported by the fixture at the stated grade',
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
    return <p className="empty-note">No claim is linked to this record yet.</p>;
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
            {claim.notes && <p className="claim-note">{claim.notes}</p>}
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
                <span className="unknown-source">No source linked — this is explicitly Unknown.</span>
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

export default function Home() {
  const [ledger, setLedger] = useState<Ledger | null>(null);
  const [loadError, setLoadError] = useState('');
  const [selectedScenarioId, setSelectedScenarioId] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState('');
  const [roadblockCategory, setRoadblockCategory] = useState<'all' | RoadblockCategory>('all');
  const [showAllRoadblocks, setShowAllRoadblocks] = useState(false);

  useEffect(() => {
    let active = true;
    fetch('/data/ledger.json')
      .then((response) => {
        if (!response.ok) throw new Error(`Ledger request failed: ${response.status}`);
        return response.json() as Promise<Ledger>;
      })
      .then((nextLedger) => {
        if (!active) return;
        setLedger(nextLedger);
        setSelectedScenarioId(nextLedger.scenarios[0]?.id ?? '');
        setSelectedNodeId(nextLedger.scenarios[0]?.pathNodeIds[0] ?? '');
      })
      .catch((error: unknown) => {
        if (active) setLoadError(error instanceof Error ? error.message : 'Could not load the ledger.');
      });
    return () => {
      active = false;
    };
  }, []);

  const selectedScenario = useMemo(
    () => ledger?.scenarios.find((scenario) => scenario.id === selectedScenarioId),
    [ledger, selectedScenarioId],
  );

  if (loadError) {
    return (
      <main className="state-page">
        <p className="eyebrow">Ledger unavailable</p>
        <h1>The evidence file could not be loaded.</h1>
        <p>{loadError}</p>
      </main>
    );
  }

  if (!ledger || !selectedScenario) {
    return <main className="loading">Loading the evidence ledger…</main>;
  }

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
  const scenarioClaims = ledger.claims.filter((claim) => claim.scenarioIds.includes(selectedScenario.id));
  const scenarioRoadblocks = ledger.roadblocks.filter((roadblock) => roadblock.scenarioIds.includes(selectedScenario.id));
  const roadblocks = ledger.roadblocks.filter((roadblock) => {
    const categoryMatch = roadblockCategory === 'all' || roadblock.category === roadblockCategory;
    const scenarioMatch = showAllRoadblocks || roadblock.scenarioIds.includes(selectedScenario.id);
    return categoryMatch && scenarioMatch;
  });
  const unresolvedCount = selectedPathNodes.filter((node) => node.status !== 'verified').length;
  const statusCounts = ledger.claims.reduce(
    (counts, claim) => ({ ...counts, [claim.status]: counts[claim.status] + 1 }),
    { verified: 0, partial: 0, contested: 0, unknown: 0 } as Record<RecordStatus, number>,
  );

  function selectScenario(id: string) {
    const scenario = ledger!.scenarios.find((item) => item.id === id);
    if (!scenario) return;
    setSelectedScenarioId(id);
    setSelectedNodeId(scenario.pathNodeIds[0] ?? '');
    setShowAllRoadblocks(false);
  }

  return (
    <main>
      <header className="site-header">
        <a className="wordmark" href="#top">Public service dependency atlas</a>
        <nav aria-label="Page navigation">
          <a href="#scenarios">Find my path</a>
          <a href="#map">Dependency map</a>
          <a href="#roadblocks">Roadblocks</a>
        </nav>
        <span className="schema-pill">Ledger v{ledger.meta.schemaVersion}</span>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">Bengaluru · Evidence-led pathfinder</p>
          <h1>{ledger.meta.title}</h1>
          <p className="lede">
            Start with your situation. Then trace the records, decisions, and system handoffs
            upstream from the final error — with gaps and disagreements left visible.
          </p>
          <a className="primary-link" href="#scenarios">Find my path <span>↓</span></a>
        </div>
        <aside className="hero-aside" aria-label="Fixture notice">
          <div className="fixture-flag">Synthetic data</div>
          <p>This preview tests the interface, not the real BESCOM process.</p>
          <dl>
            <div><dt>Scenarios</dt><dd>{ledger.scenarios.length}</dd></div>
            <div><dt>Dependencies</dt><dd>{ledger.nodes.length}</dd></div>
            <div><dt>Evidence claims</dt><dd>{ledger.claims.length}</dd></div>
          </dl>
        </aside>
      </section>

      <section className="uncertainty-strip" aria-label="How to read evidence status">
        {(Object.keys(statusCounts) as RecordStatus[]).map((status) => (
          <div key={status}>
            <StatusBadge status={status} />
            <span>{statusCopy[status]}</span>
            <b>{statusCounts[status]}</b>
          </div>
        ))}
      </section>

      <section className="section scenario-section" id="scenarios" aria-labelledby="scenario-heading">
        <div className="section-heading split-heading">
          <div>
            <p className="step-label">01 · Start here</p>
            <h2 id="scenario-heading">Which of these is you?</h2>
          </div>
          <p>Pick the closest match. You can switch paths without losing the evidence context.</p>
        </div>
        <div className="scenario-grid">
          {ledger.scenarios.map((scenario, index) => (
            <button
              className={`scenario-card ${scenario.id === selectedScenario.id ? 'selected' : ''}`}
              key={scenario.id}
              onClick={() => selectScenario(scenario.id)}
              aria-pressed={scenario.id === selectedScenario.id}
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
          <div className="selection-metric">
            <b>{selectedPathNodes.length}</b>
            <span>dependencies on this path</span>
          </div>
          <div className="selection-metric warning-metric">
            <b>{unresolvedCount}</b>
            <span>partial, contested, or unknown</span>
          </div>
        </div>
      </section>

      <section className="section map-section" id="map" aria-labelledby="map-heading">
        <div className="section-heading split-heading light-heading">
          <div>
            <p className="step-label">02 · Trace the dependency</p>
            <h2 id="map-heading">Your transfer chain</h2>
          </div>
          <p>Tap a node to see what “ready” means, how to check it, what failure looks like, and the evidence behind each claim.</p>
        </div>

        <div className="chain" role="list" aria-label={`Dependency chain for ${selectedScenario.label}`}>
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
                  <strong>{node.label}</strong>
                  <small>{node.kind}</small>
                </button>
                {nextNode && (
                  <div className="edge" aria-label={edge?.label ?? 'Dependency continues'}>
                    <span aria-hidden="true">→</span>
                    <small>{edge?.relationship.replace('_', ' ') ?? 'then'}</small>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {selectedNode && (
          <article className="node-detail" aria-live="polite">
            <header className="node-detail-header">
              <div>
                <p className="eyebrow">Selected dependency · {selectedNode.kind}</p>
                <h3>{selectedNode.label}</h3>
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
              <span>Required state before proceeding</span>
              <p>{selectedNode.requiredState}</p>
            </div>

            <div className="detail-columns">
              <DetailGroup eyebrow="Check" title="How can I check it?" details={selectedNode.checks} ledger={ledger} />
              <DetailGroup eyebrow="Failure" title="What does failure look like?" details={selectedNode.failureSignals} ledger={ledger} />
              <DetailGroup eyebrow="Recovery" title="What can I do next?" details={selectedNode.recoveries} ledger={ledger} />
            </div>

            <section className="node-claims">
              <div className="subsection-heading">
                <p className="eyebrow">Evidence attached to this dependency</p>
                <h4>Claims, grades, and sources</h4>
              </div>
              <ClaimCards claimIds={selectedNode.claimIds} ledger={ledger} />
            </section>
          </article>
        )}
      </section>

      {selectedJourney && (
        <section className="section journey-section" id="journey" aria-labelledby="journey-heading">
          <div className="section-heading split-heading">
            <div>
              <p className="step-label">03 · Follow the researched journey</p>
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
                    <span className="journey-node">{node?.label ?? 'Unknown node'}</span>
                    <h3>{step.label}</h3>
                    <p>{step.action}</p>
                    <div className="expected-result"><span>Expected result</span>{step.expectedResult}</div>
                    <StatusBadge status={step.status} compact />
                  </div>
                </li>
              );
            })}
          </ol>
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
            <p className="step-label">04 · Browse failure states</p>
            <h2 id="roadblock-heading">Roadblock register</h2>
          </div>
          <p>{scenarioRoadblocks.length} roadblocks are linked to this path. Contradictions stay flat and browsable so a generic final error can be traced upstream.</p>
        </div>
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
              <article className="roadblock" key={roadblock.id}>
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
            <p className="step-label">05 · Audit the claims</p>
            <h2 id="evidence-heading">Evidence for {selectedScenario.label}</h2>
          </div>
          <p>{scenarioClaims.length} linked claims. The letter measures source strength, not whether a claim is useful or convenient.</p>
        </div>
        <div className="grade-key" aria-label="Evidence grade legend">
          {(Object.keys(gradeCopy) as EvidenceGrade[]).map((grade) => <EvidenceBadge grade={grade} key={grade} />)}
        </div>
        <ClaimCards claimIds={scenarioClaims.map((claim) => claim.id)} ledger={ledger} />
      </section>

      <footer className="footer">
        <div className="footer-title">
          <span>Method & limits</span>
          <h2>Show the chain.<br />Keep the gaps.</h2>
        </div>
        <div className="footer-copy">
          <p>
            This interface reads one schema v1.0.0 ledger and resolves scenarios to nodes,
            edges, claims, sources, roadblocks, and journey steps. Status is data: Unknown,
            Partial, and Contested records are never silently converted into a confident answer.
          </p>
          <p>
            The current ledger is a deliberately synthetic fixture for interface testing. Its
            publishers, links, claims, errors, and recovery routes are invented placeholders;
            they are not BESCOM instructions or findings about Bengaluru. Swap in an audited
            JSON or compiled YAML ledger before publication.
          </p>
          <div className="footer-meta">
            <StatusBadge status="unknown" />
            <span>{ledger.meta.disclaimer}</span>
          </div>
          <small>Snapshot {ledger.meta.asOf} · {ledger.meta.jurisdiction} · Schema {ledger.meta.schemaVersion}</small>
        </div>
      </footer>
    </main>
  );
}
