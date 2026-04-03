import './OverviewTab.css'

export default function OverviewTab({ proposals, getScore, getProposalVotes, getProposalComments, onSelectProposal }) {
  if (proposals.length === 0) {
    return (
      <div className="overview-empty">
        <div className="empty-icon">📋</div>
        <h2>No proposals yet</h2>
        <p>The facilitator will load proposals before the meeting,<br />or anyone can add one using the <strong>+</strong> button above.</p>
      </div>
    )
  }

  const sorted = [...proposals].sort((a, b) => getScore(b.id) - getScore(a.id))

  return (
    <div className="overview">
      <div className="overview-header">
        <h1 className="overview-title">All proposals</h1>
        <span className="overview-count">{proposals.length} option{proposals.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="overview-grid">
        {sorted.map((p, i) => {
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
    </div>
  )
}
