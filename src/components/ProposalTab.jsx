import { useState } from 'react'
import './ProposalTab.css'

function formatTime(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function ProposalTab({ proposal, votes, comments, score, userVote, authorName, onVote, onComment }) {
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if (!commentText.trim()) return
    setSubmitting(true)
    await onComment(commentText.trim())
    setCommentText('')
    setSubmitting(false)
  }

  return (
    <div className="proposal-tab">
      <div className="proposal-main">
        <div className="proposal-content">
          <h1 className="proposal-title">{proposal.title}</h1>
          <p className="proposal-meta">
            Added by <strong>{proposal.author}</strong>
            {proposal.createdAt && (
              <> · {formatTime(proposal.createdAt)}</>
            )}
          </p>
          <div className="proposal-body">{proposal.body}</div>
        </div>

        <div className="vote-panel">
          <div className="vote-score-display">
            <span className={`vote-score ${score > 0 ? 'score--up' : score < 0 ? 'score--down' : ''}`}>
              {score > 0 ? '+' : ''}{score}
            </span>
            <span className="vote-score-label">score</span>
          </div>

          <div className="vote-buttons">
            <button
              className={`vote-btn vote-btn--up ${userVote === 1 ? 'vote-btn--active' : ''}`}
              onClick={() => onVote(1)}
              title="Support this proposal"
            >
              <span className="vote-arrow">▲</span>
              <span>+1</span>
            </button>
            <button
              className={`vote-btn vote-btn--down ${userVote === -1 ? 'vote-btn--active' : ''}`}
              onClick={() => onVote(-1)}
              title="Oppose this proposal"
            >
              <span className="vote-arrow">▼</span>
              <span>-1</span>
            </button>
          </div>

          {votes.length > 0 && (
            <div className="vote-breakdown">
              <span className="breakdown-label">Individual votes</span>
              <div className="breakdown-list">
                {votes.map((v) => (
                  <div key={`${v.author}-${v.value}`} className="breakdown-item">
                    <span className="breakdown-author">{v.author}</span>
                    <span className={`breakdown-value ${v.value > 0 ? 'val--up' : 'val--down'}`}>
                      {v.value > 0 ? '+1' : '-1'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="comment-section">
        <h2 className="comment-section-title">
          Discussion
          {comments.length > 0 && (
            <span className="comment-count">{comments.length}</span>
          )}
        </h2>

        {comments.length === 0 ? (
          <p className="no-comments">No comments yet. Be the first to share your thoughts.</p>
        ) : (
          <div className="comment-list">
            {comments.map((c, i) => (
              <div key={i} className="comment">
                <div className="comment-header">
                  <span className="comment-author">{c.author}</span>
                  <span className="comment-time">{formatTime(c.createdAt)}</span>
                </div>
                <p className="comment-text">{c.text}</p>
              </div>
            ))}
          </div>
        )}

        <form className="comment-form" onSubmit={handleCommentSubmit}>
          <textarea
            className="comment-input"
            placeholder={authorName ? `Comment as ${authorName}…` : 'Add a comment…'}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            rows={3}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleCommentSubmit(e)
            }}
          />
          <div className="comment-form-footer">
            <span className="comment-hint">⌘↵ to submit</span>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={!commentText.trim() || submitting}
            >
              {submitting ? 'Posting…' : 'Post comment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
