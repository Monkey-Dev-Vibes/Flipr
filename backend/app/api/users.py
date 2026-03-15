from fastapi import APIRouter, Depends

from app.core.security import get_current_user
from app.models.user import UserSession, UserStateResponse
from app.services.user_state_service import get_user_state_service

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me/state", response_model=UserStateResponse)
async def get_user_state(
    user: UserSession = Depends(get_current_user),
):
    """Get the current user's trade state (consecutive losses, total trades).

    Used by the frontend cooling-off prompt to decide when to show
    a break suggestion.
    """
    service = get_user_state_service()
    state = service.get_user_state(user.privy_user_id)
    return UserStateResponse(
        data={
            "consecutive_losses": state.consecutive_losses,
            "total_trades": state.total_trades,
        }
    )
