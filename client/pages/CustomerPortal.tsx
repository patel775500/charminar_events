import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { EventItem, User, Genre, GENRES, CITY_VENUES, City } from "@shared/api";
import { createBooking, listApprovedEvents, signInStrict } from "@/lib/store";

const ACTIVE_KEY = "ce_active_customer";

export default function CustomerPortal() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [events, setEvents] = useState<EventItem[]>([]);
  const [message, setMessage] = useState("");
  const [genre, setGenre] = useState<"All" | Genre>("All");
  const [activeCity, setActiveCity] = useState<"All" | City>("All");
  const [activeVenue, setActiveVenue] = useState<string>("All Venues");
  const [qty, setQty] = useState<Record<string, number>>({});

  useEffect(() => {
    const id = localStorage.getItem(ACTIVE_KEY);
    if (id) {
      // rehydrate minimal user state
      setUser({ id, email: "", role: "customer" });
    }
    setEvents(listApprovedEvents());
  }, []);

  useEffect(() => {
    // Always load all approved, filtering is done client-side for genre/city/venue
    setEvents(listApprovedEvents());
  }, [genre, activeCity, activeVenue]);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      const u = signInStrict("customer", email.trim(), password);
      localStorage.setItem(ACTIVE_KEY, u.id);
      setUser(u);
    } catch (e:any) {
      setMessage(e?.message || "Login failed. Please sign up first.");
    }
  };

  const book = (eventId: string) => {
    if (!user) return;
    const q = qty[eventId] ?? 1;
    const res = createBooking(eventId, user.id, q);
    if (!res.ok) {
      setMessage(res.reason ?? "Booking failed.");
      return;
    }
    setMessage("Ticket booked successfully. Use the Download Ticket button to save a copy.");
  };

  const downloadTicket = (e: EventItem) => {
    if (!user) return;
    const q = qty[e.id] ?? 1;
    const html = `<!DOCTYPE html><html><head><meta charset='utf-8'><title>Ticket</title>
      <style>body{font-family:Inter,system-ui,sans-serif;padding:24px;background:#111;color:#fff}
      .card{border:1px solid #333;border-radius:16px;padding:20px;background:#171717}
      h1{margin:0 0 8px;font-size:20px}
      .muted{color:#bbb;font-size:12px}
      .row{margin-top:8px}
      .badge{display:inline-block;padding:4px 8px;border-radius:999px;background:#ec4899;color:#fff;font-size:12px}
      </style></head><body>
      <div class='card'>
        <h1>${e.name}</h1>
        <div class='muted'>${e.genre} • ${e.city} • ${e.venue}</div>
        <div class='row'>Date & Time: <strong>${e.date} ${e.time}</strong></div>
        <div class='row'>Buyer: <strong>${user.name ?? user.email}</strong></div>
        <div class='row'>Quantity: <strong>${q}</strong></div>
        <div class='row'>Price: <strong>₹${e.priceINR} x ${q} = ₹${e.priceINR * q}</strong></div>
        <div class='row'>Beverages: <span class='badge'>${e.beverages}</span></div>
      </div>
      <script>window.print();</script>
    </body></html>`;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(html);
    w.document.close();
  };

  const genreChip = (g: "All" | Genre) => (
    <button
      key={g}
      onClick={() => setGenre(g)}
      className={
        "rounded-full px-4 py-1.5 text-sm transition border " +
        (genre === g
          ? "border-fuchsia-600 bg-fuchsia-600 text-white shadow"
          : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50")
      }
    >
      {g}
    </button>
  );

  const coverClasses = (g: Genre) => {
    switch (g) {
      case "Music":
        return "from-fuchsia-500/70 via-rose-500/50 to-amber-400/40";
      case "Comedy":
        return "from-emerald-500/60 via-teal-500/50 to-cyan-400/40";
      case "Concert":
        return "from-violet-600/70 via-indigo-500/50 to-sky-400/40";
      case "Dance Night":
        return "from-pink-600/70 via-purple-500/50 to-blue-400/40";
      case "Opera":
        return "from-amber-600/70 via-rose-500/50 to-fuchsia-400/40";
      default:
        return "from-zinc-700/60 to-zinc-500/40";
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-2 md:px-4">
        <h1 className="bg-gradient-to-r from-fuchsia-600 to-pink-500 bg-clip-text text-3xl font-extrabold text-transparent">Customer Portal</h1>
        {!user ? (
          <form onSubmit={handleLogin} className="mt-6 grid gap-4 rounded-2xl border p-6 backdrop-blur bg-white/60">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Email or Phone</label>
              <input placeholder="you@example.com or 9876543210" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-xl border px-3 py-2" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-xl border px-3 py-2" />
            </div>
            <Button type="submit" className="bg-gradient-to-r from-fuchsia-600 to-pink-500 text-white">Sign in</Button>
          </form>
        ) : (
          <div className="mt-6 space-y-6">
            {message && <div className="rounded-xl border bg-green-50 p-4 text-green-800">{message}</div>}
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-2 text-sm text-slate-700">Browse by Genre:</span>
              {(["All", ...GENRES] as ("All" | Genre)[]).map((g) => genreChip(g))}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="mr-2 text-sm text-slate-700">Filter by Location:</span>
              <select className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm" value={activeCity}
                      onChange={(e)=>{ const c = e.target.value as ("All"|City); setActiveCity(c); setActiveVenue("All Venues"); }}>
                <option value="All">All Cities</option>
                {(["Delhi","Mumbai","Hyderabad","Kolkata","Chennai"] as City[]).map((c)=> <option key={c} value={c}>{c}</option>)}
              </select>
              <select className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm" value={activeVenue}
                      onChange={(e)=> setActiveVenue(e.target.value)} disabled={activeCity==="All"}>
                <option>All Venues</option>
                {activeCity!=="All" && CITY_VENUES[activeCity].map((v)=> <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {events
                .filter((e) => genre === "All" || e.genre === genre)
                .filter((e) => activeCity === "All" || e.city === activeCity)
                .filter((e) => activeCity === "All" || activeVenue === "All Venues" || e.venue === activeVenue)
                .map((e) => (
                <div
                  key={e.id}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-fuchsia-500/10"
                >
                  <div className={`relative h-36 w-full bg-gradient-to-br ${coverClasses(e.genre)} `}>
                    <div className="absolute right-3 top-3 rounded-full bg-black/50 px-3 py-1 text-xs font-semibold text-white shadow">₹{e.priceINR}</div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-slate-900">{e.name}</div>
                        <div className="text-xs text-slate-700">{e.genre} • {e.city} • {e.venue}</div>
                        <div className="text-xs text-slate-600">{e.date} {e.time}{e.endTime ? `–${e.endTime}` : ""}</div>
                        <div className="text-[11px] text-slate-600">Available: {e.ticketsAvailable}</div>
                      </div>
                      <span className="rounded-full bg-pink-200 px-3 py-1 text-[11px] font-medium text-pink-800">Approved</span>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <input
                        type="number" min={1} max={10}
                        value={qty[e.id] ?? 1}
                        onChange={(ev) => setQty({ ...qty, [e.id]: Math.max(1, Math.min(10, Number(ev.target.value))) })}
                        className="w-20 rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900"
                      />
                      <Button onClick={() => book(e.id)} disabled={e.ticketsAvailable <= 0} className="bg-gradient-to-r from-fuchsia-600 to-pink-500 text-white disabled:opacity-50">
                        {e.ticketsAvailable > 0 ? "Book Ticket" : "Booking Closed"}
                      </Button>
                      <Button variant="secondary" onClick={() => downloadTicket(e)}>Download Ticket</Button>
                    </div>
                  </div>
                </div>
              ))}
              {events
                .filter((e) => genre === "All" || e.genre === genre)
                .filter((e) => activeCity === "All" || e.city === activeCity)
                .filter((e) => activeCity === "All" || activeVenue === "All Venues" || e.venue === activeVenue).length === 0 && (
                <div className="text-slate-600">No approved events yet.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
