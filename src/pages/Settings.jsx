import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTeam } from '../lib/team.jsx'
import { useAuth } from '../lib/auth.jsx'
import { useData } from '../lib/data.jsx'

function Switch({ on, onChange, label }) {
  return (
    <button type="button" className={'switch' + (on ? ' on' : '')} role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)}>
      <span />
    </button>
  )
}

export default function Settings() {
  const { me, roles, people, updateMe, addRole, removeRole } = useTeam()
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const { competition, updateCompetition } = useData()
  const [newRole, setNewRole] = useState('')
  const [error, setError] = useState(null)

  const save = async (changes) => setError(await updateMe(changes))
  const saveCompetition = async (changes) => setError(await updateCompetition(changes))

  async function onAddRole() {
    setError(await addRole(newRole))
    setNewRole('')
  }

  async function onRemoveRole(r) {
    const using = people.filter((p) => p.roles.includes(r)).length
    if (using && !window.confirm(`${using} ${using === 1 ? 'person has' : 'people have'} this role. Remove it from the list anyway? (Their profiles keep it.)`)) return
    setError(await removeRole(r))
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Settings</h1>
          <p>Competition details, your alerts and the role list</p>
        </div>
      </div>

      <div className="grid" style={{ maxWidth: 640 }}>
        {error && <p className="alert" style={{ margin: 0 }}>{error}</p>}

        <section className="card">
          <h2>Tell me when…</h2>
          {me ? (
            <>
              <div className="row"><span className="grow">Anything changes in the Checklist</span><Switch label="Checklist changes" on={me.notify_checklist} onChange={(v) => save({ notify_checklist: v })} /></div>
              <div className="row"><span className="grow">Anything changes in the Budget</span><Switch label="Budget changes" on={me.notify_budget} onChange={(v) => save({ notify_budget: v })} /></div>
              <div className="row">
                <span className="grow">Also send email</span>
                <select className="field" style={{ width: 'auto' }} value={me.email_mode} onChange={(e) => save({ email_mode: e.target.value })}>
                  <option value="off">No email</option>
                  <option value="daily">One daily summary</option>
                  <option value="every">Every change</option>
                </select>
              </div>
              <p className="small muted" style={{ marginBottom: 0 }}>You'll always hear about tasks given to you, close deadlines and going over budget. Alerts start working in step 6, emails in step 9.</p>
            </>
          ) : <p className="muted">Loading…</p>}
        </section>

        <section className="card">
          <h2>Roles</h2>
          <p className="small muted" style={{ marginTop: 0 }}>The list people pick from on their profile.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
            {roles.map((r) => (
              <button type="button" key={r} className="tag removable" onClick={() => onRemoveRole(r)} aria-label={`Remove ${r}`}>{r} ×</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="field" value={newRole} onChange={(e) => setNewRole(e.target.value)} placeholder="New role, e.g. Colourist" onKeyDown={(e) => e.key === 'Enter' && onAddRole()} />
            <button type="button" className="btn ghost" onClick={onAddRole}>Add</button>
          </div>
        </section>

        <section className="card grid">
          <h2 style={{ margin: 0 }}>Competition</h2>
          {competition ? (
            <>
              <label>
                <span className="label">Name</span>
                <input
                  className="field"
                  defaultValue={competition.name}
                  key={competition.name}
                  onBlur={(e) => e.target.value.trim() && e.target.value.trim() !== competition.name && saveCompetition({ name: e.target.value.trim() })}
                />
              </label>
              <label>
                <span className="label">Deadline</span>
                <input className="field" type="date" value={competition.deadline || ''} onChange={(e) => saveCompetition({ deadline: e.target.value || null })} />
              </label>
              <p className="small muted" style={{ margin: 0 }}>Changes save straight away for the whole team. The total budget is set on the Budget page (step 4).</p>
            </>
          ) : <p className="muted">Loading…</p>}
        </section>

        <section className="card">
          <h2>Account</h2>
          <div className="row"><span className="grow muted">On this device you are</span><b>{me?.name || '…'}</b></div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
            <button className="btn ghost" onClick={() => navigate('/who')}>Switch person</button>
            <button className="btn ghost" onClick={signOut}>Sign out of this device</button>
          </div>
        </section>
      </div>
    </>
  )
}
