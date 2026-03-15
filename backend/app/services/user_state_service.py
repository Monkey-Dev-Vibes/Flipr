"""In-memory user state tracking for cooling-off prompts."""

from __future__ import annotations

import logging
from typing import Dict

from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)


class UserState(BaseModel):
    """Per-user trade outcome tracking."""

    consecutive_losses: int = Field(default=0, ge=0)
    total_trades: int = Field(default=0, ge=0)


class UserStateService:
    """In-memory service for tracking user trade outcomes.

    Stores consecutive loss counts per user for the cooling-off feature.
    Not persisted across restarts (MVP).
    """

    def __init__(self) -> None:
        self._states: Dict[str, UserState] = {}

    def get_user_state(self, user_id: str) -> UserState:
        """Get the current state for a user, creating default if needed."""
        if user_id not in self._states:
            self._states[user_id] = UserState()
        return self._states[user_id]

    def record_trade_result(self, user_id: str, success: bool) -> UserState:
        """Record a trade outcome and update the user's streak.

        On success: resets consecutive_losses to 0.
        On failure: increments consecutive_losses.
        Always increments total_trades.
        """
        state = self.get_user_state(user_id)
        state.total_trades += 1

        if success:
            state.consecutive_losses = 0
        else:
            state.consecutive_losses += 1

        logger.debug(
            "User %s trade result: success=%s, streak=%d, total=%d",
            user_id,
            success,
            state.consecutive_losses,
            state.total_trades,
        )
        return state


# Singleton
_user_state_service: UserStateService | None = None


def get_user_state_service() -> UserStateService:
    """Get or create the singleton UserStateService."""
    global _user_state_service
    if _user_state_service is None:
        _user_state_service = UserStateService()
    return _user_state_service
