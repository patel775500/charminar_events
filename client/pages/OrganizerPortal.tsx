import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { EventItem, User, Genre, City, Beverages, GENRES, CITY_VENUES } from "@shared/api";
import { createEvent, listOrganizerEvents, signInStrict, signUpOrganizer } from "@/lib/store";

const ACTIVE_KEY = "ce_active_organizer";

export default function OrganizerPortal() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPwd, setSignupPwd] = useState("");
  const [signupAadhar, setSignupAadhar] = useState("");
  const [form, setForm] = useState({
    name: "",
    genre: "Music" as Genre,
    theme: "",
    artists: "",
    priceINR: 0,
    venue: "",
    city: "Delhi" as City,
    date: "",
    time: "19:00",
    endTime: "21:00",
    beverages: "Non-Alcoholic" as Beverages,
    ageLimit: undefined as number | undefined,
    totalTickets: 100,
    description: "",
  });
  const [events, setEvents] = useState<EventItem[]>([]);
  const [notice, setNotice] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [congrats, setCongrats] = useState<string>("");

  useEffect(() => {
    const id = localStorage.getItem(ACTIVE_KEY);
    if (id) setUser({ id, email: "", role: "organizer" });
    if (id) setEvents(listOrganizerEvents(id));
  }, []);

  const handleLogin = () => {
    try {
      const u = signInStrict("organizer", email, password);
      localStorage.setItem(ACTIVE_KEY, u.id);
      setUser(u);
      setEvents(listOrganizerEvents(u.id));
      setNotice("");
    } catch (e:any) {
      setNotice(e?.message || "Login failed. Please sign up first.");
    }
  };

  const create = () => {
    if (!user) return;
    // validations
    setError("");
    setCongrats("");
    if (!form.name || !form.venue || !form.date || !form.time) {
      setError("Please fill in event name, venue, date and time.");
      return;
    }
    if (form.beverages === "Alcoholic" && (!form.ageLimit || form.ageLimit < 18)) {
      setError("Alcoholic beverages require minimum age 18.");
      return;
    }
    try {
      const { event, autoApproved } = createEvent({ ...form }, user.id);
      setEvents([event, ...events]);
      setCongrats(
        autoApproved
          ? "Congratulations! Your event was auto-approved."
          : "Your event conflicts with an existing show and was rejected. Please reschedule.",
      );
      setForm({ ...form, name: "", theme: "", artists: "", priceINR: 0, totalTickets: 100, description: "" });
    } catch (e: any) {
      setError(e?.message || "Unable to create event");
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-2 md:px-4">
        <h1 className="bg-gradient-to-r from-fuchsia-600 to-pink-500 bg-clip-text text-3xl font-extrabold text-transparent">Organizer Portal</h1>
        {!user ? (
          <div className="mt-6 grid gap-6">
            <section className="grid gap-4 rounded-2xl border p-6 backdrop-blur bg-white/60">
              <h2 className="text-lg font-semibold">Sign in (Approved Organizers)</h2>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Email or Phone</label>
                <input placeholder="you@example.com or 9876543210" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-xl border px-3 py-2" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-xl border px-3 py-2" />
              </div>
              <Button onClick={handleLogin} className="bg-gradient-to-r from-fuchsia-600 to-pink-500 text-white">Sign in</Button>
              {notice && <div className="rounded-xl border bg-amber-50 p-3 text-sm text-amber-900">{notice}</div>}
            </section>

            <section className="grid gap-4 rounded-2xl border p-6 backdrop-blur bg-white/60">
              <h2 className="text-lg font-semibold">Sign up as Organizer</h2>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Full Name</label>
                <input value={signupName} onChange={(e) => setSignupName(e.target.value)} className="rounded-xl border px-3 py-2" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Email</label>
                <input value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} className="rounded-xl border px-3 py-2" placeholder="you@example.com" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Password</label>
                <input type="password" value={signupPwd} onChange={(e) => setSignupPwd(e.target.value)} className="rounded-xl border px-3 py-2" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Aadhar Number (12 digits)</label>
                <input value={signupAadhar} onChange={(e) => setSignupAadhar(e.target.value)} className="rounded-xl border px-3 py-2" placeholder="1234 5678 9012" />
              </div>
              <Button onClick={() => {
                try {
                  signUpOrganizer(signupEmail.trim(), signupName.trim(), signupPwd, signupAadhar);
                  setNotice("Signup successful. Waiting for admin approval. Please ask admin to approve from /admin.");
                  setSignupName(""); setSignupEmail(""); setSignupPwd(""); setSignupAadhar("");
                } catch (e:any) {
                  setNotice(e?.message || "Unable to sign up");
                }
              }} className="bg-gradient-to-r from-fuchsia-600 to-pink-500 text-white">Sign up</Button>
            </section>
          </div>
        ) : (
          <div className="mt-6 grid gap-8">
            {notice && <div className="rounded-xl border bg-amber-50 p-4 text-amber-900">{notice}</div>}
            {error && <div className="rounded-xl border bg-red-50 p-4 text-red-700">{error}</div>}
            {congrats && (
              <div className="rounded-xl border bg-green-50 p-4 text-green-800 shadow">{congrats}</div>
            )}
            <section className="rounded-2xl border bg-white/70 p-6 backdrop-blur">
              <h2 className="mb-4 text-xl font-semibold">Create Event</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="grid gap-2"><label className="text-sm">Event name</label><input className="rounded-xl border px-3 py-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div className="grid gap-2"><label className="text-sm font-medium">Genre</label>
                  <select className="rounded-xl border px-3 py-2" value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value as Genre })}>
                    {GENRES.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2"><label className="text-sm">Theme</label><input className="rounded-xl border px-3 py-2" value={form.theme} onChange={(e) => setForm({ ...form, theme: e.target.value })} /></div>
                <div className="grid gap-2"><label className="text-sm">Performing Artist(s)</label><input className="rounded-xl border px-3 py-2" value={form.artists} onChange={(e) => setForm({ ...form, artists: e.target.value })} placeholder="e.g., Arijit Singh, Prateek Kuhad" /></div>
                <div className="grid gap-2"><label className="text-sm">Price (INR)</label><input type="number" min={0} className="rounded-xl border px-3 py-2" value={form.priceINR} onChange={(e) => setForm({ ...form, priceINR: Number(e.target.value) })} /></div>
                <div className="grid gap-2"><label className="text-sm">Location</label>
                  <select className="rounded-xl border px-3 py-2" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value as City, venue: "" })}>
                    {(["Delhi","Mumbai","Hyderabad","Kolkata","Chennai"] as City[]).map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="grid gap-2"><label className="text-sm">Venue</label>
                  <select className="rounded-xl border px-3 py-2" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })}>
                    <option value="" disabled>Select venue</option>
                    {CITY_VENUES[form.city].map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2"><label className="text-sm">Date</label><input type="date" className="rounded-xl border px-3 py-2" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
                <div className="grid gap-2"><label className="text-sm">Start Time</label><input type="time" className="rounded-xl border px-3 py-2" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></div>
                <div className="grid gap-2"><label className="text-sm">End Time</label><input type="time" className="rounded-xl border px-3 py-2" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} /></div>
                <div className="grid gap-2"><label className="text-sm">Food & Beverages</label>
                  <select className="rounded-xl border px-3 py-2" value={form.beverages} onChange={(e) => setForm({ ...form, beverages: e.target.value as Beverages })}>
                    {(["Non-Alcoholic", "Alcoholic"] as Beverages[]).map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div className="grid gap-2"><label className="text-sm">Age Limit (optional)</label><input type="number" min={0} className="rounded-xl border px-3 py-2" value={form.ageLimit ?? ""} onChange={(e) => setForm({ ...form, ageLimit: e.target.value === "" ? undefined : Number(e.target.value) })} placeholder="18 if alcoholic" /></div>
                <div className="grid gap-2"><label className="text-sm">Total Tickets</label><input type="number" min={1} className="rounded-xl border px-3 py-2" value={form.totalTickets} onChange={(e) => setForm({ ...form, totalTickets: Number(e.target.value) })} /></div>
                <div className="grid gap-2 sm:col-span-2"><label className="text-sm">Description</label><textarea className="min-h-[80px] rounded-xl border px-3 py-2" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              </div>
              <Button onClick={create} className="mt-4 bg-gradient-to-r from-fuchsia-600 to-pink-500 text-white">Create</Button>
            </section>

            <section className="rounded-2xl border bg-white/70 p-6 backdrop-blur">
              <h2 className="mb-4 text-xl font-semibold">Your Events</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {events.map((e) => (
                  <div key={e.id} className="rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-sm">
                    <div className="font-semibold text-slate-900">{e.name} <span className="text-xs text-slate-500">({e.genre})</span></div>
                    <div className="text-xs text-slate-700">{e.city} • {e.venue}</div>
                    <div className="text-xs text-slate-600">{e.date} {e.time}{e.endTime ? `–${e.endTime}` : ""}</div>
                    <div className="mt-2 text-xs text-slate-500">Tickets left: {e.ticketsAvailable} / {e.totalTickets}</div>
                    <div className="mt-2">
                      <span className={"rounded-full px-2 py-0.5 text-[11px] font-semibold " + (e.status === "approved" ? "bg-green-100 text-green-700" : e.status === "pending" ? "bg-amber-100 text-amber-800" : e.status === "cancelled" ? "bg-gray-200 text-gray-700" : "bg-red-100 text-red-700")}>{e.status}</span>
                    </div>
                  </div>
                ))}
                {events.length === 0 && <div className="text-slate-600">No events yet.</div>}
              </div>
            </section>
          </div>
        )}
      </div>
    </Layout>
  );
}
