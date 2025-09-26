import { Route, Routes, Link } from 'react-router-dom'
import Landing from './pages/Landing'
import Organizer from './pages/Organizer'
import Attendee from './pages/Attendee'
import Admin from './pages/Admin'
import CMS from './pages/CMS'

export default function App(){
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-black/40 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="text-lg font-extrabold bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">Grand Event</Link>
          <nav className="hidden gap-4 sm:flex">
            <Link to="/organizer" className="text-sm text-white/80 hover:text-white">Organizer</Link>
            <Link to="/attendee" className="text-sm text-white/80 hover:text-white">Attendee</Link>
            <Link to="/admin" className="text-sm text-white/80 hover:text-white">Admin</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Routes>
          <Route path="/" element={<Landing/>} />
          <Route path="/organizer" element={<Organizer/>} />
          <Route path="/attendee" element={<Attendee/>} />
          <Route path="/admin" element={<Admin/>} />
          <Route path="/cms/*" element={<CMS/>} />
        </Routes>
      </main>
      <footer className="border-t border-white/10 py-8 text-center text-xs text-white/60">© {new Date().getFullYear()} Grand Event</footer>
    </div>
  )
}
