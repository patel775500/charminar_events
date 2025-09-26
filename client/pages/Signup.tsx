import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { signUp, signUpOrganizer } from "@/lib/store";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [role, setRole] = useState<"customer" | "organizer">("customer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [aadhar, setAadhar] = useState("");
  const [error, setError] = useState("");
  const [okMsg, setOkMsg] = useState("");
  const navigate = useNavigate();

  const submit = () => {
    setError("");
    if (!email.trim()) return setError("Please enter your email.");
    if (!name.trim()) return setError("Please enter your name.");
    if (role === "customer" && !phone.trim()) return setError("Please enter your phone number.");
    if (!password.trim()) return setError("Please enter your password.");
    try {
      if (role === "customer") {
        const u = signUp(role, email, name, phone, password);
        localStorage.setItem("ce_active_customer", u.id);
        navigate("/customer");
      } else {
        const digits = aadhar.replace(/\D/g, "");
        if (!/^\d{12}$/.test(digits)) return setError("Aadhar must be 12 digits");
        signUpOrganizer(email, name, password, digits);
        setOkMsg("Organizer signup successful. Awaiting admin approval. Please login after approval.");
      }
    } catch (e:any) {
      setError(e?.message || "Could not sign up");
      return;
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-xl">
        <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-b from-black via-zinc-900 to-black p-6 shadow-2xl">
          <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(800px_320px_at_10%_10%,rgba(236,72,153,.3),transparent),radial-gradient(700px_260px_at_90%_20%,rgba(168,85,247,.3),transparent)]" />
          <div className="relative">
            <h1 className="text-3xl font-extrabold text-white">Welcome on Board</h1>
            <p className="mt-2 text-zinc-300">Create an account and start your journey as an Attendee or Organizer.</p>
            {error && <div className="mt-4 rounded-xl border border-red-200 bg-red-50/10 p-3 text-red-200">{error}</div>}
            {okMsg && <div className="mt-4 rounded-xl border border-green-200 bg-green-50/10 p-3 text-green-200">{okMsg}</div>}

            <div className="mt-6 grid gap-4">
              <div className="grid gap-2">
                <label className="text-sm text-zinc-300">Your Name</label>
                <input className="rounded-xl border border-white/20 bg-black/30 px-3 py-2 text-white" value={name} onChange={(e)=>setName(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm text-zinc-300">Email</label>
                <input className="rounded-xl border border-white/20 bg-black/30 px-3 py-2 text-white" value={email} onChange={(e)=>setEmail(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm text-zinc-300">Phone</label>
                <input className="rounded-xl border border-white/20 bg-black/30 px-3 py-2 text-white" value={phone} onChange={(e)=>setPhone(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm text-zinc-300">Password</label>
                <input type="password" className="rounded-xl border border-white/20 bg-black/30 px-3 py-2 text-white" value={password} onChange={(e)=>setPassword(e.target.value)} />
              </div>
              {role === "organizer" && (
                <div className="grid gap-2">
                  <label className="text-sm text-zinc-300">Aadhar Number (12 digits)</label>
                  <input className="rounded-xl border border-white/20 bg-black/30 px-3 py-2 text-white" value={aadhar} onChange={(e)=>setAadhar(e.target.value)} placeholder="1234 5678 9012" />
                </div>
              )}
              <div className="grid gap-2">
                <label className="text-sm text-zinc-300">I am</label>
                <div className="flex gap-2">
                  <button type="button" onClick={()=>setRole("customer")} className={(role==="customer"?"bg-fuchsia-600 text-white":"bg-white/10 text-white/80")+" rounded-xl px-4 py-2 transition"}>Attendee</button>
                  <button type="button" onClick={()=>setRole("organizer")} className={(role==="organizer"?"bg-fuchsia-600 text-white":"bg-white/10 text-white/80")+" rounded-xl px-4 py-2 transition"}>Organizer</button>
                </div>
              </div>
              <Button onClick={submit} className="mt-2 bg-gradient-to-r from-fuchsia-600 to-pink-500 text-white">Continue</Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
