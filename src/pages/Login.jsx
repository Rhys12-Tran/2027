import { useState } from 'react'
import { useAuth } from '../lib/auth.jsx'
import { isDemo } from '../lib/supabase.js'

export default function Login() {
  const { signInWithCode } = useAuth()
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const err = await signInWithCode(code.trim())
    setBusy(false)
    if (err) setError(err)
  }

  return (
    <main className="center-page">
      <form className="card" style={{ width: '100%', maxWidth: 380, textAlign: 'center' }} onSubmit={submit}>
        <img src={`${import.meta.env.BASE_URL}icon.svg`} alt="" width="56" height="56" />
        <h1 style={{ margin: '12px 0 4px' }}>Film Crew HQ</h1>
        <p className="muted" style={{ marginTop: 0 }}>Type the team code. You only need to do this once on each device.</p>
        <input
          className="field"
          type="password"
          required
          autoComplete="current-password"
          placeholder="Team code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          style={{ marginBottom: 12, textAlign: 'center' }}
        />
        <button className="btn" style={{ width: '100%' }} disabled={isDemo || busy}>{busy ? 'Checking…' : 'Enter'}</button>
        {error && <p className="alert" style={{ marginBottom: 0 }}>{error}</p>}
        {isDemo && <p className="notice" style={{ marginTop: 12 }}>Demo mode: the team code works once Supabase is connected.</p>}
      </form>
    </main>
  )
}
