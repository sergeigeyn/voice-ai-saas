"use client";

import { motion } from "motion/react";
import {
  PhoneCall, PhoneIncoming, Mic, Brain, Languages, Gauge,
  Headphones, Webhook, ArrowRight, Sparkles, Check,
} from "lucide-react";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050816] text-white font-sans">
      {/* background layers */}
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-30" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[800px] bg-radial-glow" />
      <div className="pointer-events-none absolute top-40 left-1/2 -translate-x-1/2 size-[800px] rounded-full bg-violet-600/10 blur-[120px]" />

      <Header />
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
      <Footer />
    </main>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#050816]/70 border-b border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2.5">
          <div className="relative size-8 rounded-lg bg-gradient-to-br from-violet-500 via-blue-500 to-cyan-400 shadow-lg shadow-violet-500/30">
            <div className="absolute inset-0.5 rounded-[0.4rem] bg-[#050816] flex items-center justify-center">
              <Mic className="size-4 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <span className="font-display font-semibold text-[15px] tracking-tight">VoiceAI</span>
        </a>
        <nav className="hidden md:flex gap-1 text-[13px]">
          {[
            ["Возможности", "#features"],
            ["Как работает", "#how"],
            ["Тарифы", "#pricing"],
          ].map(([t, h]) => (
            <a key={h} href={h} className="px-3.5 py-1.5 rounded-md text-white/60 hover:text-white hover:bg-white/[0.04] transition">
              {t}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a href="/login" className="hidden sm:inline-block text-[13px] text-white/70 hover:text-white px-3 py-1.5 transition">
            Войти
          </a>
          <a href="/signup" className="group relative text-[13px] font-medium px-4 py-2 rounded-lg bg-white text-slate-900 hover:bg-white/95 transition shadow-lg shadow-white/10">
            Попробовать
          </a>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative max-w-6xl mx-auto px-6 pt-24 pb-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 text-[11px] font-medium tracking-wide uppercase px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 mb-8"
        >
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
            <span className="relative inline-flex size-1.5 rounded-full bg-emerald-400" />
          </span>
          <Sparkles className="size-3 text-violet-300" />
          <span className="text-white/70">Голос как у живого человека</span>
        </motion.div>

        <h1 className="font-display text-5xl md:text-7xl lg:text-[88px] font-semibold tracking-[-0.02em] leading-[0.95] mb-6">
          <span className="text-white">AI-агент</span>
          <br />
          <span className="bg-gradient-to-r from-violet-400 via-blue-300 to-cyan-300 bg-clip-text text-transparent">
            звонит за вас
          </span>
        </h1>
        <p className="text-[17px] md:text-lg text-white/60 max-w-xl mx-auto mb-10 leading-relaxed">
          Принимает входящие, обзванивает лидов, квалифицирует, договаривается о встречах.
          Нативный русский голос, понимает прерывания, ведёт реальный диалог.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <a
            href="/signup"
            className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-slate-900 font-medium text-[14px] hover:bg-white/95 transition shadow-2xl shadow-violet-500/20"
          >
            Попробовать бесплатно
            <ArrowRight className="size-4 group-hover:translate-x-0.5 transition" />
          </a>
          <a
            href="#how"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-white/15 text-white/80 hover:bg-white/[0.04] hover:text-white transition text-[14px]"
          >
            Как это работает
          </a>
        </div>

        <div className="mt-16 flex items-center justify-center gap-8 opacity-50 text-[11px] tracking-wide uppercase text-white/40">
          <span>Plusofon</span>
          <span className="size-1 rounded-full bg-white/20" />
          <span>LiveKit</span>
          <span className="size-1 rounded-full bg-white/20" />
          <span>ElevenLabs</span>
          <span className="size-1 rounded-full bg-white/20" />
          <span>Groq</span>
        </div>
      </motion.div>
    </section>
  );
}

const features = [
  { icon: PhoneCall, title: "Реальный диалог", desc: "Учитывает прерывания, ведёт сценарий, помнит контекст." },
  { icon: Mic, title: "Живой голос", desc: "Нативный русский, естественная интонация, без роботизации." },
  { icon: Gauge, title: "Низкая задержка", desc: "~1 сек на ответ — как живой собеседник." },
  { icon: PhoneIncoming, title: "Российские номера", desc: "Городские и мобильные через Плюсофон." },
  { icon: Headphones, title: "Запись и транскрипты", desc: "Все разговоры сохраняются, поиск по тексту." },
  { icon: Webhook, title: "Интеграции", desc: "amoCRM, Bitrix24, webhooks для своих CRM." },
];

function Features() {
  return (
    <section id="features" className="relative max-w-6xl mx-auto px-6 py-24">
      <div className="text-center mb-16">
        <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight mb-4">
          Что умеет агент
        </h2>
        <p className="text-white/50 text-[15px]">Шесть фич, которые отличают живой разговор от робота</p>
      </div>
      <div className="grid md:grid-cols-3 gap-px bg-white/[0.06] rounded-2xl overflow-hidden border border-white/[0.08]">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="group relative p-7 bg-[#0a0f24] hover:bg-[#0d1330] transition"
          >
            <div className="size-10 rounded-lg bg-gradient-to-br from-violet-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center mb-4">
              <f.icon className="size-5 text-violet-300" strokeWidth={2} />
            </div>
            <h3 className="font-display font-semibold text-[17px] mb-1.5 tracking-tight">{f.title}</h3>
            <p className="text-[13px] text-white/50 leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

const steps = [
  { n: "01", t: "Регистрируешься", d: "Email + пароль, 30 секунд" },
  { n: "02", t: "Настраиваешь сценарий", d: "Описываешь что должен говорить агент" },
  { n: "03", t: "Загружаешь номера", d: "CSV или подключаешь CRM" },
  { n: "04", t: "Запускаешь обзвон", d: "Записи и транскрипты в реальном времени" },
];

function HowItWorks() {
  return (
    <section id="how" className="relative max-w-6xl mx-auto px-6 py-24">
      <div className="text-center mb-16">
        <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight mb-4">Как это работает</h2>
        <p className="text-white/50 text-[15px]">От регистрации до первого звонка — 5 минут</p>
      </div>
      <div className="grid md:grid-cols-4 gap-6 md:gap-2 relative">
        <div className="absolute top-7 left-[12.5%] right-[12.5%] hidden md:block border-t border-dashed border-white/10" />
        {steps.map((s, i) => (
          <motion.div
            key={s.n}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="relative text-center"
          >
            <div className="relative size-14 mx-auto mb-5 bg-[#050816]">
              <div className="size-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 border border-white/15 flex items-center justify-center font-mono text-[13px] font-semibold text-violet-200">
                {s.n}
              </div>
            </div>
            <h3 className="font-display font-semibold text-[16px] mb-1.5">{s.t}</h3>
            <p className="text-[13px] text-white/50 max-w-[200px] mx-auto">{s.d}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="relative max-w-6xl mx-auto px-6 py-24">
      <div className="text-center mb-12">
        <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight mb-4">Тарифы</h2>
        <p className="text-white/50 text-[15px]">Только за минуты разговора. Никаких подписок.</p>
      </div>
      <div className="max-w-md mx-auto">
        <div className="relative p-px rounded-2xl bg-gradient-to-br from-violet-500/40 via-blue-500/30 to-transparent">
          <div className="rounded-2xl bg-[#0a0f24] p-8">
            <div className="flex items-center justify-between mb-6">
              <span className="text-[11px] font-medium tracking-wider uppercase px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-200">
                Бета
              </span>
              <Sparkles className="size-4 text-violet-300" />
            </div>
            <div className="flex items-baseline gap-1.5 mb-1">
              <span className="font-display text-5xl font-semibold">Бесплатно</span>
            </div>
            <p className="text-[13px] text-white/50 mb-7">10 минут на пробу. Без карты.</p>
            <ul className="space-y-3 mb-8">
              {[
                "Входящие и исходящие звонки",
                "1 настраиваемый сценарий",
                "Запись + транскрипты",
                "Российские номера",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-[14px] text-white/80">
                  <Check className="size-4 text-emerald-400 shrink-0" strokeWidth={2.5} />
                  {f}
                </li>
              ))}
            </ul>
            <a
              href="/signup"
              className="group flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-white text-slate-900 font-medium text-[14px] hover:bg-white/95 transition"
            >
              Получить доступ
              <ArrowRight className="size-4 group-hover:translate-x-0.5 transition" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative border-t border-white/[0.06] mt-12">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="size-6 rounded-md bg-gradient-to-br from-violet-500 to-blue-500" />
          <span className="font-display text-[13px] text-white/60">VoiceAI</span>
        </div>
        <p className="text-[12px] text-white/30">© 2026 VoiceAI. Голос для бизнеса.</p>
      </div>
    </footer>
  );
}
