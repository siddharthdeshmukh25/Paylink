import { useEffect, useState } from 'react'
import { onAuthStateChanged, sendPasswordResetEmail, signOut, updateProfile } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { api } from '../lib/api'
import { QRCodeSVG } from 'qrcode.react'
import { useNavigate, useSearchParams } from 'react-router-dom'

const blank = {
  username: '',
  upiId: '',
  courseName: '',
  amount: '',
  paymentNote: '',
  logo: '',
  banner: '',
  themeColor: '#316bff',
  socialLinks: {}
}

const imageRules = {
  logo: { label: 'Logo', maxBytes: 1024 * 1024, maxWidth: 1200, maxHeight: 1200 },
  banner: { label: 'Banner image', maxBytes: 2 * 1024 * 1024, maxWidth: 1920, maxHeight: 1080 }
}

async function validateImage(file, key) {
  const rule = imageRules[key]
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Use a JPG, PNG, or WebP image.')
  if (file.size > rule.maxBytes) throw new Error(`${rule.label} must be ${rule.maxBytes / 1024 / 1024} MB or smaller.`)
  const url = URL.createObjectURL(file)
  try {
    const image = await new Promise((resolve, reject) => {
      const preview = new Image()
      preview.onload = () => resolve(preview)
      preview.onerror = () => reject(new Error('This image file could not be read.'))
      preview.src = url
    })
    if (image.naturalWidth > rule.maxWidth || image.naturalHeight > rule.maxHeight) throw new Error(`${rule.label} must be no larger than ${rule.maxWidth} × ${rule.maxHeight}px.`)
  } finally { URL.revokeObjectURL(url) }
}

export function DashboardApp() {
  const [user, setUser] = useState(null)
  const [pages, setPages] = useState([])
  const [page, setPage] = useState(blank)
  const [searchParams, setSearchParams] = useSearchParams()
  const [tab, setTab] = useState(searchParams.get('view') || 'editor')
  const [notice, setNotice] = useState('')
  const [uploading, setUploading] = useState('')
  const [metrics, setMetrics] = useState(null)
  const [newPage, setNewPage] = useState(false)
  const [authReady, setAuthReady] = useState(false)
  const [profile, setProfile] = useState(null)
  const navigate = useNavigate()

  const load = async () => {
    const result = await api.me()
    setPages(result.pages || [])
    return result.pages || []
  }

  useEffect(() => {
    return onAuthStateChanged(auth, async current => {
      setAuthReady(true)
      if (!current) return navigate('/login', { replace: true })
      setUser(current)
      try {
        const [, profileResult] = await Promise.all([load(), api.profile()])
        setProfile(profileResult.profile)
      } catch (e) {
        setNotice(e.message)
      }
    })
  }, [navigate])

  const selectTab = next => { setTab(next); setSearchParams(next === 'editor' ? {} : { view: next }) }

  useEffect(() => {
    if (tab === 'analytics') {
      api.analytics().then(setMetrics).catch(e => setNotice(e.message))
    }
    if (tab === 'pages') {
      load().catch(e => setNotice(e.message))
    }
  }, [tab])

  const update = (key, value) => setPage(p => ({ ...p, [key]: value }))

  const edit = p => {
    setPage(p)
    setNewPage(false)
    selectTab('editor')
  }

  const create = () => {
    setPage(blank)
    setNewPage(true)
    setNotice('New private page draft ready. Add details or upload an image.')
    selectTab('editor')
  }

  const upload = async (event, key) => {
    const file = event.target.files?.[0]
    try {
      if (!file) return
      await validateImage(file, key)
      setUploading(key)
      const reader = new FileReader()
      const data = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      const image = await api.upload({ data, folder: 'nexforge-paypages' })
      const saved = await api.save({ ...page, [key]: image.url, draft: true, newPage })
      setPage(saved.page)
      setNewPage(false)
      await load()
      setNotice(`${key === 'logo' ? 'Logo' : 'Banner'} uploaded and draft saved.`)
    } catch (e) {
      setNotice(`Upload failed: ${e.message}`)
    } finally {
      setUploading('')
      event.target.value = ''
    }
  }

  const publish = async () => {
    try {
      setNotice('Publishing…')
      const saved = await api.save({ ...page, newPage })
      setPage(saved.page)
      setNewPage(false)
      await load()
      setNotice(`Published: /p/${saved.page.slug}`)
    } catch (e) {
      setNotice(e.message)
    }
  }

  const saveProfile = async event => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const savedProfile = await api.saveProfile({ fullName: form.get('name'), photoURL: form.get('photo') })
    await updateProfile(auth.currentUser, { displayName: savedProfile.profile.fullName, photoURL: savedProfile.profile.photoURL })
    setProfile(savedProfile.profile)
    setUser({ ...auth.currentUser })
    setNotice('Profile updated.')
  }

  if (!authReady) return <DashboardSkeleton/>
  if (!user) return null

  return (
    <div className="studio">
      <aside className="studio-nav">
        <a className="studio-brand" href="/dashboard"><i>P</i>PayLink</a>
        <button className={tab === 'editor' ? 'active' : ''} onClick={() => selectTab('editor')}>Page editor</button>
        <button className={tab === 'pages' ? 'active' : ''} onClick={() => selectTab('pages')}>My pages</button>
        <button className={tab === 'analytics' ? 'active' : ''} onClick={() => selectTab('analytics')}>Analytics</button>
        <button className={tab === 'profile' ? 'active' : ''} onClick={() => selectTab('profile')}>Profile</button>
        <button className="studio-signout" onClick={() => signOut(auth)}>Log out</button>
      </aside>
      <main className="studio-main">
        <header className="studio-head">
          <div>
            <p>{tab === 'editor' ? 'PAYMENT PAGE BUILDER' : tab.toUpperCase()}</p>
            <h1>{tab === 'editor' ? 'Page editor' : tab === 'pages' ? 'My pages' : tab === 'analytics' ? 'Analytics' : 'Your profile'}</h1>
          </div>
          <button className="avatar" onClick={() => selectTab('profile')}>
            {(profile?.photoURL || user.photoURL) ? <img src={profile?.photoURL || user.photoURL} alt=""/> : (profile?.fullName || user.displayName || user.email)[0].toUpperCase()}
          </button>
        </header>
        {notice && <div className="studio-notice">{notice}</div>}
        {tab === 'editor' ? <Editor page={page} update={update} upload={upload} uploading={uploading} publish={publish}/> :
         tab === 'pages' ? <Pages pages={pages} edit={edit} create={create}/> :
         tab === 'analytics' ? <Analytics metrics={metrics}/> :
         <Profile user={user} profile={profile} save={saveProfile} reset={() => sendPasswordResetEmail(auth, user.email).then(() => setNotice('Password reset link sent to your email.')).catch(e => setNotice(e.message))}/>}
      </main>
    </div>
  )
}

function Editor({ page, update, upload, uploading, publish }) {
  const upi = `upi://pay?pa=${encodeURIComponent(page.upiId || 'name@bank')}&pn=${encodeURIComponent(page.username || 'NexForge')}&am=${page.amount || 0}&tn=${encodeURIComponent(page.courseName || 'Payment')}&cu=INR`
  return (
    <div className="editor-layout">
      <section className="form-card">
        <div className="card-head">
          <div>
            <h2>Page details</h2>
            <p>Drafts save after each image upload.</p>
          </div>
          <button className="primary-action" onClick={publish}>Publish</button>
        </div>
        <div className="form-grid">
          {[['username', 'Your name'], ['upiId', 'UPI ID'], ['courseName', 'Course / product'], ['amount', 'Amount (₹)'], ['paymentNote', 'Payment note']].map(([key, label]) =>
            <label key={key}>
              {label}
              <input type={key === 'amount' ? 'number' : 'text'} value={page[key] || ''} onChange={e => update(key, e.target.value)} placeholder={key === 'upiId' ? 'name@bank' : ''}/>
            </label>
          )}
        </div>
        <div className="asset-row">
          {[['logo', 'Logo'], ['banner', 'Banner image']].map(([key, label]) =>
            <label className="asset" key={key}>
              {uploading === key ? <span className="loader"/> : page[key] ? <img src={page[key]} alt=""/> : <span>+</span>}
              <input type="file" accept="image/*" disabled={Boolean(uploading)} onChange={e => upload(e, key)}/>
              <b>{uploading === key ? 'Uploading…' : page[key] ? `Change ${label}` : label}</b>
            </label>
          )}
        </div>
        <label className="color-field">Theme colour <input type="color" value={page.themeColor} onChange={e => update('themeColor', e.target.value)}/></label>
        <p className="auto-copy">Slug and SEO are generated automatically. Publish to make this page public.</p>
      </section>
      <aside className="mini-preview" style={{ '--accent': page.themeColor }}>
        {page.banner && <img className="mini-banner" src={page.banner} alt=""/>}
        {page.logo ? <img className="mini-logo" src={page.logo} alt=""/> : <i>{(page.username || 'N')[0]}</i>}
        <h3>{page.courseName || 'Your course name'}</h3>
        <strong>₹{page.amount || 0}</strong>
        <QRCodeSVG value={upi} size={120}/>
        <button>Pay now</button>
      </aside>
    </div>
  )
}
function Pages({ pages, edit, create }) {
  return (
    <section className="pages-view">
      <div className="section-toolbar">
        <p>{pages.length} page{pages.length !== 1 ? 's' : ''}</p>
        <button className="primary-action" onClick={create}>+ Create new</button>
      </div>
      <div className="compact-pages">
        {pages.map(p =>
          <article key={p.pageId || p.slug} className="compact-page">
            {p.logo ? <img src={p.logo} alt=""/> : <i>{(p.username || 'N')[0]}</i>}
            <div>
              <b>{p.courseName || 'Untitled payment page'}</b>
              <small>/p/{p.slug}</small>
            </div>
            <span className={p.published ? 'state live' : 'state'}>{p.published ? 'Live' : 'Draft'}</span>
            <button onClick={() => edit(p)}>Edit</button>
            {p.published && <a href={`/p/${p.slug}`} target="_blank" rel="noreferrer">View ↗</a>}
          </article>
        )}
      </div>
    </section>
  )
}
function Analytics({ metrics }) {
  if (!metrics) return <section className="loading-card">Loading analytics…</section>
  return (
    <section className="analytics-view">
      <div className="metric-row">
        <Metric label="Views" value={metrics.total.views}/>
        <Metric label="Pay clicks" value={metrics.total.clicks}/>
        <Metric label="QR scans" value={metrics.total.scans}/>
      </div>
      <div className="analytics-table">
        <div className="table-head">
          <span>Payment page</span>
          <span>Views</span>
          <span>Clicks</span>
          <span>Scans</span>
        </div>
        {metrics.pages.map(p =>
          <div className="table-row" key={p.pageId || p.slug}>
            <span><b>{p.courseName || 'Untitled'}</b><small>/p/{p.slug}</small></span>
            <span>{p.views || 0}</span>
            <span>{p.payClicks || 0}</span>
            <span>{p.qrScans || 0}</span>
          </div>
        )}
      </div>
    </section>
  )
}
function Metric({ label, value }) {
  return <article className="metric"><small>{label}</small><b>{value || 0}</b></article>
}
function DashboardSkeleton() {
  return <main className="dashboard-skeleton"><aside><i/><i/><i/><i/></aside><section><div className="skel-head"><i/><i/></div><div className="skel-cards"><i/><i/><i/></div><div className="skel-panel"><i/><i/><i/><i/></div></section></main>
}
function Profile({ user, profile, save, reset }) {
  return (
    <form className="profile-card profile-pro" onSubmit={save}>
      <div className="profile-top"><div className="profile-avatar">{(profile?.photoURL || user.photoURL) ? <img src={profile?.photoURL || user.photoURL} alt=""/> : (profile?.fullName || user.displayName || user.email)[0].toUpperCase()}</div><div><p>ACCOUNT PROFILE</p><h2>{profile?.fullName || user.displayName || 'Your profile'}</h2><span>{user.email}</span></div></div>
      <div className="profile-grid"><label>Full name<input name="name" defaultValue={profile?.fullName || user.displayName || ''} placeholder="Your name"/></label><label>Email address<input value={user.email || ''} disabled/></label></div>
      <label>Profile image URL<input name="photo" defaultValue={profile?.photoURL || user.photoURL || ''} placeholder="https://…"/></label>
      <section className="security-box"><div><b>Account security</b><span>Password is managed securely through Firebase Authentication.</span></div><button className="text-action" type="button" onClick={reset}>Reset password</button></section>
      <button className="primary-action">Save changes</button>
    </form>
  )
}
