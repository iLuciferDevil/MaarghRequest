'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Search, ArrowUpRight } from 'lucide-react'

type Request = { id:string; request_code:string; title:string; requester_name:string; requester_email:string; request_type:string; urgency:string; priority:string; status:string; created_at:string; desired_deadline:string|null }
const statuses=['All','New','Reviewing','Planned','In Progress','Blocked','Done','Rejected']; const priorities=['All','P0','P1','P2','P3']; const types=['All','bug','feature','improvement','data_reporting','content_admin','other']; const urgencies=['All','blocking','high','normal','low']

export default function TechPage(){
 const [supabase,setSupabase]=useState<ReturnType<typeof createClient>|null>(null)
 const [requests,setRequests]=useState<Request[]>([])
 const [loading,setLoading]=useState(true)
 const [error,setError]=useState('')
 const [filters,setFilters]=useState({search:'',status:'All',priority:'All',type:'All',urgency:'All',date:'',sort:'newest'})
 const [refresh,setRefresh]=useState(0)

 useEffect(()=>{setSupabase(createClient())},[])
 useEffect(()=>{
  if(!supabase)return
  setLoading(true)
  supabase.from('tech_requests').select('id,request_code,title,requester_name,requester_email,request_type,urgency,priority,status,created_at,desired_deadline').order('created_at',{ascending:false}).then(({data,error})=>{
   if(error)setError('Could not load requests.')
   else setError('')
   setRequests((data??[]) as Request[])
   setLoading(false)
  })
 },[supabase,refresh])

 if(loading)return <div className="center-state">Loading workspace…</div>

 const filtered=requests.filter(r=>(!filters.search||`${r.title} ${r.request_code} ${r.requester_name}`.toLowerCase().includes(filters.search.toLowerCase()))&&(filters.status==='All'||r.status===filters.status)&&(filters.priority==='All'||r.priority===filters.priority)&&(filters.type==='All'||r.request_type===filters.type)&&(filters.urgency==='All'||r.urgency===filters.urgency)&&(!filters.date||r.created_at.startsWith(filters.date))).sort((a,b)=>filters.sort==='oldest'?a.created_at.localeCompare(b.created_at):filters.sort==='title'?a.title.localeCompare(b.title):b.created_at.localeCompare(a.created_at))
 const open=requests.filter(r=>!['Done','Rejected','done','rejected'].includes(r.status)).length
 const inProgress=requests.filter(r=>['In Progress','in_progress'].includes(r.status)).length
 const done=requests.filter(r=>['Done','done'].includes(r.status)).length

 return <main className="tech-page">
  <header className="tech-header">
   <div className="brand"><div className="brand-mark">M</div><span>maargh<span className="brand-dot">.</span></span></div>
   <div><span className="eyebrow">Internal workspace</span><h1>Technology requests</h1></div>
  </header>
  <div className="tech-content">
   <div className="metric-grid"><Metric label="Open requests" value={open}/><Metric label="In progress" value={inProgress}/><Metric label="Completed" value={done}/><Metric label="Total requests" value={requests.length}/></div>
   <section className="panel all-requests">
    <div className="panel-heading"><div><h2>All requests</h2><p>{requests.length ? `${filtered.length} of ${requests.length} requests` : 'No requests yet.'}</p></div><Link className="text-button" href="/request">Public request form <ArrowUpRight size={14}/></Link></div>
    <div className="filters">
     <label className="search-box"><Search size={16}/><input placeholder="Search requests" value={filters.search} onChange={e=>setFilters({...filters,search:e.target.value})}/></label>
     <select value={filters.status} onChange={e=>setFilters({...filters,status:e.target.value})}>{statuses.map(x=><option key={x}>{x}</option>)}</select>
     <select value={filters.priority} onChange={e=>setFilters({...filters,priority:e.target.value})}>{priorities.map(x=><option key={x}>{x}</option>)}</select>
     <select value={filters.type} onChange={e=>setFilters({...filters,type:e.target.value})}>{types.map(x=><option key={x}>{x}</option>)}</select>
     <select value={filters.urgency} onChange={e=>setFilters({...filters,urgency:e.target.value})}>{urgencies.map(x=><option key={x}>{x}</option>)}</select>
     <input type="date" value={filters.date} onChange={e=>setFilters({...filters,date:e.target.value})}/>
     <select value={filters.sort} onChange={e=>setFilters({...filters,sort:e.target.value})}><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="title">Title A–Z</option></select>
    </div>
    {error&&<p className="form-error">{error} <button onClick={()=>setRefresh(refresh+1)}>Retry</button></p>}
    <div className="request-table">
     <div className="table-header"><span>Request</span><span>Status</span><span>Priority</span><span>Submitted</span></div>
     {filtered.map(r=><Link href={`/tech/requests/${r.id}`} className="request-row" key={r.id}><div className="request-main"><div className="request-file">{r.request_code}</div><div><strong>{r.title}</strong><span>{r.requester_name} · {r.request_type} · {r.urgency}</span></div></div><span className={`status ${r.status.toLowerCase().replace(' ','-')}`}><i/>{r.status}</span><span className={`priority ${r.priority.toLowerCase()}`}>{r.priority}</span><span className="request-date">{new Date(r.created_at).toLocaleDateString()}</span></Link>)}
     {!filtered.length&&<div className="empty-state">No requests yet.</div>}
    </div>
   </section>
  </div>
 </main>
}

function Metric({label,value}:{label:string;value:number}){return <div className="stat-card"><span className="stat-label">{label}</span><strong>{value}</strong><span className="stat-note">From Supabase</span></div>}