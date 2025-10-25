const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000'

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
