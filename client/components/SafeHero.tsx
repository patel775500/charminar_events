import React from "react";

export default function SafeHero() {
  // Always render the static cinematic hero to avoid any 3D import/runtime issues
  return (
    <section className="relative overflow-hidden rounded-[28px] border bg-gradient-to-b from-black via-zinc-900 to-black p-0 shadow-2xl">
      <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(1000px_400px_at_10%_10%,rgba(236,72,153,.35),transparent),radial-gradient(800px_300px_at_90%_20%,rgba(168,85,247,.35),transparent)]" />
      <div className="relative grid min-h-[420px] grid-cols-1 items-center gap-8 p-10 md:grid-cols-2">
        <div>
          <h1 className="text-4xl font-extrabold leading-tight text-white md:text-5xl">Automated Event Management</h1>
          <p className="mt-3 max-w-xl text-zinc-300">Dark, cinematic, Netflix-style experience. Organizers create. Smart automation approves on no clash; Attendees book with seamless vibes.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="/customer" className="inline-flex items-center rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-500 px-4 py-2 font-semibold text-white shadow">Attendee</a>
            <a href="/organizer" className="inline-flex items-center rounded-xl border border-white/20 bg-white/10 px-4 py-2 font-semibold text-white hover:bg-white/20">Organizer</a>
          </div>
        </div>
        <div className="flex items-center justify-center gap-10 py-8">
          <div className="relative h-40 w-40 rounded-full bg-gradient-to-br from-fuchsia-500 via-pink-500 to-rose-500 shadow-[0_0_80px_-20px_rgba(236,72,153,.8)]" />
          <div className="relative h-40 w-40 rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 shadow-[0_0_80px_-20px_rgba(139,92,246,.8)]" />
        </div>
      </div>
    </section>
  );
}
