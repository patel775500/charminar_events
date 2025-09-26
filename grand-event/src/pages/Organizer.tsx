import { useEffect, useState } from 'react'
import { City, EventItem, Genre, Beverages } from '../types'
import { createEvent, listOrganizerEvents, signIn } from '../store'

const ACTIVE_KEY = 'ge_active_organizer'

export default function Organizer(){
  const [user, setUser] = useState<{id:string; email:string; name?:string}|null>(null)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [form, setForm] = useState({
    name: '', genre: 'Music' as Genre, theme: '', artists: '', priceINR: 0,
    venue: '', city: 'Delhi' as City, date: '', time: '19:00', beverages: 'Non-Alcoholic' as Beverages,
    ageLimit: undefined as number|undefined, totalTickets: 100, description: ''
  })
  const [events, setEvents] = useState<EventItem[]>([])
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [congrats, setCongrats] = useState('')

  useEffect(()=>{
    const id = localStorage.getItem(ACTIVE_KEY)
    if(id){ setUser({ id, email:'' }); setEvents(listOrganizerEvents(id)) }
  },[])

  const handleLogin = ()=>{
    const u = signIn('organizer', email, name)
    localStorage.setItem(ACTIVE_KEY, u.id)
    setUser({ id:u.id, email:u.email, name:u.name })
    setEvents(listOrganizerEvents(u.id))
  }

  const create = ()=>{
    if(!user) return
    setError(''); setCongrats(''); setNotice('')
    if(!form.name || !form.venue || !form.date || !form.time){ setError('Please fill in event name, venue, date and time.'); return }
    if(form.beverages==='Alcoholic' && (form.ageLimit ?? 0) < 18){ setError('Not possible for under 18 (Alcoholic beverages). Set Age Limit ≥ 18.'); return }
    if(form.totalTickets<=0){ setError('Total tickets must be greater than 0.'); return }
    const { autoApproved, clashes } = createEvent({ ...form }, user.id)
    setEvents(listOrganizerEvents(user.id))
    setForm({ name:'', genre:'Music', theme:'', artists:'', priceINR:0, venue:'', city:'Delhi', date:'', time:'19:00', beverages:'Non-Alcoholic', ageLimit:undefined, totalTickets:100, description:'' })
    if(autoApproved){ setNotice('Event created and auto-approved (no conflicts).'); setCongrats('Congratulations! Your event was approved.'); setTimeout(()=>setCongrats(''), 3200) }
    else setNotice('Venue clash detected, please reschedule.')
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-3xl font-extrabold text-transparent">Organizer Portal</h1>
      {!user ? (
        <div className="mt-6 grid gap-4 card p-6">
          <div className="grid gap-2">
            <label className="text-sm">Name</label>
            <input value={name} onChange={(e)=>setName(e.target.value)} className="rounded-xl border border-white/20 bg-black/30 px-3 py-2" />
          </div>
          <div className="grid gap-2">
            <label className="text-sm">Email</label>
            <input value={email} onChange={(e)=>setEmail(e.target.value)} className="rounded-xl border border-white/20 bg-black/30 px-3 py-2" />
          </div>
          <button onClick={handleLogin} className="btn btn-primary">Sign in</button>
        </div>
      ) : (
        <div className="mt-6 grid gap-8">
          {notice && <div className="rounded-xl border border-amber-200 bg-amber-50/10 p-4 text-amber-200">{notice}</div>}
          {error && <div className="rounded-xl border border-red-200 bg-red-50/10 p-4 text-red-200">{error}</div>}
          {congrats && <div className="rounded-xl border border-green-200 bg-green-50/10 p-4 text-green-200">{congrats}</div>}

          <section className="card p-6">
            <h2 className="mb-4 text-xl font-semibold text-white">Create Event</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="grid gap-2"><label className="text-sm">Event name</label><input className="rounded-xl border border-white/20 bg-black/30 px-3 py-2" value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})} /></div>
              <div className="grid gap-2"><label className="text-sm">Genre</label>
                <select className="rounded-xl border border-white/20 bg-black/30 px-3 py-2" value={form.genre} onChange={(e)=>setForm({...form, genre:e.target.value as Genre})}>
                  {(['Music','Comedy','Concert','Dance Night','Opera'] as Genre[]).map(g=> <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="grid gap-2"><label className="text-sm">Theme</label><input className="rounded-xl border border-white/20 bg-black/30 px-3 py-2" value={form.theme} onChange={(e)=>setForm({...form, theme:e.target.value})} /></div>
              <div className="grid gap-2"><label className="text-sm">Performing Artist(s)</label><input className="rounded-xl border border-white/20 bg-black/30 px-3 py-2" value={form.artists} onChange={(e)=>setForm({...form, artists:e.target.value})} placeholder="e.g., Arijit Singh, Prateek Kuhad" /></div>
              <div className="grid gap-2"><label className="text-sm">Price (INR)</label><input type="number" min={0} className="rounded-xl border border-white/20 bg-black/30 px-3 py-2" value={form.priceINR} onChange={(e)=>setForm({...form, priceINR:Number(e.target.value)})} /></div>
              <div className="grid gap-2"><label className="text-sm">Venue</label><input className="rounded-xl border border-white/20 bg-black/30 px-3 py-2" value={form.venue} onChange={(e)=>setForm({...form, venue:e.target.value})} /></div>
              <div className="grid gap-2"><label className="text-sm">Location</label>
                <select className="rounded-xl border border-white/20 bg-black/30 px-3 py-2" value={form.city} onChange={(e)=>setForm({...form, city:e.target.value as City})}>
                  {(['Delhi','Mumbai','Hyderabad','Kolkata','Chennai'] as City[]).map(c=> <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid gap-2"><label className="text-sm">Date</label><input type="date" className="rounded-xl border border-white/20 bg-black/30 px-3 py-2" value={form.date} onChange={(e)=>setForm({...form, date:e.target.value})} /></div>
              <div className="grid gap-2"><label className="text-sm">Time</label><input type="time" className="rounded-xl border border-white/20 bg-black/30 px-3 py-2" value={form.time} onChange={(e)=>setForm({...form, time:e.target.value})} /></div>
              <div className="grid gap-2"><label className="text-sm">Food & Beverages</label>
                <select className="rounded-xl border border-white/20 bg-black/30 px-3 py-2" value={form.beverages} onChange={(e)=>setForm({...form, beverages:e.target.value as Beverages})}>
                  {(['Non-Alcoholic','Alcoholic'] as Beverages[]).map(b=> <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div className="grid gap-2"><label className="text-sm">Age Limit (optional)</label><input type="number" min={0} className="rounded-xl border border-white/20 bg-black/30 px-3 py-2" value={form.ageLimit ?? ''} onChange={(e)=>setForm({...form, ageLimit: e.target.value===''? undefined : Number(e.target.value)})} placeholder="18 if alcoholic" /></div>
              <div className="grid gap-2"><label className="text-sm">Total Tickets</label><input type="number" min={1} className="rounded-xl border border-white/20 bg-black/30 px-3 py-2" value={form.totalTickets} onChange={(e)=>setForm({...form, totalTickets: Number(e.target.value)})} /></div>
              <div className="grid gap-2 sm:col-span-2"><label className="text-sm">Description</label><textarea className="min-h-[80px] rounded-xl border border-white/20 bg-black/30 px-3 py-2" value={form.description} onChange={(e)=>setForm({...form, description:e.target.value})} /></div>
            </div>
            <button onClick={create} className="btn btn-primary mt-4">Create</button>
          </section>

          <section className="card p-6">
            <h2 className="mb-4 text-xl font-semibold text-white">Your Events</h2>
            <div className="grid gap-4">
              {events.map(e=> (
                <div key={e.id} className="flex flex-col justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center">
                  <div>
                    <div className="font-medium text-white">{e.name} <span className="text-xs text-white/50">({e.genre})</span></div>
                    <div className="text-sm text-white/60">{e.city} • {e.venue} • {e.date} {e.time}</div>
                    <div className="text-xs text-white/50">Tickets left: {e.ticketsAvailable} / {e.totalTickets}</div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${e.status==='approved'?'bg-emerald-500/20 text-emerald-200': e.status==='pending'?'bg-amber-500/20 text-amber-200': e.status==='cancelled'?'bg-white/10 text-white/70':'bg-red-500/20 text-red-200'}`}>{e.status}</span>
                </div>
              ))}
              {events.length===0 && <div className="text-white/60">No events yet.</div>}
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
