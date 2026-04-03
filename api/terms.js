import { kv, getSessionId, KEYS } from './_kv.js'
import { readFileSync } from 'fs'
import { join } from 'path'

function slugify(text) {
  return 'term--' + text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

// Action verbs that can safely be stripped when leading a bullet and followed
// by a capitalised noun phrase (e.g. "Deliver Over-The-Air updates" → "Over-The-Air updates").
const LEADING_VERBS = new Set([
  'deliver', 'provide', 'support', 'enable', 'manage', 'handle',
  'implement', 'configure', 'execute', 'track', 'send', 'receive',
  'launch', 'automate', 'ensure', 'allow', 'expose', 'register',
])

function normalizeLabel(raw) {
  let s = raw
    // Step 1: strip matched paren pairs first, so "(OTA)" in
    // "Over-The-Air (OTA) updates" is removed without taking the rest of the line.
    .replace(/\s*\([^)]*\)/g, '')
    // Step 2: strip any remaining unclosed '(' to end of line
    // (handles "Get started (→ quickstarts per product)" after arrow stripping).
    .replace(/\s*\(.*$/g, '')
    // Strip trailing prepositional/adverbial qualifiers followed by a lowercase word:
    // "in real-time", "at scale", "via the dashboard".
    // 'for', 'on', 'over' excluded — they appear in product names
    // (COS for robotics, Over-The-Air, on-device).
    .replace(/\s+(?:in|at|with|via|across|through|from|by)\s+[a-z].*$/g, '')
    .trim()

  // Strip leading action verb when followed by a capitalised noun phrase:
  // "Deliver Over-The-Air updates" → "Over-The-Air updates"
  const leadMatch = s.match(/^(\S+)\s+([A-Z].*)$/)
  if (leadMatch && LEADING_VERBS.has(leadMatch[1].toLowerCase())) {
    s = leadMatch[2]
  }

  if (s.length > 0) {
    s = s[0].toUpperCase() + s.slice(1)
  }

  return s
}

function extractTermsFromProposals(proposals) {
  const seen = new Set()
  const terms = []

  for (const proposal of proposals) {
    const lines = (proposal.body || '').split('\n')
    for (const line of lines) {
      if (!line.startsWith('- ')) continue

      const raw = line.slice(2)
      const parts = raw.split(/\s+&\s+|\s+and\s+/i)

      for (const part of parts) {
        const label = normalizeLabel(part)
        if (!label) continue
        const key = label.toLowerCase()
        if (!seen.has(key)) {
          seen.add(key)
          terms.push({ id: slugify(label), label })
        }
      }
    }
  }

  return terms
}

function readSessionTerms() {
  try {
    const session = JSON.parse(readFileSync(join(process.cwd(), 'session.json'), 'utf8'))
    return Array.isArray(session.terms) ? session.terms : []
  } catch {
    return []
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()

  const sessionId = getSessionId()
  const termsKey = KEYS.terms(sessionId)

  // DELETE { id } — remove a single term chip
  if (req.method === 'DELETE') {
    const { id } = req.body || {}
    if (!id) return res.status(400).json({ error: 'id is required' })

    const existing = (await kv.get(termsKey)) || []
    const updated = existing.filter((t) => t.id !== id)
    await kv.set(termsKey, updated)

    return res.status(200).json({ terms: updated })
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  // POST { refresh: true } — re-extract terms from all KV proposals and merge
  if (req.body?.refresh === true) {
    const proposals = (await kv.get(KEYS.proposals(sessionId))) || []
    const extracted = extractTermsFromProposals(proposals)
    const existing = (await kv.get(termsKey)) || []

    const existingIds = new Set(existing.map((t) => t.id))
    const newTerms = extracted.filter((t) => !existingIds.has(t.id))
    const merged = [...existing, ...newTerms]

    await kv.set(termsKey, merged)

    return res.status(200).json({ terms: merged, added: newTerms.length })
  }

  // POST { reset: true } — restore terms to session.json originals only
  if (req.body?.reset === true) {
    const original = readSessionTerms()
    await kv.set(termsKey, original)
    return res.status(200).json({ terms: original })
  }

  // POST { label } — add a single term manually
  const { label } = req.body || {}
  if (!label || !label.trim()) {
    return res.status(400).json({ error: 'label is required' })
  }

  const raw = label.trim()
  const trimmed = raw.length > 0 ? raw[0].toUpperCase() + raw.slice(1) : raw
  const id = slugify(trimmed)
  const existing = (await kv.get(termsKey)) || []

  if (existing.some((t) => t.id === id)) {
    return res.status(409).json({ error: 'Term already exists' })
  }

  const newTerm = { id, label: trimmed }
  await kv.set(termsKey, [...existing, newTerm])

  return res.status(201).json({ term: newTerm })
}
