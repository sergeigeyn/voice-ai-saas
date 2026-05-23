"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { Mic, Phone, LogOut, Loader2, CheckCircle2, AlertCircle, ListTree } from "lucide-react";
import { pb } from "@/lib/pb";

type CallStatus = "idle" | "dialing" | "success" | "error";

export default function DashboardPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string>("");
  const [ready, setReady] = useState(false);

  const [phone, setPhone] = useState("");
  const [leadName, setLeadName] = useState("");
  const [scenarioId, setScenarioId] = useState<string>("");
  const [scenarios, setScenarios] = useState<{ id: string; name: string; is_template?: boolean }[]>([]);
  const [status, setStatus] = useState<CallStatus>("idle");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (!pb.authStore.isValid) {
      router.replace("/login");
      return;
    }
    const model = pb.authStore.record as { email?: string } | null;
    setUserEmail(model?.email ?? "user");
    setReady(true);
    (async () => {
      try {
        const list = await pb.collection("scenarios").getFullList<{ id: string; name: string; is_template?: boolean }>({
          sort: "-is_template,name",
          fields: "id,name,is_template",
        });
        setScenarios(list);
      } catch {
        // тихо — селектор просто не покажет варианты
      }
    })();
  }, [router]);

  function handleLogout() {
    pb.authStore.clear();
    router.replace("/login");
  }

  async function handleCall(e: React.FormEvent) {
    e.preventDefault();
    setStatus("dialing");
    setMessage("");

    const normalized = phone.replace(/[^\d+]/g, "");
    if (!normalized.startsWith("+") || normalized.length < 10) {
      setStatus("error");
      setMessage("Номер должен быть в формате +7XXXXXXXXXX");
      return;
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
      const res = await fetch(`${API_URL}/api/calls/initiate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${pb.authStore.token}`,
        },
        body: JSON.stringify({ phone: normalized, lead_name: leadName || null, scenario_id: scenarioId || null }),
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setStatus("success");
      setMessage("Звонок запущен. Ожидайте — мы перезвоним через несколько секунд.");
    } catch (err: unknown) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Не удалось инициировать звонок");
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
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 w-fit">
            <div className="relative size-8 rounded-lg bg-gradient-to-br from-violet-500 via-blue-500 to-cyan-400 shadow-lg shadow-violet-500/30">
              <div className="absolute inset-0.5 rounded-[0.4rem] bg-[#050816] flex items-center justify-center">
                <Mic className="size-4 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <span className="font-display font-semibold text-[15px] tracking-tight">VoiceAI</span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-[13px] text-white/50">{userEmail}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-[13px] text-white/60 hover:text-white transition"
            >
              <LogOut className="size-4" /> Выйти
            </button>
          </div>
        </div>
      </header>

      <div className="relative max-w-6xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight mb-2">
            Тестовый звонок
          </h1>
          <p className="text-white/50 mb-10">
            Введи номер — агент перезвонит и проведёт демо-диалог.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <form
              onSubmit={handleCall}
              className="rounded-2xl bg-white/[0.03] border border-white/10 p-6 backdrop-blur-xl space-y-4"
            >
              <div>
                <label className="block text-[12px] uppercase tracking-wider text-white/40 mb-1.5">
                  Номер телефона
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-white placeholder-white/30 outline-none focus:border-violet-400/50 transition font-mono"
                  placeholder="+79991234567"
                />
              </div>
              <div>
                <label className="block text-[12px] uppercase tracking-wider text-white/40 mb-1.5">
                  Имя клиента (опционально)
                </label>
                <input
                  type="text"
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-white placeholder-white/30 outline-none focus:border-violet-400/50 transition"
                  placeholder="Иван"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[12px] uppercase tracking-wider text-white/40">
                    Сценарий (опционально)
                  </label>
                  <Link href="/dashboard/scenarios" className="text-[11px] text-white/50 hover:text-white inline-flex items-center gap-1">
                    <ListTree className="size-3" /> Управление
                  </Link>
                </div>
                <select
                  value={scenarioId}
                  onChange={(e) => setScenarioId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-white outline-none focus:border-violet-400/50 transition"
                >
                  <option value="" className="bg-[#0a0e1f]">Без сценария — общий менеджер</option>
                  {scenarios.length > 0 && (
                    <optgroup label="Шаблоны" className="bg-[#0a0e1f]">
                      {scenarios.filter((s) => s.is_template).map((s) => (
                        <option key={s.id} value={s.id} className="bg-[#0a0e1f]">{s.name}</option>
                      ))}
                    </optgroup>
                  )}
                  {scenarios.some((s) => !s.is_template) && (
                    <optgroup label="Мои" className="bg-[#0a0e1f]">
                      {scenarios.filter((s) => !s.is_template).map((s) => (
                        <option key={s.id} value={s.id} className="bg-[#0a0e1f]">{s.name}</option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

              <button
                type="submit"
                disabled={status === "dialing"}
                className="group flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-white text-slate-900 font-medium text-[14px] hover:bg-white/95 transition disabled:opacity-50"
              >
                {status === "dialing" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <>
                    <Phone className="size-4" /> Позвонить
                  </>
                )}
              </button>

              {status === "success" && message && (
                <div className="flex items-start gap-2 text-[13px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
                  <CheckCircle2 className="size-4 mt-0.5 shrink-0" />
                  <span>{message}</span>
                </div>
              )}
              {status === "error" && message && (
                <div className="flex items-start gap-2 text-[13px] text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  <AlertCircle className="size-4 mt-0.5 shrink-0" />
                  <span>{message}</span>
                </div>
              )}
            </form>

            <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-6 backdrop-blur-xl">
              <h2 className="font-display text-lg font-semibold mb-1">Как это работает</h2>
              <p className="text-[13px] text-white/50 mb-5">Четыре шага от заявки до результата.</p>
              <ol className="space-y-3 text-[13px] text-white/70">
                <li className="flex gap-3">
                  <span className="size-5 rounded-full bg-violet-500/20 text-violet-300 flex items-center justify-center text-[11px] shrink-0">1</span>
                  <span>Ты оставляешь заявку с номером.</span>
                </li>
                <li className="flex gap-3">
                  <span className="size-5 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center text-[11px] shrink-0">2</span>
                  <span>Мы инициируем исходящий звонок.</span>
                </li>
                <li className="flex gap-3">
                  <span className="size-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-[11px] shrink-0">3</span>
                  <span>Когда клиент берёт трубку — агент ведёт разговор.</span>
                </li>
                <li className="flex gap-3">
                  <span className="size-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-[11px] shrink-0">4</span>
                  <span>Запись и результат сохраняются в кабинете.</span>
                </li>
              </ol>
            </div>
          </div>

          <div className="mt-10 rounded-2xl bg-white/[0.03] border border-white/10 p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold">История звонков</h2>
              <span className="text-[12px] text-white/40">скоро</span>
            </div>
            <div className="text-center py-10 text-[13px] text-white/40">
              Здесь появится список звонков, транскрипты и аналитика.
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
