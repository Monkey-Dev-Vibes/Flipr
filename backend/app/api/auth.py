"""Authentication endpoints — Privy JWT verification."""

from fastapi import APIRouter, Depends

from app.core.security import get_current_user
from app.models.user import AuthVerifyResponse, UserSession

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/verify", response_model=AuthVerifyResponse)
async def verify_session(user: UserSession = Depends(get_current_user)):
    """Verify a Privy access token and return user session data.

    The frontend calls this after Privy login to confirm the backend
    can validate the token and establish a session.
    """
    return AuthVerifyResponse(
        data={
            "user_id": user.privy_user_id,
            "wallet_address": user.wallet_address,
            "balance": user.balance,
        },
        meta={"verified": True},
    )
