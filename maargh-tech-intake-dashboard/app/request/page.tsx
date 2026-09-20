'use client'

import { FormEvent, useState } from 'react'
import { Check, FileUp, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const initialForm = { title:'', requester_name:'', requester_email:'', request_type:'feature', description:'', why_needed:'', business_impact:'', impact_area:'', affected_area:'', urgency:'normal', desired_deadline:'', relevant_url:'', expected_outcome:'', dependencies:'', additional_context:'' }

export default function RequestPage() {
  const [form, setForm] = useState(initialForm)
  const [submitted, setSubmitted] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const update = (key: keyof typeof initialForm, value: string) => setForm((current) => ({ ...current, [key]: value }))
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError(null)

    try {
      const payload = {
        ...form,
        desired_deadline: form.desired_deadline ? form.desired_deadline.slice(0, 10) : '',
        attachments: [],
      }
      const response = await fetch(
        'https://cpggikitfurjujtjmbnv.supabase.co/functions/v1/create-tech-request',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      )
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result?.error || `Request failed (${response.status})`)
      }
      if (result?.ok !== true) {
        throw new Error(result?.error || 'Request submission failed')
      }

      setError(null)
      setBusy(false)
      setSubmitted(`MRG-${result.request.request_code}`)
      setForm(initialForm)
      return
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Request submission failed')
    } finally {
      setBusy(false)
    }
  }
  if (submitted) return <main className="public-page"><div className="public-card success-state"><div className="success-icon"><Check size={26}/></div><h1>Request submitted successfully</h1><p>Your request has been received by the Maargh Tech team.</p><strong className="request-id">Request ID: {submitted}</strong><Link className="primary-button" href="/request">Submit another request</Link></div></main>
  return <main className="public-page"><div className="public-card"><Link href="/" className="back-link"><ArrowLeft size={15}/> Maargh Tech</Link><div className="eyebrow">Technology intake</div><h1>Submit a technology request</h1><p className="lead">Tell us what you need and the technology team will take it from there.</p><form onSubmit={submit} className="public-form"><Field label="Request title" required><input required value={form.title} onChange={e=>update('title',e.target.value)} placeholder="e.g. Add bulk export to campaign reporting"/></Field><div className="form-grid"><Field label="Requester name" required><input required value={form.requester_name} onChange={e=>update('requester_name',e.target.value)}/></Field><Field label="Requester email" required><input required type="email" value={form.requester_email} onChange={e=>update('requester_email',e.target.value)}/></Field><Field label="Request type" required><select value={form.request_type} onChange={e=>update('request_type',e.target.value)}><option value="feature">Feature request</option><option value="bug">Something isn&apos;t working</option><option value="improvement">Improvement</option><option value="data_reporting">Data / reporting</option><option value="content_admin">Content / admin</option><option value="other">Something else</option></select></Field><Field label="Urgency" required><select value={form.urgency} onChange={e=>update('urgency',e.target.value)}><option value="blocking">Blocking</option><option value="high">High</option><option value="normal">Normal</option><option value="low">Low</option></select></Field></div><Field label="Description / what do you need?" required><textarea required rows={5} value={form.description} onChange={e=>update('description',e.target.value)}/></Field><div className="form-grid"><Field label="Why is this needed?"><textarea rows={3} value={form.why_needed} onChange={e=>update('why_needed',e.target.value)}/></Field><Field label="Potential business impact" required><textarea required rows={3} value={form.business_impact} onChange={e=>update('business_impact',e.target.value)}/></Field><Field label="Impact area"><input value={form.impact_area} onChange={e=>update('impact_area',e.target.value)} placeholder="Revenue, operations, customer experience..."/></Field><Field label="Who/what is affected?"><input value={form.affected_area} onChange={e=>update('affected_area',e.target.value)}/></Field><Field label="Desired deadline"><input type="date" value={form.desired_deadline} onChange={e=>update('desired_deadline',e.target.value)}/></Field><Field label="Relevant URL"><input type="url" value={form.relevant_url} onChange={e=>update('relevant_url',e.target.value)} placeholder="https://"/></Field></div><Field label="Expected outcome / success criteria"><textarea rows={3} value={form.expected_outcome} onChange={e=>update('expected_outcome',e.target.value)}/></Field><Field label="Dependencies / blockers"><textarea rows={3} value={form.dependencies} onChange={e=>update('dependencies',e.target.value)}/></Field><Field label="Additional context"><textarea rows={3} value={form.additional_context} onChange={e=>update('additional_context',e.target.value)}/></Field><label className="upload-field"><FileUp size={18}/><span>Screenshot or file attachment <small>Attachments are reviewed with your request</small></span><input type="file" accept="image/*,.pdf,.doc,.docx,.txt"/></label>{error && <p className="form-error">{error}</p>}<button className="primary-button submit-button" disabled={busy}>{busy ? 'Submitting…' : 'Submit request'}</button></form></div></main>
}
function Field({label,required,children}:{label:string;required?:boolean;children:React.ReactNode}) { return <label className="field"><span>{label}{required && <b> *</b>}</span>{children}</label> }
