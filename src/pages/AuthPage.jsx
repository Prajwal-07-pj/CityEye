import { useState } from "react";
import { Mail, Lock, UserPlus } from "lucide-react";

export default function AuthPage({ C, ui, onAuth }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch(`/api/auth/${mode}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to continue.");
      onAuth(data.user);
    } catch (requestError) {
      setError(requestError.message || "Unable to continue.");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: `linear-gradient(160deg, ${C.navyDeep}, ${C.navy} 60%)` }}>
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-3"><ui.Logo dark size={30} /></div>
        <p className="text-center text-sm text-white/60 mb-10">See the Problem. Track the Action. Verify the Change.</p>
        <ui.Card className="p-6" style={{ background: "rgba(255,255,255,0.98)" }}>
          <div className="flex gap-1 p-1 rounded-xl mb-6" style={{ background: C.bg }}>
            {[{ key: "login", label: "Sign in" }, { key: "signup", label: "Create citizen account" }].map((tab) => (
              <button key={tab.key} onClick={() => { setMode(tab.key); setError(""); }} className="flex-1 rounded-lg py-2 text-xs font-semibold" style={{ background: mode === tab.key ? "white" : "transparent", color: mode === tab.key ? C.navy : C.sub, boxShadow: mode === tab.key ? "0 1px 4px rgba(15,27,45,0.1)" : "none" }}>{tab.label}</button>
            ))}
          </div>
          <div className="mb-5">
            <div className="text-lg font-display font-bold" style={{ color: C.ink }}>{mode === "login" ? "Welcome back" : "Join NagarNetra"}</div>
            <div className="text-xs mt-1" style={{ color: C.sub }}>{mode === "login" ? "Use the ID and password issued by your upper class." : "Citizen accounts can report and track civic issues."}</div>
          </div>
          <form onSubmit={submit} className="flex flex-col gap-3">
            {mode === "signup" && <label className="relative"><UserPlus size={16} color={C.sub} className="absolute left-3 top-3.5" /><input required value={form.name} onChange={updateField("name")} placeholder="Full name" className="w-full rounded-xl border py-3 pl-10 pr-3 text-sm outline-none" style={{ borderColor: C.border }} /></label>}
            <label className="relative"><Mail size={16} color={C.sub} className="absolute left-3 top-3.5" /><input required type="email" value={form.email} onChange={updateField("email")} placeholder="Email / user ID" className="w-full rounded-xl border py-3 pl-10 pr-3 text-sm outline-none" style={{ borderColor: C.border }} /></label>
            <label className="relative"><Lock size={16} color={C.sub} className="absolute left-3 top-3.5" /><input required type="password" value={form.password} onChange={updateField("password")} placeholder="Password" className="w-full rounded-xl border py-3 pl-10 pr-3 text-sm outline-none" style={{ borderColor: C.border }} /></label>
            {error && <div className="rounded-lg px-3 py-2 text-xs" style={{ color: C.red, background: C.red + "12" }}>{error}</div>}
            <ui.Btn type="submit" disabled={loading} className="w-full mt-2">{loading ? "Checking..." : mode === "login" ? "Sign in securely" : "Create account"}</ui.Btn>
          </form>
          <div className="text-[11px] text-center mt-5" style={{ color: C.sub }}>{mode === "login" ? "Admin, field worker, and officer access is issued by administration." : "Staff accounts cannot be created from this page."}</div>
        </ui.Card>
      </div>
    </div>
  );
}
