import React, { useEffect, useState } from 'react'
import { createSubmission, listSubmissions } from './api'

const initial = {
  FullName: '',
  Email: '',
  Mobile: '',
  Company: '',
  Role: '',
  Address: '',
  City: '',
  State: '',
  PinCode: '',
  Date: '',
  Remarks: '',
}

export default function App() {
  const [form, setForm] = useState(initial)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [pdfUrl, setPdfUrl] = useState('')
  const [docxUrl, setDocxUrl] = useState('')
  const [items, setItems] = useState([])

  const validate = () => {
    if (!form.FullName.trim()) return 'Full Name is required'
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.Email)) return 'Valid Email is required'
    if (!form.Mobile.trim()) return 'Mobile is required'
    return ''
  }

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    const err = validate()
    if (err) {
      setMessage(err)
      return
    }
    setLoading(true)
    setMessage('')
    setPdfUrl('')
    setDocxUrl('')
    try {
      const res = await createSubmission(form)
      setMessage(res.message || 'Submitted')
      setPdfUrl(res.pdfUrl || '')
      setDocxUrl(res.docxUrl || '')
      setForm(initial)
      fetchList()
    } catch (e) {
      setMessage(e.message || 'Submission failed')
    } finally {
      setLoading(false)
    }
  }

  const fetchList = async () => {
    try {
      const res = await listSubmissions()
      setItems(res.items || [])
    } catch {}
  }

  useEffect(() => { fetchList() }, [])

  return (
    <div className="container">
      <h1>Metrica Internship Assignment</h1>

      <form onSubmit={onSubmit} className="card">
        <div className="grid">
          {Object.keys(initial).map((k) => (
            <div key={k} className="field">
              <label>{k}</label>
              <input name={k} value={form[k]} onChange={onChange} />
            </div>
          ))}
        </div>
        <button disabled={loading} type="submit">{loading ? 'Submitting…' : 'Submit'}</button>
      </form>

      {message && <p className="message">{message}</p>}

      <div className="links">
        {pdfUrl && <a href={pdfUrl} target="_blank" rel="noreferrer">Download PDF</a>}
        {!pdfUrl && docxUrl && <a href={docxUrl} target="_blank" rel="noreferrer">Download DOCX</a>}
      </div>

      <h2>Previous Submissions</h2>
      <div className="list">
        {items.map((it) => (
          <div key={it.id} className="list-item">
            <div>
              <strong>{it.FullName}</strong>
              <div className="muted">{new Date(it.createdAt).toLocaleString?.() || ''}</div>
            </div>
            <div className="links">
              {it.pdfUrl && <a href={it.pdfUrl} target="_blank" rel="noreferrer">PDF</a>}
              {it.docxUrl && <a href={it.docxUrl} target="_blank" rel="noreferrer">DOCX</a>}
            </div>
          </div>
        ))}
        {!items.length && <div className="muted">No submissions yet.</div>}
      </div>
    </div>
  )
}
