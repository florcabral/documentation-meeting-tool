import { kv, getSessionId, KEYS } from './_kv.js'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const EMPTY_SESSION = {
  id: '',
  title: '',
  date: '',
  facilitator: 'facilitator',
  proposals: [],
  terms: [],
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const sessionId = getSessionId()

  // Clear all session data from KV
  await Promise.all([
    kv.del(KEYS.proposals(sessionId)),
    kv.del(KEYS.votes(sessionId)),
    kv.del(KEYS.comments(sessionId)),
    kv.del(KEYS.terms(sessionId)),
  ])

  // fresh: true — blank session.json and set all KV keys to empty arrays so
  // the seeding logic never runs. Use before /propose or /review to start clean.
  if (req.body?.fresh === true) {
    writeFileSync(join(process.cwd(), 'session.json'), JSON.stringify(EMPTY_SESSION, null, 2))
    await Promise.all([
      kv.set(KEYS.proposals(sessionId), []),
      kv.set(KEYS.terms(sessionId), []),
    ])
    return res.status(200).json({ ok: true, sessionId, fresh: true })
  }

  // Default — reseed proposals and terms from session.json
  let proposals = []
  let terms = []
  try {
    const session = JSON.parse(readFileSync(join(process.cwd(), 'session.json'), 'utf8'))
    if (Array.isArray(session.proposals) && session.proposals.length > 0) {
      proposals = session.proposals
      await kv.set(KEYS.proposals(sessionId), proposals)
    }
    if (Array.isArray(session.terms) && session.terms.length > 0) {
      terms = session.terms
      await kv.set(KEYS.terms(sessionId), terms)
    }
  } catch {
    // session.json missing or invalid — start with empty proposals and terms
  }

  return res.status(200).json({
    ok: true,
    sessionId,
    proposalsLoaded: proposals.length,
    termsLoaded: terms.length,
  })
}
