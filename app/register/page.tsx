import type { Metadata } from 'next';
import Link from 'next/link';
import { buildGapRegister } from '@/lib/gap-register';
import { registerOpenedOn } from '@/lib/atlas-data';

export const metadata: Metadata = {
  title: 'Documentation-debt register | Public Service Dependency Atlas',
  description: 'An open register of missing public-service procedures in Bengaluru.',
};

export default function GapRegisterPage() {
  const register = buildGapRegister();

  return (
    <main className="register-page">
      <header className="site-header">
        <Link className="wordmark" href="/">Public service dependency atlas</Link>
        <nav aria-label="Page navigation"><Link href="/">Atlas</Link><Link href="/agencies">For agencies</Link></nav>
        <span className="schema-pill">{register.length} open gaps</span>
      </header>

      <section className="register-hero">
        <p className="eyebrow">Documentation-debt register · opened {registerOpenedOn}</p>
        <h1>Every gap is a small, publishable fix.</h1>
        <p>These are the public-service handoffs people cannot reliably complete because the procedure is not published in one usable place. All records start Open; that is the point of a day-zero register.</p>
        <aside className="closure-criteria"><b>How a gap closes</b><span>The responsible authority publishes the missing document or procedure; we verify it; the closed record links to that source with a date.</span></aside>
      </section>

      <section className="register-list" aria-labelledby="register-list-heading">
        <div className="section-heading split-heading"><div><p className="step-label">All open records</p><h2 id="register-list-heading">{register.length} gaps to close</h2></div><p>Each record names the public authority, the missing procedure, and the underlying atlas evidence.</p></div>
        <ol>
          {register.map((record) => (
            <li key={record.slug}>
              <article className="register-card">
                <div className="register-card-meta"><span>G{String(record.number).padStart(2, '0')}</span><b>{record.status}</b><span>{record.service.title}</span></div>
                <h3><Link href={`/register/${record.slug}`}>{record.statement.situation}</Link></h3>
                <p>{record.statement.missing}</p>
                <div className="register-card-footer"><span>{record.authorities.map((authority) => authority.name).join(' · ')}</span><Link href={record.evidenceHref}>Atlas evidence →</Link></div>
              </article>
            </li>
          ))}
        </ol>
      </section>

      <footer className="footer"><div className="footer-title"><span>Documentation debt</span><h2>Publish it.<br />Close it.</h2></div><div className="footer-copy"><p>This is independent research, not official government guidance. A gap is not an accusation; it is a precise opportunity to make a public journey easier to complete.</p><div className="footer-meta"><span>Register opened {registerOpenedOn} · All records Open · Bengaluru, Karnataka, India</span></div></div></footer>
    </main>
  );
}
