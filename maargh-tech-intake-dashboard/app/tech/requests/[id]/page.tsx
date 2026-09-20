'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Save } from 'lucide-react'

type Request = Record<string, any>

const STATUS_OPTIONS = [
  ['new', 'New'],
  ['reviewing', 'Reviewing'],
  ['planned', 'Planned'],
  ['in_progress', 'In Progress'],
  ['blocked', 'Blocked'],
  ['done', 'Done'],
  ['rejected', 'Rejected'],
]

export default function RequestDetail() {
  const { id } = useParams<{ id: string }>()
  const [supabase, setSupabase] = useState<ReturnType<typeof createClient> | null>(null)
  const [item, setItem] = useState<Request | null>(null)
  const [activity, setActivity] = useState<any[]>([])
  const [comment, setComment] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    setSupabase(createClient())
  }, [])

  useEffect(() => {
    if (!supabase) return
    Promise.all([
      supabase.from('tech_requests').select('*').eq('id', id).single(),
      supabase.from('tech_request_activity').select('*').eq('request_id', id).order('created_at', { ascending: false }),
    ]).then(([request, events]) => {
      setItem(request.data)
      setActivity(events.data ?? [])
    })
  }, [supabase, id])

  async function save() {
    if (!item || !supabase) return
    setBusy(true)
    setMessage('')

    const status = String(item.status || 'new').toLowerCase().replace(/ /g, '_')
    const { error } = await supabase
      .from('tech_requests')
      .update({
        priority: item.priority,
        status,
        assignee: item.assignee,
        desired_deadline: item.desired_deadline || null,
        internal_notes: item.internal_notes,
        resolution_notes: item.resolution_notes,
      })
      .eq('id', id)

    if (error) {
      setMessage('Could not save changes: ' + error.message)
      setBusy(false)
      return
    }

    setItem({ ...item, status })
    setMessage('Changes saved.')

    try {
      await fetch('https://cpggikitfurjujtjmbnv.supabase.co/functions/v1/create-tech-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'status_update', request_id: id, status }),
      })
    } catch {
      // Request update is already saved; email failure must not block it.
    }

    setBusy(false)
  }

  async function addComment(e: React.FormEvent) {
    e.preventDefault()
    if (!comment.trim() || !supabase) return

    const { error } = await supabase
      .from('tech_request_activity')
      .insert({ request_id: id, author_name: 'Tech team', body: comment.trim() })

    if (error) {
      setMessage('Could not add comment: ' + error.message)
      return
    }

    setComment('')
    const { data } = await supabase
      .from('tech_request_activity')
      .select('*')
      .eq('request_id', id)
      .order('created_at', { ascending: false })
    setActivity(data ?? [])
  }

  if (!item) return <main className="center-state">Loading request…</main>

  const field = (label: string, key: string, type = 'text') => (
    <label className="field">
      <span>{label}</span>
      {type === 'textarea' ? (
        <textarea rows={4} value={item[key] ?? ''} onChange={(e) => setItem({ ...item, [key]: e.target.value })} />
      ) : (
        <input type={type} value={item[key] ?? ''} onChange={(e) => setItem({ ...item, [key]: e.target.value })} />
      )}
    </label>
  )

  return (
    <main className="detail-page">
      <Link href="/tech" className="back-link"><ArrowLeft size={15} /> Back to requests</Link>
      <header className="detail-header">
        <div>
          <span className="eyebrow">{item.request_code}</span>
          <h1>{item.title}</h1>
          <p>{item.requester_name} · {item.requester_email} · Submitted {new Date(item.created_at).toLocaleString()}</p>
        </div>
        <button className="primary-button" onClick={save} disabled={busy}>
          <Save size={16} /> {busy ? 'Saving…' : 'Save changes'}
        </button>
      </header>

      {message && <p className="save-message">{message}</p>}

      <div className="detail-grid">
        <section className="panel detail-panel">
          <h2>Request details</h2>
          <dl className="request-details">
            <dt>Type</dt><dd>{item.request_type}</dd>
            <dt>Urgency</dt><dd>{item.urgency}</dd>
            <dt>Description</dt><dd>{item.description}</dd>
            <dt>Why needed</dt><dd>{item.why_needed || '—'}</dd>
            <dt>Business impact</dt><dd>{item.business_impact}</dd>
            <dt>Impact area</dt><dd>{item.impact_area || '—'}</dd>
            <dt>Affected</dt><dd>{item.affected_area || '—'}</dd>
            <dt>Expected outcome</dt><dd>{item.expected_outcome || '—'}</dd>
            <dt>Dependencies</dt><dd>{item.dependencies || '—'}</dd>
            <dt>Additional context</dt><dd>{item.additional_context || '—'}</dd>
            <dt>Relevant URL</dt><dd>{item.relevant_url || '—'}</dd>
          </dl>
        </section>

        <aside className="panel detail-panel">
          <h2>Manage request</h2>
          <div className="detail-form">
            <label className="field">
              <span>Priority</span>
              <select value={item.priority} onChange={(e) => setItem({ ...item, priority: e.target.value })}>
                {['P0', 'P1', 'P2', 'P3'].map((x) => <option key={x}>{x}</option>)}
              </select>
            </label>

            <label className="field">
              <span>Status</span>
              <select value={item.status} onChange={(e) => setItem({ ...item, status: e.target.value })}>
                {STATUS_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>

            {field('Assignee', 'assignee')}
            {field('Deadline', 'desired_deadline', 'date')}
            {field('Internal notes', 'internal_notes', 'textarea')}
            {field('Resolution notes', 'resolution_notes', 'textarea')}
          </div>

          <h2 className="activity-title">Activity & comments</h2>
          <div className="comments">
            {activity.map((event) => (
              <div className="comment" key={event.id}>
                <strong>{event.author_name}</strong>
                <small>{new Date(event.created_at).toLocaleString()}</small>
                <p>{event.body}</p>
              </div>
            ))}
            {!activity.length && <p className="muted">No activity yet.</p>}
          </div>

          <form className="comment-form" onSubmit={addComment}>
            <textarea rows={3} placeholder="Add a comment" value={comment} onChange={(e) => setComment(e.target.value)} />
            <button className="secondary-button">Add comment</button>
          </form>
        </aside>
      </div>
    </main>
  )
}