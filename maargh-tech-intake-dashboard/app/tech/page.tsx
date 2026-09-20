'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowUpRight, Download, FileText, Search, Sparkles, RefreshCw, X } from 'lucide-react'

type Request = {
 id:string; request_code:string|number; title:string; requester_name:string; requester_email:string;
 request_type:string; description:string; why_needed:string|null; business_impact:string;
 impact_area:string|null; affected_area:string|null; urgency:string; priority:string; status:string;
 assignee:string|null; desired_deadline:string|null; relevant_url:string|null; expected_outcome:string|null;
 dependencies:string|null; additional_context:string|null; internal_notes:string|null; resolution_notes:string|null;
 created_at:string; updated_at:string; completed_at:string|null
}

const STATUS=[['all','All'],['new','New'],['reviewing','Reviewing'],['planned','Planned'],['in_progress','In Progress'],['blocked','Blocked'],['done','Done'],['rejected','Rejected']]
const PRIORITIES=['All','P0','P1','P2','P3']
const TYPES=[['All','All'],['bug','Bug'],['feature','Feature'],['improvement','Improvement'],['data_reporting','Data / reporting'],['content_admin','Content / admin'],['other','Other']]
const URGENCY=[['All','All'],['blocking','Blocking'],['high','High'],['normal','Normal'],['low','Low']]

function csvValue(value:any){const s=value==null?'':String(value);return '"'+s.replace(/"/g,'""')+'"'}
function downloadCsv(rows:Request[], filename:string){
 const headers=['Request ID','Title','Requester','Requester Email','Type','Description','Business Impact','Impact Area','Affected Area','Urgency','Priority','Status','Assignee','Deadline','Created','Updated','Completed','Relevant URL','Expected Outcome','Dependencies','Internal Notes','Resolution Notes']
 const keys=['request_code','title','requester_name','requester_email','request_type','description','business_impact','impact_area','affected_area','urgency','priority','status','assignee','desired_deadline','created_at','updated_at','completed_at','relevant_url','expected_outcome','dependencies','internal_notes','resolution_notes']
 const csv=[headers.map(csvValue).join(','),...rows.map(r=>keys.map(k=>csvValue((r as any)[k])).join(','))].join('\r\n')
 const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;a.click();URL.revokeObjectURL(url)
}
function monthEnd(month:string){if(!month)return '';const [y,m]=month.split('-').map(Number);return new Date(y,m,0).toISOString().slice(0,10)}
function prettyStatus(s:string){return s.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}

export default function TechPage(){
 const [supabase,setSupabase]=useState<ReturnType<typeof createClient>|null>(null)
 const [requests,setRequests]=useState<Request[]>([])
 const [loading,setLoading]=useState(true)
 const [error,setError]=useState('')
 const [filters,setFilters]=useState({search:'',status:'all',priority:'All',type:'All',urgency:'All',month:'',start:'',end:'',sort:'newest'})
 const [refresh,setRefresh]=useState(0)
 const [showSummary,setShowSummary]=useState(false)

 useEffect(()=>{setSupabase(createClient())},[])
 useEffect(()=>{
  if(!supabase)return
  setLoading(true)
  supabase.from('tech_requests').select('*').order('created_at',{ascending:false}).then(({data,error})=>{
   if(error)setError('Could not load requests: '+error.message);else setError('')
   setRequests((data??[]) as Request[]);setLoading(false)
  })
 },[supabase,refresh])

 const filtered=useMemo(()=>requests.filter(r=>{
  const q=filters.search.toLowerCase(), created=r.created_at.slice(0,10)
  const start=filters.month?filters.month+'-01':filters.start, end=filters.month?monthEnd(filters.month):filters.end
  return (!q||`${r.title} ${r.request_code} ${r.requester_name} ${r.requester_email}`.toLowerCase().includes(q)) &&
   (filters.status==='all'||r.status===filters.status)&&(filters.priority==='All'||r.priority===filters.priority)&&
   (filters.type==='All'||r.request_type===filters.type)&&(filters.urgency==='All'||r.urgency===filters.urgency)&&
   (!start||created>=start)&&(!end||created<=end)
 }).sort((a,b)=>filters.sort==='oldest'?a.created_at.localeCompare(b.created_at):filters.sort==='title'?a.title.localeCompare(b.title):b.created_at.localeCompare(a.created_at)),[requests,filters])

 const counts=useMemo(()=>Object.fromEntries(STATUS.map(([v])=>[v,v==='all'?requests.length:requests.filter(r=>r.status===v).length])),[requests])
 const open=requests.filter(r=>!['done','rejected'].includes(r.status)).length
 const inProgress=requests.filter(r=>r.status==='in_progress').length
 const done=requests.filter(r=>r.status==='done').length

 const summary=useMemo(()=>{
  const total=filtered.length,doneN=filtered.filter(r=>r.status==='done').length,rejected=filtered.filter(r=>r.status==='rejected').length
  const pipeline=filtered.filter(r=>!['done','rejected'].includes(r.status)).length,blocked=filtered.filter(r=>r.status==='blocked').length
  const high=filtered.filter(r=>['P0','P1'].includes(r.priority)).length
  const byType=Object.entries(filtered.reduce((a,r)=>{a[r.request_type]=(a[r.request_type]||0)+1;return a},{} as Record<string,number>)).sort((a,b)=>b[1]-a[1])
  return {total,doneN,rejected,pipeline,blocked,high,byType}
 },[filtered])

 function resetFilters(){setFilters({search:'',status:'all',priority:'All',type:'All',urgency:'All',month:'',start:'',end:'',sort:'newest'})}

 if(loading)return <div className="center-state">Loading workspace…</div>

 return <main className="tech-page">
  <header className="tech-header">
   <div className="brand"><div className="brand-mark">M</div><span>maargh<span className="brand-dot">.</span></span></div>
   <div><span className="eyebrow">Internal workspace</span><h1>Technology requests</h1></div>
  </header>
  <div className="tech-content">
   <div className="metric-grid"><Metric label="Open requests" value={open}/><Metric label="In progress" value={inProgress}/><Metric label="Completed" value={done}/><Metric label="Total requests" value={requests.length}/></div>

   <section className="panel report-panel">
    <div className="panel-heading"><div><h2>Reports & exports</h2><p>Download all requests, download the current filtered view, or create a stakeholder summary.</p></div><div className="report-actions">
      <button className="secondary-button" onClick={()=>downloadCsv(requests,'maargh-tech-all-requests.csv')}><Download size={15}/> Download all</button>
      <button className="secondary-button" onClick={()=>downloadCsv(filtered,'maargh-tech-filtered-requests.csv')}><FileText size={15}/> Download filtered</button>
      <button className="primary-button" onClick={()=>setShowSummary(true)}><Sparkles size={15}/> Monthly summary</button>
    </div></div>
   </section>

   <section className="panel status-panel">
    <div className="panel-heading"><div><h2>Requests by status</h2><p>Use these tabs to see Done, Rejected, In Progress, or any other queue.</p></div></div>
    <div className="status-tabs">{STATUS.map(([value,label])=><button key={value} className={filters.status===value?'status-tab active':'status-tab'} onClick={()=>setFilters(f=>({...f,status:value}))}><span>{label}</span><strong>{counts[value]??0}</strong></button>)}</div>
   </section>

   <section className="panel all-requests">
    <div className="panel-heading"><div><h2>All requests</h2><p>{filtered.length} of {requests.length} requests shown</p></div><div className="heading-actions"><button className="text-button" onClick={()=>setRefresh(x=>x+1)}><RefreshCw size={14}/> Refresh</button><Link className="text-button" href="/request">Public request form <ArrowUpRight size={14}/></Link></div></div>
    <div className="filters">
     <label className="search-box"><Search size={16}/><input placeholder="Search requests" value={filters.search} onChange={e=>setFilters({...filters,search:e.target.value})}/></label>
     <select value={filters.status} onChange={e=>setFilters({...filters,status:e.target.value})}>{STATUS.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select>
     <select value={filters.priority} onChange={e=>setFilters({...filters,priority:e.target.value})}>{PRIORITIES.map(x=><option key={x}>{x}</option>)}</select>
     <select value={filters.type} onChange={e=>setFilters({...filters,type:e.target.value})}>{TYPES.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select>
     <select value={filters.urgency} onChange={e=>setFilters({...filters,urgency:e.target.value})}>{URGENCY.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select>
     <label className="filter-date"><span>Month</span><input type="month" value={filters.month} onChange={e=>setFilters(f=>({...f,month:e.target.value,start:'',end:''}))}/></label>
     <label className="filter-date"><span>From</span><input type="date" value={filters.start} onChange={e=>setFilters(f=>({...f,month:'',start:e.target.value}))}/></label>
     <label className="filter-date"><span>To</span><input type="date" value={filters.end} onChange={e=>setFilters(f=>({...f,month:'',end:e.target.value}))}/></label>
     <select value={filters.sort} onChange={e=>setFilters({...filters,sort:e.target.value})}><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="title">Title A–Z</option></select>
     {(filters.search||filters.status!=='all'||filters.priority!=='All'||filters.type!=='All'||filters.urgency!=='All'||filters.month||filters.start||filters.end)&&<button className="text-button" onClick={resetFilters}><X size={14}/> Clear</button>}
    </div>
    {error&&<p className="form-error">{error} <button onClick={()=>setRefresh(refresh+1)}>Retry</button></p>}
    <div className="request-table">
     <div className="table-header"><span>Request</span><span>Status</span><span>Priority</span><span>Submitted</span></div>
     {filtered.map(r=><Link href={`/tech/requests/${r.id}`} className="request-row" key={r.id}><div className="request-main"><div className="request-file">{r.request_code}</div><div><strong>{r.title}</strong><span>{r.requester_name} · {r.request_type} · {r.urgency}</span></div></div><span className={`status ${r.status}`}><i/>{prettyStatus(r.status)}</span><span className={`priority ${r.priority.toLowerCase()}`}>{r.priority}</span><span className="request-date">{new Date(r.created_at).toLocaleDateString()}</span></Link>)}
     {!filtered.length&&<div className="empty-state">No requests match these filters.</div>}
    </div>
   </section>
  </div>

  {showSummary&&<div className="modal-backdrop" onClick={()=>setShowSummary(false)}><section className="summary-modal" onClick={e=>e.stopPropagation()}><div className="modal-header"><div><span className="eyebrow">Stakeholder report</span><h2>Monthly request summary</h2></div><button className="icon-button" onClick={()=>setShowSummary(false)}><X size={18}/></button></div><div className="summary-stats"><Metric label="Requests" value={summary.total}/><Metric label="Completed" value={summary.doneN}/><Metric label="Rejected" value={summary.rejected}/><Metric label="Pipeline" value={summary.pipeline}/></div><div className="summary-copy"><p><strong>Executive summary:</strong> {summary.total} technology requests were recorded in the selected period. {summary.doneN} are completed, {summary.rejected} rejected, and {summary.pipeline} remain in the pipeline. {summary.blocked} are currently blocked and {summary.high} are P0/P1 priority.</p><p><strong>Work completed:</strong> {summary.doneN} requests were marked Done.</p><p><strong>Pipeline:</strong> {summary.pipeline} requests remain open.</p><p><strong>Request mix:</strong> {summary.byType.slice(0,4).map(([t,n])=>`${prettyStatus(t)} (${n})`).join(', ')||'No requests in this period.'}.</p></div><div className="modal-actions"><button className="secondary-button" onClick={()=>downloadCsv(filtered,'maargh-tech-monthly-update.csv')}><Download size={15}/> Download monthly data</button><button className="primary-button" onClick={()=>navigator.clipboard?.writeText(document.querySelector('.summary-copy')?.textContent||'')}><FileText size={15}/> Copy summary</button></div><p className="summary-note"><Sparkles size={14}/> Automated data summary. LLM-powered narrative can be connected separately with an AI API key.</p></section></div>}
 </main>
}

function Metric({label,value}:{label:string;value:number}){return <div className="stat-card"><span className="stat-label">{label}</span><strong>{value}</strong><span className="stat-note">From Supabase</span></div>}