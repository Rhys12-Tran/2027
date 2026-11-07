import { Link, useParams } from 'react-router-dom'
import { useTeam } from '../lib/team.jsx'
import { nzd } from '../data/sample.js'
import { useData, isDone, byDue, sumOf } from '../lib/data.jsx'
import { Avatar, Tick, fmtDate } from '../components/Bits.jsx'

export default function Profile() {
  const { id } = useParams()
  const { people, me, loading } = useTeam()
  const { tasks, expenses, updateTask } = useData()
  const p = people.find((x) => x.id === id)

  if (!p) return <p className="muted">{loading ? 'Loading…' : 'Person not found.'} <Link to="/team">Back to team</Link></p>

  const theirTasks = tasks.filter((t) => t.owner === p.id).sort(byDue)
  const paid = sumOf(expenses.filter((e) => e.paid_by === p.id))

  return (
    <>
      <p style={{ margin: '4px 0 12px' }}><Link to="/team" className="small">← Team</Link></p>

      <section className="card" style={{ textAlign: 'center', marginBottom: 12 }}>
        <div style={{ display: 'grid', placeItems: 'center', marginBottom: 10 }}><Avatar person={p} size="xl" /></div>
        <h1>{p.name || 'New member'}</h1>
        <p className="muted" style={{ margin: '4px 0 10px' }}>{p.roles.length ? p.roles.join(' · ') : 'No role yet'}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
          {p.skills.map((s) => <span className="tag" key={s}>{s}</span>)}
        </div>
        {p.id === me?.id && <Link to="/profile/edit" className="btn" style={{ marginTop: 14 }}>Edit my profile</Link>}
      </section>

      <div className="grid grid-3">
        <section className="card">
          <h2>Contact</h2>
          {p.email && <div className="row"><span className="grow muted small">Email</span><a href={`mailto:${p.email}`}>{p.email}</a></div>}
          {p.phone && <div className="row"><span className="grow muted small">Phone</span><a href={`tel:${p.phone}`}>{p.phone}</a></div>}
          {p.other_contact && <div className="row"><span className="grow muted small">Other</span><span>{p.other_contact}</span></div>}
        </section>

        <section className="card">
          <h2>Tasks</h2>
          <div className="small muted" style={{ marginBottom: 4 }}>{theirTasks.filter(isDone).length} of {theirTasks.length} done</div>
          {theirTasks.length === 0 && <p className="muted small">No tasks yet.</p>}
          {theirTasks.map((t) => (
            <div className="row" key={t.id}>
              <Tick on={isDone(t)} onClick={() => updateTask(t.id, { status: isDone(t) ? 'In progress' : 'Done' })} label={t.title} />
              <span className="grow">{t.title}</span>
              <span className="small muted">{fmtDate(t.due)}</span>
            </div>
          ))}
        </section>

        <section className="card">
          <h2>Money paid</h2>
          <div className="big-number">{nzd(paid)}</div>
          <div className="small muted">{expenses.filter((e) => e.paid_by === p.id).length} expenses</div>
        </section>
      </div>
    </>
  )
}
