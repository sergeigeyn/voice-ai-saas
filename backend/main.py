"""FastAPI backend для voice-ai-saas."""
from __future__ import annotations

import asyncio
import json
import os
import re
import time
import uuid
from datetime import datetime, timezone
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
PB_SUPERUSER_EMAIL = os.environ.get("PB_SUPERUSER_EMAIL", "")
PB_SUPERUSER_PASSWORD = os.environ.get("PB_SUPERUSER_PASSWORD", "")
INTERNAL_API_SECRET = os.environ.get("INTERNAL_API_SECRET", "")

ALLOWED_ORIGINS = [
    o.strip()
    for o in os.environ.get(
        "ALLOWED_ORIGINS",
        "http://localhost:3000,https://voice-ai-agent.vercel.app",
    ).split(",")
    if o.strip()
]

app = FastAPI(title="VoiceAI API", version="0.4.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PHONE_RE = re.compile(r"^\+\d{10,15}$")


# ─── модели ────────────────────────────────────────────────────────────────

class InitiateCallReq(BaseModel):
    phone: str = Field(..., description="E.164, например +79991234567")
    lead_name: Optional[str] = Field(None, max_length=80)
    scenario_id: Optional[str] = None


class InitiateCallRes(BaseModel):
    call_id: str
    room_name: str
    participant_id: str
    sip_call_id: str


class CallCompletedReq(BaseModel):
    """Передаётся voice-agent'ом в /api/_internal/call-completed."""
    room_name: str
    status: str  # answered / ended / failed
    started_at: Optional[str] = None
    ended_at: Optional[str] = None
    duration: Optional[int] = None
    transcript: Optional[list[dict[str, Any]]] = None


# ─── helpers ───────────────────────────────────────────────────────────────

def _bearer(authorization: str | None) -> str:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    return authorization.split(None, 1)[1]


async def verify_pb_token(authorization: str | None) -> tuple[dict, str]:
    """Возвращает (user_record, token) после проверки JWT юзера."""
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


_admin_token: dict[str, Any] = {"token": "", "exp": 0.0}


async def admin_token() -> str:
    """Возвращает кэшированный admin-токен, обновляет если устарел."""
    if _admin_token["token"] and _admin_token["exp"] > time.time() + 60:
        return _admin_token["token"]
    if not (PB_SUPERUSER_EMAIL and PB_SUPERUSER_PASSWORD):
        raise HTTPException(status_code=500, detail="PB superuser not configured")
    async with httpx.AsyncClient(timeout=10.0) as client:
        r = await client.post(
            f"{PB_URL}/api/collections/_superusers/auth-with-password",
            json={"identity": PB_SUPERUSER_EMAIL, "password": PB_SUPERUSER_PASSWORD},
        )
        if r.status_code != 200:
            raise HTTPException(status_code=500, detail=f"PB admin auth failed: {r.status_code}")
        data = r.json()
        _admin_token["token"] = data["token"]
        _admin_token["exp"] = time.time() + 60 * 60 * 24  # JWT обычно 14 дней, обновим раньше
        return _admin_token["token"]


async def pb_admin(method: str, path: str, json_body: Any | None = None, params: dict | None = None) -> Any:
    tok = await admin_token()
    async with httpx.AsyncClient(timeout=10.0) as client:
        r = await client.request(
            method,
            f"{PB_URL}{path}",
            headers={"Authorization": tok},
            json=json_body,
            params=params,
        )
        if r.status_code >= 400:
            raise HTTPException(status_code=502, detail=f"PB {path} → {r.status_code}: {r.text[:200]}")
        return r.json() if r.text else None


async def pb_user(method: str, path: str, token: str, json_body: Any | None = None, params: dict | None = None) -> Any:
    async with httpx.AsyncClient(timeout=10.0) as client:
        r = await client.request(
            method,
            f"{PB_URL}{path}",
            headers={"Authorization": token},
            json=json_body,
            params=params,
        )
        if r.status_code >= 400:
            raise HTTPException(status_code=r.status_code, detail=r.text[:200])
        return r.json() if r.text else None


async def fetch_scenario(scenario_id: str, token: str) -> dict:
    return await pb_user("GET", f"/api/collections/scenarios/records/{scenario_id}", token)


def now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S.%fZ")


# ─── public endpoints ──────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "ok", "service": "voice-ai-saas-api", "version": app.version}


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "livekit_configured": bool(LIVEKIT_URL and LIVEKIT_API_KEY and LIVEKIT_API_SECRET),
        "pb_configured": bool(PB_URL),
        "admin_configured": bool(PB_SUPERUSER_EMAIL and PB_SUPERUSER_PASSWORD),
        "internal_secret_set": bool(INTERNAL_API_SECRET),
    }


@app.get("/api/scenarios")
async def list_scenarios(authorization: str | None = Header(default=None)) -> list[dict]:
    _, token = await verify_pb_token(authorization)
    data = await pb_user(
        "GET",
        "/api/collections/scenarios/records",
        token,
        params={"perPage": 100, "sort": "-is_template,name"},
    )
    return [
        {
            "id": it["id"],
            "name": it.get("name", ""),
            "description": it.get("description", ""),
            "is_template": bool(it.get("is_template", False)),
        }
        for it in data.get("items", [])
    ]


@app.get("/api/calls")
async def list_calls(authorization: str | None = Header(default=None)) -> list[dict]:
    _, token = await verify_pb_token(authorization)
    data = await pb_user(
        "GET",
        "/api/collections/calls/records",
        token,
        params={"perPage": 50, "sort": "-started_at", "expand": "scenario"},
    )
    return [
        {
            "id": it["id"],
            "phone": it.get("phone", ""),
            "lead_name": it.get("lead_name", ""),
            "direction": it.get("direction", ""),
            "status": it.get("status", ""),
            "duration": it.get("duration") or 0,
            "started_at": it.get("started_at", ""),
            "ended_at": it.get("ended_at", ""),
            "scenario_name": (it.get("expand") or {}).get("scenario", {}).get("name", "") if it.get("expand") else "",
        }
        for it in data.get("items", [])
    ]


@app.get("/api/calls/{call_id}")
async def get_call(call_id: str, authorization: str | None = Header(default=None)) -> dict:
    _, token = await verify_pb_token(authorization)
    it = await pb_user(
        "GET",
        f"/api/collections/calls/records/{call_id}",
        token,
        params={"expand": "scenario"},
    )
    return {
        "id": it["id"],
        "phone": it.get("phone", ""),
        "lead_name": it.get("lead_name", ""),
        "direction": it.get("direction", ""),
        "status": it.get("status", ""),
        "duration": it.get("duration") or 0,
        "started_at": it.get("started_at", ""),
        "ended_at": it.get("ended_at", ""),
        "scenario_name": (it.get("expand") or {}).get("scenario", {}).get("name", "") if it.get("expand") else "",
        "transcript": it.get("transcript", ""),
        "recording_url": it.get("recording_url", ""),
        "room_name": it.get("room_name", ""),
        "sip_call_id": it.get("sip_call_id", ""),
    }


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

    # 1) Создаём preliminary запись в calls с JWT юзера (правильный owner)
    room_name = f"out-{int(time.time())}-{uuid.uuid4().hex[:6]}"
    call_data: dict[str, Any] = {
        "user": user.get("id"),
        "phone": req.phone,
        "lead_name": req.lead_name or "",
        "direction": "outbound",
        "status": "initiated",
        "room_name": room_name,
    }

    scenario_payload: dict[str, Any] = {}
    if req.scenario_id:
        sc = await fetch_scenario(req.scenario_id, token)
        scenario_payload = {
            "id": sc["id"],
            "name": sc.get("name", ""),
            "greeting": sc.get("greeting", "") or "",
            "prompt": sc.get("prompt", "") or "",
            "voice_id": sc.get("voice_id") or None,
        }
        call_data["scenario"] = sc["id"]

    call_rec = await pb_user("POST", "/api/collections/calls/records", token, json_body=call_data)
    call_id = call_rec["id"]

    # 2) Метадата для voice-agent (включая call_id для обратной связи)
    metadata: dict[str, Any] = {
        "lead_name": req.lead_name or "",
        "user_id": user.get("id", ""),
        "user_email": user.get("email", ""),
        "call_id": call_id,
    }
    if scenario_payload:
        metadata["scenario_id"] = scenario_payload["id"]
        metadata["scenario_name"] = scenario_payload["name"]
        metadata["scenario_greeting"] = scenario_payload["greeting"]
        metadata["scenario_prompt"] = scenario_payload["prompt"]
        if scenario_payload["voice_id"]:
            metadata["voice_id"] = scenario_payload["voice_id"]

    # 3) LiveKit create room + SIP participant
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
    except Exception as e:
        await pb_admin(
            "PATCH",
            f"/api/collections/calls/records/{call_id}",
            json_body={"status": "failed"},
        )
        await lk.aclose()
        raise HTTPException(status_code=502, detail=f"LiveKit error: {e}") from e
    finally:
        try:
            await lk.aclose()
        except Exception:
            pass

    # 4) Обновляем запись sip_call_id + started_at через admin
    await pb_admin(
        "PATCH",
        f"/api/collections/calls/records/{call_id}",
        json_body={
            "sip_call_id": info.sip_call_id,
            "started_at": now_iso(),
        },
    )

    return InitiateCallRes(
        call_id=call_id,
        room_name=room_name,
        participant_id=info.participant_id,
        sip_call_id=info.sip_call_id,
    )


# ─── internal endpoints (voice-agent → backend) ────────────────────────────

@app.post("/api/_internal/call-completed")
async def call_completed(
    req: CallCompletedReq,
    x_internal_secret: str | None = Header(default=None, alias="X-Internal-Secret"),
):
    if not INTERNAL_API_SECRET:
        raise HTTPException(status_code=500, detail="Internal secret not configured")
    if x_internal_secret != INTERNAL_API_SECRET:
        raise HTTPException(status_code=401, detail="Invalid internal secret")

    # Находим запись по room_name
    list_data = await pb_admin(
        "GET",
        "/api/collections/calls/records",
        params={"filter": f"room_name='{req.room_name}'", "perPage": 1},
    )
    items = list_data.get("items", [])
    if not items:
        raise HTTPException(status_code=404, detail=f"No call with room_name={req.room_name}")
    call_id = items[0]["id"]

    update: dict[str, Any] = {"status": req.status}
    if req.duration is not None:
        update["duration"] = req.duration
    if req.ended_at:
        update["ended_at"] = req.ended_at
    if req.started_at and not items[0].get("started_at"):
        update["started_at"] = req.started_at
    if req.transcript:
        update["transcript"] = json.dumps(req.transcript, ensure_ascii=False)

    await pb_admin(
        "PATCH",
        f"/api/collections/calls/records/{call_id}",
        json_body=update,
    )
    return {"ok": True, "call_id": call_id}
