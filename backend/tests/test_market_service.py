from datetime import datetime, timedelta, timezone

import pytest

from app.adapters.base import BaseMarketAdapter
from app.models.market import RawMarket, TradeRequest, TradeResult
from app.services.market_service import MarketService


MOCK_RAW_MARKETS = [
    RawMarket(
        id="mkt-001",
        question="Will Bitcoin hit $150k this year?",
        category="Crypto",
        yes_price=28,
        no_price=72,
        volume=2100000,
        expires_at=datetime(2026, 12, 31, tzinfo=timezone.utc),
        source="test",
    ),
]


class MockAdapter(BaseMarketAdapter):
    """Test adapter that tracks call counts."""

    def __init__(self):
        self.fetch_markets_call_count = 0
        self.markets_to_return = MOCK_RAW_MARKETS

    @property
    def source_name(self) -> str:
        return "mock"

    async def fetch_markets(self):
        self.fetch_markets_call_count += 1
        return self.markets_to_return

    async def fetch_market_odds(self, market_id: str):
        return {
            "market_id": market_id,
            "yes_price": 30.0,
            "no_price": 70.0,
            "last_updated": datetime.now(timezone.utc).isoformat(),
        }

    async def execute_trade(self, trade: TradeRequest) -> TradeResult:
        return TradeResult(
            success=False,
            market_id=trade.market_id,
            intent=trade.intent,
            amount=trade.amount,
            error="Mock adapter",
        )


@pytest.mark.asyncio
async def test_cache_hit_does_not_refetch():
    """Second call within 5 minutes should use cache, not call adapter again."""
    adapter = MockAdapter()
    service = MarketService(adapter=adapter)

    result1 = await service.get_feed()
    result2 = await service.get_feed()

    assert adapter.fetch_markets_call_count == 1
    assert len(result1) == 1
    assert len(result2) == 1


@pytest.mark.asyncio
async def test_cache_expiry_triggers_refetch():
    """After 5 minutes, cache should expire and adapter should be called again."""
    adapter = MockAdapter()
    service = MarketService(adapter=adapter)

    await service.get_feed()
    assert adapter.fetch_markets_call_count == 1

    # Simulate cache expiry by backdating _last_fetched
    service._last_fetched = datetime.now(timezone.utc) - timedelta(minutes=6)

    await service.get_feed()
    assert adapter.fetch_markets_call_count == 2


@pytest.mark.asyncio
async def test_force_refresh_updates_cache():
    """refresh_markets() should always call adapter regardless of cache age."""
    adapter = MockAdapter()
    service = MarketService(adapter=adapter)

    await service.get_feed()  # Initial fetch
    count = await service.refresh_markets()  # Force refresh

    assert adapter.fetch_markets_call_count == 2
    assert count == 1


@pytest.mark.asyncio
async def test_raw_to_curated_maps_fields():
    """Curated market should have all fields from raw market plus headline/description."""
    adapter = MockAdapter()
    service = MarketService(adapter=adapter)

    feed = await service.get_feed()
    market = feed[0]

    assert market.id == "mkt-001"
    assert market.question == "Will Bitcoin hit $150k this year?"
    assert market.yes_price == 28
    assert market.category == "Crypto"
    assert market.source == "test"
    assert market.headline  # Should be non-empty
    assert market.description  # Should be non-empty
