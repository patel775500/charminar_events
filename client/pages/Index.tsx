import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { listApprovedEvents, seedDemoIfEmpty } from "@/lib/store";
import { useEffect, useState } from "react";
import { CITY_VENUES, City, EventItem, Genre, toEpochMillis } from "@shared/api";
import { motion } from "framer-motion";
import { BuilderComponent, builder } from "@builder.io/react";
import "@/lib/builder";
import SafeHero from "@/components/SafeHero";

export default function Index() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [cmsContent, setCmsContent] = useState<any>(null);
  const [activeGenre, setActiveGenre] = useState<"All" | Genre>("All");
  const [activeCity, setActiveCity] = useState<"All" | City>("All");
  const [activeVenue, setActiveVenue] = useState<string>("All Venues");
  const [cmsChecked, setCmsChecked] = useState(false);

  useEffect(() => {
    // Seed a few demo events if storage is empty so users immediately see functionality
    seedDemoIfEmpty();
    setEvents(listApprovedEvents());
    // Try to load Builder content for homepage. If exists, render it.
    const apiKey = import.meta.env.VITE_PUBLIC_BUILDER_KEY as string | undefined;
    if (!apiKey) {
      setCmsChecked(true);
      return;
    }
    builder
      .get("page", { userAttributes: { urlPath: "/" } })
      .promise()
      .then((res) => setCmsContent(res))
      .finally(() => setCmsChecked(true));
  }, []);

  return (
    <Layout>
      {cmsChecked && cmsContent && (
        <div className="mx-auto max-w-7xl px-2 md:px-4">
          <BuilderComponent model="page" content={cmsContent} />
        </div>
      )}
      {(!cmsChecked || !cmsContent) && <SafeHero />}

      <div className="mx-auto max-w-7xl px-2 md:px-4">
      {/* Featured Genres */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold">Featured Genres</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {([
            { g: "Music", c: "from-fuchsia-600 to-rose-500" },
            { g: "Comedy", c: "from-emerald-600 to-teal-500" },
            { g: "Concert", c: "from-violet-600 to-indigo-500" },
            { g: "Dance Night", c: "from-pink-600 to-purple-500" },
            { g: "Opera", c: "from-amber-600 to-rose-500" },
          ] as { g: Genre; c: string }[]).map(({ g, c }) => (
            <button
              key={g}
              onClick={() => setActiveGenre(g)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium shadow transition ${activeGenre === g ? `bg-gradient-to-r ${c} text-white` : "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50"}`}
            >
              {g}
            </button>
          ))}
          <button
            onClick={() => setActiveGenre("All")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${activeGenre === "All" ? "bg-slate-900 text-white" : "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50"}`}
          >
            All Shows
          </button>
        </div>
      </section>

      {/* Location Filters */}
      <section className="mt-6">
        <h3 className="text-sm font-medium text-slate-700">Filter by Location</h3>
        <div className="mt-2 flex flex-wrap gap-3">
          <select className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm" value={activeCity}
                  onChange={(e)=>{ const c = e.target.value as ("All"|City); setActiveCity(c); setActiveVenue("All Venues"); }}>
            <option value="All">All Cities</option>
            {(["Delhi","Mumbai","Hyderabad","Kolkata","Chennai"] as City[]).map(c=> <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm" value={activeVenue}
                  onChange={(e)=> setActiveVenue(e.target.value)} disabled={activeCity==="All"}>
            <option>All Venues</option>
            {activeCity!=="All" && CITY_VENUES[activeCity].map(v=> <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Ongoing Events</h2>
        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {events
            .filter((e) => activeGenre === "All" || e.genre === activeGenre)
            .filter((e) => activeCity === "All" || e.city === activeCity)
            .filter((e) => activeCity === "All" || activeVenue === "All Venues" || e.venue === activeVenue)
            .filter((e) => {
              const start = toEpochMillis(e.date, e.time);
              const end = e.endTime ? toEpochMillis(e.date, e.endTime) : start + 2 * 60 * 60 * 1000;
              const now = Date.now();
              return now >= start && now <= end;
            })
            .map((e) => (
            <div key={e.id} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-sm backdrop-blur">
              <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(400px_160px_at_0%_0%,rgba(236,72,153,.35),transparent)]" />
              <div className="relative">
                <div className="font-semibold text-slate-900">{e.name}</div>
                <div className="text-xs text-slate-700">{e.genre} • {e.city}</div>
                <div className="text-xs text-slate-600">{e.venue} • {e.date} {e.time}{e.endTime ? `–${e.endTime}` : ""}</div>
                <Link to="/customer"><Button className="mt-3 w-full bg-gradient-to-r from-fuchsia-600 to-pink-500 text-white">Book</Button></Link>
              </div>
            </div>
          ))}
          {events
            .filter((e) => activeGenre === "All" || e.genre === activeGenre)
            .filter((e) => activeCity === "All" || e.city === activeCity)
            .filter((e) => activeCity === "All" || activeVenue === "All Venues" || e.venue === activeVenue)
            .filter((e) => {
              const start = toEpochMillis(e.date, e.time);
              const end = e.endTime ? toEpochMillis(e.date, e.endTime) : start + 2 * 60 * 60 * 1000;
              const now = Date.now();
              return now >= start && now <= end;
            }).length === 0 && (
            <div className="rounded-2xl border bg-white/70 p-6 text-slate-600">No ongoing events right now.</div>
          )}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Upcoming Events</h2>
        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {events
            .filter((e) => activeGenre === "All" || e.genre === activeGenre)
            .filter((e) => activeCity === "All" || e.city === activeCity)
            .filter((e) => activeCity === "All" || activeVenue === "All Venues" || e.venue === activeVenue)
            .filter((e) => toEpochMillis(e.date, e.time) > Date.now())
            .map((e) => (
            <div key={e.id} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-sm backdrop-blur">
              <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(400px_160px_at_0%_0%,rgba(236,72,153,.35),transparent)]" />
              <div className="relative">
                <div className="font-semibold text-slate-900">{e.name}</div>
                <div className="text-xs text-slate-700">{e.genre} • {e.city}</div>
                <div className="text-xs text-slate-600">{e.venue} • {e.date} {e.time}{e.endTime ? `–${e.endTime}` : ""}</div>
                <Link to="/customer"><Button className="mt-3 w-full bg-gradient-to-r from-fuchsia-600 to-pink-500 text-white">Book</Button></Link>
              </div>
            </div>
          ))}
          {events
            .filter((e) => activeGenre === "All" || e.genre === activeGenre)
            .filter((e) => activeCity === "All" || e.city === activeCity)
            .filter((e) => activeCity === "All" || activeVenue === "All Venues" || e.venue === activeVenue)
            .filter((e) => toEpochMillis(e.date, e.time) > Date.now()).length === 0 && (
            <div className="rounded-2xl border bg-white/70 p-6 text-slate-600">No upcoming events. Organizers can create one from the Organizer portal.</div>
          )}
        </div>
      </section>

      {/* Organizer CTA */}
      <section className="mx-auto mt-12 max-w-6xl">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-fuchsia-700/40 via-pink-600/30 to-rose-600/30 p-6">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="text-lg font-semibold text-white">Hosting a show?</div>
              <div className="text-sm text-white/80">Create your event in minutes. Our automation handles approvals and conflicts.</div>
            </div>
            <Link to="/organizer" className="inline-flex rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:opacity-90">Create an Event</Link>
          </div>
        </div>
      </section>
    </div>
    </Layout>
  );
}
