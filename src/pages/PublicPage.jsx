import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { QRCodeCanvas } from 'qrcode.react'
import { api } from '../lib/api'

export function PublicPage() {
  const { slug } = useParams()
  const [page, setPage] = useState()
  const [error, setError] = useState('')
  const [showScanner, setShowScanner] = useState(false)
  const qrRef = useRef(null)

  useEffect(() => {
    api.page(slug).then(r => {
      setPage(r.page)
      document.title = r.page.seoTitle || r.page.courseName
      const description = document.querySelector('meta[name="description"]') || document.head.appendChild(Object.assign(document.createElement('meta'), { name: 'description' }))
      description.content = r.page.seoDescription || ''
      api.event({ slug, event: 'view' })
    }).catch(e => setError(e.message))
  }, [slug])

  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector('canvas')
    if (canvas) {
      const link = document.createElement('a')
      link.download = `paylink-${page.courseName.replace(/\s+/g, '-').toLowerCase()}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    }
  }

  const upiLinks = {
    gpay: `tez://upi/pay?pa=${encodeURIComponent(page?.upiId)}&pn=${encodeURIComponent(page?.username)}&am=${page?.amount}&tn=${encodeURIComponent(page?.courseName)}&cu=INR`,
    phonepe: `phonepe://pay?pa=${encodeURIComponent(page?.upiId)}&pn=${encodeURIComponent(page?.username)}&am=${page?.amount}&tn=${encodeURIComponent(page?.courseName)}&cu=INR`,
    paytm: `paytmmp://pay?pa=${encodeURIComponent(page?.upiId)}&pn=${encodeURIComponent(page?.username)}&am=${page?.amount}&tn=${encodeURIComponent(page?.courseName)}&cu=INR`,
    bhim: `bhim://upi/pay?pa=${encodeURIComponent(page?.upiId)}&pn=${encodeURIComponent(page?.username)}&am=${page?.amount}&tn=${encodeURIComponent(page?.courseName)}&cu=INR`,
    generic: `upi://pay?pa=${encodeURIComponent(page?.upiId)}&pn=${encodeURIComponent(page?.username)}&am=${page?.amount}&tn=${encodeURIComponent(page?.courseName)}&cu=INR`
  }

  if (error) return <main className="public-error">This payment page is unavailable.</main>
  if (!page) return <PaymentSkeleton/>

  const upi = upiLinks.generic
  const links = Object.entries(page.socialLinks || {}).filter(([, v]) => v)

  return (
    <main className="payment-page" style={{ '--accent': page.themeColor || '#316bff' }}>
      <div className="payment-glow one"/>
      <div className="payment-glow two"/>
      <section className="payment-layout">
        <article className="payment-intro">
          {page.banner ? <img className="payment-banner" src={page.banner} alt=""/> : <div className="payment-banner payment-banner-fallback"/>}
          <div className="payment-intro-copy">
            <p className="payment-kicker">SECURE UPI PAYMENT</p>
            <h1>{page.courseName}</h1>
            <p>Complete your payment securely with any UPI app.</p>
            <div className="payment-owner">
              {page.logo ? <img src={page.logo} alt=""/> : <i>{page.username?.[0] || 'N'}</i>}
              <span>Created by <b>{page.username}</b></span>
            </div>
          </div>
        </article>
        <article className="payment-card">
          <div className="payment-card-top">
            <span>Amount to pay</span>
            <strong>₹{Number(page.amount || 0).toLocaleString('en-IN')}</strong>
          </div>
          <div className="payment-qr" ref={qrRef}>
            <QRCodeCanvas value={upi} size={210} level="M" includeMargin/>
            <p>Scan with any UPI app</p>
            <button className="download-qr" onClick={downloadQR}>Download QR</button>
          </div>
          <div className="upi-apps">
            <a href={upiLinks.gpay} onClick={() => api.event({ slug, event: 'pay_click_gpay' })} className="upi-btn gpay">
              <span>₹</span> Google Pay
            </a>
            <a href={upiLinks.phonepe} onClick={() => api.event({ slug, event: 'pay_click_phonepe' })} className="upi-btn phonepe">
              <span>₹</span> PhonePe
            </a>
            <a href={upiLinks.paytm} onClick={() => api.event({ slug, event: 'pay_click_paytm' })} className="upi-btn paytm">
              <span>₹</span> Paytm
            </a>
            <a href={upiLinks.bhim} onClick={() => api.event({ slug, event: 'pay_click_bhim' })} className="upi-btn bhim">
              <span>₹</span> BHIM
            </a>
          </div>
          <a className="payment-cta" href={upi} onClick={() => api.event({ slug, event: 'pay_click' })}>Pay with any UPI app <b>→</b></a>
          <p className="payment-note">{page.paymentNote}</p>
          <div className="payment-safe"><span>✓</span> UPI payment is completed in your payment app.</div>
          {links.length > 0 && <div className="payment-socials">
            {links.map(([name, url]) => <a key={name} href={url.startsWith('http') ? url : `https://${url}`} target="_blank" rel="noreferrer">{name}</a>)}
          </div>}
        </article>
      </section>
      <footer className="payment-footer">
        <span>Powered by PayLink</span>
        <div>
          <Link to="/legal/privacy">Privacy</Link>
          <Link to="/legal/terms">Terms</Link>
          <Link to="/legal/refund">Refund</Link>
        </div>
      </footer>
    </main>
  )
}
function PaymentSkeleton() {
  return (
    <main className="payment-page payment-skeleton">
      <section className="payment-layout">
        <article className="payment-intro">
          <div className="skel skel-banner"/>
          <div className="payment-intro-copy">
            <div className="skel skel-kicker"/>
            <div className="skel skel-title"/>
            <div className="skel skel-title short"/>
            <div className="skel skel-copy"/>
            <div className="skel skel-owner"/>
          </div>
        </article>
        <article className="payment-card">
          <div className="skel skel-amount"/>
          <div className="skel skel-qr"/>
          <div className="skel skel-button"/>
          <div className="skel skel-copy"/>
        </article>
      </section>
    </main>
  )
}
