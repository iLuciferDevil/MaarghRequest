'use client'
import {FormEvent,useState} from 'react'
import {Check,FileUp,Zap,Target,Users,Link2,Flag,FileText,Send,Grid2X2,CircleHelp} from 'lucide-react'
import Link from 'next/link'
const initialForm={title:'',requester_name:'',requester_email:'',request_type:'',description:'',why_needed:'',business_impact:'',impact_area:'',affected_area:'',urgency:'',desired_deadline:'',relevant_url:'',expected_outcome:'',dependencies:'',additional_context:''}
export default function RequestPage(){
 const [form,setForm]=useState(initialForm),[submitted,setSubmitted]=useState<string|null>(null),[error,setError]=useState<string|null>(null),[busy,setBusy]=useState(false),[confirmed,setConfirmed]=useState(false)
 const update=(key:keyof typeof initialForm,value:string)=>setForm(v=>({...v,[key]:value}))
 async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();if(!confirmed){setError('Please confirm that the information provided is accurate.');return}setBusy(true);setError(null);try{const payload={...form,desired_deadline:form.desired_deadline?form.desired_deadline.slice(0,10):'',attachments:[]};const r=await fetch('https://cpggikitfurjujtjmbnv.supabase.co/functions/v1/create-tech-request',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});const result=await r.json();if(!r.ok||result?.ok!==true)throw new Error(result?.error||`Request failed (${r.status})`);setSubmitted(`MRG-${result.request.request_code}`);setForm(initialForm);setConfirmed(false)}catch(e){setError(e instanceof Error?e.message:'Request submission failed')}finally{setBusy(false)}}
 if(submitted)return <main className="tiger-request-page"><style jsx global>{`
.tiger-request-page{min-height:100vh;background:#090706;color:#f4ead8}
.tiger-scene{position:relative;min-height:100vh;display:block;overflow:hidden;background:#090706}
.tiger-visual{position:absolute;inset:0;background-image:linear-gradient(90deg,rgba(8,6,4,.02) 0%,rgba(8,6,4,.05) 45%,rgba(8,6,4,.88) 78%,#090706 100%),url('/tiger-bg.webp');background-size:cover;background-position:center;transform:scaleX(-1)}
.tiger-form-shell{position:relative;z-index:2;width:59%;min-height:100vh;margin-left:auto;padding:48px 5vw 52px 4vw;display:flex;align-items:flex-start;background:linear-gradient(90deg,rgba(9,7,5,.62),rgba(9,7,5,.91) 18%,rgba(9,7,5,.96));border-left:1px solid rgba(214,164,73,.16);backdrop-filter:blur(2px)}
.tiger-form-inner{width:min(720px,100%);margin:auto 0}
.tiger-heading{margin-bottom:30px}
.tiger-heading h1{margin:0;color:#efc66d;font-family:Georgia,'Times New Roman',serif;font-size:clamp(38px,3.2vw,56px);font-weight:500;letter-spacing:.6px}
.heading-rule{width:55px;height:3px;background:#efb33e;margin-top:18px;box-shadow:0 0 14px rgba(239,179,62,.3)}
.tiger-form{gap:14px}
.tiger-section{margin-top:5px;padding:8px 0 9px;border-bottom:1px solid #49351e}
.tiger-section h2{margin:0;color:#dcae58;font-size:18px;letter-spacing:.4px;text-transform:none;font-weight:500}
.section-number{color:#a8792d}
.tiger-grid{gap:12px}
.tiger-field{gap:6px}
.tiger-field>span{color:#eee2cf;font-size:11px}
.tiger-field>span svg{color:#dcae58}
.tiger-field b{color:#e9ad3b}
.tiger-field input,.tiger-field textarea,.tiger-field select{border:1px solid #5a5a5b;border-radius:7px;background:linear-gradient(180deg,#252629,#1d1e21);color:#f5eee2;padding:11px 12px;font-size:12px;box-shadow:inset 0 1px 0 rgba(255,255,255,.03)}
.tiger-field textarea{min-height:76px}
.tiger-field input::placeholder,.tiger-field textarea::placeholder{color:#929397}
.tiger-field input:focus,.tiger-field textarea:focus,.tiger-field select:focus{border-color:#d9a23c;box-shadow:0 0 0 2px rgba(217,162,60,.14)}
.field-letter{font-size:17px;line-height:1;color:#dcae58}
.requester-row{margin-top:2px}
.tiger-upload{border:1px dashed #72562c;background:rgba(17,14,10,.72);padding:12px}
.tiger-submit-row{padding-top:7px;align-items:center}
.tiger-confirm{display:flex;align-items:center;gap:9px;color:#d1c7b8;font-family:Arial,sans-serif;font-size:10px}
.tiger-confirm input{accent-color:#e6a72f;width:17px;height:17px}
.tiger-button{border-radius:7px;padding:12px 19px;background:linear-gradient(135deg,#e5a52e,#f5bb4b);border-color:#f0bd59;color:#1b1105}
@media(max-width:1000px){.tiger-form-shell{width:64%;padding-left:4vw}}
@media(max-width:760px){.tiger-scene{display:flex;flex-direction:column}.tiger-visual{position:relative;min-height:48vh;background-position:center;transform:scaleX(-1)}.tiger-form-shell{width:100%;min-height:auto;margin:0;padding:34px 20px 42px;background:linear-gradient(180deg,#0b0806,#0d0906)}.tiger-grid.two{grid-template-columns:1fr}.tiger-heading h1{font-size:40px}.tiger-submit-row{align-items:flex-start;flex-direction:column}.tiger-button{width:100%}}
`}</style><div className="tiger-success"><div className="tiger-success-mark"><Check size={28}/></div><span className="gold-kicker">REQUEST RECEIVED</span><h1>Your request is in the queue.</h1><p>The Technology team has received your request.</p><strong>{submitted}</strong><Link className="tiger-button" href="/request">Submit another request <Send size={15}/></Link></div></main>
 return <main className="tiger-request-page"><div className="tiger-scene"><div className="tiger-visual" aria-hidden="true"/><section className="tiger-form-shell"><div className="tiger-form-inner">
  <div className="tiger-heading"><h1>TECH REQUEST</h1><div className="heading-rule"/></div>
  <form onSubmit={submit} className="tiger-form">
   <div className="tiger-section"><span className="section-number">01</span><h2>Request</h2></div>
   <div className="tiger-grid two">
    <Field label="Request type" required icon={<Grid2X2 size={15}/>}><select required value={form.request_type} onChange={e=>update('request_type',e.target.value)}><option value="">Select type</option><option value="feature">Feature request</option><option value="bug">Something isn't working</option><option value="improvement">Improvement</option><option value="data_reporting">Data / reporting</option><option value="content_admin">Content / admin</option><option value="other">Something else</option></select></Field>
    <Field label="Urgency" required icon={<Zap size={15}/>}><select required value={form.urgency} onChange={e=>update('urgency',e.target.value)}><option value="">Select urgency</option><option value="blocking">Blocking</option><option value="high">High</option><option value="normal">Normal</option><option value="low">Low</option></select></Field>
   </div>
   <Field label="Title" required icon={<span className="field-letter">T</span>}><input required value={form.title} onChange={e=>update('title',e.target.value)} placeholder="Short and clear title"/></Field>
   <Field label="Description" required icon={<FileText size={15}/>}><textarea required rows={3} value={form.description} onChange={e=>update('description',e.target.value)} placeholder="Tell us more about the request"/></Field>
   <div className="tiger-section"><h2>Business context</h2></div>
   <div className="tiger-grid two">
    <Field label="Why is this needed?" required icon={<CircleHelp size={15}/>}><textarea required rows={3} value={form.why_needed} onChange={e=>update('why_needed',e.target.value)} placeholder="What problem are we trying to solve?"/></Field>
    <Field label="Business impact" required icon={<Target size={15}/>}><textarea required rows={3} value={form.business_impact} onChange={e=>update('business_impact',e.target.value)} placeholder="How will this help the business?"/></Field>
    <Field label="Impact area" required icon={<Target size={15}/>}><select required value={form.impact_area} onChange={e=>update('impact_area',e.target.value)}><option value="">Select impact area</option><option>Revenue</option><option>Users</option><option>Retention</option><option>Operations</option><option>Product</option><option>Compliance</option><option>Customer experience</option><option>Other</option></select></Field>
    <Field label="Who/what is affected?" required icon={<Users size={15}/>}><input required value={form.affected_area} onChange={e=>update('affected_area',e.target.value)} placeholder="e.g. Customers, Internal team, Specific users"/></Field>
   </div>
   <div className="tiger-section"><h2>Additional information</h2></div>
   <div className="tiger-grid two">
    <Field label="Expected outcome" icon={<Flag size={15}/>}><input value={form.expected_outcome} onChange={e=>update('expected_outcome',e.target.value)} placeholder="What does success look like?"/></Field>
    <Field label="Dependencies" icon={<Link2 size={15}/>}><input value={form.dependencies} onChange={e=>update('dependencies',e.target.value)} placeholder="Any dependencies?"/></Field>
    <Field label="Additional context" icon={<FileText size={15}/>}><textarea rows={3} value={form.additional_context} onChange={e=>update('additional_context',e.target.value)} placeholder="Any other information that might help?"/></Field>
    <Field label="Relevant URL (optional)" icon={<Link2 size={15}/>}><input type="url" value={form.relevant_url} onChange={e=>update('relevant_url',e.target.value)} placeholder="Paste link (Figma, doc, etc.)"/></Field>
   </div>
   <div className="tiger-grid two requester-row"><Field label="Your name" required><input required value={form.requester_name} onChange={e=>update('requester_name',e.target.value)} placeholder="Your name"/></Field><Field label="Your email" required><input required type="email" value={form.requester_email} onChange={e=>update('requester_email',e.target.value)} placeholder="you@example.com"/></Field></div>
   <label className="tiger-upload"><FileUp size={18}/><span><strong>Screenshot or file attachment</strong><small>Optional</small></span><input type="file" accept="image/*,.pdf,.doc,.docx,.txt"/></label>
   {error&&<p className="tiger-error">{error}</p>}
   <div className="tiger-submit-row"><label className="tiger-confirm"><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/><span>I confirm that the information provided is accurate.</span></label><button className="tiger-button" disabled={busy}>{busy?'Submitting…':'Submit request'} <Send size={15}/></button></div>
  </form>
 </div></section></div></main>
}
function Field({label,required,icon,children}:{label:string;required?:boolean;icon?:React.ReactNode;children:React.ReactNode}){return <label className="tiger-field"><span>{icon}{label}{required&&<b> *</b>}</span>{children}</label>}
