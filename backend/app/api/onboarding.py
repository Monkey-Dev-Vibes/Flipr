"""Onboarding endpoints — first-time user grant."""

from fastapi import APIRouter, Depends

from app.core.security import get_current_user
from app.models.user import OnboardingGrantResponse, UserSession

router = APIRouter(prefix="/onboarding", tags=["onboarding"])

# In-memory set of users who have already claimed the grant.
# In production this would be a database check.
_claimed_users: set[str] = set()

GRANT_AMOUNT = 1.0  # 1 Test USDC


@router.post("/grant", response_model=OnboardingGrantResponse)
async def claim_onboarding_grant(
    user: UserSession = Depends(get_current_user),
):
    """Grant 1 Test USDC to a first-time user.

    Idempotent — subsequent calls for the same user return the grant
    amount but do not double-credit.
    """
    already_claimed = user.privy_user_id in _claimed_users
    if not already_claimed:
        _claimed_users.add(user.privy_user_id)

    return OnboardingGrantResponse(
        data={
            "user_id": user.privy_user_id,
            "grant_amount": GRANT_AMOUNT,
            "already_claimed": already_claimed,
            "balance": GRANT_AMOUNT,
        },
    )
