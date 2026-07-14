import { Link } from 'react-router-dom'

export function HomePage() {
  return (
    <main className="home-page">
      <nav className="home-nav">
        <Link className="home-brand" to="/"><i>N</i>NexForge</Link>
        <div className="home-nav-links"><a href="#features">Features</a><a href="#how-it-works">How it works</a></div>
        <Link className="home-get-started" to="/login">Get Started <b>→</b></Link>
      </nav>
      <section className="home-hero">
        <div className="home-copy">
          <p className="home-eyebrow">SIMPLE PAYMENTS. ONE LINK.</p>
          <h1>Turn your payment details into a <em>beautiful</em> page.</h1>
          <p className="home-lead">Create a branded UPI payment page, share it anywhere, and see how people engage with it.</p>
          <div className="home-actions"><Link className="home-primary" to="/login">Create your page <b>→</b></Link><a className="home-secondary" href="#how-it-works">See how it works</a></div>
          <div className="home-trust"><span>✓ No code required</span><span>✓ Ready in minutes</span><span>✓ Secure UPI links</span></div>
        </div>
        <div className="home-preview" aria-label="Example NexForge payment page preview">
          <div className="home-preview-top"><span>PAYMENT PAGE</span><i>•••</i></div>
          <div className="home-preview-banner"/>
          <div className="home-preview-body"><div className="home-preview-logo">N</div><small>PAYMENT FOR</small><h2>Design workshop</h2><strong>₹499</strong><div className="home-qr">▦</div><button>Pay with UPI <b>→</b></button></div>
        </div>
      </section>
      <section className="home-features" id="features">
        <p className="home-eyebrow">BUILT FOR INDEPENDENT SELLERS</p><h2>Everything you need to collect payments professionally.</h2>
        <div className="home-feature-grid">
          <article><i>✦</i><h3>Branded payment page</h3><p>Add your logo, cover image and colours to make every payment feel like your brand.</p></article>
          <article><i>⌁</i><h3>Instant UPI checkout</h3><p>Share a single link or QR code that works with any UPI app.</p></article>
          <article><i>↗</i><h3>Clear analytics</h3><p>Track page views, QR scans and payment-click activity in one place.</p></article>
        </div>
      </section>
      <section className="home-steps" id="how-it-works"><p className="home-eyebrow">HOW IT WORKS</p><h2>From details to shareable link in three steps.</h2><div><span><b>01</b>Add your details</span><span><b>02</b>Personalise your page</span><span><b>03</b>Publish and share</span></div></section>
      <footer className="home-footer"><Link className="home-brand" to="/"><i>N</i>NexForge</Link><span>Made for simple, polished payments.</span></footer>
    </main>
  )
}
