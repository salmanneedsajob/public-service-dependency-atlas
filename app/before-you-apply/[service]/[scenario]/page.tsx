import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import '../../before-you-apply.css';
import { BriefExports } from '@/components/BriefExports';
import { buildAgentBrief, buildClarificationPacket, getBrief, listBriefScenarios, type BriefClaim } from '@/lib/brief';

type Params = { service: string; scenario: string };

const gradeMeaning: Record<string, string> = {
  A: 'binding law, regulation, commission order or gazette notification',
  B: 'current official procedure, form, portal or agency page',
  C: 'official but indirect, incomplete, archived, undated or potentially outdated',
  D: 'reputable secondary reporting',
  E: 'genuine public first-person evidence',
  F: 'uncorroborated lead',
  Unknown: 'no usable source',
};

export function generateStaticParams() {
  return listBriefScenarios().map((scenario) => ({ service: scenario.serviceId, scenario: scenario.scenarioSlug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { service, scenario } = await params;
  const brief = getBrief(service, scenario);
  if (!brief) return { title: 'Before You Apply | Public Service Dependency Atlas' };
  return {
    title: `${brief.scenario.label} — ${brief.service.title} | Before You Apply`,
    description: brief.scenario.summary,
  };
}

function Claim({ claim }: { claim: BriefClaim }) {
  return (
    <article className={`bya-claim bya-claim-${claim.status}`}>
      <p className="bya-claim-text">{claim.text}</p>
      <p className="bya-claim-tags">
        {claim.status === 'unknown' ? (
          <span className="bya-kind">{claim.boundary ? 'Our reading stopped here' : 'The record leaves this open'}</span>
        ) : null}
        <span>
          Evidence <b>{claim.grade}</b>
        </span>
        <span>
          Record <b>{claim.status}</b>
        </span>
        <span>
          Basis <b>{claim.basis}</b>
        </span>
      </p>
      {claim.notes ? (
        <p className="bya-qualify">
          <b>{claim.status === 'unknown' ? (claim.boundary ? 'Where we stopped' : 'What we checked') : 'Read this with it'}</b>
          {claim.notes}
        </p>
      ) : null}
      {claim.sources.length ? (
        <ul className="bya-claim-sources">
          {claim.sources.map((source) => (
            <li key={source.id}>
              <a href={source.url} target="_blank" rel="noreferrer noopener">
                {source.title}
              </a>{' '}
              — {source.publisher}
              {source.publishedAt ? `, published ${source.publishedAt}` : ''}, checked {source.accessedAt}
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

export default async function BriefPage({ params }: { params: Promise<Params> }) {
  const { service, scenario } = await params;
  const brief = getBrief(service, scenario);
  if (!brief) notFound();

  const clarification = buildClarificationPacket(brief);
  const agentBrief = buildAgentBrief(brief);
  const siblings = listBriefScenarios().filter((item) => item.serviceId === brief.service.id && item.scenarioId !== brief.scenario.id);
  const visibleClaims = 8;
  const gradesUsed = [...new Set([...brief.established, ...brief.contested, ...brief.unresolved].map((claim) => claim.grade))].sort();

  return (
    <main className="bya-page">
      <header className="site-header">
        <Link className="wordmark" href="/">
          <span className="wordmark-accent">BLR</span>
          <span>Public Service Dependency Atlas</span>
        </Link>
        <nav aria-label="Page navigation">
          <Link className="primary-nav-link" href="/before-you-apply">
            Before you apply
          </Link>
          <Link href="/report">Report</Link>
          <Link href="/benchmark">Benchmark</Link>
        </nav>
      </header>

      <p className="bya-crumb">
        <Link href="/before-you-apply">Before you apply</Link> <span aria-hidden="true">/</span> {brief.service.title}
      </p>

      <section className="bya-brief-head">
        <p className="bya-eyebrow">
          {brief.scenario.label === brief.service.title ? 'Your situation' : `${brief.service.title} · your situation`}
        </p>
        <h1>{brief.scenario.label}</h1>
        <p className="bya-situation-summary">{brief.scenario.summary}</p>
        <dl className="bya-meta">
          <div>
            <dt>Jurisdiction</dt>
            <dd>{brief.jurisdiction}</dd>
          </div>
          <div>
            <dt>Evidence as of</dt>
            <dd>{brief.asOf}</dd>
          </div>
          <div>
            <dt>Supported statements</dt>
            <dd>{brief.established.length}</dd>
          </div>
          <div>
            <dt>Left unresolved</dt>
            <dd>{brief.unresolved.length + brief.contested.length}</dd>
          </div>
          <div>
            <dt>Full research</dt>
            <dd>
              <Link href={brief.service.href}>Atlas entry →</Link>
            </dd>
          </div>
        </dl>
      </section>

      <section className={`bya-action bya-action-${brief.nextAction.kind}`} aria-labelledby="next-action">
        <p className="bya-eyebrow">Your next step</p>
        <h2 id="next-action">{brief.nextAction.headline}</h2>
        <p>{brief.nextAction.detail}</p>
        {brief.nextAction.owners.length ? (
          <p className="bya-action-owners">
            Responsible on the public record:{' '}
            {brief.nextAction.owners.map((owner, index) => (
              <span key={owner.id}>
                {index > 0 ? ', ' : ''}
                <a href={owner.officialUrl} target="_blank" rel="noreferrer noopener">
                  {owner.name}
                </a>
              </span>
            ))}
. We did not confirm that {brief.nextAction.owners.length > 1 ? 'any of them decide' : 'this office decides'} this
            particular case.
          </p>
        ) : null}
      </section>

      <section className="bya-block" aria-labelledby="established">
        <div className="bya-block-head">
          <div>
            <p className="bya-eyebrow">Block one</p>
            <h2 id="established">What the published record says</h2>
            <p>
              Found in public documents, graded and dated. The statements closest to your situation come first; a single
              first-person account never outranks the documentary record. Open any source to read it yourself.
            </p>
          </div>
          <span className="bya-count">{brief.established.length} statements</span>
        </div>
        {brief.established.length ? (
          <>
            <div className="bya-claims">
              {brief.established.slice(0, visibleClaims).map((claim) => (
                <Claim claim={claim} key={claim.id} />
              ))}
            </div>
            {brief.established.length > visibleClaims ? (
              <details className="bya-more">
                <summary>Show the remaining {brief.established.length - visibleClaims} statements</summary>
                <div className="bya-claims">
                  {brief.established.slice(visibleClaims).map((claim) => (
                    <Claim claim={claim} key={claim.id} />
                  ))}
                </div>
              </details>
            ) : null}
          </>
        ) : (
          <p className="bya-empty">
            Our research recorded no supported statement scoped to this situation. That is a limit of what we found, not proof that no
            guidance exists.
          </p>
        )}
      </section>

      {brief.contested.length ? (
        <section className="bya-block" aria-labelledby="contested">
          <div className="bya-block-head">
            <div>
              <p className="bya-eyebrow">Block two</p>
              <h2 id="contested">Where the record disagrees with itself</h2>
              <p>Accounts we could not reconcile. We kept both rather than picking a winner.</p>
            </div>
            <span className="bya-count">{brief.contested.length} contested</span>
          </div>
          <div className="bya-claims">
            {brief.contested.map((claim) => (
              <Claim claim={claim} key={claim.id} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="bya-block" aria-labelledby="unresolved">
        <div className="bya-block-head">
          <div>
            <p className="bya-eyebrow">Block {brief.contested.length ? 'three' : 'two'}</p>
            <h2 id="unresolved">What is still unsettled</h2>
            <p>
              Two kinds of thing sit here: questions the published record leaves open, and points where our own reading stopped — at a login
              we did not cross, or a step we could not observe without applying. Each item says which it is. Both are reasons to ask before
              you apply rather than after.
            </p>
          </div>
          <span className="bya-count">{brief.unresolved.length} open</span>
        </div>
        {brief.unresolved.length ? (
          <div className="bya-claims">
            {brief.unresolved.map((claim) => (
              <Claim claim={claim} key={claim.id} />
            ))}
          </div>
        ) : (
          <p className="bya-empty">
            Our research did not record an unresolved requirement for this situation. That is not the same as the record being complete —
            check the source dates before you rely on anything here.
          </p>
        )}
      </section>

      {brief.roadblocks.length ? (
        <section className="bya-block" aria-labelledby="roadblocks">
          <div className="bya-block-head">
            <div>
              <p className="bya-eyebrow">Block {brief.contested.length ? 'four' : 'three'}</p>
              <h2 id="roadblocks">Where this route is known to break</h2>
              <p>Failure points recorded for this situation, with the recovery the record supports — or the absence of one.</p>
            </div>
            <span className="bya-count">{brief.roadblocks.length} recorded</span>
          </div>
          <div className="bya-roadblocks">
            {brief.roadblocks.map((roadblock) => (
              <article className="bya-roadblock" key={roadblock.id}>
                <div>
                  <span className="bya-category">{roadblock.category}</span>
                  <h3>{roadblock.title}</h3>
                  <p className="bya-roadblock-symptom">{roadblock.symptom}</p>
                </div>
                <dl>
                  <div>
                    <dt>Likely cause</dt>
                    <dd>{roadblock.likelyCause}</dd>
                  </div>
                  <div>
                    <dt>Recovery</dt>
                    <dd>{roadblock.recovery}</dd>
                  </div>
                  {roadblock.owners.length ? (
                    <div>
                      <dt>Owner on the public record</dt>
                      <dd>{roadblock.owners.map((owner) => owner.name).join(', ')}</dd>
                    </div>
                  ) : null}
                </dl>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="bya-block" aria-labelledby="take-it-with-you">
        <div className="bya-block-head">
          <div>
            <p className="bya-eyebrow">Take it with you</p>
            <h2 id="take-it-with-you">Two ways to carry this</h2>
            <p>Both are built from the same claim records you just read. Neither one adds a fact that is not above.</p>
          </div>
        </div>
        <BriefExports clarification={clarification} agentBrief={agentBrief} />
      </section>

      <section className="bya-block" aria-labelledby="sources">
        <div className="bya-block-head">
          <div>
            <p className="bya-eyebrow">Check us</p>
            <h2 id="sources">Every source behind this brief</h2>
            <p>Read them yourself. If one has moved or changed since we checked it, that is worth knowing before you act.</p>
          </div>
          <span className="bya-count">{brief.sources.length} sources</span>
        </div>
        <ul className="bya-sources-list">
          {brief.sources.map((source) => (
            <li key={source.id}>
              <b>{source.title}</b>
              <span>
                {source.publisher} · {source.type}
                {source.publishedAt ? ` · published ${source.publishedAt}` : ''} · checked {source.accessedAt}
              </span>
              <br />
              <a href={source.url} target="_blank" rel="noreferrer noopener">
                {source.url}
              </a>
            </li>
          ))}
        </ul>
      </section>

      {siblings.length ? (
        <section className="bya-block" aria-labelledby="other-situations">
          <div className="bya-block-head">
            <div>
              <p className="bya-eyebrow">Not your case?</p>
              <h2 id="other-situations">Other situations for this service</h2>
            </div>
          </div>
          <div className="bya-other">
            {siblings.map((sibling) => (
              <Link href={sibling.href} key={sibling.scenarioId}>
                {sibling.label}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <p className="bya-footnote">
        <b>How to read the grades</b>
        {gradesUsed.map((grade) => `${grade} — ${gradeMeaning[grade] ?? 'ungraded'}`).join('. ')}.
        <br />
        <br />
        {brief.disclaimer} Evidence collected as of {brief.asOf}; nothing on this page is generated when you open it. Every statement is a
        recorded claim you can trace to the source above, and the unsettled items stay unsettled on purpose.
        {brief.auditLimitations.length ? (
          <>
            <br />
            <br />
            <b>What our own audit said it could not close</b>
            {brief.auditLimitations.map((limitation) => limitation.recovery || limitation.likelyCause).join(' ')}
          </>
        ) : null}
      </p>
    </main>
  );
}
