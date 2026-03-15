from __future__ import annotations

from datetime import datetime
from typing import Dict, List, Optional

from pydantic import BaseModel, Field


class RawMarket(BaseModel):
    """Raw market data as fetched from a protocol adapter."""

    id: str
    question: str
    category: str
    yes_price: float = Field(ge=0, le=100, description="YES outcome price in cents (0-100)")
    no_price: float = Field(ge=0, le=100, description="NO outcome price in cents (0-100)")
    volume: float = Field(ge=0, description="Total volume in USD")
    expires_at: datetime
    source: str = Field(description="Protocol source (e.g., 'hyperliquid')")


class CuratedMarket(BaseModel):
    """Market data after AI curation, ready for the frontend feed."""

    id: str
    question: str
    headline: str = Field(max_length=60, description="AI-curated punchy headline (max 6 words)")
    description: str = Field(description="AI-curated accessible description (max 2 sentences)")
    category: str
    yes_price: float = Field(ge=0, le=100)
    no_price: float = Field(ge=0, le=100)
    volume: float = Field(ge=0)
    expires_at: datetime
    source: str


class TradeRequest(BaseModel):
    """Incoming trade request from the frontend."""

    market_id: str
    intent: str = Field(pattern=r"^(yes|no)$", description="Trade direction")
    amount: float = Field(gt=0, description="Bet amount in USD")
    locked_price: float = Field(ge=0, le=100, description="Price locked at swipe time")


class TradeResult(BaseModel):
    """Result of a trade execution."""

    success: bool
    market_id: str
    intent: str
    amount: float
    executed_price: Optional[float] = None
    fee: Optional[float] = None
    error: Optional[str] = None


class MarketFeedResponse(BaseModel):
    """API response envelope for the market feed."""

    data: List[CuratedMarket]
    error: Optional[str] = None
    meta: Optional[Dict] = None


class MarketOddsResponse(BaseModel):
    """API response envelope for single market odds."""

    data: Optional[Dict] = None
    error: Optional[str] = None
    meta: Optional[Dict] = None
