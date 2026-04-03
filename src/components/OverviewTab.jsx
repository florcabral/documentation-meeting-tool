import { useState } from 'react'
import TabBar from './TabBar.jsx'
import './OverviewTab.css'

function TermChip({ term, score, userVote, onVote, onDelete, isAdmin }) {
  return (
    <div className={`term-chip ${score > 0 ? 'term-chip--up' : score < 0 ? 'term-chip--down' : ''}`}>
      <span className="term-label">
        {term.label.charAt(0).toUpperCase() + term.label.slice(1)}
      </span>
      <div className="term-actions">
        <button
          className={`term-vote-btn term-vote-btn--up ${userVote === 1 ? 'term-vote-btn--active' : ''}`}
          onClick={() => onVote(term.id, 1)}
          title="Support"
        >↑</button>
        <span className={`term-score ${score > 0 ? 'score--positive' : score < 0 ? 'score--negative' : ''}`}>
          {score > 0 ? `+${score}` : score}
        </span>
        <button
          className={`term-vote-btn term-vote-btn--down ${userVote === -1 ? 'term-vote-btn--active' : ''}`}
          onClick={() => onVote(term.id, -1)}
          title="Against"
        >↓</button>
        {isAdmin && (
          <button
            className="term-delete-btn"
            onClick={() => onDelete(term.id)}
            title="Remove chip"
          >×</button>
        )}
      </div>
    </div>
  )
}

export default function OverviewTab({
  proposals,
  terms,
  getScore,
  getProposalVotes,
  getProposalComments,
  onSelectProposal,
  getTermScore,
  getUserTermVote,
  onTermVote,
  onAddProposal,
  onRefreshTerms,
  onResetTerms,
  onAddTerm,
  onDeleteTerm,
  facilitator,
  authorName,
}) {
  const [newTermLabel, setNewTermLabel] = useState('')
  const [addingTerm, setAddingTerm] = useState(false)
  const [termError, setTermError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [resetting, setResetting] = useState(false)

  const isAdmin = authorName && facilitator && authorName === facilitator
  const sortedTerms = [...(terms || [])].sort((a, b) => getTermScore(b.id) - getTermScore(a.id))
  const sortedProposals = [...proposals].sort((a, b) => getScore(b.id) - getScore(a.id))

  const handleAddTermSubmit = async (e) => {
    e.preventDefault()
    if (!newTermLabel.trim()) return
    setAddingTerm(true)
    setTermError(null)
    const res = await onAddTerm(newTermLabel.trim())
    if (res.status === 409) {
      setTermError('Term already exists')
    } else {
      setNewTermLabel('')
    }
    setAddingTerm(false)
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await onRefreshTerms()
    setRefreshing(false)
  }

  const handleReset = async () => {
    setResetting(true)
    await onResetTerms()
    setResetting(false)
  }

  return (
    <div className="overview">

      {/* Section 1: Terms */}
      <section className="overview-section">
        <div className="overview-section-header">
          <h2 className="overview-section-title">Domains of concern</h2>
          <span className="overview-section-sub">Vote on individual terms — top results will inform a new cluster proposal</span>
          {isAdmin && (
            <>
              <button
                className="terms-refresh-btn"
                onClick={handleRefresh}
                disabled={refreshing}
                title="Pull terms from all current proposals (including any added mid-meeting)"
              >
                {refreshing ? 'Refreshing…' : 'Refresh from proposals'}
              </button>
              <button
                className="terms-reset-btn"
                onClick={handleReset}
                disabled={resetting}
                title="Restore chips to the original set from session.json"
              >
                {resetting ? 'Resetting…' : 'Reset to original'}
              </button>
            </>
          )}
        </div>

        {sortedTerms.length === 0 ? (
          <p className="overview-empty-inline">No terms loaded. Run <code>/review</code> or use <strong>Refresh from proposals</strong> above.</p>
        ) : (
          <div className="terms-grid">
            {sortedTerms.map(term => (
              <TermChip
                key={term.id}
                term={term}
                score={getTermScore(term.id)}
                userVote={getUserTermVote(term.id)}
                onVote={onTermVote}
                onDelete={onDeleteTerm}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        )}

        <form className="add-term-form" onSubmit={handleAddTermSubmit}>
          <input
            className={`add-term-input ${termError ? 'add-term-input--error' : ''}`}
            placeholder="Add a term…"
            value={newTermLabel}
            onChange={(e) => { setNewTermLabel(e.target.value); setTermError(null) }}
            disabled={addingTerm}
          />
          <button
            type="submit"
            className="add-term-btn"
            disabled={!newTermLabel.trim() || addingTerm}
          >
            {addingTerm ? '…' : '+'}
          </button>
          {termError && <span className="add-term-error">{termError}</span>}
        </form>
      </section>

      {/* Section 2: Clusters */}
      <section className="overview-section">
        <div className="overview-section-header">
          <h2 className="overview-section-title">Clustered proposals</h2>
          <span className="overview-count">{proposals.length} option{proposals.length !== 1 ? 's' : ''}</span>
        </div>

        <TabBar
          proposals={proposals}
          activeTab={null}
          onTabChange={onSelectProposal}
          onAddProposal={onAddProposal}
          getScore={getScore}
          hideOverview
        />

        {proposals.length === 0 ? (
          <div className="overview-empty">
            <div className="empty-icon">📋</div>
            <h2>No proposals yet</h2>
            <p>The facilitator will load proposals before the meeting,<br />or anyone can add one using the <strong>+</strong> button above.</p>
          </div>
        ) : (
          <div className="overview-grid">
            {sortedProposals.map((p, i) => {
              const score = getScore(p.id)
              const voteList = getProposalVotes(p.id)
              const commentList = getProposalComments(p.id)
              const isLeading = i === 0 && score > 0

              return (
                <button
                  key={p.id}
                  className={`proposal-card ${isLeading ? 'proposal-card--leading' : ''}`}
                  onClick={() => onSelectProposal(p.id)}
                >
                  <div className="card-top">
                    <div className="card-meta">
                      {isLeading && <span className="leading-badge">Leading</span>}
                      <span className="card-author">by {p.author}</span>
                    </div>
                    <div className={`card-score ${score > 0 ? 'score--positive' : score < 0 ? 'score--negative' : ''}`}>
                      {score > 0 ? '+' : ''}{score}
                    </div>
                  </div>

                  <h3 className="card-title">{p.title}</h3>
                  <p className="card-body">{p.body}</p>

                  <div className="card-footer">
                    <span className="card-stat">
                      <span className="stat-icon">↑↓</span>
                      {voteList.length} vote{voteList.length !== 1 ? 's' : ''}
                    </span>
                    <span className="card-stat">
                      <span className="stat-icon">💬</span>
                      {commentList.length} comment{commentList.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {voteList.length > 0 && (
                    <div className="card-vote-bar">
                      {voteList.map(v => (
                        <span
                          key={`${v.author}-${v.value}`}
                          className={`vote-pip ${v.value > 0 ? 'pip--up' : 'pip--down'}`}
                          title={`${v.author}: ${v.value > 0 ? '+1' : '-1'}`}
                        />
                      ))}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
