"use client";

import { useState } from "react";
import { loginAction } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await loginAction(formData);
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <main
      className="min-h-screen w-full flex items-center justify-center p-4 overflow-hidden"
      style={{
        backgroundImage: "url('/auth-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center top",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Subtle dark overlay so text is readable */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Glass Card - transparent like real glass, no blur */}
      <div className="relative z-10 w-full max-w-[390px] sm:max-w-[430px] rounded-[32px] p-7 sm:p-10 flex flex-col my-8"
        style={{
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.35)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.4)",
        }}
      >
        {/* Header Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-14 h-12 flex items-center justify-center my-1">
            <div className="w-9 h-3.5 bg-gradient-to-r from-[#9D4EDD] to-[#C77DFF] rounded-full transform -rotate-45 shadow-[0_0_18px_rgba(199,125,255,0.7)] -translate-y-1.5 -translate-x-1" />
            <div className="w-9 h-3.5 bg-gradient-to-r from-[#7B2CBF] to-[#9D4EDD] rounded-full transform -rotate-45 shadow-[0_0_18px_rgba(157,78,221,0.7)] translate-y-1.5 translate-x-1" />
          </div>
          <span className="font-extrabold text-white text-base tracking-[0.28em] uppercase mt-2 drop-shadow">BMR</span>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-3 text-center tracking-tight drop-shadow-lg">
            Welcome Back, Breakout
          </h1>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-2xl bg-red-500/20 border border-red-400/40 text-red-100 text-xs font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/90 ml-1">Email address</label>
            <input
              name="email"
              type="email"
              required
              className="w-full rounded-2xl px-4 py-3.5 text-white text-sm outline-none transition-all"
              style={{
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.3)",
              }}
              onFocus={e => { e.target.style.background = "rgba(255,255,255,0.2)"; e.target.style.borderColor = "#C77DFF"; }}
              onBlur={e => { e.target.style.background = "rgba(255,255,255,0.12)"; e.target.style.borderColor = "rgba(255,255,255,0.3)"; }}
              placeholder=""
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/90 ml-1">Password</label>
            <input
              name="password"
              type="password"
              required
              className="w-full rounded-2xl px-4 py-3.5 text-white text-sm outline-none transition-all"
              style={{
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.3)",
              }}
              onFocus={e => { e.target.style.background = "rgba(255,255,255,0.2)"; e.target.style.borderColor = "#C77DFF"; }}
              onBlur={e => { e.target.style.background = "rgba(255,255,255,0.12)"; e.target.style.borderColor = "rgba(255,255,255,0.3)"; }}
              placeholder=""
            />
          </div>

          <div className="flex justify-start">
            <Link
              href="#"
              onClick={(e) => { e.preventDefault(); alert("Silakan hubungi Admin untuk reset password."); }}
              className="text-xs text-white/60 hover:text-white transition ml-1"
            >
              Forget Password ?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full bg-gradient-to-b from-[#A370F7] via-[#8B44F7] to-[#7322EA] hover:from-[#B184F9] hover:to-[#7E33ED] text-white font-bold text-base py-3.5 rounded-2xl shadow-[0_10px_30px_rgba(139,68,247,0.5)] border border-white/20 transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Login"}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-white/80">
          Are You New Member?{" "}
          <Link href="/register" className="font-extrabold text-white hover:text-[#C77DFF] transition ml-1">
            Sign UP
          </Link>
        </div>
      </div>
    </main>
  );
}