import { useEffect, useMemo, useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { EventItem, eventsClash } from "@shared/api";
import { cancelEvent, listEvents, updateEventStatus } from "@/lib/store";

export default function AdminPortal() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [message, setMessage] = useState("");

  const refresh = () => setEvents(listEvents());
  useEffect(() => { refresh(); }, []);

  const setStatus = (id: string, status: "approved" | "rejected" | "pending") => {
    updateEventStatus(id, status);
    refresh();
  };

  const conflicts = useMemo(() => {
    const map: Record<string, EventItem[]> = {};
    for (const e of events) {
      map[e.id] = events.filter((x) => x.id !== e.id && eventsClash(e, x));
    }
    return map;
  }, [events]);

  const handleCancel = (id: string) => {
    const res = cancelEvent(id);
    if (!res.ok) setMessage(res.reason ?? "Cancel failed");
    else setMessage("Event cancelled.");
    refresh();
  };

  return (
    <Layout>
      <div className="mx-auto max-w-4xl">
        <h1 className="bg-gradient-to-r from-fuchsia-600 to-pink-500 bg-clip-text text-3xl font-extrabold text-transparent">Admin Portal</h1>
        <p className="mt-2 text-slate-600">Review conflicts, approve or reject events, and cancel shows (not allowed within 1 week of start).</p>
        {message && <div className="mt-4 rounded-xl border bg-amber-50 p-4 text-amber-900">{message}</div>}
        <div className="mt-6 grid gap-4">
          {events.map((e) => (
            <div key={e.id} className="grid items-start gap-4 rounded-2xl border bg-white/70 p-4 sm:grid-cols-[1fr_auto]">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{e.name}</span>
                  <span className="text-xs text-slate-600">{e.genre} • {e.city} • {e.venue} • {e.date} {e.time}</span>
                </div>
                <div className="mt-1 text-xs text-slate-600">Artists: {e.artists || "N/A"} • Theme: {e.theme || "N/A"}</div>
                <div className="mt-1 text-xs text-slate-600">Tickets: {e.ticketsAvailable}/{e.totalTickets} • Price: ₹{e.priceINR}</div>
                {conflicts[e.id]?.length > 0 && (
                  <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs text-amber-900">
                    Venue clash detected with {conflicts[e.id].length} event(s). Consider rejecting or requesting reschedule.
                  </div>
                )}
              </div>
              <div className="flex flex-col items-stretch gap-2 justify-self-end sm:w-72">
                <span className={"self-end rounded-full px-3 py-1 text-xs font-semibold " + (e.status === "approved" ? "bg-green-100 text-green-700" : e.status === "pending" ? "bg-amber-100 text-amber-800" : e.status === "cancelled" ? "bg-gray-200 text-gray-700" : "bg-red-100 text-red-700")}>{e.status}</span>
                <div className="flex gap-2">
                  <Button onClick={() => setStatus(e.id, "approved")} className="bg-green-600 text-white hover:bg-green-700">Approve</Button>
                  <Button onClick={() => setStatus(e.id, "rejected")} variant="destructive">Reject</Button>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => setStatus(e.id, "pending")} variant="secondary">Mark Pending</Button>
                  <Button onClick={() => handleCancel(e.id)} variant="outline">Cancel Show</Button>
                </div>
              </div>
            </div>
          ))}
          {events.length === 0 && <div className="text-slate-600">No events yet.</div>}
        </div>
      </div>
    </Layout>
  );
}
