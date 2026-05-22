export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <header className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500" />
            <span className="font-semibold text-lg">VoiceAI</span>
          </div>
          <nav className="hidden md:flex gap-8 text-sm text-white/70">
            <a href="#features" className="hover:text-white">Возможности</a>
            <a href="#how" className="hover:text-white">Как работает</a>
            <a href="#pricing" className="hover:text-white">Тарифы</a>
          </nav>
          <div className="flex gap-3">
            <a href="/login" className="text-sm text-white/80 hover:text-white">Войти</a>
            <a href="/signup" className="text-sm px-4 py-2 rounded-lg bg-white text-slate-900 font-medium hover:bg-white/90">
              Попробовать
            </a>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6">
          <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
          Голос как у живого человека
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
          AI-агент<br />
          <span className="bg-gradient-to-r from-violet-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">
            звонит за вас
          </span>
        </h1>
        <p className="text-lg text-white/70 max-w-2xl mx-auto mb-10">
          Принимает входящие, обзванивает лидов, квалифицирует, договаривается о встречах.
          Нативный русский голос, понимает прерывания, ведёт реальный диалог.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href="/signup" className="px-6 py-3 rounded-lg bg-white text-slate-900 font-medium hover:bg-white/90">
            Попробовать бесплатно
          </a>
          <a href="#how" className="px-6 py-3 rounded-lg border border-white/20 hover:bg-white/5">
            Как это работает
          </a>
        </div>
      </section>

      <section id="features" className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: "Реальный диалог", desc: "Учитывает прерывания, ведёт сценарий, помнит контекст разговора." },
            { title: "Живой голос", desc: "Нативный русский, естественная интонация, без роботизации." },
            { title: "Низкая задержка", desc: "Streaming TTS, время ответа ~1 секунда — как живой собеседник." },
            { title: "Российские номера", desc: "Подключаем городские и мобильные номера через Плюсофон." },
            { title: "Запись и транскрипты", desc: "Все разговоры сохраняются, можно прослушать и прочитать." },
            { title: "Интеграции", desc: "Webhook'и в amoCRM, Bitrix24 — лиды автоматически попадают в CRM." },
          ].map((f) => (
            <div key={f.title} className="p-6 rounded-xl bg-white/5 border border-white/10">
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-white/60">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how" className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Как это работает</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { n: "1", t: "Регистрируешься", d: "Email + пароль, 30 секунд" },
            { n: "2", t: "Настраиваешь сценарий", d: "Описываешь что должен говорить агент" },
            { n: "3", t: "Загружаешь номера", d: "CSV с контактами или подключаешь CRM" },
            { n: "4", t: "Запускаешь обзвон", d: "Агент звонит, слушаешь записи, читаешь транскрипты" },
          ].map((s) => (
            <div key={s.n} className="text-center">
              <div className="size-12 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center mx-auto mb-4 font-bold">
                {s.n}
              </div>
              <h3 className="font-semibold mb-2">{s.t}</h3>
              <p className="text-sm text-white/60">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="max-w-6xl mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Тарифы</h2>
        <p className="text-white/60 mb-10">Платишь только за минуты разговора.<br/>Подробные планы скоро.</p>
        <div className="inline-flex flex-col items-center p-8 rounded-xl bg-white/5 border border-white/10">
          <div className="text-sm text-white/60 mb-2">Бета</div>
          <div className="text-4xl font-bold mb-2">Бесплатно</div>
          <div className="text-sm text-white/60 mb-6">10 минут на пробу</div>
          <a href="/signup" className="px-6 py-2.5 rounded-lg bg-white text-slate-900 font-medium hover:bg-white/90">
            Получить доступ
          </a>
        </div>
      </section>

      <footer className="border-t border-white/10 mt-20">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-sm text-white/40">
          © 2026 VoiceAI
        </div>
      </footer>
    </main>
  );
}
