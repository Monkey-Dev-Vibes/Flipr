from __future__ import annotations

from datetime import datetime
from typing import Dict, Optional

from pydantic import BaseModel, Field


class UserSession(BaseModel):
    """Verified user session from Privy JWT."""

    privy_user_id: str = Field(description="Privy DID (e.g., did:privy:abc123)")
    wallet_address: Optional[str] = None
    balance: float = Field(default=0.0, ge=0, description="USDC balance")
    created_at: datetime = Field(default_factory=datetime.utcnow)


class AuthVerifyResponse(BaseModel):
    """API response envelope for auth verification."""

    data: Optional[Dict] = None
    error: Optional[str] = None
    meta: Optional[Dict] = None
