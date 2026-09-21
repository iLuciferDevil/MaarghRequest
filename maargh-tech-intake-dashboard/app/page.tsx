import Link from 'next/link'

export default function Home() {
  return (
    <main className="rq-page rq-home">
      <div className="rq-bg" aria-hidden="true" />
      <section className="rq-card rq-home-card">
        <div className="rq-home-brand">
          <div className="rq-home-mark">M</div>
          <span>maargh<span className="rq-home-dot">.</span></span>
        </div>

        <span className="rq-kicker">TECHNOLOGY WORKSPACE</span>

        <h1>Keep your technology work moving.</h1>

        <p className="rq-home-lead">
          Submit a request to the Maargh Tech team or sign in to manage the internal queue.
        </p>

        <div className="rq-home-actions">
          <Link href="/request" className="rq-submit-btn">
            Submit a request <span aria-hidden="true">→</span>
          </Link>
          <Link href="/tech" className="rq-home-secondary">
            Tech team sign in
          </Link>
        </div>
      </section>
    </main>
  )
}
