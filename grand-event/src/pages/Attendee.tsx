import { useEffect, useState } from 'react'
import { EventItem, Genre } from '../types'
import { createBooking, listApprovedEvents, listByGenre, signIn } from '../store'

const ACTIVE_KEY = 'ge_active_customer'

const genres: ("All"|Genre)[] = ['All','Music','Comedy','Concert','Dance Night','Opera']

export default function Attendee(){
  const [user, setUser] = useState<{id:string; email:string; name?:string}|null>(null)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [events, setEvents] = useState<EventItem[]>([])
  const [message, setMessage] = useState('')
  const [genre, setGenre] = useState<typeof genres[number]>('All')
  const [qty, setQty] = useState<Record<string, number>>({})

  useEffect(()=>{
    const id = localStorage.getItem(ACTIVE_KEY)
    if(id){ setUser({ id, email:'' }) }
    setEvents(listApprovedEvents())
  },[])

  useEffect(()=>{
    if(genre==='All') setEvents(listApprovedEvents())
    else setEvents(listByGenre(genre))
  },[genre])

  const handleLogin = ()=>{
    const u = signIn('customer', email, name)
    localStorage.setItem(ACTIVE_KEY, u.id)
    setUser({ id:u.id, email:u.email, name:u.name })
  }

  const book = (eventId:string)=>{
    if(!user) return
    const q = qty[eventId] ?? 1
    const res = createBooking(eventId, user.id, q)
    if(!res.ok){ setMessage(res.reason ?? 'Booking failed.'); return }
    setMessage('Ticket booked successfully. Use the browser print to save a copy.')
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-3xl font-extrabold text-transparent">Welcome on Board</h1>
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
        <div className="mt-6 space-y-6">
          {message && <div className="rounded-xl border border-emerald-200 bg-emerald-50/10 p-4 text-emerald-200">{message}</div>}

          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-white">Choose a Genre</h2>
            <select className="rounded-xl border border-white/20 bg-black/30 px-3 py-2" value={genre} onChange={(e)=>setGenre(e.target.value as any)}>
              {genres.map(g=> <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {events.map(e=> (
              <div key={e.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-white">{e.name}</div>
                    <div className="text-sm text-white/60">{e.genre} • {e.city} • {e.venue}</div>
                    <div className="text-sm text-white/60">{e.date} {e.time}</div>
                    <div className="text-xs text-white/50">Available: {e.ticketsAvailable}</div>
                  </div>
                  <span className="rounded-full bg-pink-500/20 px-3 py-1 text-xs font-medium text-pink-200">Approved</span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <input type="number" min={1} max={10} value={qty[e.id] ?? 1} onChange={(ev)=>setQty({ ...qty, [e.id]: Math.max(1, Math.min(10, Number(ev.target.value))) })} className="w-20 rounded-xl border border-white/20 bg-black/30 px-3 py-2" />
                  <button onClick={()=>book(e.id)} disabled={e.ticketsAvailable<=0} className="btn btn-primary disabled:opacity-50">{e.ticketsAvailable>0? 'Book Ticket':'Booking Closed'}</button>
                </div>
              </div>
            ))}
            {events.length===0 && <div className="text-white/60">No approved events yet.</div>}
          </div>
        </div>
      )}
    </div>
  )
}
