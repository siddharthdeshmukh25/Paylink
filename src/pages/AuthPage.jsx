import { useState } from 'react'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth'
import { auth, googleProvider } from '../lib/firebase'
import { useNavigate } from 'react-router-dom'

export function AuthPage() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [notice, setNotice] = useState('')
  const navigate = useNavigate()

  const submit = async e => {
    e.preventDefault()
    try {
      mode === 'signup' ? await createUserWithEmailAndPassword(auth, email, password) : await signInWithEmailAndPassword(auth, email, password)
      navigate('/dashboard')
    } catch (err) {
      let msg = err.message.replace('Firebase: ', '')
      if (err.code === 'auth/operation-not-allowed') msg = 'Email/Password sign-in is disabled. Enable it in Firebase Console → Authentication → Sign-in method.'
      setNotice(msg)
    }
  }

  return (
    <main className="auth">
      <section>
        <a className="wordmark" href="/"><i>P</i>PayLink</a>
        <p className="kicker">PAYPAGES</p>
        <h1>One page.<br/><em>Every</em> payment.</h1>
        <p>Build your public bio, payment and course page in a few focused steps.</p>
      </section>
      <form className="auth-card" onSubmit={submit}>
        <h2>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
        <p>Use your PayLink workspace to publish.</p>
        {notice && <div className="notice">{notice}</div>}
        <label>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} required/></label>
        <label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} minLength="6" required/></label>
        <button className="primary">{mode === 'login' ? 'Sign in' : 'Create account'} <b>→</b></button>
        <button type="button" className="google" onClick={() => signInWithPopup(auth, googleProvider).then(() => navigate('/dashboard')).catch(e => setNotice(e.message))}>Continue with Google</button>
        {mode === 'login' && <button type="button" className="text-btn" onClick={() => sendPasswordResetEmail(auth, email).then(() => setNotice('Password reset email sent.')).catch(e => setNotice(e.message))}>Forgot password?</button>}
        <button type="button" className="text-btn" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>{mode === 'login' ? 'New here? Create account' : 'Already have an account? Sign in'}</button>
      </form>
    </main>
  )
}
