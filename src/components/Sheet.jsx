import { useEffect } from 'react'

// Pop-up form: slides up from the bottom on phones, centred on bigger screens. Esc or tapping outside closes it.
export default function Sheet({ title, onClose, onSubmit, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <form className="sheet" onClick={(e) => e.stopPropagation()} onSubmit={onSubmit} role="dialog" aria-modal="true" aria-label={title}>
        <div className="sheet-head">
          <h2 style={{ margin: 0 }}>{title}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="grid">{children}</div>
      </form>
    </div>
  )
}
