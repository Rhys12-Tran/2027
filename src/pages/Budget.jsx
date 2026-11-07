import { useState } from 'react'
import { nzd } from '../data/sample.js'
import { useData, budgetSummary, moneyColor, sumOf } from '../lib/data.jsx'
import { useTeam } from '../lib/team.jsx'
import { Avatar, Bar, fmtDate } from '../components/Bits.jsx'
import ExpenseSheet from '../components/ExpenseSheet.jsx'
import BudgetSheet from '../components/BudgetSheet.jsx'

export default function Budget() {
  const { competition, categories, expenses, loading } = useData()
  const { people } = useTeam()
  const [editing, setEditing] = useState(null) // null, 'new', or an expense
  const [settingBudget, setSettingBudget] = useState(false)
  const [filter, setFilter] = useState('all')

  const b = budgetSummary(competition, categories, expenses)
  const catName = (id) => categories.find((c) => c.id === id)?.name || 'No category'
  const personName = (id) => people.find((p) => p.id === id)?.name || 'Not sure'

  const shown = expenses
    .filter((e) => filter === 'all' || (filter === 'none' ? !categories.some((c) => c.id === e.category_id) : e.category_id === filter))
    .sort((x, y) => y.date.localeCompare(x.date) || y.id - x.id)

  const payers = people
    .map((p) => ({ ...p, paid: sumOf(expenses.filter((e) => e.paid_by === p.id)) }))
    .filter((p) => p.paid > 0)
    .sort((x, y) => y.paid - x.paid)

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Budget</h1>
          <p>All amounts in NZD</p>
        </div>
        <button className="btn" onClick={() => setEditing('new')}>+ Add expense</button>
      </div>

      {b.total === 0 && !loading && (
        <button className="card setup-card" onClick={() => setSettingBudget(true)}>
          <b>💰 Set your total budget</b>
          <span className="small muted">Tell the site how much you have to spend, and a limit for each category if you like.</span>
        </button>
      )}

      {b.over && <p className="alert">⚠ The total budget is over by {nzd(b.spent - b.total)}</p>}
      {b.byCategory.filter((c) => c.over).map((c) => (
        <p className="alert" key={c.id}>⚠ {c.name} is over its limit by {nzd(c.spent - c.planned)}</p>
      ))}

      <div className="grid grid-3" style={{ marginBottom: 12 }}>
        <section className="card">
          <div className="label">Money spent</div>
          <div className="big-number">{nzd(b.spent)}</div>
          <div className="small muted">{expenses.length} expense{expenses.length === 1 ? '' : 's'}</div>
        </section>
        <section className="card">
          <div className="label">Money left</div>
          <div className={'big-number' + (b.left < 0 ? ' over' : '')}>{nzd(b.left)}</div>
          <div className="small muted">of {nzd(b.total)} total</div>
        </section>
        <section className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div className="label">Budget used</div>
            <button className="link-btn small" onClick={() => setSettingBudget(true)}>Set budget</button>
          </div>
          <div className="big-number">{Math.round(b.pct)}%</div>
          <div style={{ marginTop: 10 }}><Bar value={b.pct} color={moneyColor(b.pct)} /></div>
        </section>
      </div>

      <div className="grid grid-3" style={{ marginBottom: 12, alignItems: 'start' }}>
        <section className="card span-2">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <h2 style={{ margin: 0 }}>By category</h2>
            <button className="link-btn small" onClick={() => setSettingBudget(true)}>Edit limits</button>
          </div>
          {b.byCategory.map((c) => (
            <div className="row" key={c.id} style={{ display: 'block' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                <span><span className="dot" style={{ background: c.color, marginRight: 8 }} />{c.name}</span>
                <span className={'small ' + (c.over ? 'over' : 'muted')} style={{ whiteSpace: 'nowrap' }}>
                  {nzd(c.spent)}{c.planned > 0 ? ` of ${nzd(c.planned)}` : ' · no limit'}
                </span>
              </div>
              {c.planned > 0 && <Bar value={c.pct} color={moneyColor(c.pct)} />}
            </div>
          ))}
          {b.uncategorised > 0 && (
            <div className="row"><span className="grow muted">No category</span><span className="small muted">{nzd(b.uncategorised)}</span></div>
          )}
        </section>

        <section className="card">
          <h2>Who paid</h2>
          {payers.length === 0 && <p className="small muted">Nobody yet.</p>}
          {payers.map((p) => (
            <div className="row" key={p.id}>
              <Avatar person={p} />
              <span className="grow">{p.name}</span>
              <b>{nzd(p.paid)}</b>
            </div>
          ))}
          {payers.length > 0 && <p className="small muted" style={{ marginBottom: 0 }}>Handy for paying people back.</p>}
        </section>
      </div>

      <div className="grid grid-3" style={{ marginBottom: 12 }}>
        {['Spend by category', 'Planned vs actual', 'Spend over time'].map((t) => (
          <section className="card" key={t}>
            <h2>{t}</h2>
            <div className="notice" style={{ height: 120, display: 'grid', placeItems: 'center' }}>Chart arrives in step 5</div>
          </section>
        ))}
      </div>

      <section className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <h2 style={{ margin: 0 }}>Expenses</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <select className="field" style={{ width: 'auto', minHeight: 40 }} value={filter} onChange={(e) => setFilter(e.target.value === 'all' || e.target.value === 'none' ? e.target.value : Number(e.target.value) || e.target.value)} aria-label="Show category">
              <option value="all">All categories</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              <option value="none">No category</option>
            </select>
            <button className="btn ghost" onClick={() => downloadCsv(expenses, catName, personName)} disabled={!expenses.length}>Export CSV</button>
          </div>
        </div>
        <div style={{ marginTop: 8 }}>
          {loading && <p className="muted">Loading…</p>}
          {!loading && shown.length === 0 && <p className="muted small">No expenses yet. Tap "+ Add expense" when someone pays for something.</p>}
          {shown.map((e) => (
            <div className="row task-row" key={e.id} onClick={() => setEditing(e)} role="button" tabIndex={0} onKeyDown={(k) => k.key === 'Enter' && setEditing(e)}>
              <span className="dot" style={{ background: categories.find((c) => c.id === e.category_id)?.color || 'var(--line)' }} />
              <div className="grow">
                <div>{e.item}</div>
                <div className="small muted">{catName(e.category_id)} · {fmtDate(e.date)} · paid by {personName(e.paid_by)}</div>
              </div>
              <b>{nzd(Number(e.amount))}</b>
            </div>
          ))}
        </div>
      </section>

      {editing && <ExpenseSheet expense={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
      {settingBudget && <BudgetSheet onClose={() => setSettingBudget(false)} />}
    </>
  )
}

// Spreadsheet-friendly file: opens in Excel and Google Sheets. The BOM makes Excel read "$" and macrons correctly.
function downloadCsv(expenses, catName, personName) {
  const cell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const header = ['Date', 'Item', 'Category', 'Amount (NZD)', 'Who paid', 'Note']
  const lines = [...expenses]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((e) => [e.date, e.item, catName(e.category_id), Number(e.amount).toFixed(2), personName(e.paid_by), e.note].map(cell).join(','))
  const blob = new Blob(['﻿' + [header.map(cell).join(','), ...lines].join('\r\n')], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `film-crew-budget-${new Date().toLocaleDateString('en-CA')}.csv`
  a.click()
  URL.revokeObjectURL(a.href)
}
