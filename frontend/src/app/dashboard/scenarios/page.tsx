"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { Mic, Plus, ArrowLeft, FileText, Sparkles, Loader2 } from "lucide-react";
import { pb } from "@/lib/pb";

type Scenario = {
  id: string;
  name: string;
  description?: string;
  is_template?: boolean;
};

export default function ScenariosListPage() {
  const router = useRouter();
  const [items, setItems] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!pb.authStore.isValid) {
      router.replace("/login");
      return;
    }
    (async () => {
      try {
        const list = await pb.collection("scenarios").getFullList<Scenario>({
          sort: "-is_template,name",
          fields: "id,name,description,is_template",
        });
        setItems(list);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Не удалось загрузить сценарии");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const templates = items.filter((s) => s.is_template);
  const mine = items.filter((s) => !s.is_template);

  return (
    <main className="min-h-screen bg-[#050816] relative">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-20" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[600px] bg-radial-glow" />

      <header className="relative border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-[13px] text-white/60 hover:text-white transition">
            <ArrowLeft className="size-4" /> К кабинету
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

      <div className="relative max-w-6xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight mb-2">Сценарии</h1>
              <p className="text-white/50">Готовые шаблоны и твои собственные.</p>
            </div>
            <Link
              href="/dashboard/scenarios/new"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white text-slate-900 font-medium text-[14px] hover:bg-white/95 transition"
            >
              <Plus className="size-4" /> Создать
            </Link>
          </div>

          {loading && (
            <div className="text-center py-20">
              <Loader2 className="size-6 animate-spin text-white/40 mx-auto" />
            </div>
          )}

          {error && (
            <div className="text-[13px] text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          {!loading && !error && (
            <>
              {templates.length > 0 && (
                <section className="mb-10">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="size-4 text-violet-400" />
                    <h2 className="font-display text-lg font-semibold">Шаблоны</h2>
                    <span className="text-[12px] text-white/40">— готовые, нельзя редактировать</span>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {templates.map((s) => (
                      <div
                        key={s.id}
                        className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 backdrop-blur-xl"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-display font-semibold text-[15px]">{s.name}</h3>
                          <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-violet-500/15 text-violet-300 border border-violet-500/20">
                            шаблон
                          </span>
                        </div>
                        {s.description && (
                          <p className="text-[13px] text-white/55 line-clamp-3">{s.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="size-4 text-cyan-400" />
                  <h2 className="font-display text-lg font-semibold">Мои сценарии</h2>
                </div>
                {mine.length === 0 ? (
                  <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-10 text-center">
                    <p className="text-[14px] text-white/50 mb-4">У тебя пока нет своих сценариев.</p>
                    <Link
                      href="/dashboard/scenarios/new"
                      className="inline-flex items-center gap-2 text-[13px] text-white/80 hover:text-white"
                    >
                      <Plus className="size-4" /> Создать первый
                    </Link>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mine.map((s) => (
                      <Link
                        key={s.id}
                        href={`/dashboard/scenarios/${s.id}`}
                        className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 backdrop-blur-xl hover:border-white/25 transition"
                      >
                        <h3 className="font-display font-semibold text-[15px] mb-2">{s.name}</h3>
                        {s.description && (
                          <p className="text-[13px] text-white/55 line-clamp-3">{s.description}</p>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </motion.div>
      </div>
    </main>
  );
}
