import asyncio
import logging
from datetime import datetime, timezone
from typing import List, Optional

from app.adapters.base import BaseMarketAdapter
from app.adapters.hyperliquid import HyperliquidAdapter
from app.ai.curation import curate_markets
from app.models.market import CuratedMarket

logger = logging.getLogger(__name__)

# How often the background cron refreshes markets (seconds)
CURATION_INTERVAL = 300  # 5 minutes


class MarketService:
    """Service layer for fetching, curating, and serving market data.

    Uses Claude AI to generate punchy headlines and accessible descriptions.
    Falls back to naive curation when the API key is not configured.
    """

    def __init__(self, adapter: Optional[BaseMarketAdapter] = None) -> None:
        self._adapter = adapter or HyperliquidAdapter()
        self._cached_markets: List[CuratedMarket] = []
        self._last_fetched: Optional[datetime] = None
        self._cron_task: Optional[asyncio.Task] = None

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
        """Fetch raw markets and run AI curation pipeline."""
        raw_markets = await self._adapter.fetch_markets()
        self._cached_markets = await curate_markets(raw_markets)
        self._last_fetched = datetime.now(timezone.utc)
        logger.info("Refreshed %d markets", len(self._cached_markets))
        return len(self._cached_markets)

    async def _refresh_if_needed(self) -> None:
        """Refresh if cache is empty or older than the curation interval."""
        if self._last_fetched is None:
            await self.refresh_markets()
            return

        age = (datetime.now(timezone.utc) - self._last_fetched).total_seconds()
        if age > CURATION_INTERVAL:
            await self.refresh_markets()

    def start_cron(self) -> None:
        """Start the background curation cron job."""
        if self._cron_task is None:
            self._cron_task = asyncio.create_task(self._cron_loop())
            logger.info("Started curation cron (every %ds)", CURATION_INTERVAL)

    def stop_cron(self) -> None:
        """Stop the background curation cron job."""
        if self._cron_task is not None:
            self._cron_task.cancel()
            self._cron_task = None
            logger.info("Stopped curation cron")

    async def _cron_loop(self) -> None:
        """Background loop that refreshes markets every CURATION_INTERVAL."""
        while True:
            try:
                await asyncio.sleep(CURATION_INTERVAL)
                await self.refresh_markets()
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error("Curation cron error: %s", e)
                # Continue running — next cycle may succeed


# Singleton instance for dependency injection
_market_service: Optional[MarketService] = None


def get_market_service() -> MarketService:
    """Get or create the market service singleton."""
    global _market_service
    if _market_service is None:
        _market_service = MarketService()
    return _market_service
