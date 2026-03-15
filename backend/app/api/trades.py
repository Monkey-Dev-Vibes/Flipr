from fastapi import APIRouter, Depends, Request

from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.models.market import TradeExecuteResponse, TradeRequest
from app.models.user import UserSession
from app.services.trade_service import get_trade_service
from app.services.user_state_service import get_user_state_service

router = APIRouter(prefix="/trade", tags=["trade"])


@router.post("/execute", response_model=TradeExecuteResponse)
@limiter.limit("10/minute")
async def execute_trade(
    request: Request,
    trade: TradeRequest,
    user: UserSession = Depends(get_current_user),
):
    """Execute a trade on a prediction market.

    Requires authentication. The trade goes through slippage protection
    and is executed as a Fill-Or-Kill order on the underlying protocol.
    A $0.50 platform fee is applied on successful trades.
    """
    service = get_trade_service()
    result = await service.execute_trade(trade)

    # Record trade outcome for cooling-off tracking
    user_state_service = get_user_state_service()
    user_state_service.record_trade_result(user.privy_user_id, result.success)

    if not result.success:
        return TradeExecuteResponse(data=result, error=result.error)

    return TradeExecuteResponse(
        data=result,
        meta={"fee": result.fee, "total_charge": result.amount + (result.fee or 0)},
    )
