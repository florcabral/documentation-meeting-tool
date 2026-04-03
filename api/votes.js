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

    if (!proposalId || !author || (value !== 1 && value !== -1)) {
      return res.status(400).json({ error: 'proposalId, author, and value (+1 or -1) are required' })
    }

    let votes = (await kv.get(key)) || []

    // One vote per author per proposal — overwrite existing
    votes = votes.filter(v => !(v.proposalId === proposalId && v.author === author))
    votes.push({
      proposalId,
      author: author.trim(),
      value,
      createdAt: new Date().toISOString(),
    })

    await kv.set(key, votes)

    return res.status(200).json({ ok: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
