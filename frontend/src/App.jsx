import React, { useEffect, useState } from 'react'
import { createSubmission, listSubmissions } from './api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Select } from '@/components/ui/select'

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

  const labels = { FullName: 'Full Name' }

  // Disable submit until all fields have a non-empty value
  const allFilled = Object.keys(initial).every((k) => String(form[k] ?? '').trim() !== '')

  const IN_STATES = [
    'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal'
  ]

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
    <div className="mx-auto max-w-4xl p-4">
      <h1 className="text-2xl font-semibold mb-4">Metrica Internship Assignment</h1>

      <Card className="mb-4 animate-in fade-in-50">
        <CardContent className="pt-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.keys(initial).map((k) => {
                const isDate = k === 'Date'
                const isState = k === 'State'
                return (
                  <div key={k} className="flex flex-col gap-1.5">
                    <Label htmlFor={k}>
                      {labels[k] || k}
                      <span className="text-destructive ml-0.5" aria-hidden>*</span>
                      <span className="sr-only"> required</span>
                    </Label>
                    {isState ? (
                      <Select
                        id={k}
                        name={k}
                        value={form[k]}
                        onChange={onChange}
                        required
                        aria-required="true"
                        className="transition-colors"
                      >
                        <option value="">Select State</option>
                        {IN_STATES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </Select>
                    ) : (
                      <Input
                        id={k}
                        name={k}
                        value={form[k]}
                        onChange={onChange}
                        type={isDate ? 'date' : undefined}
                        required
                        aria-required="true"
                        className="transition-colors"
                      />
                    )}
                  </div>
                )
              })}
            </div>
            <Button disabled={loading || !allFilled} type="submit" className="transition-colors">
              {loading ? 'Submitting…' : 'Submit'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {message && (
        <p className="text-sm text-muted-foreground mb-2 animate-in fade-in-50">
          {message}
        </p>
      )}

      <div className="flex gap-3 mb-6">
        {pdfUrl && (
          <Button asChild variant="default" className="transition-colors">
            <a href={pdfUrl} target="_blank" rel="noreferrer">Download PDF</a>
          </Button>
        )}
        {!pdfUrl && docxUrl && (
          <Button asChild variant="link" className="transition-colors">
            <a href={docxUrl} target="_blank" rel="noreferrer">Download DOCX</a>
          </Button>
        )}
      </div>

      <h2 className="text-xl font-medium mb-2">Previous Submissions</h2>
      <div className="flex flex-col gap-2 animate-in fade-in-50">
        {items.map((it) => (
          <Card key={it.id} className="transition-colors hover:bg-accent/10">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <div className="font-medium">{it.FullName}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(it.createdAt).toLocaleString?.() || ''}
                </div>
              </div>
              <div className="flex gap-3">
                {it.pdfUrl && (
                  <Button asChild variant="outline" className="transition-colors">
                    <a href={it.pdfUrl} target="_blank" rel="noreferrer">PDF</a>
                  </Button>
                )}
                {it.docxUrl && (
                  <Button asChild variant="outline" className="transition-colors">
                    <a href={it.docxUrl} target="_blank" rel="noreferrer">DOCX</a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {!items.length && (
          <div className="text-sm text-muted-foreground">No submissions yet.</div>
        )}
      </div>
    </div>
  )
}
