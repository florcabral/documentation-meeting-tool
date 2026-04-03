import { kv } from '@vercel/kv'

export { kv }

export function getSessionId() {
  return process.env.SESSION_ID || new Date().toISOString().slice(0, 10).replace(/-/g, '')
}

export const KEYS = {
  proposals: (sid) => `session:${sid}:proposals`,
  votes: (sid) => `session:${sid}:votes`,
  comments: (sid) => `session:${sid}:comments`,
  terms: (sid) => `session:${sid}:terms`,
}
