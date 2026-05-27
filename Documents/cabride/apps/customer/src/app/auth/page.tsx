"use client";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";
import Logo from "@/components/layout/Logo";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

type Tab = "login" | "register";

export default function AuthPage() {
  const [tab,     setTab]     = useState<Tab>("login");
  const [loading, setLoading] = useState(false);
  const { login, register }   = useAuth();
  const { showToast }         = useToast();

  const [form, setForm] = useState({ name:"", email:"", password:"", phone:"" });
  const set = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (tab === "login") {
        await login(form.email, form.password);
        showToast("Welcome back!", "success");
      } else {
        await register({ name: form.name, email: form.email, password: form.password, phone: form.phone });
        showToast("Account created successfully!", "success");
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Something went wrong", "error");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col">
      <div className="flex items-center justify-center p-5 border-b border-[#1e1e1e]">
        <Logo />
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-white mb-1">
              {tab === "login" ? "Welcome back" : "Create account"}
            </h1>
            <p className="text-sm text-gray-500">
              {tab === "login" ? "Sign in to book your ride" : "Start booking rides today"}
            </p>
          </div>

          <div className="flex bg-[#1a1a1a] border border-[#252525] rounded-xl p-1 mb-6">
            {(["login","register"] as Tab[]).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all
                  ${tab===t ? "bg-yellow-400 text-black" : "text-gray-500 hover:text-white"}`}>
                {t === "login" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-4">
            {tab === "register" && (
              <>
                <Input name="name"  value={form.name}  onChange={set} label="Full Name"    placeholder="John Doe"          required />
                <Input name="phone" value={form.phone} onChange={set} label="Phone Number" placeholder="+91 98765 43210"   type="tel" />
              </>
            )}
            <Input name="email"    value={form.email}    onChange={set} label="Email"    placeholder="you@email.com"     type="email"    required />
            <Input name="password" value={form.password} onChange={set} label="Password" placeholder="Min 6 characters"  type="password" required />

            <Button type="submit" full size="lg" loading={loading} className="mt-2">
              {tab === "login" ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            {tab === "login" ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => setTab(tab === "login" ? "register" : "login")}
              className="text-yellow-400 hover:text-yellow-300 font-medium transition-colors">
              {tab === "login" ? "Register" : "Sign In"}
            </button>
          </p>
        </div>
      </div>

      <div className="p-5 text-center border-t border-[#1e1e1e]">
        <p className="text-xs text-gray-600">© 2026 4jtravel. Safe rides, every time.</p>
      </div>
    </div>
  );
}
