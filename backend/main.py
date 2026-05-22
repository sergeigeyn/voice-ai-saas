"""FastAPI backend для voice-ai-saas.

Endpoints (план MVP):
- POST /auth/signup, /auth/login — через Supabase Auth
- GET /api/me — текущий пользователь
- GET/POST /api/scenarios — сценарии диалога
- POST /api/contacts/upload — загрузка CSV
- POST /api/campaigns — создать кампанию
- POST /api/campaigns/{id}/start — запустить обзвон
- GET /api/calls — история звонков
- GET /api/calls/{id}/recording — запись
- GET /api/calls/{id}/transcript — транскрипт
"""
from __future__ import annotations
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="VoiceAI API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://*.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"status": "ok", "service": "voice-ai-saas-api"}


@app.get("/api/health")
def health():
    return {"status": "ok"}


# TODO: подключить auth, scenarios, campaigns, calls
