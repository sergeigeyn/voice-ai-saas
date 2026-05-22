"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { Mic, ArrowRight, Loader2 } from "lucide-react";
import { pb } from "@/lib/pb";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await pb.collection("users").authWithPassword(email, password);
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Неверный email или пароль";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-[#050816]">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-30" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[600px] bg-radial-glow" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <Link href="/" className="flex items-center gap-2.5 mb-10 w-fit">
          <div className="relative size-8 rounded-lg bg-gradient-to-br from-violet-500 via-blue-500 to-cyan-400 shadow-lg shadow-violet-500/30">
            <div className="absolute inset-0.5 rounded-[0.4rem] bg-[#050816] flex items-center justify-center">
              <Mic className="size-4 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <span className="font-display font-semibold text-[15px] tracking-tight">VoiceAI</span>
        </Link>

        <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-8 backdrop-blur-xl">
          <h1 className="font-display text-3xl font-semibold tracking-tight mb-2">С возвращением</h1>
          <p className="text-sm text-white/50 mb-8">Войди в аккаунт.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[12px] uppercase tracking-wider text-white/40 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-white placeholder-white/30 outline-none focus:border-violet-400/50 transition"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-[12px] uppercase tracking-wider text-white/40 mb-1.5">Пароль</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-white placeholder-white/30 outline-none focus:border-violet-400/50 transition"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="text-[13px] text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-white text-slate-900 font-medium text-[14px] hover:bg-white/95 transition disabled:opacity-50"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : <>Войти <ArrowRight className="size-4 group-hover:translate-x-0.5 transition" /></>}
            </button>
          </form>

          <p className="text-center text-[13px] text-white/40 mt-6">
            Нет аккаунта? <Link href="/signup" className="text-white/80 hover:text-white">Создать</Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
