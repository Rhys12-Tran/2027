import { Link } from 'react-router-dom'
import { activity, nzd, person, PHASES } from '../data/sample.js'
import { Avatar, Bar, Tick, PreviewNote, fmtDate } from '../components/Bits.jsx'
import { useTeam } from '../lib/team.jsx'
import { useAuth } from '../lib/auth.jsx'
import { useData, isDone, isOverdue, progressOf, byDue, budgetSummary, moneyColor } from '../lib/data.jsx'

export default function Home() {
  const { me: profile } = useTeam()
  const { userId } = useAuth()
  const { tasks, competition, categories, expenses, updateTask } = useData()

  const deadline = competition?.deadline
  const daysLeft = deadline ? Math.ceil((new Date(deadline + 'T23:59') - new Date()) / 86400000) : null
  const progress = progressOf(tasks)
  const myTasks = tasks.filter((t) => t.owner === userId && !isDone(t)).sort(byDue)

  const money = budgetSummary(competition, categories, expenses)
  const overCats = money.byCategory.filter((c) => c.over)

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Kia ora{profile?.name ? `, ${profile.name}` : ''}</h1>
          <p>{competition?.name}</p>
        </div>
      </div>

      <div className="grid grid-3">
        <section className="card">
          <div className="label">Deadline</div>
          {daysLeft === null ? (
            <p style={{ marginBottom: 0 }}>No deadline yet. <Link to="/settings">Set it in Settings</Link></p>
          ) : (
            <>
              <div className={'big-number' + (daysLeft < 0 ? ' over' : '')}>{Math.abs(daysLeft)}</div>
              <div className="muted">{daysLeft < 0 ? 'days past' : daysLeft === 1 ? 'day left' : 'days left'} · {fmtDate(deadline)}</div>
            </>
          )}
        </section>

        <section className="card">
          <div className="label">Overall progress</div>
          <div className="big-number">{Math.round(progress)}%</div>
          <div className="muted small" style={{ marginBottom: 10 }}>{tasks.filter(isDone).length} of {tasks.length} tasks done</div>
          <div className="grid" style={{ gap: 6 }}>
            {PHASES.map((ph) => (
              <div key={ph.id} style={{ display: 'grid', gridTemplateColumns: '84px 1fr', alignItems: 'center', gap: 8 }}>
                <span className="small muted">{ph.name}</span>
                <Bar value={progressOf(tasks.filter((t) => t.phase === ph.id))} color={ph.color} />
              </div>
            ))}
          </div>
        </section>

        <Link to="/budget" className="card" style={{ display: 'block', textDecoration: 'none' }}>
          <div className="label">Money left</div>
          {money.total === 0 ? (
            <p style={{ marginBottom: 0 }}>{money.spent > 0 ? `${nzd(money.spent)} spent. ` : ''}No budget set yet. Set it on the Budget page.</p>
          ) : (
            <>
              <div className={'big-number' + (money.left < 0 ? ' over' : '')}>{nzd(money.left)}</div>
              <div className="muted" style={{ marginBottom: 10 }}>left of {nzd(money.total)}</div>
              <Bar value={money.pct} color={moneyColor(money.pct)} />
              <div className="small muted" style={{ marginTop: 6 }}>{nzd(money.spent)} spent · {Math.round(money.pct)}% used</div>
            </>
          )}
          {(money.over || overCats.length > 0) && (
            <div className="small over" style={{ marginTop: 6 }}>⚠ Over: {[money.over && 'total budget', ...overCats.map((c) => c.name)].filter(Boolean).join(', ')}</div>
          )}
        </Link>

        <section className="card">
          <h2>My tasks</h2>
          {myTasks.length === 0 && <p className="muted">Nothing on your list. Nice work.</p>}
          {myTasks.slice(0, 6).map((t) => (
            <div className="row" key={t.id}>
              <Tick on={false} onClick={() => updateTask(t.id, { status: 'Done' })} label={t.title} />
              <div className="grow">{t.title}</div>
              <span className={'small ' + (isOverdue(t) ? 'over' : 'muted')}>{fmtDate(t.due)}</span>
            </div>
          ))}
          {myTasks.length > 6 && <Link to="/checklist" className="small">+{myTasks.length - 6} more</Link>}
        </section>

        <section className="card">
          <h2>Latest activity · sample</h2>
          {activity.slice(0, 5).map((a) => (
            <div className="row" key={a.id}>
              <Avatar id={a.who} />
              <div className="grow small"><b>{person(a.who).name}</b> {a.text}</div>
              <span className="small muted">{a.ago}</span>
            </div>
          ))}
          <Link to="/activity" className="small" style={{ display: 'inline-block', marginTop: 8 }}>See all</Link>
        </section>
      </div>

      <div style={{ marginTop: 16 }}><PreviewNote step={7} /></div>
    </>
  )
}
