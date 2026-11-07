import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTeam } from '../lib/team.jsx'
import { Avatar } from '../components/Bits.jsx'

export default function ProfileEdit() {
  const { me, roles, updateMe, uploadPhoto, addRole } = useTeam()
  const navigate = useNavigate()
  const [form, setForm] = useState(null)
  const [newRole, setNewRole] = useState('')
  const [newSkill, setNewSkill] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (me && !form) {
      setForm({ name: me.name, email: me.email || '', roles: me.roles, skills: me.skills, phone: me.phone || '', other_contact: me.other_contact || '', photo_url: me.photo_url })
    }
  }, [me, form])

  if (!form) return <p className="muted">Loading…</p>

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))
  const toggleRole = (r) => set('roles', form.roles.includes(r) ? form.roles.filter((x) => x !== r) : [...form.roles, r])

  async function onAddRole() {
    const name = newRole.trim()
    if (!name) return
    const err = await addRole(name)
    if (err) return setError(err)
    if (!form.roles.includes(name)) set('roles', [...form.roles, name])
    setNewRole('')
  }

  function onAddSkill() {
    const s = newSkill.trim()
    if (s && !form.skills.includes(s)) set('skills', [...form.skills, s])
    setNewSkill('')
  }

  async function onPhoto(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return setError('Please pick a photo (JPG or PNG).')
    setBusy(true)
    setError(null)
    const { url, error: err } = await uploadPhoto(file)
    setBusy(false)
    if (err) return setError("Couldn't upload the photo: " + err)
    set('photo_url', url)
  }

  async function save(e) {
    e.preventDefault()
    if (!form.name.trim()) return setError('Please add your name.')
    setBusy(true)
    const err = await updateMe({ ...form, name: form.name.trim(), email: form.email.trim() || null, phone: form.phone.trim(), other_contact: form.other_contact.trim() })
    setBusy(false)
    if (err) return setError("Couldn't save: " + err)
    navigate(`/team/${me.id}`)
  }

  return (
    <form onSubmit={save}>
      <p style={{ margin: '4px 0 12px' }}><Link to="/team" className="small">← Team</Link></p>
      <div className="page-head"><h1>My profile</h1></div>

      <div className="grid" style={{ maxWidth: 560 }}>
        <section className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Avatar person={{ ...me, ...form }} size="xl" />
          <label className="btn ghost">
            {busy ? 'Uploading…' : form.photo_url ? 'Change photo' : 'Add photo'}
            <input type="file" accept="image/*" onChange={onPhoto} hidden />
          </label>
        </section>

        <section className="card grid">
          <label>
            <span className="label">Name</span>
            <input className="field" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Your first name" />
          </label>
          <label>
            <span className="label">Email (optional, for alerts later)</span>
            <input className="field" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="you@example.com" />
          </label>
          <label>
            <span className="label">Phone (optional)</span>
            <input className="field" type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="021 123 4567" />
          </label>
          <label>
            <span className="label">Other contact (optional)</span>
            <input className="field" value={form.other_contact} onChange={(e) => set('other_contact', e.target.value)} placeholder="Discord, Instagram…" />
          </label>
        </section>

        <section className="card">
          <span className="label">My roles · tap to pick</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '8px 0 12px' }}>
            {roles.map((r) => (
              <button type="button" key={r} className={'chip' + (form.roles.includes(r) ? ' active' : '')} onClick={() => toggleRole(r)}>{r}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="field" value={newRole} onChange={(e) => setNewRole(e.target.value)} placeholder="Add a new role" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), onAddRole())} />
            <button type="button" className="btn ghost" onClick={onAddRole}>Add</button>
          </div>
        </section>

        <section className="card">
          <span className="label">My skills</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, margin: '8px 0 12px' }}>
            {form.skills.length === 0 && <span className="small muted">None yet, e.g. Runway, Premiere Pro, voice acting</span>}
            {form.skills.map((s) => (
              <button type="button" key={s} className="tag removable" onClick={() => set('skills', form.skills.filter((x) => x !== s))} aria-label={`Remove ${s}`}>{s} ×</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="field" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="Add a skill" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), onAddSkill())} />
            <button type="button" className="btn ghost" onClick={onAddSkill}>Add</button>
          </div>
        </section>

        {error && <p className="alert" style={{ margin: 0 }}>{error}</p>}
        <button className="btn" disabled={busy}>Save profile</button>
      </div>
    </form>
  )
}
