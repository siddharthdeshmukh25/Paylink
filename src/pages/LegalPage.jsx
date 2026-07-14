import { useParams, Link } from 'react-router-dom'

const titles = {
  privacy: 'Privacy Policy',
  terms: 'Terms & Conditions',
  refund: 'Refund Policy',
  cookies: 'Cookie Policy',
  contact: 'Contact Us',
  disclaimer: 'Disclaimer'
}

export function LegalPage() {
  const { type } = useParams()
  const title = titles[type] || 'Legal'

  return (
    <main className='legal'>
      <Link className='wordmark' to='/'><i>P</i>PayLink</Link>
      <p className='kicker'>LEGAL</p>
      <h1>{title}</h1>
      <p>This page explains the rules and information relating to PayLink. Page owners are responsible for their own products, payment instructions and customer communication.</p>
      <h2>Our commitment</h2>
      <p>We use reasonable measures to keep the platform secure. Payment is completed directly through the user's chosen UPI application. PayLink does not process or hold payment funds.</p>
      <h2>Contact</h2>
      <p>For questions about a published page, contact its page owner directly.</p>
    </main>
  )
}

