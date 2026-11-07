import { useState } from 'react'
import Sheet from './Sheet.jsx'
import { useTeam } from '../lib/team.jsx'
import { useAuth } from '../lib/auth.jsx'
import { useData, todayISO } from '../lib/data.jsx'

// Turns "$1,234.50" or "12" into a number; NaN if it isn't one.
const parseAmount = (text) => Number(String(text).replace(/[$,\s]/g, ''))

export default function ExpenseSheet({ expense, onClose }) {
  const { people } = useTeam()
  const { userId } = useAuth()
  const { categories, addExpense, updateExpense, deleteExpense } = useData()
  const isNew = !expense
  const [form, setForm] = useState({
    item: expense?.item || '',
    amount: expense ? String(expense.amount) : '',
    category_id: expense?.category_id ?? categories[0]?.id ?? '',
    date: expense?.date || todayISO(),
    paid_by: expense?.paid_by ?? userId ?? '',
    note: expense?.note || '',
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  async function save(e) {
    e.preventDefault()
    const amount = Math.round(parseAmount(form.amount) * 100) / 100
    if (!form.item.trim()) return setError('What was it for?')
    if (!(amount > 0)) return setError('Type an amount, e.g. 24.99')
    setBusy(true)
    const payload = {
      item: form.item.trim(),
      amount,
      category_id: form.category_id === '' ? null : categories.find((c) => String(c.id) === String(form.category_id))?.id ?? null,
      date: form.date || todayISO(),
      paid_by: form.paid_by || null,
      note: form.note.trim(),
    }
    const err = isNew ? await addExpense(payload) : await updateExpense(expense.id, payload)
    setBusy(false)
    if (err) return setError("Couldn't save: " + err)
    onClose()
  }

  async function remove() {
    if (!window.confirm(`Delete "${expense.item}"? This can't be undone.`)) return
    const err = await deleteExpense(expense.id)
    if (err) return setError("Couldn't delete: " + err)
    onClose()
  }

  return (
    <Sheet title={isNew ? 'Add expense' : 'Edit expense'} onClose={onClose} onSubmit={save}>
      <label>
        <span className="label">What was it?</span>
        <input className="field" autoFocus={isNew} value={form.item} onChange={(e) => set('item', e.target.value)} placeholder="e.g. Runway, 1 month" />
      </label>

      <div className="grid-2">
        <label>
          <span className="label">Amount (NZD)</span>
          <div className="money-input">
            <span>$</span>
            <input className="field" inputMode="decimal" value={form.amount} onChange={(e) => set('amount', e.target.value)} placeholder="0.00" />
          </div>
        </label>
        <label>
          <span className="label">Date</span>
          <input className="field" type="date" value={form.date} onChange={(e) => set('date', e.target.value)} />
        </label>
      </div>

      <div className="grid-2">
        <label>
          <span className="label">Category</span>
          <select className="field" value={form.category_id ?? ''} onChange={(e) => set('category_id', e.target.value)}>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            <option value="">No category</option>
          </select>
        </label>
        <label>
          <span className="label">Who paid</span>
          <select className="field" value={form.paid_by ?? ''} onChange={(e) => set('paid_by', e.target.value)}>
            <option value="">Not sure</option>
            {people.map((p) => <option key={p.id} value={p.id}>{p.name || p.email}</option>)}
          </select>
        </label>
      </div>

      <label>
        <span className="label">Note (optional)</span>
        <input className="field" value={form.note} onChange={(e) => set('note', e.target.value)} placeholder="Receipt link, monthly or one-off…" />
      </label>

      {error && <p className="alert" style={{ margin: 0 }}>{error}</p>}

      <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
        {!isNew ? <button type="button" className="btn ghost danger" onClick={remove}>Delete</button> : <span />}
        <button className="btn" disabled={busy}>{busy ? 'Saving…' : isNew ? 'Add expense' : 'Save'}</button>
      </div>
    </Sheet>
  )
}
