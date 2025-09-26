import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { getUserById } from "@/lib/store";

const nav = [
  { to: "/", label: "Home" },
  { to: "/customer", label: "Customer" },
  { to: "/organizer", label: "Organizer" },
  { to: "/signup", label: "Sign up" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [activeRole, setActiveRole] = useState<"customer" | "organizer" | null>(null);

  const computeActive = () => {
    const c = localStorage.getItem("ce_active_customer");
    const o = localStorage.getItem("ce_active_organizer");
    if (c) return "customer" as const;
    if (o) return "organizer" as const;
    return null;
  };

  const [activeUserLabel, setActiveUserLabel] = useState<string>("");

  useEffect(() => {
    const role = computeActive();
    setActiveRole(role);
    const id = role === "customer" ? localStorage.getItem("ce_active_customer") : role === "organizer" ? localStorage.getItem("ce_active_organizer") : null;
    const u = getUserById(id || undefined);
    setActiveUserLabel(u ? `${u.name ?? u.email} · ${u.role}` : "");
  }, []);

  useEffect(() => {
    const onStorage = () => {
      const role = computeActive();
      setActiveRole(role);
      const id = role === "customer" ? localStorage.getItem("ce_active_customer") : role === "organizer" ? localStorage.getItem("ce_active_organizer") : null;
      const u = getUserById(id || undefined);
      setActiveUserLabel(u ? `${u.name ?? u.email} · ${u.role}` : "");
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const logoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (activeRole === "customer") navigate("/customer");
    else if (activeRole === "organizer") navigate("/organizer");
    else navigate("/");
  };

  const logout = () => {
    localStorage.removeItem("ce_active_customer");
    localStorage.removeItem("ce_active_organizer");
    setActiveRole(null);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-fuchsia-100 via-pink-100 to-white dark:from-fuchsia-950 dark:via-fuchsia-900/60 dark:to-black">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-32 -left-32 h-80 w-80 rounded-full bg-fuchsia-400/40 blur-3xl" />
        <div className="absolute top-40 -right-20 h-72 w-72 rounded-full bg-pink-500/40 blur-[96px]" />
      </div>
      <header className="sticky top-0 z-20 border-b backdrop-blur supports-[backdrop-filter]:bg-white/60 bg-white/80 dark:bg-black/40">
        <div className="container flex h-16 items-center justify-between">
          <a href="#" onClick={logoClick} className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 to-pink-500 text-xl tracking-tight">
            Charminar Event
          </a>
          <nav className="hidden items-center gap-6 md:flex">
            {!activeRole ? (
              <>
                {nav.map((n) => (
                  <NavLink
                    key={n.to}
                    to={n.to}
                    className={({ isActive }) =>
                      cn(
                        "text-sm font-medium transition-colors hover:text-fuchsia-600",
                        isActive ? "text-fuchsia-600" : "text-slate-700",
                      )
                    }
                  >
                    {n.label}
                  </NavLink>
                ))}
              </>
            ) : (
              <>
                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    cn(
                      "text-sm font-medium transition-colors hover:text-fuchsia-600",
                      isActive ? "text-fuchsia-600" : "text-slate-700",
                    )
                  }
                >
                  My Profile
                </NavLink>
                {activeUserLabel && (
                  <span className="rounded-lg border border-white/20 bg-white/40 px-3 py-1 text-xs text-slate-800">{activeUserLabel}</span>
                )}
                <button onClick={logout} className="rounded-lg border border-white/20 bg-white/10 px-3 py-1 text-sm font-medium text-slate-800 hover:bg-white/20">
                  Logout
                </button>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="container py-10">{children}</main>
      <footer className="mt-10 border-t bg-white/60 backdrop-blur py-8 text-center text-sm text-slate-600 dark:bg-black/40">
        © {new Date().getFullYear()} Charminar Event. All rights reserved.
      </footer>
    </div>
  );
}
