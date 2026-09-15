"use client";

import { useState } from "react";
import { registerAction } from "@/app/actions/auth";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export function RegisterClient({ bgUrl }: { bgUrl?: string }) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleInitialSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    
    if (password !== confirmPassword) {
      setError("Password dan Konfirmasi Password tidak cocok.");
      setLoading(false);
      return;
    }

    try {
      const timeoutPromise = new Promise<{error: string}>((resolve) =>
        setTimeout(() => resolve({ error: "Pendaftaran timeout. Silakan coba lagi." }), 15000)
      );

      const res = await Promise.race([registerAction(formData), timeoutPromise]);
      
      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else {
        window.location.href = `/register/success?name=${encodeURIComponent(formData.get("name") as string)}&email=${encodeURIComponent(formData.get("email") as string)}&whatsapp=${encodeURIComponent(formData.get("whatsapp") as string)}`;
      }
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan. Silakan coba lagi.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 overflow-hidden py-12" style={{backgroundImage:"url('/auth-bg.jpg')",backgroundSize:"cover",backgroundPosition:"center top",backgroundRepeat:"no-repeat"}}>
      
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/30 z-0" />

      {/* Glassmorphic Card Container */}
      <div className="relative z-10 w-full max-w-[420px] sm:max-w-[480px] rounded-[32px] p-7 sm:p-10 flex flex-col my-6" style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.35)",boxShadow:"0 8px 32px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.4)"}}>
        
        {/* Header Logo */}
        <div className="flex flex-col items-center mb-6 mt-2">
          <h1 className="font-extrabold text-white text-2xl sm:text-3xl tracking-widest uppercase text-center drop-shadow-lg">
            BREAKOUT<br/>
            <span className="text-white/80 text-lg sm:text-xl mt-1 block tracking-[0.3em]">MUSIC RECORD</span>
          </h1>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-5 p-3 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-medium text-center">
            {error}
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleInitialSubmit} className="flex flex-col gap-4">
          
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/80 ml-1">Full Name (sesuai KTP)</label>
            <input 
              name="name" 
              type="text" 
              required
              className="w-full bg-white/10 border border-white/30 rounded-2xl px-4 py-3.5 text-white placeholder-gray-500 text-sm outline-none focus:border-[#C77DFF] focus:ring-2 focus:ring-[#C77DFF]/30 transition-all" 
              placeholder="John Doe"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/80 ml-1">Email address</label>
            <input 
              name="email" 
              type="email" 
              required
              className="w-full bg-white/10 border border-white/30 rounded-2xl px-4 py-3.5 text-white placeholder-gray-500 text-sm outline-none focus:border-[#C77DFF] focus:ring-2 focus:ring-[#C77DFF]/30 transition-all" 
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/80 ml-1">Nomor WhatsApp</label>
            <input 
              name="whatsapp" 
              type="tel" 
              required
              className="w-full bg-white/10 border border-white/30 rounded-2xl px-4 py-3.5 text-white placeholder-gray-500 text-sm outline-none focus:border-[#C77DFF] focus:ring-2 focus:ring-[#C77DFF]/30 transition-all" 
              placeholder="081234567890"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/80 ml-1">Link YouTube Artis</label>
            <input 
              name="youtubeUrl" 
              type="url" 
              required
              className="w-full bg-white/10 border border-white/30 rounded-2xl px-4 py-3.5 text-white placeholder-gray-500 text-sm outline-none focus:border-[#C77DFF] focus:ring-2 focus:ring-[#C77DFF]/30 transition-all" 
              placeholder="https://youtube.com/@artist"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/80 ml-1">Alamat Lengkap (Sesuai KTP)</label>
            <textarea 
              name="address" 
              required
              rows={2}
              className="w-full bg-white/10 border border-white/30 rounded-2xl px-4 py-3 text-white placeholder-gray-500 text-sm outline-none focus:border-[#C77DFF] focus:ring-2 focus:ring-[#C77DFF]/30 transition-all resize-none" 
              placeholder="Jl. Contoh No. 123..."
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/80 ml-1">Password</label>
            <input 
              name="password" 
              type="password" 
              required
              minLength={8}
              className="w-full bg-white/10 border border-white/30 rounded-2xl px-4 py-3.5 text-white placeholder-gray-500 text-sm outline-none focus:border-[#C77DFF] focus:ring-2 focus:ring-[#C77DFF]/30 transition-all" 
              placeholder="Minimal 8 karakter"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/80 ml-1">Konfirmasi Password</label>
            <input 
              name="confirmPassword" 
              type="password" 
              required
              minLength={8}
              className="w-full bg-white/10 border border-white/30 rounded-2xl px-4 py-3.5 text-white placeholder-gray-500 text-sm outline-none focus:border-[#C77DFF] focus:ring-2 focus:ring-[#C77DFF]/30 transition-all" 
              placeholder="Ulangi password"
            />
          </div>

          <div className="flex items-start gap-3 mt-1">
            <input 
              id="consent" 
              name="consent" 
              type="checkbox" 
              required 
              className="w-4 h-4 mt-0.5 rounded border-gray-600 text-[#9D4EDD] bg-white/5 focus:ring-[#9D4EDD]" 
            />
            <label htmlFor="consent" className="text-xs text-white/80 leading-tight cursor-pointer">
              Saya menyatakan bahwa seluruh data yang saya kirim adalah benar dan sesuai identitas asli saya.
            </label>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="mt-3 w-full bg-gradient-to-b from-[#A370F7] via-[#8B44F7] to-[#7322EA] hover:from-[#B184F9] hover:to-[#7E33ED] text-white font-bold text-base py-3.5 rounded-2xl shadow-[0_10px_30px_rgba(139,68,247,0.45),inset_0_1px_1px_rgba(255,255,255,0.4)] border border-white/25 transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign Up"}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-8 text-center text-xs text-white/70">
          Already Have an Account ?{" "}
          <Link href="/login" className="font-extrabold text-white hover:text-[#C77DFF] transition ml-1">
            Log In
          </Link>
        </div>

      </div>

    </main>
  );
}
