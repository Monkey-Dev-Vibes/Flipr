"""WebSocket endpoint for real-time odds streaming."""

from __future__ import annotations

import asyncio
import json
import logging
from typing import Dict, Set

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.core.security import _verify_privy_token
from app.services.market_service import get_market_service

logger = logging.getLogger(__name__)

router = APIRouter(tags=["websocket"])

# Per-user connection tracking
MAX_CONNECTIONS_PER_USER = 5
_user_connections: Dict[str, Set[WebSocket]] = {}

# Streaming interval
ODDS_PUSH_INTERVAL = 2.0  # seconds


def _track_connection(user_id: str, ws: WebSocket) -> bool:
    """Track a user connection. Returns False if limit exceeded."""
    if user_id not in _user_connections:
        _user_connections[user_id] = set()
    if len(_user_connections[user_id]) >= MAX_CONNECTIONS_PER_USER:
        return False
    _user_connections[user_id].add(ws)
    return True


def _untrack_connection(user_id: str, ws: WebSocket) -> None:
    """Remove a connection from tracking."""
    if user_id in _user_connections:
        _user_connections[user_id].discard(ws)
        if not _user_connections[user_id]:
            del _user_connections[user_id]


@router.websocket("/ws/odds/{market_id}")
async def stream_odds(websocket: WebSocket, market_id: str):
    """WebSocket endpoint for streaming live odds for a specific market.

    Authentication: pass JWT as query parameter `?token=<jwt>`.
    Pushes updated odds every 2 seconds as JSON:
    {"market_id": "...", "yes_price": 65, "no_price": 35, "last_updated": "..."}
    """
    # Authenticate via query parameter
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=4001, reason="Missing auth token")
        return

    try:
        claims = await _verify_privy_token(token)
        user_id = claims.get("sub", "unknown")
    except Exception:
        await websocket.close(code=4001, reason="Invalid auth token")
        return

    # Check connection limit
    if not _track_connection(user_id, websocket):
        await websocket.close(code=4029, reason="Too many connections")
        return

    await websocket.accept()
    logger.info("WS connected: user=%s market=%s", user_id, market_id)

    try:
        market_service = get_market_service()

        while True:
            try:
                odds = await market_service.get_market_odds(market_id)
                if odds:
                    await websocket.send_text(json.dumps(odds))
            except Exception as e:
                logger.warning("WS odds fetch error: %s", e)
                # Send error frame but don't disconnect
                await websocket.send_text(
                    json.dumps({"error": "Failed to fetch odds"})
                )

            await asyncio.sleep(ODDS_PUSH_INTERVAL)

    except WebSocketDisconnect:
        logger.info("WS disconnected: user=%s market=%s", user_id, market_id)
    except Exception as e:
        logger.error("WS error: %s", e)
    finally:
        _untrack_connection(user_id, websocket)
