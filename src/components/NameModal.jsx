import { useState } from 'react'
import './NameModal.css'

export default function NameModal({ currentName, onSubmit, onClose }) {
  const [name, setName] = useState(currentName || '')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit(name.trim())
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">
          {currentName ? 'Change your name' : 'Enter your name'}
        </h2>
        <p className="modal-desc">
          Your name is visible to everyone in the session. It's stored only in your browser.
        </p>
        <form onSubmit={handleSubmit} className="modal-form">
          <input
            className="modal-input"
            placeholder="Your display name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            required
            maxLength={40}
          />
          <div className="modal-actions">
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={!name.trim()}>
              {currentName ? 'Update' : 'Join session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
