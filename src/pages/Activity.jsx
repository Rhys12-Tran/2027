import { useState } from 'react'
import { activity, person } from '../data/sample.js'
import { Avatar, PreviewNote } from '../components/Bits.jsx'

const SECTIONS = ['Everything', 'Checklist', 'Budget', 'Team']

export default function Activity() {
  const [section, setSection] = useState('Everything')
  const shown = activity.filter((a) => section === 'Everything' || a.section === section)

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Activity</h1>
          <p>Who changed what, and when</p>
        </div>
      </div>

      <div className="chips" style={{ marginBottom: 12 }}>
        {SECTIONS.map((s) => (
          <button key={s} className={'chip' + (section === s ? ' active' : '')} onClick={() => setSection(s)}>{s}</button>
        ))}
      </div>

      <section className="card">
        {shown.map((a) => (
          <div className="row" key={a.id}>
            <Avatar id={a.who} />
            <div className="grow">
              <div><b>{person(a.who).name}</b> {a.text}</div>
              <div className="small muted">{a.section} · {a.ago}</div>
            </div>
          </div>
        ))}
      </section>

      <div style={{ marginTop: 16 }}><PreviewNote step={6} /></div>
    </>
  )
}
