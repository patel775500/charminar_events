export type Role = 'customer' | 'organizer' | 'admin'
export type Genre = 'Music' | 'Comedy' | 'Concert' | 'Dance Night' | 'Opera'
export type City = 'Delhi' | 'Mumbai' | 'Hyderabad' | 'Kolkata' | 'Chennai'
export type Beverages = 'Non-Alcoholic' | 'Alcoholic'
export type EventStatus = 'approved' | 'pending' | 'rejected' | 'cancelled'

export interface User { id: string; email: string; role: Role; name?: string }

export interface EventInput {
  name: string
  genre: Genre
  theme: string
  artists: string
  priceINR: number
  venue: string
  city: City
  date: string
  time: string
  beverages: Beverages
  ageLimit?: number
  totalTickets: number
  description?: string
}

export interface EventItem extends EventInput {
  id: string
  organizerId: string
  createdAt: number
  status: EventStatus
  ticketsAvailable: number
}

export interface Booking { id: string; eventId: string; customerId: string; qty: number; createdAt: number }

export function eventsClash(a: Pick<EventInput,'city'|'venue'|'date'|'time'>, b: Pick<EventInput,'city'|'venue'|'date'|'time'>) {
  const norm = (s:string)=>s.trim().toLowerCase()
  return norm(a.city)===norm(b.city)&&norm(a.venue)===norm(b.venue)&&a.date===b.date&&a.time===b.time
}

export function toEpochMillis(date:string, time:string){
  const [y,m,d] = date.split('-').map(n=>parseInt(n,10));
  const [hh,mm] = time.split(':').map(n=>parseInt(n,10));
  return new Date(y,(m-1),d,hh,mm,0,0).getTime();
}
