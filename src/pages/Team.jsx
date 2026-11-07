import { Link } from 'react-router-dom'
import { useTeam } from '../lib/team.jsx'
import { Avatar } from '../components/Bits.jsx'

export default function Team() {
  const { people, me, loading } = useTeam()
  const unfinished = me && (!me.name || me.roles.length === 0)

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Team</h1>
          <p>{loading ? 'Loading…' : `${people.length} ${people.length === 1 ? 'person' : 'people'}`}</p>
        </div>
        <Link to="/profile/edit" className="btn ghost">Edit my profile</Link>
      </div>

      {unfinished && (
        <Link to="/profile/edit" className="card" style={{ display: 'block', marginBottom: 12, textDecoration: 'none', borderColor: 'var(--accent)' }}>
          <b>👋 Finish your profile</b>
          <div className="small muted">Add your name, role and a photo so the team knows who's who.</div>
        </Link>
      )}

      <div className="grid-2 grid-3">
        {people.map((p) => (
          <Link to={`/team/${p.id}`} className="card person-card" key={p.id}>
            <div style={{ display: 'grid', placeItems: 'center', marginBottom: 8 }}><Avatar person={p} size="lg" /></div>
            <h2 style={{ marginBottom: 2 }}>{p.name || 'New member'}{p.id === me?.id && <span className="small muted"> (you)</span>}</h2>
            <div className="small muted" style={{ marginBottom: 8 }}>{p.roles.length ? p.roles.join(' · ') : 'No role yet'}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
              {p.skills.map((s) => <span className="tag" key={s}>{s}</span>)}
            </div>
          </Link>
        ))}
      </div>
    </>
  )
}
