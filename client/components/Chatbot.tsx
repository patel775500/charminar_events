import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface Msg { id: string; role: "bot" | "user"; text: string; }

const BOT_WELCOME = "Hi! I'm your Charminar assistant. Ask about logging in, booking tickets, creating events, or approvals.";

function uid() { return Math.random().toString(36).slice(2); }

export default function Chatbot() {
  const [open, setOpen] = useState(true);
  const [msgs, setMsgs] = useState<Msg[]>([{ id: uid(), role: "bot", text: BOT_WELCOME }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    const userMsg: Msg = { id: uid(), role: "user", text };
    setMsgs((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const messages = [
        { role: "system", content: `You are the Charminar Event AI assistant for a Netflix-style event platform.
Current route: ${location.pathname}

Site rules and flows:
- Authentication: Users must Sign up first with Name, Email (optional), Phone (10 digits), and Password. Login accepts Email OR Phone + Password.
- Roles & portals:
  * Customer (/customer): browse by genre tabs (All, Music, Comedy, Concert, Dance Night, Opera), view Ongoing/Upcoming events, book up to 10 tickets total per event. Inventory decrements on booking. Ticket can be downloaded.
  * Organizer (/organizer): create events with genre, theme, artists, price (INR), venue, city, date, time, beverages (Alcoholic requires age >= 18), total tickets, optional description. Auto-approval when no city+venue+date+time clash; otherwise rejected with message to reschedule.
- Profile (/profile): shows Name/Email/Phone/Role, lets users edit name/phone, change password. Customers see My Bookings; Organizers see My Events.
- Navbar when logged in: only My Profile + Logout. Logo routes to active portal.
- Homepage: static cinematic hero; events split into Ongoing and Upcoming. If a Builder page exists for '/', it renders instead.

Assistant guidelines:
- Be concise and step-by-step. Include the correct route and exact button/field names. Prefer short bullet steps.
- If asked about errors, suggest: refresh (Ctrl+Shift+R), check login state, verify phone has 10 digits, ensure Alcoholic events have age limit >= 18, avoid venue/date/time clashes.
- If asked where to go next, give a direct link path (e.g., /signup, /customer, /organizer, /profile).` },
        ...msgs.map((m) => ({ role: m.role === "user" ? "user" : "assistant", content: m.text })),
        { role: "user", content: text },
      ];

      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });
      const data = await resp.json();
      const reply = (data?.message as string) || "Sorry, I couldn't generate a response.";
      setMsgs((m) => [...m, { id: uid(), role: "bot", text: reply }]);
    } catch (err) {
      setMsgs((m) => [...m, { id: uid(), role: "bot", text: "There was an issue reaching the assistant. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={cn("w-80 overflow-hidden rounded-2xl shadow-2xl border backdrop-blur", open ? "" : "hidden")}
           style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.8), rgba(255,255,255,0.6))" }}>
        <div className="bg-gradient-to-r from-fuchsia-600 to-pink-500 text-white px-4 py-3 flex items-center justify-between">
          <span className="font-semibold">Assistant</span>
          <button onClick={() => setOpen(false)} className="text-white/90 hover:text-white">×</button>
        </div>
        <div className="px-3 pt-3 flex flex-wrap gap-2">
          <button onClick={()=>{ setInput("Help me sign up"); }} className="rounded-full bg-pink-100 px-3 py-1 text-xs text-pink-700 hover:bg-pink-200">Sign up</button>
          <button onClick={()=>{ navigate("/organizer"); setMsgs((m)=>[...m,{id:uid(),role:"bot",text:"Opening Organizer. Fill the form — automation will approve if no venue/date/time clash."}]); }} className="rounded-full bg-fuchsia-100 px-3 py-1 text-xs text-fuchsia-700 hover:bg-fuchsia-200">Create Event</button>
          <button onClick={()=>{ navigate("/customer"); setMsgs((m)=>[...m,{id:uid(),role:"bot",text:"Opening Attendee. Pick a genre, select a show, and book up to 10 tickets."}]); }} className="rounded-full bg-violet-100 px-3 py-1 text-xs text-violet-700 hover:bg-violet-200">Browse Shows</button>
        </div>
        <div className="max-h-80 overflow-y-auto px-3 py-3 space-y-2">
          {msgs.map((m) => (
            <div key={m.id} className={cn("rounded-xl px-3 py-2 text-sm", m.role === "bot" ? "bg-fuchsia-100 text-fuchsia-900" : "bg-pink-100 text-pink-900 ml-auto max-w-[85%]")}>{m.text}</div>
          ))}
          <div ref={endRef} />
        </div>
        <div className="p-3 flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)}
                 onKeyDown={(e) => { if (e.key === "Enter") send(); }}
                 placeholder="Type your question..." className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500" />
          <button onClick={send} disabled={loading} className="rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-500 px-3 py-2 text-sm font-medium text-white shadow disabled:opacity-60">{loading ? "..." : "Send"}</button>
        </div>
      </div>

      {!open && (
        <button onClick={() => setOpen(true)}
                className="h-14 w-14 rounded-full shadow-xl border text-white bg-gradient-to-r from-fuchsia-600 to-pink-500 flex items-center justify-center">
          💬
        </button>
      )}
    </div>
  );
}
