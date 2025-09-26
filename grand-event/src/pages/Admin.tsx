import { useEffect, useMemo, useState } from 'react'
import { EventItem, eventsClash } from '../types'
import { cancelEvent, listEvents, updateEventStatus } from '../store'

export default function Admin(){
  const [events, setEvents] = useState<EventItem[]>([])
  const [message, setMessage] = useState('')

  const refresh = ()=> setEvents(listEvents())
  useEffect(()=>{ refresh() },[])

  const setStatus = (id:string, status:'approved'|'rejected'|'pending')=>{
    updateEventStatus(id, status)
    refresh()
  }

  const conflicts = useMemo(()=>{
    const map: Record<string, EventItem[]> = {}
    for(const e of events){ map[e.id] = events.filter(x=>x.id!==e.id && eventsClash(e,x)) }
    return map
  },[events])

  const handleCancel = (id:string)=>{
    const res = cancelEvent(id)
    if(!res.ok) setMessage(res.reason ?? 'Cancel failed')
    else setMessage('Event cancelled.')
    refresh()
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-3xl font-extrabold text-transparent">Admin Panel</h1>
      {message && <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/10 p-4 text-amber-200">{message}</div>}
      <div className="mt-6 grid gap-4">
        {events.map(e=> (
          <div key={e.id} className="grid items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 sm:grid-cols-[1fr_auto]">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-white">{e.name}</span>
                <span className="text-xs text-white/60">{e.genre} • {e.city} • {e.venue} • {e.date} {e.time}</span>
              </div>
              <div className="mt-1 text-xs text-white/60">Artists: {e.artists || 'N/A'} • Theme: {e.theme || 'N/A'}</div>
              <div className="mt-1 text-xs text-white/60">Tickets: {e.ticketsAvailable}/{e.totalTickets} • Price: ₹{e.priceINR}</div>
              {conflicts[e.id]?.length>0 && (
                <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50/10 p-2 text-xs text-amber-200">
                  Venue clash detected with {conflicts[e.id].length} event(s). Consider rejecting or requesting reschedule.
                </div>
              )}
            </div>
            <div className="flex flex-col items-stretch gap-2 justify-self-end sm:w-72">
              <span className={`self-end rounded-full px-3 py-1 text-xs font-semibold ${e.status==='approved'?'bg-emerald-500/20 text-emerald-200': e.status==='pending'?'bg-amber-500/20 text-amber-200': e.status==='cancelled'?'bg-white/10 text-white/70':'bg-red-500/20 text-red-200'}`}>{e.status}</span>
              <div className="flex gap-2">
                <button onClick={()=>setStatus(e.id, 'approved')} className="btn btn-primary">Approve</button>
                <button onClick={()=>setStatus(e.id, 'rejected')} className="btn btn-outline">Reject</button>
              </div>
              <div className="flex gap-2">
                <button onClick={()=>setStatus(e.id, 'pending')} className="btn btn-outline">Mark Pending</button>
                <button onClick={()=>handleCancel(e.id)} className="btn btn-outline">Cancel Show</button>
              </div>
            </div>
          </div>
        ))}
        {events.length===0 && <div className="text-white/60">No events yet.</div>}
      </div>
    </div>
  )
}
