# voice-ai-saas

SaaS-обёртка над [voice-ai-agent](https://github.com/sergeigeyn/voice-ai-agent).
Клиенты регистрируются, создают сценарии диалога, загружают номера и запускают обзвон —
агент звонит и общается голосом за них.

**Live:** https://voice-ai-agent.vercel.app

## Структура

| Каталог | Что |
|---|---|
| `frontend/` | Next.js 16 + React 19 + Tailwind v4. Лендинг + кабинет. Деплой Vercel. |
| `backend/` | FastAPI (Python). REST API для auth, кампаний, звонков. Хостинг — Beget Moscow. |

## Stack

| Слой | Технология | Где |
|---|---|---|
| Frontend | Next.js 16, Tailwind v4, **shadcn/ui**, **Magic UI**, **motion**, **lucide-react** | Vercel project `voice-agent` (alias `voice-ai-agent.vercel.app`) |
| Backend | FastAPI, Python 3.12 | Beget Moscow (план) |
| Database | PostgreSQL + Supabase Auth + Storage | Supabase (план) |
| Биллинг | ЮKassa | Отложен (физлицу нельзя) |
| Voice Agent | LiveKit + Asterisk + Plusofon + Deepgram + Groq + ElevenLabs | Beget Moscow, работает |

## Дизайн-система

- **Шрифты:** Inter (body, cyrillic), Space Grotesk (display), JetBrains Mono (numbers)
- **Цвета:** dark navy `#050816` + violet→blue→cyan tri-gradient акценты
- **Фон:** subtle dotted grid + radial-glow в hero
- **Компоненты:** shadcn/ui (button, card, badge, separator, input, label) + Magic UI (ShimmerButton, NumberTicker, Marquee, AnimatedBeam)
- **Анимации:** motion (Framer Motion 12)
- **Иконки:** lucide-react

## Состояние (2026-05-22)

✅ **Лендинг** на https://voice-ai-agent.vercel.app:
- Header sticky + backdrop-blur, унифицированный логотип (gradient + Mic-иконка)
- Hero: пульсирующий бейдж, gradient-надпись, ShimmerButton CTA
- Metrics: 4 анимированных числа (1с / 95% / 24/7 / 100%)
- Features: bento-сетка 6 фич с иконками Lucide
- How: 4 шага с dashed connector
- Pricing: gradient-обведённая карточка "Бета бесплатно"
- Footer subtle

✅ **Backend** каркас (FastAPI + CORS + /api/health). Endpoints для бизнес-логики ещё не написаны.

🔧 **В очереди:**
1. Supabase проект + auth страницы (`/login`, `/signup`)
2. Минимальный кабинет (`/dashboard`)
3. Backend endpoints: scenarios, contacts, campaigns, calls
4. Интеграция backend ↔ voice-agent через `initiate_call()` из `voice-ai-agent/agent/outbound.py`
5. Юридическое (ИП, РКН, лицензия связи) — после первой обратной связи от тест-пользователей

## Деплой

### Frontend (Vercel)

```bash
cd frontend
# Vercel CLI установлен в ../.vercel-cli (вне репо)
HOME=$(realpath ../vercel-home) \
  ../.vercel-cli/node_modules/.bin/vercel deploy --prod --yes \
  --token $VERCEL_TOKEN --scope sergeis-projects-6c3481be
```

Vercel project: `voice-agent`
Alias domain: `voice-ai-agent.vercel.app`
SSO protection: отключено
GitHub auto-deploy: подключён (push в main → auto-deploy)

### Backend (план)

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

## Безопасность

- **npm audit**: 0 critical, 0 high, 2 moderate (next/postcss — false positives рекомендуют downgrade)
- **shadcn/ui**: компоненты копируются в `src/components/ui/` — код можно аудитить перед коммитом
- **Magic UI**: тот же подход, copy-paste через shadcn CLI
- **Skills для дизайна:** Anthropic frontend-design + Koomook distinctive-frontend — оба прошли аудит (markdown only, MIT, без shell/eval/network)

## Связанные репо

- [voice-ai-agent](https://github.com/sergeigeyn/voice-ai-agent) — voice pipeline. Backend будет дёргать его через `initiate_call(phone, metadata)`.
