import { useState } from 'react'
import './TabBar.css'

export default function TabBar({ proposals, activeTab, onTabChange, onAddProposal, getScore, hideOverview = false }) {
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    setSubmitting(true)
    await onAddProposal(title.trim(), body.trim())
    setTitle('')
    setBody('')
    setShowForm(false)
    setSubmitting(false)
  }

  const getTabId = (p) => p.id

  return (
    <div className="tabbar-wrapper">
      <div className="tabbar-outer">
        <div className="tabbar">
        {!hideOverview && (
          <button
            className={`tab ${activeTab === 'overview' ? 'tab--active' : ''}`}
            onClick={() => onTabChange('overview')}
          >
            Overview
          </button>
        )}

        {proposals.map((p) => {
          const score = getScore(p.id)
          const tabId = getTabId(p)
          return (
            <button
              key={p.id}
              className={`tab ${activeTab === tabId ? 'tab--active' : ''}`}
              onClick={() => onTabChange(tabId)}
            >
                <span className="tab-title">{p.title}</span>
                <span className={`tab-score ${score > 0 ? 'score--positive' : score < 0 ? 'score--negative' : ''}`}>
                  {score > 0 ? '+' : ''}{score}
                </span>
              </button>
            )
          })}
        </div>

        <button
          className={`tab tab--add ${showForm ? 'tab--add-active' : ''}`}
          onClick={() => setShowForm(!showForm)}
          title="Add new proposal"
        >
          {showForm ? '×' : '+'}
        </button>
      </div>

      {showForm && (
        <form className="add-proposal-form" onSubmit={handleSubmit}>
          <div className="form-header">
            <span className="form-title">New proposal</span>
          </div>
          <input
            className="form-input"
            placeholder="Title (e.g. Option 4: by team)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            required
          />
          <textarea
            className="form-textarea"
            placeholder="Describe the proposal…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
          />
          <div className="form-actions">
            <button type="button" className="btn btn--ghost" onClick={() => setShowForm(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={!title.trim() || submitting}>
              {submitting ? 'Adding…' : 'Add proposal'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
