"""FastAPI backend для voice-ai-saas.

MVP endpoints:
- GET  /                       — health
- GET  /api/health             — health
- GET  /api/scenarios          — список сценариев (свои + шаблоны)
- POST /api/calls/initiate     — инициировать исходящий звонок (auth: PB token)
"""
from __future__ import annotations

import json
import os
import re
import time
import uuid
from typing import Any, Optional

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from livekit import api
from pydantic import BaseModel, Field

load_dotenv()

LIVEKIT_URL = os.environ.get("LIVEKIT_URL", "")
LIVEKIT_API_KEY = os.environ.get("LIVEKIT_API_KEY", "")
LIVEKIT_API_SECRET = os.environ.get("LIVEKIT_API_SECRET", "")
OUTBOUND_TRUNK_ID = os.environ.get("OUTBOUND_TRUNK_ID", "ST_mp5ZseUc9n8S")
PB_URL = os.environ.get("PB_URL", "").rstrip("/")

ALLOWED_ORIGINS = [
    o.strip()
    for o in os.environ.get(
        "ALLOWED_ORIGINS",
        "http://localhost:3000,https://voice-ai-agent.vercel.app",
    ).split(",")
    if o.strip()
]

app = FastAPI(title="VoiceAI API", version="0.3.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PHONE_RE = re.compile(r"^\+\d{10,15}$")


class InitiateCallReq(BaseModel):
    phone: str = Field(..., description="E.164, например +79991234567")
    lead_name: Optional[str] = Field(None, max_length=80)
    scenario_id: Optional[str] = Field(None, description="ID сценария из PocketBase")


class InitiateCallRes(BaseModel):
    room_name: str
    participant_id: str
    sip_call_id: str


def _bearer(authorization: str | None) -> str:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    return authorization.split(None, 1)[1]


async def verify_pb_token(authorization: str | None) -> tuple[dict, str]:
    """Проверяет PocketBase JWT через auth-refresh. Возвращает (user_record, token)."""
    if not PB_URL:
        raise HTTPException(status_code=500, detail="PB_URL not configured")
    token = _bearer(authorization)
    async with httpx.AsyncClient(timeout=10.0) as client:
        r = await client.post(
            f"{PB_URL}/api/collections/users/auth-refresh",
            headers={"Authorization": token},
        )
        if r.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid PB token")
        return r.json().get("record", {}), token


async def fetch_scenario(scenario_id: str, token: str) -> dict:
    """Грузит сценарий из PocketBase с JWT пользователя.
    PB сам проверит права (юзер видит свои + шаблоны)."""
    async with httpx.AsyncClient(timeout=10.0) as client:
        r = await client.get(
            f"{PB_URL}/api/collections/scenarios/records/{scenario_id}",
            headers={"Authorization": token},
        )
        if r.status_code == 404:
            raise HTTPException(status_code=404, detail="Scenario not found or access denied")
        if r.status_code != 200:
            raise HTTPException(status_code=502, detail=f"PB error {r.status_code}")
        return r.json()


@app.get("/")
def root():
    return {"status": "ok", "service": "voice-ai-saas-api", "version": app.version}


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "livekit_configured": bool(LIVEKIT_URL and LIVEKIT_API_KEY and LIVEKIT_API_SECRET),
        "pb_configured": bool(PB_URL),
    }


@app.get("/api/scenarios")
async def list_scenarios(authorization: str | None = Header(default=None)) -> list[dict]:
    """Возвращает доступные пользователю сценарии (свои + шаблоны)."""
    _, token = await verify_pb_token(authorization)
    async with httpx.AsyncClient(timeout=10.0) as client:
        r = await client.get(
            f"{PB_URL}/api/collections/scenarios/records",
            params={"perPage": 100, "sort": "-is_template,name"},
            headers={"Authorization": token},
        )
        if r.status_code != 200:
            raise HTTPException(status_code=502, detail=f"PB error {r.status_code}")
        items = r.json().get("items", [])
    # Возвращаем только нужные поля наружу
    return [
        {
            "id": it["id"],
            "name": it.get("name", ""),
            "description": it.get("description", ""),
            "is_template": bool(it.get("is_template", False)),
        }
        for it in items
    ]


@app.post("/api/calls/initiate", response_model=InitiateCallRes)
async def initiate_call(
    req: InitiateCallReq,
    authorization: str | None = Header(default=None),
):
    user, token = await verify_pb_token(authorization)

    if not PHONE_RE.match(req.phone):
        raise HTTPException(status_code=400, detail="Bad phone format, need +E164")
    if not (LIVEKIT_URL and LIVEKIT_API_KEY and LIVEKIT_API_SECRET):
        raise HTTPException(status_code=500, detail="LiveKit not configured")

    metadata: dict[str, Any] = {
        "lead_name": req.lead_name or "",
        "user_id": user.get("id", ""),
        "user_email": user.get("email", ""),
    }

    if req.scenario_id:
        sc = await fetch_scenario(req.scenario_id, token)
        metadata["scenario_id"] = sc["id"]
        metadata["scenario_name"] = sc.get("name", "")
        metadata["scenario_greeting"] = sc.get("greeting", "") or ""
        metadata["scenario_prompt"] = sc.get("prompt", "") or ""
        if sc.get("voice_id"):
            metadata["voice_id"] = sc["voice_id"]

    room_name = f"out-{int(time.time())}-{uuid.uuid4().hex[:6]}"

    lk = api.LiveKitAPI(LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET)
    try:
        await lk.room.create_room(api.CreateRoomRequest(name=room_name, metadata=json.dumps(metadata)))
        info = await lk.sip.create_sip_participant(
            api.CreateSIPParticipantRequest(
                sip_trunk_id=OUTBOUND_TRUNK_ID,
                sip_call_to=req.phone,
                room_name=room_name,
                participant_identity=f"caller-{uuid.uuid4().hex[:8]}",
                participant_name=req.lead_name or "Lead",
                wait_until_answered=False,
            )
        )
    finally:
        await lk.aclose()

    return InitiateCallRes(
        room_name=room_name,
        participant_id=info.participant_id,
        sip_call_id=info.sip_call_id,
    )
