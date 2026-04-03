import { kv, getSessionId, KEYS } from './_kv.js'
import { readFileSync } from 'fs'
import { join } from 'path'
import { randomUUID } from 'crypto'

function slugify(text) {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

async function seedFromSessionJson(key) {
  try {
    const sessionPath = join(process.cwd(), 'session.json')
    const session = JSON.parse(readFileSync(sessionPath, 'utf8'))
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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const sessionId = getSessionId()
  const key = KEYS.proposals(sessionId)

  if (req.method === 'GET') {
    let proposals = await kv.get(key)

    if (!proposals) {
      proposals = await seedFromSessionJson(key)
    }

    return res.status(200).json({ proposals, sessionId })
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

  return res.status(405).json({ error: 'Method not allowed' })
}
