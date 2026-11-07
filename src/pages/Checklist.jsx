import { useState } from 'react'
import { PHASES } from '../data/sample.js'
import { useData, isDone, isOverdue, progressOf, byDue } from '../lib/data.jsx'
import { useAuth } from '../lib/auth.jsx'
import { Avatar, Bar, Tick, fmtDate } from '../components/Bits.jsx'
import TaskSheet from '../components/TaskSheet.jsx'

const FILTERS = ['All', 'Mine', 'Overdue']

export default function Checklist() {
  const { tasks, loading, updateTask } = useData()
  const { userId } = useAuth()
  const [phase, setPhase] = useState('all')
  const [filter, setFilter] = useState('All')
  const [editing, setEditing] = useState(null) // null = closed, 'new' = adding, or a task

  const shown = tasks
    .filter((t) => filter === 'All' || (filter === 'Mine' ? t.owner === userId : isOverdue(t)))
    .sort(byDue)

  const toggle = (t) => updateTask(t.id, { status: isDone(t) ? 'In progress' : 'Done' })

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Checklist</h1>
          <p>Idea → Script → Storyboard → Video → Audio → Edit → Submit</p>
        </div>
        <button className="btn" onClick={() => setEditing('new')}>+ Add task</button>
      </div>

      <section className="card" style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span className="label">Overall</span>
          <b>{Math.round(progressOf(tasks))}% · {tasks.filter(isDone).length} of {tasks.length}</b>
        </div>
        <Bar value={progressOf(tasks)} />
      </section>

      <div className="chips" style={{ marginBottom: 8 }}>
        <button className={'chip' + (phase === 'all' ? ' active' : '')} onClick={() => setPhase('all')}>All phases</button>
        {PHASES.map((ph) => (
          <button key={ph.id} className={'chip' + (phase === ph.id ? ' active' : '')} onClick={() => setPhase(ph.id)}>
            <span className="dot" style={{ background: ph.color, marginRight: 6 }} />{ph.name}
          </button>
        ))}
      </div>
      <div className="chips" style={{ marginBottom: 12 }}>
        {FILTERS.map((f) => (
          <button key={f} className={'chip' + (filter === f ? ' active' : '')} onClick={() => setFilter(f)}>
            {f}{f === 'Overdue' && tasks.some(isOverdue) ? ` (${tasks.filter(isOverdue).length})` : ''}
          </button>
        ))}
      </div>

      {loading && <p className="muted">Loading…</p>}
      {!loading && filter !== 'All' && shown.length === 0 && (
        <p className="notice">{filter === 'Mine' ? 'No tasks are given to you yet.' : 'Nothing overdue. 🎉'}</p>
      )}

      <div className="grid">
        {PHASES.filter((ph) => phase === 'all' || ph.id === phase).map((ph) => {
          const all = tasks.filter((t) => t.phase === ph.id)
          const list = shown.filter((t) => t.phase === ph.id)
          if (phase === 'all' && filter !== 'All' && list.length === 0) return null
          const pct = progressOf(all)
          return (
            <section className="card" key={ph.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span className="dot" style={{ background: ph.color }} />
                <h2 style={{ margin: 0, flex: 1 }}>{ph.name}</h2>
                <span className="small muted">{all.filter(isDone).length}/{all.length} · {Math.round(pct)}%</span>
              </div>
              <Bar value={pct} color={ph.color} />
              <div style={{ marginTop: 8 }}>
                {list.map((t) => (
                  <div className="row task-row" key={t.id} onClick={() => setEditing(t)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setEditing(t)}>
                    <Tick on={isDone(t)} onClick={() => toggle(t)} label={t.title} />
                    <div className="grow">
                      <div style={{ textDecoration: isDone(t) ? 'line-through' : 'none', opacity: isDone(t) ? 0.6 : 1 }}>
                        {t.title} {t.is_lesson && <span className="tag" title="From a lesson learned">💡 Lesson</span>}
                      </div>
                      <div className={'small ' + (isOverdue(t) ? 'over' : 'muted')}>
                        {[t.due ? (isOverdue(t) ? 'Overdue · ' : 'Due ') + fmtDate(t.due) : 'No due date', t.status].join(' · ')}
                      </div>
                    </div>
                    {t.owner ? <Avatar id={t.owner} /> : <span className="small muted">Nobody</span>}
                  </div>
                ))}
                <button className="add-row" onClick={() => setEditing({ newIn: ph.id })}>+ Add to {ph.name}</button>
              </div>
            </section>
          )
        })}
      </div>

      {editing && (
        <TaskSheet
          task={editing === 'new' || editing.newIn ? null : editing}
          defaultPhase={editing.newIn || (phase !== 'all' ? phase : 'idea')}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  )
}
