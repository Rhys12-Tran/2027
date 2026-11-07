import { TickMark } from './Icons.jsx'
import { person, initials } from '../data/sample.js'
import { useTeam } from '../lib/team.jsx'

// Pass a profile as `person`, or just an `id` to look one up (team first, then sample data).
export function Avatar({ id, person: given, size }) {
  const { people } = useTeam()
  const p = given || people.find((x) => x.id === id) || person(id)
  const cls = 'avatar' + (size ? ' ' + size : '')
  if (p?.photo_url) return <img className={cls} src={p.photo_url} alt={p.name} />
  return <span className={cls} title={p?.name}>{p?.name ? initials(p.name) : '?'}</span>
}

export function Bar({ value, color }) {
  const pct = Math.max(0, Math.min(100, value))
  return (
    <div className="bar" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
      <span style={{ width: pct + '%', background: color }} />
    </div>
  )
}

export function Tick({ on, onClick, label }) {
  return (
    <button
      type="button"
      className={'tick' + (on ? ' on' : '')}
      aria-pressed={on}
      aria-label={(on ? 'Untick ' : 'Tick ') + (label || 'task')}
      onClick={(e) => {
        e.stopPropagation()
        onClick?.()
      }}
    >
      {on && <TickMark />}
    </button>
  )
}

export function PreviewNote({ step }) {
  return <p className="notice">Sample data for now. This goes live in build step {step}.</p>
}

export const fmtDate = (iso) => (iso ? new Date(iso + 'T00:00').toLocaleDateString('en-NZ', { day: 'numeric', month: 'short' }) : '')
