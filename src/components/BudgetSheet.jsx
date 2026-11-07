import { useState } from 'react'
import Sheet from './Sheet.jsx'
import { useData } from '../lib/data.jsx'
import { nzd } from '../data/sample.js'

const toNumber = (text) => {
  const n = Number(String(text).replace(/[$,\s]/g, ''))
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : NaN
}

// Set the total budget and how much each category is allowed. Categories can be renamed, added and removed here.
export default function BudgetSheet({ onClose }) {
  const { competition, categories, expenses, updateCompetition, addCategory, updateCategory, deleteCategory } = useData()
  const [total, setTotal] = useState(String(Number(competition?.total_budget || 0)))
  const [rows, setRows] = useState(categories.map((c) => ({ id: c.id, name: c.name, planned: String(Number(c.planned)) })))
  const [newName, setNewName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const setRow = (id, key, value) => setRows((list) => list.map((r) => (r.id === id ? { ...r, [key]: value } : r)))
  const plannedSum = rows.reduce((s, r) => s + (toNumber(r.planned) || 0), 0)
  const totalNum = toNumber(total)

  async function onAdd() {
    const name = newName.trim()
    if (!name) return
    if (categories.some((c) => c.name.toLowerCase() === name.toLowerCase())) return setError('That category already exists.')
    const err = await addCategory(name)
    if (err) return setError(err)
    setRows((list) => [...list, { id: 'new-' + name, name, planned: '0', pending: true }])
    setNewName('')
  }

  async function onDelete(row) {
    const used = expenses.filter((e) => e.category_id === row.id).length
    const msg = used
      ? `Remove "${row.name}"? Its ${used} expense${used === 1 ? '' : 's'} will be kept as "No category".`
      : `Remove "${row.name}"?`
    if (!window.confirm(msg)) return
    const err = await deleteCategory(row.id)
    if (err) return setError(err)
    setRows((list) => list.filter((r) => r.id !== row.id))
  }

  async function save(e) {
    e.preventDefault()
    if (Number.isNaN(totalNum)) return setError('The total budget needs to be a number, e.g. 600')
    const bad = rows.find((r) => Number.isNaN(toNumber(r.planned)) || !r.name.trim())
    if (bad) return setError(`Check "${bad.name || 'a category'}": it needs a name and an amount.`)
    setBusy(true)
    const jobs = []
    if (totalNum !== Number(competition?.total_budget || 0)) jobs.push(updateCompetition({ total_budget: totalNum }))
    // Newly added categories only exist once reloaded, so match them by name.
    for (const r of rows) {
      const c = categories.find((x) => x.id === r.id) || categories.find((x) => x.name === r.name)
      if (!c) continue
      const changes = {}
      if (r.name.trim() !== c.name) changes.name = r.name.trim()
      if (toNumber(r.planned) !== Number(c.planned)) changes.planned = toNumber(r.planned)
      if (Object.keys(changes).length) jobs.push(updateCategory(c.id, changes))
    }
    const err = (await Promise.all(jobs)).find(Boolean)
    setBusy(false)
    if (err) return setError("Couldn't save: " + err)
    onClose()
  }

  return (
    <Sheet title="Set budget" onClose={onClose} onSubmit={save}>
      <label>
        <span className="label">Total budget (NZD)</span>
        <div className="money-input">
          <span>$</span>
          <input className="field" inputMode="decimal" value={total} onChange={(e) => setTotal(e.target.value)} />
        </div>
      </label>

      <div>
        <span className="label">Limit for each category</span>
        <p className="small muted" style={{ margin: '2px 0 8px' }}>Use 0 for "no limit". You get a warning when a category goes over its limit.</p>
        {rows.map((r) => (
          <div key={r.id} className="cat-row">
            <input className="field" value={r.name} onChange={(e) => setRow(r.id, 'name', e.target.value)} aria-label="Category name" />
            <div className="money-input" style={{ width: 120, flex: 'none' }}>
              <span>$</span>
              <input className="field" inputMode="decimal" value={r.planned} onChange={(e) => setRow(r.id, 'planned', e.target.value)} aria-label={`Limit for ${r.name}`} />
            </div>
            <button type="button" className="icon-btn" onClick={() => onDelete(r)} aria-label={`Remove ${r.name}`} disabled={r.pending}>✕</button>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <input className="field" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New category" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), onAdd())} />
          <button type="button" className="btn ghost" onClick={onAdd}>Add</button>
        </div>
      </div>

      <p className={'small ' + (!Number.isNaN(totalNum) && plannedSum > totalNum ? 'over' : 'muted')} style={{ margin: 0 }}>
        Category limits add up to {nzd(plannedSum)}
        {!Number.isNaN(totalNum) && plannedSum > totalNum ? `, that's ${nzd(plannedSum - totalNum)} more than the total budget.` : ` of ${nzd(totalNum || 0)}.`}
      </p>

      {error && <p className="alert" style={{ margin: 0 }}>{error}</p>}
      <button className="btn" disabled={busy}>{busy ? 'Saving…' : 'Save budget'}</button>
    </Sheet>
  )
}
