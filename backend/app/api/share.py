"""Share card endpoints for social media sharing."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any, Optional

from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel, Field

from app.core.rate_limit import limiter
from app.core.security import get_current_user

router = APIRouter(prefix="/share", tags=["share"])

# In-memory store for share snapshots (MVP; use DB in production)
_share_store: dict[str, dict[str, Any]] = {}


class CreateShareRequest(BaseModel):
    type: str = Field(..., pattern="^(trade-win|portfolio)$")
    question: Optional[str] = None
    intent: Optional[str] = Field(None, pattern="^(yes|no)$")
    percentGain: float = 0
    amount: float = 0
    winStreak: Optional[int] = None


class ShareData(BaseModel):
    id: str
    shareUrl: str
    createdAt: str


@router.post("")
@limiter.limit("30/minute")
async def create_share(
    request: Request,
    body: CreateShareRequest,
    user: dict = Depends(get_current_user),
) -> dict:
    """Create a shareable snapshot and return a share URL."""
    share_id = uuid.uuid4().hex[:12]

    _share_store[share_id] = {
        "id": share_id,
        "userId": user.get("sub", "anonymous"),
        "type": body.type,
        "question": body.question,
        "intent": body.intent,
        "percentGain": body.percentGain,
        "amount": body.amount,
        "winStreak": body.winStreak,
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }

    # In production, shareUrl would be the actual domain
    share_url = f"https://flipr.app/s/{share_id}"

    return {
        "data": ShareData(
            id=share_id,
            shareUrl=share_url,
            createdAt=_share_store[share_id]["createdAt"],
        ).model_dump(),
        "error": None,
    }


@router.get("/{share_id}")
@limiter.limit("60/minute")
async def get_share(request: Request, share_id: str) -> dict:
    """
    Get a share snapshot by ID.
    Returns OG-compatible data for Twitter Card / social media previews.
    No authentication required — share links are public.
    """
    snapshot = _share_store.get(share_id)
    if not snapshot:
        return {"data": None, "error": "Share not found"}

    # Build OG meta description
    gain_str = f"+{snapshot['percentGain']:.1f}%" if snapshot["percentGain"] >= 0 else f"{snapshot['percentGain']:.1f}%"

    og_data = {
        **snapshot,
        "og": {
            "title": f"Flipr — {gain_str} {'🎯' if snapshot['type'] == 'trade-win' else '🚀'}",
            "description": snapshot.get("question", f"Portfolio: ${snapshot['amount']:.2f}"),
            "image": f"https://flipr.app/api/og/{share_id}.png",
            "url": f"https://flipr.app/s/{share_id}",
        },
    }

    return {"data": og_data, "error": None}
