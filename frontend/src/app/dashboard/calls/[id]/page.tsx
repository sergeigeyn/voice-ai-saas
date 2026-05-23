"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { Mic, ArrowLeft, Loader2, Phone, User as UserIcon, FileText } from "lucide-react";
import { pb } from "@/lib/pb";

type Call = {
  id: string;
  phone: string;
  lead_name?: string;
  direction: string;
  status: string;
  duration?: number;
  started_at?: string;
  ended_at?: string;
  scenario_name?: string;
  transcript?: string;
  recording_url?: string;
  room_name?: string;
};

type Turn = { role: "user" | "assistant"; text: string; ts?: string };

function statusLabel(s: string): string {
  return ({ initiated: "набор", ringing: "звонит", answered: "идёт", ended: "завершён", failed: "не отвечает" } as Record<string, string>)[s] ?? s;
}

function statusBadge(s: string): string {
  return ({
    initiated: "bg-blue-500/15 text-blue-300 border border-blue-500/20",
    ringing: "bg-blue-500/15 text-blue-300 border border-blue-500/20",
    answered: "bg-violet-500/15 text-violet-300 border border-violet-500/20",
    ended: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20",
    failed: "bg-white/5 text-white/40 border border-white/10",
  } as Record<string, string>)[s] ?? "bg-white/5 text-white/40 border border-white/10";
}

function formatDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso.replace(" ", "T"));
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString("ru-RU", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function formatDuration(sec?: number): string {
  if (!sec) return "—";
  if (sec < 60) return `${sec}с`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}м ${s}с`;
}

export default function CallDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [call, setCall] = useState<Call | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!pb.authStore.isValid) {
      router.replace("/login");
      return;
    }
    (async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
        const res = await fetch(`${API_URL}/api/calls/${id}`, {
          headers: { Authorization: `Bearer ${pb.authStore.token}` },
        });
        if (!res.ok) {
          throw new Error(res.status === 404 ? "Звонок не найден" : `HTTP ${res.status}`);
        }
        const data = await res.json();
        setCall(data);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Не удалось загрузить");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, router]);

  const turns: Turn[] = (() => {
    if (!call?.transcript) return [];
    try {
      const parsed = JSON.parse(call.transcript);
      if (Array.isArray(parsed)) return parsed as Turn[];
    } catch {}
    return [];
  })();

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#050816]">
        <Loader2 className="size-6 animate-spin text-white/40" />
      </main>
    );
  }

  if (!call) {
    return (
      <main className="min-h-screen bg-[#050816] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <h1 className="font-display text-2xl font-semibold mb-3">Звонок не найден</h1>
          <p className="text-[14px] text-white/50 mb-6">{error ?? "Возможно, он был удалён или у тебя нет доступа."}</p>
          <Link href="/dashboard" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white text-slate-900 font-medium text-[13px] hover:bg-white/95 transition">
            <ArrowLeft className="size-4" /> К кабинету
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050816] relative">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-20" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[600px] bg-radial-glow" />

      <header className="relative border-b border-white/5">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
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

      <div className="relative max-w-4xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <Phone className="size-5 text-white/70" />
            <h1 className="font-display text-3xl font-semibold tracking-tight font-mono">{call.phone}</h1>
            <span className={`text-[11px] uppercase tracking-wider px-2 py-0.5 rounded ${statusBadge(call.status)}`}>
              {statusLabel(call.status)}
            </span>
          </div>
          <p className="text-white/50 mb-8">
            {call.direction === "outbound" ? "Исходящий" : "Входящий"}
            {call.lead_name ? ` · ${call.lead_name}` : ""}
            {call.scenario_name ? ` · сценарий «${call.scenario_name}»` : ""}
          </p>

          <div className="grid md:grid-cols-3 gap-3 mb-8">
            <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4">
              <div className="text-[11px] uppercase tracking-wider text-white/40 mb-1">Длительность</div>
              <div className="text-[18px] font-mono">{formatDuration(call.duration)}</div>
            </div>
            <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4">
              <div className="text-[11px] uppercase tracking-wider text-white/40 mb-1">Начало</div>
              <div className="text-[13px]">{formatDate(call.started_at)}</div>
            </div>
            <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4">
              <div className="text-[11px] uppercase tracking-wider text-white/40 mb-1">Конец</div>
              <div className="text-[13px]">{formatDate(call.ended_at)}</div>
            </div>
          </div>

          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-6 backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-5">
              <FileText className="size-4 text-cyan-400" />
              <h2 className="font-display text-lg font-semibold">Транскрипт</h2>
              {turns.length > 0 && <span className="text-[12px] text-white/40">— {turns.length} реплик</span>}
            </div>

            {turns.length === 0 ? (
              <div className="text-center py-10 text-[13px] text-white/40">
                {call.status === "failed" ? "Разговор не состоялся." : "Транскрипт пока пуст."}
              </div>
            ) : (
              <div className="space-y-3">
                {turns.map((t, i) => (
                  <div key={i} className={`flex gap-3 ${t.role === "user" ? "" : "flex-row-reverse"}`}>
                    <div className={`shrink-0 size-7 rounded-full flex items-center justify-center text-[11px] ${
                      t.role === "user"
                        ? "bg-white/10 text-white/70"
                        : "bg-violet-500/20 text-violet-200"
                    }`}>
                      {t.role === "user" ? <UserIcon className="size-3.5" /> : "A"}
                    </div>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed ${
                      t.role === "user"
                        ? "bg-white/[0.04] border border-white/10"
                        : "bg-violet-500/10 border border-violet-500/20"
                    }`}>
                      {t.text}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {call.recording_url && (
            <div className="mt-6 rounded-2xl bg-white/[0.03] border border-white/10 p-6 backdrop-blur-xl">
              <h2 className="font-display text-lg font-semibold mb-3">Запись</h2>
              <audio controls src={call.recording_url} className="w-full" />
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}
