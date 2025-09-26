/**
 * Shared types and small pure helpers for the app
 */

/** Example response type for /api/demo */
export interface DemoResponse {
  message: string;
}

// Auth & roles
export type Role = "customer" | "organizer" | "admin";
export interface User {
  id: string;
  email: string;
  role: Role;
  name?: string;
  phone?: string;
  aadhar?: string; // organizer identity (12 digits)
  approved?: boolean; // organizers require admin approval
  passwordHash?: string; // demo-only hashing stored client-side
}

// Events & bookings
export type EventStatus = "approved" | "pending" | "rejected" | "cancelled";

export type Genre = "Music" | "Comedy" | "Concert" | "Dance Night" | "Opera";
export type City = "Delhi" | "Mumbai" | "Hyderabad" | "Kolkata" | "Chennai";
export type Beverages = "Non-Alcoholic" | "Alcoholic";

// Unified list of genres for both Organizer (form select) and Customer (tabs/filter)
export const GENRES: Genre[] = [
  "Music",
  "Comedy",
  "Concert",
  "Dance Night",
  "Opera",
];

export interface EventInput {
  name: string;
  genre: Genre;
  theme: string;
  artists: string; // comma-separated performer names
  priceINR: number;
  venue: string;
  city: City;
  date: string; // ISO date (yyyy-mm-dd)
  time: string; // 24h HH:mm (start)
  endTime?: string; // 24h HH:mm (end)
  beverages: Beverages;
  ageLimit?: number; // if beverages is Alcoholic, must be >= 18
  totalTickets: number;
  description?: string;
}

export interface EventItem extends EventInput {
  id: string;
  organizerId: string;
  createdAt: number;
  status: EventStatus;
  ticketsAvailable: number;
}

export interface Booking {
  id: string;
  eventId: string;
  customerId: string;
  qty: number;
  createdAt: number;
}

export function eventsClash(
  a: Pick<EventInput, "city" | "venue" | "date" | "time">,
  b: Pick<EventInput, "city" | "venue" | "date" | "time">,
): boolean {
  const norm = (s: string) => s.trim().toLowerCase();
  return (
    norm(a.city) === norm(b.city) &&
    norm(a.venue) === norm(b.venue) &&
    a.date === b.date &&
    a.time === b.time
  );
}

export function toEpochMillis(date: string, time: string): number {
  // date: yyyy-mm-dd, time: HH:mm local
  const [y, m, d] = date.split("-").map((n) => parseInt(n, 10));
  const [hh, mm] = time.split(":" ).map((n) => parseInt(n, 10));
  const dt = new Date(y, (m - 1) as any, d as any, hh as any, mm as any, 0, 0);
  return dt.getTime();
}

// City -> Venues (demo list)
export const CITY_VENUES: Record<City, string[]> = {
  Delhi: ["Jester Club", "Royal Hall", "City Arena", "Open Grounds"],
  Mumbai: ["Neon Arena", "Marine Drive Amphitheatre", "Galaxy Hall"],
  Hyderabad: ["Oak Stay 401", "VNRF", "Charminar Grounds", "City Ensemble Hall"],
  Kolkata: ["Heritage Theatre", "Riverfront Stage", "Bard Hall"],
  Chennai: ["Marina Bay Hall", "Soundscape Arena", "Lotus Theatre"],
};
