import { useState, useEffect, useCallback, useRef } from 'react'
import TabBar from './components/TabBar.jsx'
import OverviewTab from './components/OverviewTab.jsx'
import ProposalTab from './components/ProposalTab.jsx'
import NameModal from './components/NameModal.jsx'
import './App.css'

const POLL_INTERVAL = 4000

function getSessionId() {
  try {
    const session = JSON.parse(localStorage.getItem('session_meta') || '{}')
    return session.id || null
  } catch {
    return null
  }
}

export default function App() {
  const [proposals, setProposals] = useState([])
  const [terms, setTerms] = useState([])
  const [votes, setVotes] = useState([])
  const [comments, setComments] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const [showNameModal, setShowNameModal] = useState(false)
  const [pendingAction, setPendingAction] = useState(null)
  const [authorName, setAuthorName] = useState(() => localStorage.getItem('author_name') || '')
  const [sessionId, setSessionId] = useState(() => getSessionId())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const pollRef = useRef(null)

  const fetchAll = useCallback(async () => {
    try {
      const [pRes, vRes, cRes] = await Promise.all([
        fetch('/api/proposals'),
        fetch('/api/votes'),
        fetch('/api/comments'),
      ])

      if (!pRes.ok || !vRes.ok || !cRes.ok) {
        throw new Error('Failed to fetch data')
      }

      const [pData, vData, cData] = await Promise.all([
        pRes.json(),
        vRes.json(),
        cRes.json(),
      ])

      setProposals(pData.proposals || [])
      setTerms(pData.terms || [])
      setVotes(vData.votes || [])
      setComments(cData.comments || [])
      setLastUpdated(new Date())
      setError(null)
    } catch (err) {
      setError('Connection issue — retrying...')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
    pollRef.current = setInterval(fetchAll, POLL_INTERVAL)
    return () => clearInterval(pollRef.current)
  }, [fetchAll])

  const requireName = (action) => {
    if (authorName) {
      action(authorName)
    } else {
      setPendingAction(() => action)
      setShowNameModal(true)
    }
  }

  const handleNameSubmit = (name) => {
    const trimmed = name.trim()
    localStorage.setItem('author_name', trimmed)
    setAuthorName(trimmed)
    setShowNameModal(false)
    if (pendingAction) {
      pendingAction(trimmed)
      setPendingAction(null)
    }
  }

  const handleVote = async (proposalId, value) => {
    requireName(async (author) => {
      // clicking the active vote again clears it
      const existing = votes.find(v => v.proposalId === proposalId && v.author === author)
      const newValue = existing?.value === value ? 0 : value
      await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposalId, author, value: newValue }),
      })
      fetchAll()
    })
  }

  const handleComment = async (proposalId, text) => {
    requireName(async (author) => {
      await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposalId, author, text }),
      })
      fetchAll()
    })
  }

  const handleEditProposal = async (proposalId, title, body) => {
    await fetch('/api/proposals', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: proposalId, title, body }),
    })
    fetchAll()
  }

  const handleDeleteComment = async (proposalId, createdAt) => {
    if (!authorName) return
    await fetch('/api/comments', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proposalId, author: authorName, createdAt }),
    })
    fetchAll()
  }

  const handleAddProposal = async (title, body) => {
    requireName(async (author) => {
      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body, author }),
      })
      const data = await res.json()
      await fetchAll()
      if (data.proposal?.id) {
        setActiveTab(data.proposal.id)
      }
    })
  }

  const getProposalVotes = (proposalId) => votes.filter(v => v.proposalId === proposalId)
  const getProposalComments = (proposalId) => comments.filter(c => c.proposalId === proposalId)
  const getScore = (proposalId) => getProposalVotes(proposalId).reduce((sum, v) => sum + v.value, 0)
  const getUserVote = (proposalId) => {
    if (!authorName) return null
    const v = votes.find(v => v.proposalId === proposalId && v.author === authorName)
    return v ? v.value : null
  }

  const getTermScore = (termId) => getScore(termId)
  const getUserTermVote = (termId) => getUserVote(termId)
  const handleTermVote = (termId, value) => handleVote(termId, value)

  const activeProposal = proposals.find(
    p => p.id === activeTab || p.title.toLowerCase().replace(/\s+/g, '-') === activeTab
  )

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div className="header-left">
            {activeTab !== 'overview' && (
              <button
                className="home-btn"
                onClick={() => setActiveTab('overview')}
                title="Back to overview"
              >
                ← Home
              </button>
            )}
            <span className="app-logo">⬡</span>
            <span className="app-name">Docs Decision</span>
            {lastUpdated && (
              <span className="live-badge">
                <span className="live-dot" />
                live
              </span>
            )}
          </div>
          <div className="header-right">
            {error && <span className="error-badge">{error}</span>}
            {authorName && (
              <button
                className="author-chip"
                onClick={() => setShowNameModal(true)}
                title="Change display name"
              >
                {authorName}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="app-main">
        {activeTab !== 'overview' && (
          <TabBar
            proposals={proposals}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onAddProposal={handleAddProposal}
            getScore={getScore}
          />
        )}

        <div className="tab-content">
          {loading ? (
            <div className="loading-state">
              <div className="spinner" />
              <span>Loading session…</span>
            </div>
          ) : activeTab === 'overview' ? (
            <OverviewTab
              proposals={proposals}
              terms={terms}
              getScore={getScore}
              getProposalVotes={getProposalVotes}
              getProposalComments={getProposalComments}
              onSelectProposal={setActiveTab}
              getTermScore={getTermScore}
              getUserTermVote={getUserTermVote}
              onTermVote={handleTermVote}
              onAddProposal={handleAddProposal}
            />
          ) : activeProposal ? (
            <ProposalTab
              proposal={activeProposal}
              votes={getProposalVotes(activeProposal.id)}
              comments={getProposalComments(activeProposal.id)}
              score={getScore(activeProposal.id)}
              userVote={getUserVote(activeProposal.id)}
              authorName={authorName}
              onVote={(value) => handleVote(activeProposal.id, value)}
              onComment={(text) => handleComment(activeProposal.id, text)}
              onDeleteComment={(createdAt) => handleDeleteComment(activeProposal.id, createdAt)}
              onEdit={(title, body) => handleEditProposal(activeProposal.id, title, body)}
            />
          ) : (
            <div className="loading-state">
              <span>Proposal not found.</span>
            </div>
          )}
        </div>
      </main>

      {showNameModal && (
        <NameModal
          currentName={authorName}
          onSubmit={handleNameSubmit}
          onClose={() => { setShowNameModal(false); setPendingAction(null) }}
        />
      )}
    </div>
  )
}
