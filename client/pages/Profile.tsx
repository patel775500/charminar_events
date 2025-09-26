import { useEffect, useMemo, useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Booking, EventItem, User } from "@shared/api";
import { changePassword, getUserById, listBookingsByUser, listOrganizerEvents, updateUser, listEvents } from "@/lib/store";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  // messages now shown via toast
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");

  useEffect(() => {
    const cid = localStorage.getItem("ce_active_customer");
    const oid = localStorage.getItem("ce_active_organizer");
    const id = cid || oid || undefined;
    const u = getUserById(id);
    if (!u) { navigate("/signup"); return; }
    setUser(u);
    setName(u.name ?? "");
    setPhone(u.phone ?? "");
  }, [navigate]);

  const bookings: Booking[] = useMemo(() => user && user.role === "customer" ? listBookingsByUser(user.id) : [], [user]);
  const events: EventItem[] = useMemo(() => user && user.role === "organizer" ? listOrganizerEvents(user.id) : [], [user]);
  const eventsById = useMemo(() => {
    const map = new Map<string, EventItem>();
    for (const e of listEvents()) map.set(e.id, e);
    return map;
  }, [user]);

  const downloadTicket = (ev: EventItem, qty: number) => {
    if (!user) return;
    const html = `<!DOCTYPE html><html><head><meta charset='utf-8'><title>Ticket</title>
      <style>body{font-family:Inter,system-ui,sans-serif;padding:24px;background:#111;color:#fff}
      .card{border:1px solid #333;border-radius:16px;padding:20px;background:#171717}
      h1{margin:0 0 8px;font-size:20px}
      .muted{color:#bbb;font-size:12px}
      .row{margin-top:8px}
      .badge{display:inline-block;padding:4px 8px;border-radius:999px;background:#ec4899;color:#fff;font-size:12px}
      </style></head><body>
      <div class='card'>
        <h1>${ev.name}</h1>
        <div class='muted'>${ev.genre} • ${ev.city} • ${ev.venue}</div>
        <div class='row'>Date & Time: <strong>${ev.date} ${ev.time}${ev.endTime ? `–${ev.endTime}` : ""}</strong></div>
        <div class='row'>Buyer: <strong>${user.name ?? user.email}</strong></div>
        <div class='row'>Quantity: <strong>${qty}</strong></div>
        <div class='row'>Price: <strong>₹${ev.priceINR} x ${qty} = ₹${ev.priceINR * qty}</strong></div>
        <div class='row'>Beverages: <span class='badge'>${ev.beverages}</span></div>
      </div>
      <script>window.print();</script>
    </body></html>`;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(html);
    w.document.close();
  };

  const saveProfile = () => {
    if (!user) return;
    const updated = updateUser(user.id, { name, phone });
    setUser(updated ?? user);
    toast.success("Profile updated");
  };

  const changePwd = () => {
    if (!user) return;
    const res = changePassword(user.id, oldPwd, newPwd);
    if (!res.ok) { toast.error(res.reason || "Unable to change password"); return; }
    toast.success("Password changed successfully");
    setOldPwd(""); setNewPwd("");
  };

  if (!user) return null;

  return (
    <Layout>
      <div className="mx-auto grid max-w-5xl gap-6 px-2 md:px-4">
        <h1 className="bg-gradient-to-r from-fuchsia-600 to-pink-500 bg-clip-text text-3xl font-extrabold text-transparent">My Profile</h1>

        <section className="rounded-2xl border bg-white/70 p-6 backdrop-blur">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs text-slate-600">Name</label>
              <input className="mt-1 w-full rounded-xl border px-3 py-2" value={name} onChange={(e)=>setName(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-slate-600">Phone</label>
              <input className="mt-1 w-full rounded-xl border px-3 py-2" value={phone} onChange={(e)=>setPhone(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-slate-600">Email</label>
              <input className="mt-1 w-full rounded-xl border px-3 py-2" value={user.email} readOnly />
            </div>
            <div>
              <label className="text-xs text-slate-600">Role</label>
              <input className="mt-1 w-full rounded-xl border px-3 py-2" value={user.role} readOnly />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={saveProfile} className="bg-gradient-to-r from-fuchsia-600 to-pink-500 text-white">Save</Button>
          </div>
        </section>

        <section className="rounded-2xl border bg-white/70 p-6 backdrop-blur">
          <h2 className="mb-2 text-lg font-semibold">Change Password</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs text-slate-600">Current password</label>
              <input type="password" className="mt-1 w-full rounded-xl border px-3 py-2" value={oldPwd} onChange={(e)=>setOldPwd(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-slate-600">New password</label>
              <input type="password" className="mt-1 w-full rounded-xl border px-3 py-2" value={newPwd} onChange={(e)=>setNewPwd(e.target.value)} />
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <Button onClick={changePwd} variant="secondary">Update Password</Button>
          </div>
        </section>

        {user.role === "customer" ? (
          <section className="rounded-2xl border bg-white/70 p-6 backdrop-blur">
            <h2 className="mb-3 text-lg font-semibold">My Bookings</h2>
            <div className="grid gap-3">
              {bookings.map((b) => {
                const ev = eventsById.get(b.eventId);
                return (
                  <div key={b.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    {ev ? (
                      <>
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="text-sm font-semibold text-slate-900">{ev.name}</div>
                            <div className="mt-0.5 text-xs text-slate-700">{ev.genre} • {ev.city} • {ev.venue}</div>
                            <div className="text-xs text-slate-600">{ev.date} {ev.time}</div>
                          </div>
                          <span className="rounded-full bg-pink-100 px-3 py-1 text-[11px] font-semibold text-pink-800">Qty {b.qty}</span>
                        </div>
                        <div className="mt-2 text-xs text-slate-500">Booked at {new Date(b.createdAt).toLocaleString()}</div>
                        <div className="mt-1 text-xs text-slate-700">Total: ₹{ev.priceINR} × {b.qty} = <span className="font-semibold">₹{ev.priceINR * b.qty}</span></div>
                        <div className="mt-3 flex gap-2">
                          <Button onClick={() => downloadTicket(ev, b.qty)} className="bg-gradient-to-r from-fuchsia-600 to-pink-500 text-white">Download Ticket</Button>
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-slate-800">Booking #{b.id.slice(-6)} • Qty {b.qty} • {new Date(b.createdAt).toLocaleString()}</div>
                    )}
                  </div>
                );
              })}
              {bookings.length === 0 && <div className="text-sm text-slate-600">No bookings yet.</div>}
            </div>
          </section>
        ) : (
          <section className="rounded-2xl border bg-white/70 p-6 backdrop-blur">
            <h2 className="mb-3 text-lg font-semibold">My Events</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((e) => (
                <div key={e.id} className="rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-sm">
                  <div className="font-semibold text-slate-900">{e.name}</div>
                  <div className="text-xs text-slate-700">{e.genre} • {e.city} • {e.venue}</div>
                  <div className="text-xs text-slate-600">{e.date} {e.time}{e.endTime ? `–${e.endTime}` : ""}</div>
                  <div className="mt-2 text-xs text-slate-500">Tickets left: {e.ticketsAvailable} / {e.totalTickets}</div>
                  <div className="mt-2">
                    <span className={"rounded-full px-2 py-0.5 text-[11px] font-semibold " + (e.status === "approved" ? "bg-green-100 text-green-700" : e.status === "pending" ? "bg-amber-100 text-amber-800" : e.status === "cancelled" ? "bg-gray-200 text-gray-700" : "bg-red-100 text-red-700")}>{e.status}</span>
                  </div>
                </div>
              ))}
              {events.length === 0 && <div className="text-sm text-slate-600">No events created yet.</div>}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}
