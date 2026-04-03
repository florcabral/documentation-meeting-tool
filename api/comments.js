import { kv, getSessionId, KEYS } from './_kv.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const sessionId = getSessionId()
  const key = KEYS.comments(sessionId)

  if (req.method === 'GET') {
    const comments = (await kv.get(key)) || []
    return res.status(200).json({ comments, sessionId })
  }

  if (req.method === 'POST') {
    const { proposalId, author, text } = req.body

    if (!proposalId || !author || !text) {
      return res.status(400).json({ error: 'proposalId, author, and text are required' })
    }

    const comments = (await kv.get(key)) || []

    comments.push({
      proposalId,
      author: author.trim(),
      text: text.trim(),
      createdAt: new Date().toISOString(),
    })

    await kv.set(key, comments)

    return res.status(201).json({ ok: true })
  }

  if (req.method === 'DELETE') {
    const { proposalId, author, createdAt } = req.body

    if (!proposalId || !author || !createdAt) {
      return res.status(400).json({ error: 'proposalId, author, and createdAt are required' })
    }

    let comments = (await kv.get(key)) || []
    comments = comments.filter(
      c => !(c.proposalId === proposalId && c.author === author && c.createdAt === createdAt)
    )
    await kv.set(key, comments)

    return res.status(200).json({ ok: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
