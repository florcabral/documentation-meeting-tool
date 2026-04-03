import { kv, getSessionId, KEYS } from './_kv.js'
import { readFileSync } from 'fs'
import { join } from 'path'
import { randomUUID } from 'crypto'

function slugify(text) {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

function readSessionJson() {
  const sessionPath = join(process.cwd(), 'session.json')
  return JSON.parse(readFileSync(sessionPath, 'utf8'))
}

async function seedFromSessionJson(key) {
  try {
    const session = readSessionJson()
    if (Array.isArray(session.proposals) && session.proposals.length > 0) {
      const proposals = session.proposals.map((p) => ({
        id: p.id || slugify(p.title),
        title: p.title,
        body: p.body || '',
        author: p.author || 'facilitator',
        createdAt: p.createdAt || new Date().toISOString(),
      }))
      await kv.set(key, proposals)
      return proposals
    }
  } catch {
    // session.json not found or invalid — start empty
  }
  return []
}

async function seedTermsFromSessionJson(termsKey) {
  try {
    const session = readSessionJson()
    if (Array.isArray(session.terms) && session.terms.length > 0) {
      await kv.set(termsKey, session.terms)
      return session.terms
    }
  } catch {
    // session.json not found or no terms — return empty
  }
  return []
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const sessionId = getSessionId()
  const key = KEYS.proposals(sessionId)
  const termsKey = KEYS.terms(sessionId)

  if (req.method === 'GET') {
    let proposals = await kv.get(key)
    if (!proposals) {
      proposals = await seedFromSessionJson(key)
    }

    let terms = await kv.get(termsKey)
    if (!terms) {
      terms = await seedTermsFromSessionJson(termsKey)
    }

    let facilitator = 'facilitator'
    try {
      const session = readSessionJson()
      if (session.facilitator) facilitator = session.facilitator
    } catch { /* use default */ }

    return res.status(200).json({ proposals, terms, sessionId, facilitator })
  }

  if (req.method === 'POST') {
    const { title, body, author } = req.body

    if (!title || !author) {
      return res.status(400).json({ error: 'title and author are required' })
    }

    const proposals = (await kv.get(key)) || []

    const newProposal = {
      id: randomUUID(),
      title: title.trim(),
      body: (body || '').trim(),
      author: author.trim(),
      createdAt: new Date().toISOString(),
    }

    proposals.push(newProposal)
    await kv.set(key, proposals)

    return res.status(201).json({ proposal: newProposal })
  }

  if (req.method === 'PATCH') {
    const { id, title, body } = req.body

    if (!id || !title) {
      return res.status(400).json({ error: 'id and title are required' })
    }

    const proposals = (await kv.get(key)) || []
    const idx = proposals.findIndex((p) => p.id === id)

    if (idx === -1) {
      return res.status(404).json({ error: 'Proposal not found' })
    }

    proposals[idx] = {
      ...proposals[idx],
      title: title.trim(),
      body: (body || '').trim(),
    }

    await kv.set(key, proposals)

    return res.status(200).json({ proposal: proposals[idx] })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
