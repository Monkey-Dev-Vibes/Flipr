from fastapi import APIRouter, Depends, Query, Request

from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.models.market import MarketFeedResponse, MarketOddsResponse
from app.models.user import UserSession
from app.services.market_service import get_market_service

router = APIRouter(prefix="/markets", tags=["markets"])


@router.get("/feed", response_model=MarketFeedResponse)
@limiter.limit("30/minute")
async def get_market_feed(
    request: Request,
    limit: int = Query(
        default=20, ge=1, le=50, description="Number of markets to return"
    ),
    offset: int = Query(default=0, ge=0, description="Pagination offset"),
    user: UserSession = Depends(get_current_user),
):
    """Get the curated market feed for the card stack."""
    service = get_market_service()
    markets = await service.get_feed(limit=limit, offset=offset)
    return MarketFeedResponse(
        data=markets,
        meta={"limit": limit, "offset": offset, "count": len(markets)},
    )


@router.get("/{market_id}/odds", response_model=MarketOddsResponse)
@limiter.limit("60/minute")
async def get_market_odds(
    request: Request,
    market_id: str,
    user: UserSession = Depends(get_current_user),
):
    """Get live odds for a specific market (used for 3-second polling)."""
    service = get_market_service()
    odds = await service.get_market_odds(market_id)

    if "error" in odds:
        return MarketOddsResponse(data=None, error=odds["error"])

    return MarketOddsResponse(data=odds)
