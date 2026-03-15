import logging
from datetime import datetime, timezone
from typing import List, Optional

from app.adapters.base import BaseMarketAdapter
from app.adapters.hyperliquid import HyperliquidAdapter
from app.models.market import CuratedMarket, RawMarket

logger = logging.getLogger(__name__)


class MarketService:
    """Service layer for fetching and serving market data.

    Pre-curation: serves raw markets with question as headline/description.
    Sprint 5 will add AI curation via Claude.
    """

    def __init__(self, adapter: Optional[BaseMarketAdapter] = None) -> None:
        self._adapter = adapter or HyperliquidAdapter()
        self._cached_markets: List[CuratedMarket] = []
        self._last_fetched: Optional[datetime] = None

    @property
    def adapter(self) -> BaseMarketAdapter:
        return self._adapter

    async def get_feed(self, limit: int = 20, offset: int = 0) -> List[CuratedMarket]:
        """Return curated market feed, refreshing from adapter if stale."""
        await self._refresh_if_needed()
        return self._cached_markets[offset : offset + limit]

    async def get_market_odds(self, market_id: str) -> dict:
        """Fetch live odds for a specific market."""
        return await self._adapter.fetch_market_odds(market_id)

    async def refresh_markets(self) -> int:
        """Force refresh markets from the adapter."""
        raw_markets = await self._adapter.fetch_markets()
        self._cached_markets = [self._raw_to_curated(m) for m in raw_markets]
        self._last_fetched = datetime.now(timezone.utc)
        logger.info("Refreshed %d markets", len(self._cached_markets))
        return len(self._cached_markets)

    async def _refresh_if_needed(self) -> None:
        """Refresh if cache is empty or older than 5 minutes."""
        if self._last_fetched is None:
            await self.refresh_markets()
            return

        age = (datetime.now(timezone.utc) - self._last_fetched).total_seconds()
        if age > 300:  # 5 minutes
            await self.refresh_markets()

    @staticmethod
    def _raw_to_curated(raw: RawMarket) -> CuratedMarket:
        """Convert raw market to curated format.

        Pre-AI curation: uses raw question as both headline and description.
        Sprint 5 will replace this with Claude-generated content.
        """
        # Truncate question to make a headline (first ~6 words)
        words = raw.question.split()
        headline = " ".join(words[:6])
        if len(words) > 6:
            headline += "..."

        return CuratedMarket(
            id=raw.id,
            question=raw.question,
            headline=headline,
            description=raw.question,
            category=raw.category,
            yes_price=raw.yes_price,
            no_price=raw.no_price,
            volume=raw.volume,
            expires_at=raw.expires_at,
            source=raw.source,
        )


# Singleton instance for dependency injection
_market_service: Optional[MarketService] = None


def get_market_service() -> MarketService:
    """Get or create the market service singleton."""
    global _market_service
    if _market_service is None:
        _market_service = MarketService()
    return _market_service
