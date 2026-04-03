import { useState } from 'react'
import './ProposalTab.css'

function formatTime(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function ProposalTab({ proposal, votes, comments, score, userVote, authorName, onVote, onComment, onDeleteComment, onEdit }) {
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editBody, setEditBody] = useState('')
  const [saving, setSaving] = useState(false)

  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if (!commentText.trim()) return
    setSubmitting(true)
    await onComment(commentText.trim())
    setCommentText('')
    setSubmitting(false)
  }

  const startEdit = () => {
    setEditTitle(proposal.title)
    setEditBody(proposal.body || '')
    setEditing(true)
  }

  const cancelEdit = () => {
    setEditing(false)
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!editTitle.trim()) return
    setSaving(true)
    await onEdit(editTitle.trim(), editBody.trim())
    setSaving(false)
    setEditing(false)
  }

  return (
    <div className="proposal-tab">
      <div className="proposal-main">
        <div className="proposal-content">
          {editing ? (
            <form className="edit-form" onSubmit={handleEditSubmit}>
              <input
                className="edit-title-input"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                required
                autoFocus
              />
              <textarea
                className="edit-body-input"
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                rows={6}
              />
              <div className="edit-form-actions">
                <button type="button" className="btn btn--ghost" onClick={cancelEdit}>
                  Cancel
                </button>
                <button type="submit" className="btn btn--primary" disabled={!editTitle.trim() || saving}>
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="proposal-title-row">
                <h1 className="proposal-title">{proposal.title}</h1>
                <button className="edit-btn" onClick={startEdit} title="Edit proposal">
                  Edit
                </button>
              </div>
              <p className="proposal-meta">
                Added by <strong>{proposal.author}</strong>
                {proposal.createdAt && (
                  <> · {formatTime(proposal.createdAt)}</>
                )}
              </p>
              <div className="proposal-body">{proposal.body}</div>
            </>
          )}
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
                  <div className="comment-header-right">
                    <span className="comment-time">{formatTime(c.createdAt)}</span>
                    {c.author === authorName && (
                      <button
                        className="comment-delete"
                        onClick={() => onDeleteComment(c.createdAt)}
                        title="Remove comment"
                      >
                        ×
                      </button>
                    )}
                  </div>
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
