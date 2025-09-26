import { Booking, EventInput, EventItem, EventStatus, Role, User, eventsClash, toEpochMillis } from './types'

const KEYS = { users:'ge_users', events:'ge_events', bookings:'ge_bookings' }

function read<T>(key:string, fallback:T):T{ try{ const raw=localStorage.getItem(key); return raw?JSON.parse(raw):fallback }catch{return fallback} }
function write<T>(key:string, v:T){ localStorage.setItem(key, JSON.stringify(v)) }
function uid(p:string){ return p + '_' + Math.random().toString(36).slice(2) + Date.now().toString(36) }

export function signIn(role:Role, email:string, name?:string):User{
  const users = read<User[]>(KEYS.users, [])
  const existing = users.find(u=>u.email.toLowerCase()===email.toLowerCase()&&u.role===role)
  if(existing) return existing
  const u:User = { id: uid('usr'), email, role, name }
  users.push(u); write(KEYS.users, users); return u
}

export function listEvents():EventItem[]{ return read<EventItem[]>(KEYS.events, []) }
export function listApprovedEvents():EventItem[]{ return listEvents().filter(e=>e.status==='approved') }
export function listByGenre(genre?:string){ const all=listApprovedEvents(); if(!genre||genre==='All') return all; return all.filter(e=>e.genre===genre) }

export function createEvent(input:EventInput, organizerId:string){
  const events = listEvents();
  const clashes = events.filter(e=>eventsClash(e,input));
  const autoApproved = clashes.length===0;
  const event:EventItem = { id:uid('evt'), organizerId, createdAt:Date.now(), status:autoApproved?'approved':'rejected', ticketsAvailable: input.totalTickets, ...input };
  events.push(event); write(KEYS.events, events);
  return { event, autoApproved, clashes }
}

export function updateEventStatus(id:string, status:EventStatus){ const events=listEvents(); const i=events.findIndex(e=>e.id===id); if(i!==-1){ events[i].status=status; write(KEYS.events, events) } }

export function createBooking(eventId:string, customerId:string, qty=1){
  const events = listEvents(); const i = events.findIndex(e=>e.id===eventId); if(i===-1) return { ok:false, reason:'Event not found' };
  const ev = events[i]; if(ev.status!=='approved') return { ok:false, reason:'Event not open for booking' };
  if(ev.ticketsAvailable<=0) return { ok:false, reason:'Sorry, booking closed.' };
  const bookings = read<Booking[]>(KEYS.bookings, []);
  const userTotal = bookings.filter(b=>b.customerId===customerId && b.eventId===eventId).reduce((s,b)=>s+b.qty,0)
  if(userTotal+qty>10) return { ok:false, reason:'Max 10 tickets per person.' }
  if(ev.ticketsAvailable<qty) return { ok:false, reason:'Not enough tickets available.' }
  const b:Booking = { id:uid('bkg'), eventId, customerId, qty, createdAt:Date.now() }
  bookings.push(b); ev.ticketsAvailable-=qty; events[i]=ev; write(KEYS.bookings, bookings); write(KEYS.events, events)
  return { ok:true, booking:b }
}

export function cancelEvent(id:string){ const events=listEvents(); const i=events.findIndex(e=>e.id===id); if(i===-1) return { ok:false, reason:'Event not found' };
  const e=events[i]; const start=toEpochMillis(e.date,e.time); const week=7*24*60*60*1000; if(start-Date.now()<week) return { ok:false, reason:'Admin cannot cancel shows 1 week before start.' };
  e.status='cancelled'; events[i]=e; write(KEYS.events, events); return { ok:true }
}

export function listOrganizerEvents(organizerId:string){ return listEvents().filter(e=>e.organizerId===organizerId) }
