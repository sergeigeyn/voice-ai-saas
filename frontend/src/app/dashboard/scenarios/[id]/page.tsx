"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { Mic, ArrowLeft, Loader2, Save, Trash2, Sparkles } from "lucide-react";
import { pb } from "@/lib/pb";

type Scenario = {
  id: string;
  user?: string;
  name: string;
  description?: string;
  greeting?: string;
  prompt: string;
  is_template?: boolean;
};

export default function ScenarioEditPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [greeting, setGreeting] = useState("");
  const [prompt, setPrompt] = useState("");

  useEffect(() => {
    if (!pb.authStore.isValid) {
      router.replace("/login");
      return;
    }
    (async () => {
      try {
        const rec = await pb.collection("scenarios").getOne<Scenario>(id);
        setScenario(rec);
        setName(rec.name);
        setDescription(rec.description ?? "");
        setGreeting(rec.greeting ?? "");
        setPrompt(rec.prompt);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Не удалось загрузить");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, router]);

  const isTemplate = !!scenario?.is_template;
  const isMine = scenario?.user === (pb.authStore.model as { id?: string } | null)?.id;
  const readOnly = isTemplate || !isMine;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (readOnly) return;
    setError(null);
    setSaving(true);
    try {
      await pb.collection("scenarios").update(id, {
        name: name.trim(),
        description: description.trim(),
        greeting: greeting.trim(),
        prompt: prompt.trim(),
      });
      router.push("/dashboard/scenarios");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ошибка сохранения");
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (readOnly) return;
    if (!confirm(`Удалить сценарий "${name}"?`)) return;
    setDeleting(true);
    try {
      await pb.collection("scenarios").delete(id);
      router.push("/dashboard/scenarios");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ошибка удаления");
      setDeleting(false);
    }
  }

  if (loading) {
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
          <div className="flex items-center gap-3 mb-2">
            <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">{scenario?.name ?? "Сценарий"}</h1>
            {isTemplate && (
              <span className="flex items-center gap-1 text-[11px] uppercase tracking-wider px-2 py-0.5 rounded bg-violet-500/15 text-violet-300 border border-violet-500/20">
                <Sparkles className="size-3" /> Шаблон
              </span>
            )}
          </div>
          <p className="text-white/50 mb-8">
            {readOnly ? "Только просмотр. Шаблоны редактировать нельзя — скопируй и измени." : "Правь как хочешь."}
          </p>

          <form onSubmit={handleSave} className="space-y-5 rounded-2xl bg-white/[0.03] border border-white/10 p-6 backdrop-blur-xl">
            <div>
              <label className="block text-[12px] uppercase tracking-wider text-white/40 mb-1.5">Название</label>
              <input
                disabled={readOnly}
                required
                maxLength={120}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.04] border border-white/10 outline-none focus:border-violet-400/50 transition disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-[12px] uppercase tracking-wider text-white/40 mb-1.5">Короткое описание</label>
              <input
                disabled={readOnly}
                maxLength={200}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.04] border border-white/10 outline-none focus:border-violet-400/50 transition disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-[12px] uppercase tracking-wider text-white/40 mb-1.5">Приветствие</label>
              <input
                disabled={readOnly}
                maxLength={300}
                value={greeting}
                onChange={(e) => setGreeting(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.04] border border-white/10 outline-none focus:border-violet-400/50 transition disabled:opacity-60"
              />
              <p className="text-[11px] text-white/35 mt-1">Можно вставить <code className="text-white/70">{`{lead_name}`}</code>.</p>
            </div>

            <div>
              <label className="block text-[12px] uppercase tracking-wider text-white/40 mb-1.5">Инструкция для агента</label>
              <textarea
                disabled={readOnly}
                required
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={12}
                className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.04] border border-white/10 outline-none focus:border-violet-400/50 transition font-mono text-[13px] leading-relaxed disabled:opacity-60"
              />
              <p className="text-[11px] text-white/35 mt-1">Стиль речи применяется автоматически — здесь только задача.</p>
            </div>

            {error && (
              <div className="text-[13px] text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</div>
            )}

            {!readOnly && (
              <div className="flex items-center justify-between pt-2">
                <div className="flex gap-3">
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
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex items-center gap-1.5 text-[13px] text-red-300/70 hover:text-red-300 transition"
                >
                  {deleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                  Удалить
                </button>
              </div>
            )}
          </form>
        </motion.div>
      </div>
    </main>
  );
}
