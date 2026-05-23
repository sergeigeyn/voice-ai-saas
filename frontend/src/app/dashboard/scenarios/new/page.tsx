"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { Mic, ArrowLeft, Loader2, Save } from "lucide-react";
import { pb } from "@/lib/pb";

export default function ScenarioNewPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [greeting, setGreeting] = useState("");
  const [prompt, setPrompt] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!pb.authStore.isValid) {
      router.replace("/login");
      return;
    }
    setReady(true);
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const userId = (pb.authStore.model as { id?: string } | null)?.id;
      if (!userId) throw new Error("Не залогинен");
      const rec = await pb.collection("scenarios").create({
        user: userId,
        name: name.trim(),
        description: description.trim(),
        greeting: greeting.trim(),
        prompt: prompt.trim(),
      });
      router.push(`/dashboard/scenarios/${rec.id}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ошибка сохранения");
      setSaving(false);
    }
  }

  if (!ready) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#050816]">
        <Loader2 className="size-6 animate-spin text-white/40" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050816] relative">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-20" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[600px] bg-radial-glow" />

      <header className="relative border-b border-white/5">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard/scenarios" className="flex items-center gap-2 text-[13px] text-white/60 hover:text-white transition">
            <ArrowLeft className="size-4" /> К сценариям
          </Link>
          <Link href="/" className="flex items-center gap-2.5 w-fit">
            <div className="relative size-8 rounded-lg bg-gradient-to-br from-violet-500 via-blue-500 to-cyan-400 shadow-lg shadow-violet-500/30">
              <div className="absolute inset-0.5 rounded-[0.4rem] bg-[#050816] flex items-center justify-center">
                <Mic className="size-4 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <span className="font-display font-semibold text-[15px] tracking-tight">VoiceAI</span>
          </Link>
        </div>
      </header>

      <div className="relative max-w-3xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight mb-2">Новый сценарий</h1>
          <p className="text-white/50 mb-8">Опиши задачу — агент будет говорить по нему.</p>

          <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl bg-white/[0.03] border border-white/10 p-6 backdrop-blur-xl">
            <div>
              <label className="block text-[12px] uppercase tracking-wider text-white/40 mb-1.5">Название</label>
              <input
                required
                maxLength={120}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.04] border border-white/10 outline-none focus:border-violet-400/50 transition"
                placeholder="Например: Квалификация по входящей заявке"
              />
            </div>

            <div>
              <label className="block text-[12px] uppercase tracking-wider text-white/40 mb-1.5">Короткое описание</label>
              <input
                maxLength={200}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.04] border border-white/10 outline-none focus:border-violet-400/50 transition"
                placeholder="Зачем этот сценарий"
              />
            </div>

            <div>
              <label className="block text-[12px] uppercase tracking-wider text-white/40 mb-1.5">Приветствие</label>
              <input
                maxLength={300}
                value={greeting}
                onChange={(e) => setGreeting(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.04] border border-white/10 outline-none focus:border-violet-400/50 transition"
                placeholder="Первая фраза. Можно использовать {lead_name}"
              />
              <p className="text-[11px] text-white/35 mt-1">Подсказка: можешь вставить <code className="text-white/70">{`{lead_name}`}</code> — туда подставится имя клиента.</p>
            </div>

            <div>
              <label className="block text-[12px] uppercase tracking-wider text-white/40 mb-1.5">Инструкция для агента</label>
              <textarea
                required
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={10}
                className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.04] border border-white/10 outline-none focus:border-violet-400/50 transition font-mono text-[13px] leading-relaxed"
                placeholder="Что должен делать агент. Опиши задачу, варианты ответов, как реагировать на разные ситуации."
              />
              <p className="text-[11px] text-white/35 mt-1">Стиль речи (короткие фразы, разговорно, цифры прописью) применяется автоматически — здесь только задача.</p>
            </div>

            {error && (
              <div className="text-[13px] text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving || !name.trim() || !prompt.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-slate-900 font-medium text-[14px] hover:bg-white/95 transition disabled:opacity-50"
              >
                {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                Сохранить
              </button>
              <Link
                href="/dashboard/scenarios"
                className="px-5 py-2.5 rounded-lg border border-white/15 text-[14px] text-white/70 hover:text-white hover:border-white/30 transition"
              >
                Отмена
              </Link>
            </div>
          </form>
        </motion.div>
      </div>
    </main>
  );
}
