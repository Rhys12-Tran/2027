import { useState } from 'react'
import Sheet from './Sheet.jsx'
import { useTeam } from '../lib/team.jsx'
import { useData, STATUSES } from '../lib/data.jsx'
import { PHASES } from '../data/sample.js'

// Pop-up for adding or editing one task. Slides up from the bottom on phones.
export default function TaskSheet({ task, defaultPhase, onClose }) {
  const { people } = useTeam()
  const { addTask, updateTask, deleteTask } = useData()
  const isNew = !task
  const [form, setForm] = useState({
    title: task?.title || '',
    phase: task?.phase || defaultPhase || 'idea',
    owner: task?.owner || '',
    due: task?.due || '',
    status: task?.status || 'Not started',
    is_lesson: task?.is_lesson || false,
    note: task?.note || '',
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  async function save(e) {
    e.preventDefault()
    if (!form.title.trim()) return setError('Give the task a name.')
    setBusy(true)
    const payload = { ...form, title: form.title.trim(), note: form.note.trim(), owner: form.owner || null, due: form.due || null }
    const err = isNew ? await addTask(payload) : await updateTask(task.id, payload)
    setBusy(false)
    if (err) return setError("Couldn't save: " + err)
    onClose()
  }

  async function remove() {
    if (!window.confirm(`Delete "${task.title}"? This can't be undone.`)) return
    const err = await deleteTask(task.id)
    if (err) return setError("Couldn't delete: " + err)
    onClose()
  }

  return (
    <Sheet title={isNew ? 'Add task' : 'Edit task'} onClose={onClose} onSubmit={save}>
      <label>
        <span className="label">Task</span>
        <input className="field" autoFocus={isNew} value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Write script draft 2" />
      </label>

      <div className="grid-2">
        <label>
          <span className="label">Phase</span>
          <select className="field" value={form.phase} onChange={(e) => set('phase', e.target.value)}>
            {PHASES.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>
        <label>
          <span className="label">Status</span>
          <select className="field" value={form.status} onChange={(e) => set('status', e.target.value)}>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
      </div>

      <div className="grid-2">
        <label>
          <span className="label">Who's doing it</span>
          <select className="field" value={form.owner} onChange={(e) => set('owner', e.target.value)}>
            <option value="">Nobody yet</option>
            {people.map((p) => <option key={p.id} value={p.id}>{p.name || p.email}</option>)}
          </select>
        </label>
        <label>
          <span className="label">Due date</span>
          <input className="field" type="date" value={form.due} onChange={(e) => set('due', e.target.value)} />
        </label>
      </div>

      <label>
        <span className="label">Note (optional)</span>
        <textarea className="field" rows={2} value={form.note} onChange={(e) => set('note', e.target.value)} placeholder="Links, details, anything useful" />
      </label>

      <label style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <input type="checkbox" checked={form.is_lesson} onChange={(e) => set('is_lesson', e.target.checked)} style={{ width: 20, height: 20 }} />
        <span>💡 This came from a lesson learned</span>
      </label>

      {error && <p className="alert" style={{ margin: 0 }}>{error}</p>}

      <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
        {!isNew ? <button type="button" className="btn ghost danger" onClick={remove}>Delete</button> : <span />}
        <button className="btn" disabled={busy}>{busy ? 'Saving…' : isNew ? 'Add task' : 'Save'}</button>
      </div>
    </Sheet>
  )
}
