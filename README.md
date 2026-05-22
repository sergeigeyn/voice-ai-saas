# voice-ai-saas

SaaS-обёртка над voice-ai-agent. Клиенты регистрируются, создают сценарии,
загружают номера и запускают обзвон.

## Структура
- `frontend/` — Next.js 16 + Tailwind v4 + shadcn/ui. Лендинг + кабинет.
- `backend/` — FastAPI (REST). Auth через Supabase, обзвон через voice-ai-agent.

## Стек
- Frontend: Next.js, Tailwind, deploy на Vercel
- Backend: FastAPI на VPS Beget (рядом с voice-agent)
- БД: Supabase (PostgreSQL + Auth + Storage)
- Биллинг: ЮKassa (пока отложено)
- Voice agent: github.com/sergeigeyn/voice-ai-agent

## Связанные репозитории
- voice-ai-agent — voice pipeline (Asterisk + LiveKit + Deepgram + Groq + ElevenLabs)
