import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { approveOrganizer, ensureAdminSeed, listOrganizersPending, signInStrict } from "@/lib/store";
import { User } from "@shared/api";

export default function AdminPage() {
  const [adminId, setAdminId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState<string>("");
  const [pending, setPending] = useState<User[]>([]);

  useEffect(() => {
    ensureAdminSeed();
  }, []);

  const login = () => {
    try {
      const u = signInStrict("admin", email, password);
      setAdminId(u.id);
      setNotice("");
      setPending(listOrganizersPending());
    } catch (e: any) {
      setNotice(e?.message || "Login failed");
    }
  };

  const refresh = () => setPending(listOrganizersPending());

  const approve = (id: string) => {
    approveOrganizer(id);
    refresh();
  };

  return (
    <Layout>
      <div className="mx-auto max-w-5xl px-2 md:px-4">
        <h1 className="bg-gradient-to-r from-fuchsia-600 to-pink-500 bg-clip-text text-3xl font-extrabold text-transparent">Admin</h1>
        {!adminId ? (
          <div className="mt-6 grid max-w-md gap-3 rounded-2xl border bg-white/70 p-6">
            {notice && <div className="rounded-xl border bg-red-50 p-3 text-sm text-red-700">{notice}</div>}
            <div className="grid gap-2">
              <label className="text-xs text-slate-600">Email</label>
              <input className="rounded-xl border px-3 py-2" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="sutherland@global.com" />
            </div>
            <div className="grid gap-2">
              <label className="text-xs text-slate-600">Password</label>
              <input type="password" className="rounded-xl border px-3 py-2" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="123abc" />
            </div>
            <Button onClick={login} className="bg-gradient-to-r from-fuchsia-600 to-pink-500 text-white">Sign in</Button>
          </div>
        ) : (
          <div className="mt-6 grid gap-6">
            <section className="rounded-2xl border bg-white/70 p-6">
              <h2 className="mb-3 text-lg font-semibold">Pending Organizer Approvals</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {pending.map((u)=> (
                  <div key={u.id} className="rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-sm">
                    <div className="font-semibold text-slate-900">{u.name || u.email}</div>
                    <div className="text-xs text-slate-700">{u.email}</div>
                    <div className="text-xs text-slate-700">Aadhar: {u.aadhar}</div>
                    <div className="mt-3"><Button onClick={()=>approve(u.id)} className="bg-green-600 text-white hover:bg-green-700">Approve</Button></div>
                  </div>
                ))}
                {pending.length===0 && <div className="text-sm text-slate-600">No pending organizers.</div>}
              </div>
            </section>
          </div>
        )}
      </div>
    </Layout>
  );
}
