import { Booking, EventInput, EventItem, EventStatus, Role, User, eventsClash, toEpochMillis } from "@shared/api";

const KEYS = {
  users: "ce_users",
  events: "ce_events",
  bookings: "ce_bookings",
  version: "ce_version_v2", // bump to avoid legacy shape issues
};

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

// Demo-only hash (NOT for production). Keeps code synchronous.
function hash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return `h${(h >>> 0).toString(16)}`;
}

// Users
export function signUp(role: Role, email: string, name: string, phone: string, password: string): User {
  const users = read<User[]>(KEYS.users, []);
  const exists = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.role === role);
  if (exists) throw new Error("User already exists for this role");
  const phoneDigits = (phone || "").replace(/\D/g, "");
  const newUser: User = { id: uid("usr"), email, role, name, phone: phoneDigits, passwordHash: hash(password) };
  users.push(newUser);
  write(KEYS.users, users);
  return newUser;
}

// Organizer sign up requires Aadhar (12 digits). This keeps attendee signup unchanged.
export function signUpOrganizer(email: string, name: string, password: string, aadhar: string): User {
  const users = read<User[]>(KEYS.users, []);
  const exists = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.role === "organizer");
  if (exists) throw new Error("Organizer already exists with this email");
  const clean = (aadhar || "").replace(/\D/g, "");
  if (!/^\d{12}$/.test(clean)) throw new Error("Aadhar must be 12 digits");
  const newUser: User = { id: uid("usr"), email, role: "organizer", name, aadhar: clean, approved: false, passwordHash: hash(password) };
  users.push(newUser);
  write(KEYS.users, users);
  return newUser;
}

// Ensure an admin user exists for secure /admin access in dev/demo.
export function ensureAdminSeed(): User {
  const users = read<User[]>(KEYS.users, []);
  let admin = users.find((u) => u.role === "admin" && u.email === "sutherland@global.com");
  if (!admin) {
    admin = { id: uid("usr"), email: "sutherland@global.com", role: "admin", name: "Admin", passwordHash: hash("123abc") };
    users.push(admin);
    write(KEYS.users, users);
  }
  return admin;
}

export function signInStrict(role: Role, emailOrPhone: string, password: string): User {
  const users = read<User[]>(KEYS.users, []);
  const needle = emailOrPhone.trim().toLowerCase();
  const needleDigits = needle.replace(/\D/g, "");
  const existing = users.find(
    (u) => u.role === role && (
      u.email.toLowerCase() === needle ||
      ((u.phone ?? "").replace(/\D/g, "") === needleDigits && needleDigits.length >= 7)
    ),
  );
  if (!existing) throw new Error("Account not found. Please sign up first.");
  const ok = !existing.passwordHash || existing.passwordHash === hash(password);
  if (!ok) throw new Error("Invalid password");
  if (role === "organizer" && existing.approved !== true) throw new Error("Organizer awaiting admin approval");
  return existing;
}

// Admin helpers
export function listOrganizersPending(): User[] {
  return read<User[]>(KEYS.users, []).filter((u) => u.role === "organizer" && u.approved !== true);
}

export function approveOrganizer(userId: string): void {
  const users = read<User[]>(KEYS.users, []);
  const idx = users.findIndex((u) => u.id === userId && u.role === "organizer");
  if (idx !== -1) {
    users[idx].approved = true;
    write(KEYS.users, users);
  }
}

export function getUserById(id: string | null | undefined): User | undefined {
  if (!id) return undefined;
  return read<User[]>(KEYS.users, []).find((u) => u.id === id);
}

export function updateUser(id: string, patch: Partial<Pick<User, "name" | "phone">>): User | undefined {
  const users = read<User[]>(KEYS.users, []);
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return undefined;
  users[idx] = { ...users[idx], ...patch };
  write(KEYS.users, users);
  return users[idx];
}

export function changePassword(id: string, oldPassword: string, newPassword: string): { ok: boolean; reason?: string } {
  const users = read<User[]>(KEYS.users, []);
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return { ok: false, reason: "User not found" };
  const u = users[idx];
  const ok = !u.passwordHash || u.passwordHash === hash(oldPassword);
  if (!ok) return { ok: false, reason: "Current password is incorrect" };
  users[idx] = { ...u, passwordHash: hash(newPassword) };
  write(KEYS.users, users);
  return { ok: true };
}

// Events
export function listEvents(): EventItem[] {
  return read<EventItem[]>(KEYS.events, []);
}

export function listApprovedEvents(): EventItem[] {
  return listEvents().filter((e) => e.status === "approved");
}

export function createEvent(
  input: EventInput,
  organizerId: string,
): { event: EventItem; autoApproved: boolean; clashes: EventItem[] } {
  // Temporal validations
  const start = toEpochMillis(input.date, input.time);
  const end = toEpochMillis(input.date, input.endTime ?? input.time);
  if (start < Date.now()) {
    throw new Error("Invalid date/time: Start time is in the past.");
  }
  if (input.endTime && end <= start) {
    throw new Error("Invalid time range: End time must be after start time.");
  }
  const events = listEvents();
  const clashes = events.filter((e) => eventsClash(e, input));
  const autoApproved = clashes.length === 0;
  const event: EventItem = {
    id: uid("evt"),
    organizerId,
    createdAt: Date.now(),
    status: autoApproved ? "approved" : "rejected",
    ticketsAvailable: input.totalTickets,
    ...input,
  };
  events.push(event);
  write(KEYS.events, events);
  return { event, autoApproved, clashes };
}

export function updateEventStatus(id: string, status: EventStatus) {
  const events = listEvents();
  const idx = events.findIndex((e) => e.id === id);
  if (idx !== -1) {
    events[idx].status = status;
    write(KEYS.events, events);
  }
}

// Bookings
export function createBooking(eventId: string, customerId: string, qty = 1): { ok: boolean; reason?: string; booking?: Booking } {
  const events = listEvents();
  const idx = events.findIndex((e) => e.id === eventId);
  if (idx === -1) return { ok: false, reason: "Event not found." };
  const ev = events[idx];
  if (ev.status !== "approved") return { ok: false, reason: "Event not open for booking." };
  if (ev.ticketsAvailable <= 0) return { ok: false, reason: "Sorry, booking closed." };
  const bookings = read<Booking[]>(KEYS.bookings, []);
  const userTotal = bookings
    .filter((b) => b.customerId === customerId && b.eventId === eventId)
    .reduce((sum, b) => sum + b.qty, 0);
  if (userTotal + qty > 10) return { ok: false, reason: "Max 10 tickets per person." };
  if (ev.ticketsAvailable < qty) return { ok: false, reason: "Not enough tickets available." };
  // commit
  const booking: Booking = { id: uid("bkg"), eventId, customerId, qty, createdAt: Date.now() };
  bookings.push(booking);
  ev.ticketsAvailable -= qty;
  events[idx] = ev;
  write(KEYS.bookings, bookings);
  write(KEYS.events, events);
  return { ok: true, booking };
}

export function listBookingsByUser(userId: string): Booking[] {
  return read<Booking[]>(KEYS.bookings, []).filter((b) => b.customerId === userId);
}

export function listOrganizerEvents(organizerId: string): EventItem[] {
  return listEvents().filter((e) => e.organizerId === organizerId);
}

export function cancelEvent(id: string): { ok: boolean; reason?: string } {
  const events = listEvents();
  const idx = events.findIndex((e) => e.id === id);
  if (idx === -1) return { ok: false, reason: "Event not found" };
  const e = events[idx];
  const start = toEpochMillis(e.date, e.time);
  const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
  if (start - Date.now() < oneWeekMs) {
    return { ok: false, reason: "Admin cannot cancel shows 1 week before start." };
  }
  e.status = "cancelled";
  events[idx] = e;
  write(KEYS.events, events);
  return { ok: true };
}

export function listByGenre(genre?: string): EventItem[] {
  const all = listApprovedEvents();
  if (!genre || genre === "All") return all;
  return all.filter((e) => e.genre === genre);
}

// Demo data seeding (client-side) to demonstrate functionality on first load
export function seedDemoIfEmpty() {
  const existing = listEvents();
  if (existing.length > 0) return;
  const organizerId = uid("org");
  const today = new Date();
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const baseDate = fmt(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7));
  const sample: EventItem[] = [
    {
      id: uid("evt"), organizerId, createdAt: Date.now(), status: "approved",
      name: "Midnight Melodies", genre: "Music", theme: "Synthwave", artists: "DJ Nightfall",
      priceINR: 999, venue: "Neon Arena", city: "Mumbai", date: baseDate, time: "20:00", endTime: "22:00",
      beverages: "Non-Alcoholic", ticketsAvailable: 120, totalTickets: 120, description: "Retro wave party with live DJ.",
    },
    {
      id: uid("evt"), organizerId, createdAt: Date.now(), status: "approved",
      name: "Laugh Riot", genre: "Comedy", theme: "Standup", artists: "Ananya & Friends",
      priceINR: 499, venue: "Jester Club", city: "Delhi", date: baseDate, time: "19:00", endTime: "21:00",
      beverages: "Non-Alcoholic", ticketsAvailable: 80, totalTickets: 80, description: "An evening of stand-up comedy.",
    },
    {
      id: uid("evt"), organizerId, createdAt: Date.now(), status: "approved",
      name: "Opera Nights", genre: "Opera", theme: "Classic", artists: "City Ensemble",
      priceINR: 1499, venue: "Royal Hall", city: "Hyderabad", date: baseDate, time: "18:30", endTime: "20:30",
      beverages: "Alcoholic", ageLimit: 18, ticketsAvailable: 60, totalTickets: 60, description: "A classic opera performance.",
    },
  ];
  write(KEYS.events, sample);
}
