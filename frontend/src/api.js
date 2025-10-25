// In Vercel, default to proxy path "/api" (rewritten by vercel.json). Locally, default to FastAPI at 127.0.0.1:8000.
const defaultBase = (typeof window !== 'undefined' && window.location.hostname.endsWith('vercel.app'))
  ? '/api'
  : 'http://127.0.0.1:8000'
const API_BASE = import.meta.env.VITE_API_BASE || defaultBase

export async function createSubmission(payload) {
  const res = await fetch(`${API_BASE}/api/submissions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('Failed to submit')
  return res.json()
}

export async function listSubmissions() {
  const res = await fetch(`${API_BASE}/api/submissions`)
  if (!res.ok) throw new Error('Failed to fetch submissions')
  return res.json()
}
