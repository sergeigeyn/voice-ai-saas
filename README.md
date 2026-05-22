# voice-ai-saas

SaaS-обёртка над [voice-ai-agent](https://github.com/sergeigeyn/voice-ai-agent).
Клиенты регистрируются, создают сценарии диалога, загружают номера и запускают обзвон —
агент звонит и общается голосом за них.

**Live:** https://voice-ai-agent.vercel.app

## Структура

| Каталог | Что |
|---|---|
| `frontend/` | Next.js 16 + React 19 + Tailwind v4. Лендинг + кабинет. Деплой Vercel. |
| `backend/` | FastAPI (Python). REST API для auth, кампаний, звонков. Хостинг — Beget Moscow рядом с voice-agent. |

## Stack

| Слой | Технология | Где хостится |
|---|---|---|
| Frontend | Next.js 16, Tailwind v4, shadcn/ui (план) | Vercel — project `voice-agent` |
| Backend | FastAPI, Python 3.12 | Beget Moscow (план) |
| Database | PostgreSQL + Supabase Auth + Storage | Supabase (план) |
| Биллинг | ЮKassa | Отложен до подтверждения юзкейса |
| Voice Agent | LiveKit + Asterisk + Plusofon + Deepgram + Groq + ElevenLabs | Beget Moscow, уже работает |

## Состояние (2026-05-22)

✅ Лендинг развёрнут: https://voice-ai-agent.vercel.app
- Hero, фичи, шаги "как работает", тариф "Бета бесплатно"
- Тёмная тема, gradient-акценты
- Кнопки "Войти" / "Попробовать" пока ведут в никуда (страниц `/login`, `/signup` ещё нет)

✅ Backend каркас: `backend/main.py` с FastAPI, CORS, `/api/health`. Endpoints для бизнес-логики ещё не написаны.

🔧 Следующие шаги:
1. Supabase проект + auth страницы (`/login`, `/signup`)
2. Минимальный кабинет (`/dashboard`)
3. Backend endpoints: scenarios, contacts, campaigns, calls
4. Интеграция backend ↔ voice-agent через `initiate_call()` из `voice-ai-agent/agent/outbound.py`

## Деплой

### Frontend (Vercel)

```bash
cd frontend
# Vercel CLI установлен в ../.vercel-cli (вне репо)
vercel deploy --prod --scope sergeis-projects-6c3481be
```

Vercel project: `voice-agent` (team `sergeis-projects-6c3481be`)
Aliased domain: `voice-ai-agent.vercel.app`

### Backend (план)

Не задеплоен. Развернём на Beget Moscow когда дойдём до auth/API:
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

## Связанные репо

- [voice-ai-agent](https://github.com/sergeigeyn/voice-ai-agent) — voice pipeline. Backend будет дёргать его через `initiate_call(phone, metadata)`.

## Юр-вопросы (отложены)

- ЮKassa требует ИП/ООО — пока физлицо, биллинг отложен
- Регистрация оператора ПДн в РКН — обязательна перед коммерческим запуском
- Лицензия на услуги связи — уточнить у юриста
- Пока: даём знакомым на тест, по фидбеку решаем формальности
