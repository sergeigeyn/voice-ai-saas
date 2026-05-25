# HANDOFF — voice-ai-saas

Текущее состояние и план. Обновлять каждую сессию через `/endday`.

## Статус (2026-05-25)

🟢 **Production** — https://voice-ai-agent.vercel.app живой, end-to-end флоу работает.

## Сделано к 2026-05-25

См. `../voice-ai-agent/memory/2026-05-23.md`. Ключевое:

- ✅ Лендинг (Next.js 16 + Tailwind v4 + shadcn/ui + Magic UI) на Vercel
- ✅ Auth (signup / login) через PocketBase JS SDK
- ✅ /dashboard: форма тестового звонка, список звонков с бейджами статусов, auto-reload
- ✅ /dashboard/calls/{id} — детали + транскрипт chat-bubbles + готовый плеер
- ✅ /dashboard/scenarios — список / создание / редактор / селектор в форме звонка
- ✅ FastAPI backend (v0.4.0): /api/health, /api/scenarios, /api/calls, /api/calls/initiate, /api/_internal/call-completed
- ✅ PocketBase collections: users, scenarios (3 шаблона), calls, campaigns (схема)
- ✅ Security: createRule/updateRule защита от подмены user (через body), X-Internal-Secret для internal endpoint
- ✅ С фронта удалена техничка (LiveKit/Asterisk/Plusofon/initiate_call)

## В процессе

Ничего активного.

## На завтра / следующая сессия

### Critical
1. **Named CF tunnel + домен** (issue #5 в voice-ai-agent) — основной блокер production-ready. Затрагивает оба сервиса (PB + backend). Решение в `voice-ai-agent/knowledge/known-issues.md` §5.

### Backend
2. **Inbound регистрация в calls** — сейчас inbound идёт мимо backend, call_id не задан → не пишется в /dashboard/calls. Нужен endpoint регистрации входящих.
3. **Скрытие PocketBase endpoints** — сейчас в Network DevTools видно `/api/collections/users/auth-with-password`. Решение: проксирование auth через backend.

### Frontend
4. Real-time обновление списка звонков через polling/WebSocket вместо setTimeout(1500).

### Бизнес
5. **Биллинг** — ЮKassa (требует ИП).
6. **Юр.пакет** — РКН, политика обработки ПДн, согласие на запись (informed consent уже в voice-agent, но юр.документы нужны).

## Обещания

—

## Открытые вопросы

- Multi-tenancy: какие фичи давать на каких тарифах (черновик 9.9 / 24.9 / 49.9k₽ в voice-ai-dental — общий с saas или раздельный?)
- voice_id в сценариях зарезервирован, но не работает (TTS init до парсинга metadata) — нужен factory pattern в voice-agent

## Точки входа в документацию

- **README.md** — стек, состояние, деплой
- **../voice-ai-agent/knowledge/saas-deployment.md** — архитектура VPS + Vercel + tunnels
- **../voice-ai-agent/knowledge/scenarios.md** — модель данных сценариев + security
- **../voice-ai-agent/knowledge/calls.md** — модель calls + transcript + internal endpoint
- **../voice-ai-agent/knowledge/security.md** — правила безопасности

## Структура

```
backend/   FastAPI (Python). Деплоится на VPS /opt/voice-saas-backend/, systemd
frontend/  Next.js 16. Деплоится на Vercel (rootDirectory=frontend, auto-deploy main)
```
