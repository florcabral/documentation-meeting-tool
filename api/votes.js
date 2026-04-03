import { kv, getSessionId, KEYS } from './_kv.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const sessionId = getSessionId()
  const key = KEYS.votes(sessionId)

  if (req.method === 'GET') {
    const votes = (await kv.get(key)) || []
    return res.status(200).json({ votes, sessionId })
  }

  if (req.method === 'POST') {
    const { proposalId, author, value } = req.body

    if (!proposalId || !author || (value !== 1 && value !== -1 && value !== 0)) {
      return res.status(400).json({ error: 'proposalId, author, and value (+1, -1, or 0 to clear) are required' })
    }

    let votes = (await kv.get(key)) || []

    // Remove any existing vote for this author+proposal
    votes = votes.filter(v => !(v.proposalId === proposalId && v.author === author))

    // value=0 means clear — don't re-add
    if (value !== 0) {
      votes.push({
        proposalId,
        author: author.trim(),
        value,
        createdAt: new Date().toISOString(),
      })
    }

    await kv.set(key, votes)

    return res.status(200).json({ ok: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
