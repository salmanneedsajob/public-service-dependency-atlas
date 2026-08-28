import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { buildGapRegister } from '@/lib/gap-register';

export function generateStaticParams() {
  return buildGapRegister().map((record) => ({ gap: record.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ gap: string }> }): Promise<Metadata> {
  const { gap } = await params;
  const record = buildGapRegister().find((item) => item.slug === gap);
  return record ? { title: `Gap ${record.number}: ${record.service.title} | Documentation-debt register` } : {};
}

export default async function GapRecordPage({ params }: { params: Promise<{ gap: string }> }) {
  const { gap } = await params;
  const record = buildGapRegister().find((item) => item.slug === gap);
  if (!record) notFound();

  return (
    <main className="gap-record-page">
      <header className="site-header"><Link className="wordmark" href="/">Public service dependency atlas</Link><nav aria-label="Page navigation"><Link href="/register">Gap register</Link><Link href={record.service.href}>Atlas evidence</Link></nav><span className="schema-pill">{record.status}</span></header>
      <section className="gap-record-hero">
        <p className="eyebrow">G{String(record.number).padStart(2, '0')} · {record.service.title} · opened {record.openedOn}</p>
        <h1>Close this documentation gap.</h1>
        <div className="gap-authority"><span>Owning public authority</span>{record.authorities.map((authority) => <a key={authority.id} href={authority.url} rel="noreferrer" target="_blank">{authority.name} ↗</a>)}</div>
      </section>

      <section className="gap-record-section" aria-labelledby="meaning-heading"><p className="step-label">01</p><h2 id="meaning-heading">What this means for you</h2><p className="gap-statement"><strong>{record.statement.situation}</strong>{record.statement.missing}</p></section>

      <section className="gap-record-section gap-action" aria-labelledby="action-heading"><p className="step-label">02</p><h2 id="action-heading">What you can do right now</h2><p>{record.escalation.text}</p>{record.escalation.source ? <a className="text-link" href={record.escalation.source.url} rel="noreferrer" target="_blank">Source: {record.escalation.source.title} · accessed {record.escalation.source.accessedAt} ↗</a> : <p className="limitation-label">No sourced escalation route is recorded in the evidence held.</p>}</section>

      <section className="gap-record-section systemic-fix" aria-labelledby="fix-heading"><p className="step-label">03</p><h2 id="fix-heading">The systemic fix</h2><p>{record.systemicFix}</p><p className="roadmap-note">Each gap here is specific enough that a formal records request could be drafted from it — a planned later phase.</p></section>

      <section className="gap-evidence"><p><b>Atlas evidence</b> This record is derived from the dated evidence in the {record.service.title} entry.</p><Link className="primary-link" href={record.evidenceHref}>Open the atlas evidence <span>→</span></Link></section>
      <footer className="footer"><div className="footer-title"><span>Gap status</span><h2>Open.<br />Publishable.</h2></div><div className="footer-copy"><p>A gap closes when the responsible authority publishes the missing procedure, the published source is verified, and this record can link to it with a date.</p><div className="footer-meta"><span>Independent research · Not official government guidance</span></div></div></footer>
    </main>
  );
}
