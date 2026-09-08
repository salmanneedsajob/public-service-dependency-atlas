import type { Metadata } from 'next';
import Link from 'next/link';
import './before-you-apply.css';
import { briefCorpusTotals, listBriefScenarios } from '@/lib/brief';

export const metadata: Metadata = {
  title: 'Before You Apply | Public Service Dependency Atlas',
  description:
    'Pick your situation and read what the published record says, what it leaves unresolved, and what to ask before you apply.',
};

const featured = { serviceId: 'bescom', scenarioSlug: 'consent-unavailable' };

export default function BeforeYouApplyIndex() {
  const scenarios = listBriefScenarios();
  const totals = briefCorpusTotals();
  const lead = scenarios.find((scenario) => scenario.serviceId === featured.serviceId && scenario.scenarioSlug === featured.scenarioSlug);

  const services = scenarios.reduce<Array<{ id: string; title: string; category: string; href: string; situations: typeof scenarios }>>((groups, scenario) => {
    const existing = groups.find((group) => group.id === scenario.serviceId);
    if (existing) existing.situations.push(scenario);
    else groups.push({ id: scenario.serviceId, title: scenario.serviceTitle, category: scenario.serviceCategory, href: scenario.serviceHref, situations: [scenario] });
    return groups;
  }, []);

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

      <section className="bya-hero">
        <p className="bya-eyebrow">Bengaluru · {totals.scenarioCount} situations</p>
        <h1>Know what to do before you apply.</h1>
        <p className="bya-lede">
          Tell us your situation. You get a short brief: what the published guidance actually says, what it leaves unresolved, where the
          route is known to break, and one next step.
        </p>
      </section>

      {lead ? (
        <Link className="bya-featured" href={lead.href}>
          <p className="bya-eyebrow">Start here</p>
          <h2>
            {lead.serviceTitle} — {lead.label.toLowerCase()}
          </h2>
          <p>
            {lead.summary} The standard route assumes you can get that consent. The published conditions do name evidence you may
            produce instead — and leave open whether that route is still accepted today.
          </p>
          <span className="bya-featured-go">
            Read this brief <span aria-hidden="true">→</span>
          </span>
        </Link>
      ) : null}

      <section className="bya-section" aria-labelledby="all-situations">
        <p className="bya-eyebrow">Or find your own</p>
        <h2 id="all-situations">Every situation we have mapped</h2>
        <p>
          Grouped by service. The marker on the right counts the requirements our research could not settle from the public record — the
          questions you would otherwise discover at a counter.
        </p>
        <div className="bya-service-grid">
          {services.map((service) => (
            <article className="bya-service" key={service.id}>
              <p className="bya-eyebrow">{service.category}</p>
              <h3>{service.title}</h3>
              <ul className="bya-situations">
                {service.situations.map((situation) => (
                  <li key={situation.scenarioId}>
                    <Link href={situation.href}>
                      <b>{situation.label}</b>
                      <span className="bya-open-count" data-open={situation.unresolvedCount > 0}>
                        {situation.unresolvedCount > 0 ? `${situation.unresolvedCount} open` : 'none open'}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <p className="bya-footnote">
        <b>What this is not</b>
        This is not an application, and it does not talk to any government system. It cannot tell you whether your case will be accepted.
        Where our research could not establish the current position, the brief says so rather than guessing — that gap is the finding, not a
        defect. Other cities are measured on the six published expectations at{' '}
        <Link href="/benchmark">the benchmark</Link>, but only Bengaluru has the situation-level research these briefs need.
        <br />
        <br />
        Every sentence in a brief comes from a dated public source we recorded and audited — {totals.claimCount} claims across{' '}
        {totals.serviceCount} services, including {totals.unresolvedCount} places where we searched and the public record did not settle the
        question. Nothing on these pages is generated when you open them. This is independent desk research, not official guidance.
      </p>
    </main>
  );
}
