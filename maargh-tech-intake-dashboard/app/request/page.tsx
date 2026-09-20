'use client'

import { FormEvent, useState } from 'react'
import { Check, FileUp, ArrowLeft, Shield, Zap, Target, Users, Link2, Flag, FileText, Send } from 'lucide-react'
import Link from 'next/link'

const initialForm = { title:'', requester_name:'', requester_email:'', request_type:'feature', description:'', why_needed:'', business_impact:'', impact_area:'', affected_area:'', urgency:'normal', desired_deadline:'', relevant_url:'', expected_outcome:'', dependencies:'', additional_context:'' }

export default function RequestPage() {
  const [form, setForm] = useState(initialForm)
  const [submitted, setSubmitted] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const update = (key: keyof typeof initialForm, value: string) => setForm(current => ({...current,[key]:value}))

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(null)
    try {
      const payload={...form,desired_deadline:form.desired_deadline?form.desired_deadline.slice(0,10):'',attachments:[]}
      const response=await fetch('https://cpggikitfurjujtjmbnv.supabase.co/functions/v1/create-tech-request',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)})
      const result=await response.json()
      if(!response.ok||result?.ok!==true) throw new Error(result?.error||`Request failed (${response.status})`)
      setSubmitted(`MRG-${result.request.request_code}`); setForm(initialForm)
    } catch(e){setError(e instanceof Error?e.message:'Request submission failed')} finally{setBusy(false)}
  }

  if(submitted) return <main className="tiger-request-page"><div className="tiger-success"><div className="tiger-success-mark"><Check size={28}/></div><span className="gold-kicker">REQUEST RECEIVED</span><h1>Your request is in the queue.</h1><p>The Technology team has received your request.</p><strong>MRG-{submitted.replace('MRG-','')}</strong><Link className="tiger-button" href="/request">Submit another request <Send size={15}/></Link></div></main>

  return <main className="tiger-request-page">
    <div className="tiger-scene">
      <div className="tiger-visual" aria-hidden="true">
        <div className="tiger-vignette"/>
        <div className="tiger-sun"/>
        <div className="tiger-visual-caption"> </div>
      </div>
      <section className="tiger-form-shell">
        <div className="tiger-form-inner">
          <Link href="/" className="tiger-back"><ArrowLeft size={15}/> Back</Link>
          <div className="tiger-heading"><span className="gold-kicker">TECHNOLOGY INTAKE</span><h1>Request the pack.</h1><p>Bring the problem. Give us the context. We will take it from there.</p></div>
          <form onSubmit={submit} className="tiger-form">
            <div className="tiger-section"><span className="section-number">01</span><h2>Request</h2></div>
            <div className="tiger-grid two">
              <Field label="Request title" required icon={<FileText size={15}/>}><input required value={form.title} onChange={e=>update('title',e.target.value)} placeholder="Short, clear title"/></Field>
              <Field label="Request type" required icon={<Zap size={15}/>}><select required value={form.request_type} onChange={e=>update('request_type',e.target.value)}><option value="feature">Feature request</option><option value="bug">Something isn't working</option><option value="improvement">Improvement</option><option value="data_reporting">Data / reporting</option><option value="content_admin">Content / admin</option><option value="other">Something else</option></select></Field>
            </div>
            <div className="tiger-grid two">
              <Field label="Requester name" required><input required value={form.requester_name} onChange={e=>update('requester_name',e.target.value)}/></Field>
              <Field label="Requester email" required><input required type="email" value={form.requester_email} onChange={e=>update('requester_email',e.target.value)}/></Field>
            </div>
            <Field label="What do you need?" required icon={<FileText size={15}/>}><textarea required rows={4} value={form.description} onChange={e=>update('description',e.target.value)} placeholder="Describe the request clearly."/></Field>

            <div className="tiger-section"><span className="section-number">02</span><h2>Why it matters</h2></div>
            <div className="tiger-grid two">
              <Field label="Why is this needed?" required icon={<Shield size={15}/>}><textarea required rows={3} value={form.why_needed} onChange={e=>update('why_needed',e.target.value)} placeholder="What problem are we solving?"/></Field>
              <Field label="Potential business impact" required icon={<Target size={15}/>}><textarea required rows={3} value={form.business_impact} onChange={e=>update('business_impact',e.target.value)} placeholder="What changes if we do this?"/></Field>
              <Field label="Impact area" required icon={<Target size={15}/>}><select required value={form.impact_area} onChange={e=>update('impact_area',e.target.value)}><option value="">Select impact area</option><option>Revenue</option><option>Users</option><option>Retention</option><option>Operations</option><option>Product</option><option>Compliance</option><option>Customer experience</option><option>Other</option></select></Field>
              <Field label="Who/what is affected?" required icon={<Users size={15}/>}><input required value={form.affected_area} onChange={e=>update('affected_area',e.target.value)} placeholder="Customers, internal team, feature, etc."/></Field>
            </div>

            <div className="tiger-section"><span className="section-number">03</span><h2>Details</h2></div>
            <div className="tiger-grid two">
              <Field label="Urgency" required icon={<Zap size={15}/>}><select required value={form.urgency} onChange={e=>update('urgency',e.target.value)}><option value="blocking">Blocking</option><option value="high">High</option><option value="normal">Normal</option><option value="low">Low</option></select></Field>
              <Field label="Desired deadline" icon={<Flag size={15}/>}><input type="date" value={form.desired_deadline} onChange={e=>update('desired_deadline',e.target.value)}/></Field>
              <Field label="Expected outcome / success criteria"><textarea rows={3} value={form.expected_outcome} onChange={e=>update('expected_outcome',e.target.value)} placeholder="What does success look like?"/></Field>
              <Field label="Dependencies / blockers"><textarea rows={3} value={form.dependencies} onChange={e=>update('dependencies',e.target.value)} placeholder="Anything blocking progress?"/></Field>
              <Field label="Relevant URL" icon={<Link2 size={15}/>}><input type="url" value={form.relevant_url} onChange={e=>update('relevant_url',e.target.value)} placeholder="https://"/></Field>
              <Field label="Additional context"><textarea rows={3} value={form.additional_context} onChange={e=>update('additional_context',e.target.value)} placeholder="Anything else we should know?"/></Field>
            </div>
            <label className="tiger-upload"><FileUp size={18}/><span><strong>Screenshot or file attachment</strong><small>Optional</small></span><input type="file" accept="image/*,.pdf,.doc,.docx,.txt"/></label>
            {error&&<p className="tiger-error">{error}</p>}
            <div className="tiger-submit-row"><span><Shield size={15}/> Required fields are marked with *</span><button className="tiger-button" disabled={busy}>{busy?'Submitting…':'Submit request'} <Send size={15}/></button></div>
          </form>
        </div>
      </section>
    </div>
  </main>
}

function Field({label,required,icon,children}:{label:string;required?:boolean;icon?:React.ReactNode;children:React.ReactNode}) {
 return <label className="tiger-field"><span>{icon}{label}{required&&<b> *</b>}</span>{children}</label>
}