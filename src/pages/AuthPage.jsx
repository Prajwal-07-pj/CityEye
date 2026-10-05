/* eslint-disable no-unused-vars */
import { useState } from "react";
import { ArrowRight, Code2, Eye, EyeOff, Lock, Mail, UserRound } from "lucide-react";

export default function AuthPage({ C, ui, onAuth }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ email: "", password: "", name: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (mode === "signup" && form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
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
  const switchMode = (nextMode) => { setMode(nextMode); setError(""); };

  return (
    <main className="auth-page">
      <div className="auth-panel">
        <div className="auth-brand"><ui.Logo size={40} /></div>
        <h1>{mode === "login" ? "Welcome back" : "Create your account"}</h1>
        <p className="auth-subtitle">{mode === "login" ? "Sign in to continue and help make your city better." : "Join CityEye and be a part of a cleaner, safer city."}</p>

        <form onSubmit={submit} className="auth-form">
          {mode === "signup" && <label className="auth-field"><UserRound size={17} /><input required value={form.name} onChange={updateField("name")} placeholder="Full Name" autoComplete="name" /></label>}
          <label className="auth-field"><Mail size={17} /><input required type="email" value={form.email} onChange={updateField("email")} placeholder="Email address" autoComplete="email" /></label>
          <label className="auth-field"><Lock size={17} /><input required type={showPassword ? "text" : "password"} value={form.password} onChange={updateField("password")} placeholder="Password" autoComplete={mode === "login" ? "current-password" : "new-password"} /><button type="button" className="auth-field-action" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></label>
          {mode === "signup" && <label className="auth-field"><Lock size={17} /><input required type={showConfirmPassword ? "text" : "password"} value={form.confirmPassword} onChange={updateField("confirmPassword")} placeholder="Confirm Password" autoComplete="new-password" /><button type="button" className="auth-field-action" onClick={() => setShowConfirmPassword((value) => !value)} aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}>{showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></label>}

          {mode === "login" ? <div className="auth-options"><label><input type="checkbox" /> <span>Remember me</span></label><button type="button">Forgot password?</button></div> : <label className="auth-terms"><input required type="checkbox" /><span>I agree to the <button type="button">Terms of Service</button> and <button type="button">Privacy Policy</button></span></label>}
          {error && <div className="auth-error">{error}</div>}
          <button type="submit" className="auth-submit" disabled={loading}>{loading ? "Checking..." : mode === "login" ? "Sign In" : "Create Account"}<ArrowRight size={18} /></button>
        </form>

        <div className="auth-divider"><span />OR<span /></div>
        <div className="auth-socials"><button type="button"><strong className="auth-google">G</strong>Continue with Google</button><button type="button"><Code2 size={19} />Continue with GitHub</button></div>
        <p className="auth-switch">{mode === "login" ? "Don't have an account?" : "Already have an account?"} <button type="button" onClick={() => switchMode(mode === "login" ? "signup" : "login")}>{mode === "login" ? "Sign up" : "Sign in"}</button></p>
      </div>
    </main>
  );
}
