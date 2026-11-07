import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'
import { useTeam } from '../lib/team.jsx'
import { Avatar } from '../components/Bits.jsx'

// Shown after the team code, and from Settings → "Switch person".
export default function WhoAreYou() {
  const { choosePerson } = useAuth()
  const { people, loading, addPerson } = useTeam()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  function pick(id, isNew) {
    choosePerson(id)
    navigate(isNew ? '/profile/edit' : '/')
  }

  async function addMe(e) {
    e.preventDefault()
    if (!name.trim()) return
    setBusy(true)
    const { id, error: err } = await addPerson(name.trim())
    setBusy(false)
    if (err) return setError("Couldn't add you: " + err)
    pick(id, true)
  }

  return (
    <main className="center-page">
      <div style={{ width: '100%', maxWidth: 520 }}>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <img src="/icon.svg" alt="" width="48" height="48" />
          <h1 style={{ marginTop: 8 }}>Who are you?</h1>
          <p className="muted" style={{ margin: '4px 0 0' }}>Tap your name. This device will remember you.</p>
        </div>

        {loading && <p className="muted" style={{ textAlign: 'center' }}>Loading…</p>}
        <div className="grid-2">
          {people.map((p) => (
            <button key={p.id} className="card person-pick" onClick={() => pick(p.id)}>
              <Avatar person={p} size="lg" />
              <b>{p.name || p.email || 'New member'}</b>
              <span className="small muted">{p.roles.join(' · ') || ' '}</span>
            </button>
          ))}
        </div>

        <form className="card" onSubmit={addMe} style={{ marginTop: 12 }}>
          <span className="label">Not on the list?</span>
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your first name" />
            <button className="btn" disabled={busy || !name.trim()}>Add me</button>
          </div>
          {error && <p className="alert" style={{ marginBottom: 0 }}>{error}</p>}
        </form>
      </div>
    </main>
  )
}
