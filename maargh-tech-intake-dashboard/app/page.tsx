import Link from 'next/link'

export default function Home() {
  return <main className="public-page"><div className="public-card landing-card"><div className="brand"><div className="brand-mark">M</div><span>maargh<span className="brand-dot">.</span></span></div><div className="eyebrow">Technology workspace</div><h1>Keep your technology work moving.</h1><p className="lead">Submit a request to the Maargh Tech team or sign in to manage the internal queue.</p><div className="landing-actions"><Link href="/request" className="primary-button">Submit a request</Link><Link href="/tech" className="secondary-button">Tech team sign in</Link></div></div></main>
}
