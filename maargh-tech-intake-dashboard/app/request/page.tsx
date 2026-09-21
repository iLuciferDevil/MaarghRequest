'use client'
import { FormEvent, useState } from 'react'
import {
  Check, FileUp, Zap, Target, Users, Link2, Flag, FileText, Send,
  Grid2X2, CircleHelp, ArrowRight, Type, BarChart3, Crosshair
} from 'lucide-react'
import Link from 'next/link'

const initialForm = {
  title: '', requester_name: '', requester_email: '', request_type: '',
  description: '', why_needed: '', business_impact: '', impact_area: '',
  affected_area: '', urgency: '', desired_deadline: '', relevant_url: '',
  expected_outcome: '', dependencies: '', additional_context: ''
}

export default function RequestPage() {
  const [form, setForm] = useState(initialForm)
  const [submitted, setSubmitted] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  const update = (key: keyof typeof initialForm, value: string) =>
    setForm(v => ({ ...v, [key]: value }))

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!confirmed) {
      setError('Please confirm that the information provided is accurate.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const payload = {
        ...form,
        desired_deadline: form.desired_deadline ? form.desired_deadline.slice(0, 10) : '',
        attachments: []
      }
      const r = await fetch(
        'https://cpggikitfurjujtjmbnv.supabase.co/functions/v1/create-tech-request',
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
      )
      const result = await r.json()
      if (!r.ok || result?.ok !== true)
        throw new Error(result?.error || `Request failed (${r.status})`)
      setSubmitted(`MRG-${result.request.request_code}`)
      setForm(initialForm)
      setConfirmed(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request submission failed')
    } finally {
      setBusy(false)
    }
  }

  if (submitted) return (
    <main className="rq-page">
      <div className="rq-bg" aria-hidden="true" />
      <div className="rq-success-card">
        <div className="rq-success-icon"><Check size={28} /></div>
        <span className="rq-kicker">REQUEST RECEIVED</span>
        <h1>Your request is in the queue.</h1>
        <p>The Technology team has received your request.</p>
        <strong className="rq-code">{submitted}</strong>
        <Link className="rq-submit-btn" href="/request">
          Submit another request <ArrowRight size={16} />
        </Link>
      </div>
    </main>
  )

  return (
    <main className="rq-page">
      <div className="rq-bg" aria-hidden="true" />
      <div className="rq-card">
        <form onSubmit={submit} className="rq-form">
          {/* Row: Request type + Urgency */}
          <div className="rq-row">
            <Field label="Request type" required icon={<Grid2X2 size={16} />}>
              <select required value={form.request_type} onChange={e => update('request_type', e.target.value)}>
                <option value="">Select type</option>
                <option value="feature">Feature request</option>
                <option value="bug">Something isn&apos;t working</option>
                <option value="improvement">Improvement</option>
                <option value="data_reporting">Data / reporting</option>
                <option value="content_admin">Content / admin</option>
                <option value="other">Something else</option>
              </select>
            </Field>
            <Field label="Urgency" icon={<Zap size={16} />}>
              <select required value={form.urgency} onChange={e => update('urgency', e.target.value)}>
                <option value="">Select urgency</option>
                <option value="blocking">Blocking</option>
                <option value="high">High</option>
                <option value="normal">Normal</option>
                <option value="low">Low</option>
              </select>
            </Field>
          </div>

          {/* Title */}
          <Field label="Title" required icon={<Type size={16} />}>
            <input required value={form.title} onChange={e => update('title', e.target.value)} placeholder="Short and clear title for your request" />
          </Field>

          {/* Description */}
          <Field label="Description" required icon={<FileText size={16} />}>
            <textarea required rows={3} value={form.description} onChange={e => update('description', e.target.value)} placeholder="Tell us more about the request" />
          </Field>

          {/* Row: Why needed + Business impact */}
          <div className="rq-row">
            <Field label="Why is this needed?" required icon={<CircleHelp size={16} />}>
              <textarea required rows={2} value={form.why_needed} onChange={e => update('why_needed', e.target.value)} placeholder="What problem are we trying to solve?" />
            </Field>
            <Field label="Business impact" icon={<BarChart3 size={16} />}>
              <textarea required rows={2} value={form.business_impact} onChange={e => update('business_impact', e.target.value)} placeholder="How will this help the business?" />
            </Field>
          </div>

          {/* Row: Impact area + Affected */}
          <div className="rq-row">
            <Field label="Impact area" required icon={<Crosshair size={16} />}>
              <select required value={form.impact_area} onChange={e => update('impact_area', e.target.value)}>
                <option value="">Select impact area</option>
                <option>Revenue</option>
                <option>Users</option>
                <option>Retention</option>
                <option>Operations</option>
                <option>Product</option>
                <option>Compliance</option>
                <option>Customer experience</option>
                <option>Other</option>
              </select>
            </Field>
            <Field label="Who/what is affected?" required icon={<Users size={16} />}>
              <input required value={form.affected_area} onChange={e => update('affected_area', e.target.value)} placeholder="e.g. Customers, Internal team, Specific users" />
            </Field>
          </div>

          {/* Row: Expected outcome + Dependencies */}
          <div className="rq-row">
            <Field label="Expected outcome" icon={<Flag size={16} />}>
              <input value={form.expected_outcome} onChange={e => update('expected_outcome', e.target.value)} placeholder="What does success look like?" />
            </Field>
            <Field label="Dependencies" icon={<Link2 size={16} />}>
              <input value={form.dependencies} onChange={e => update('dependencies', e.target.value)} placeholder="Any dependencies?" />
            </Field>
          </div>

          {/* Row: Additional context + Relevant URL */}
          <div className="rq-row">
            <Field label="Additional context" icon={<FileText size={16} />}>
              <textarea rows={3} value={form.additional_context} onChange={e => update('additional_context', e.target.value)} placeholder="Any other information that might help?" />
            </Field>
            <Field label="Relevant URL (optional)" icon={<Link2 size={16} />}>
              <input type="url" value={form.relevant_url} onChange={e => update('relevant_url', e.target.value)} placeholder="Paste link (Figma, doc, etc.)" />
            </Field>
          </div>

          {/* Row: Name + Email */}
          <div className="rq-row">
            <Field label="Your name" required>
              <input required value={form.requester_name} onChange={e => update('requester_name', e.target.value)} placeholder="Your name" />
            </Field>
            <Field label="Your email" required>
              <input required type="email" value={form.requester_email} onChange={e => update('requester_email', e.target.value)} placeholder="you@example.com" />
            </Field>
          </div>

          {/* File upload */}
          <label className="rq-upload">
            <FileUp size={18} />
            <span><strong>Screenshot or file attachment</strong><small>Optional</small></span>
            <input type="file" accept="image/*,.pdf,.doc,.docx,.txt" />
          </label>

          {error && <p className="rq-error">{error}</p>}

          {/* Footer: confirm + submit */}
          <div className="rq-footer">
            <label className="rq-confirm">
              <input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} />
              <span>I confirm that the information provided is accurate.</span>
            </label>
            <button className="rq-submit-btn" disabled={busy}>
              {busy ? 'Submitting…' : 'Submit request'} <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}

function Field({ label, required, icon, children }: {
  label: string; required?: boolean; icon?: React.ReactNode; children: React.ReactNode
}) {
  return (
    <label className="rq-field">
      <span className="rq-label">
        {label}
        {required && <b> *</b>}
      </span>
      <div className="rq-input-wrap">
        {icon && <span className="rq-icon">{icon}</span>}
        {children}
      </div>
    </label>
  )
}
