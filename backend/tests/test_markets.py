from datetime import datetime, timezone
from unittest.mock import AsyncMock, patch

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app
from app.models.market import RawMarket


MOCK_RAW_MARKETS = [
    RawMarket(
        id="mkt-001",
        question="Will Bitcoin hit $150k this year?",
        category="Crypto",
        yes_price=28,
        no_price=72,
        volume=2100000,
        expires_at=datetime(2026, 12, 31, tzinfo=timezone.utc),
        source="hyperliquid",
    ),
    RawMarket(
        id="mkt-002",
        question="Will the Fed cut rates in June?",
        category="Finance",
        yes_price=42,
        no_price=58,
        volume=892000,
        expires_at=datetime(2026, 6, 30, tzinfo=timezone.utc),
        source="hyperliquid",
    ),
]

MOCK_ODDS = {
    "market_id": "mkt-001",
    "yes_price": 30.0,
    "no_price": 70.0,
    "last_updated": "2026-03-15T00:00:00+00:00",
}


@pytest.fixture(autouse=True)
def _reset_market_service():
    """Reset the singleton market service between tests."""
    import app.services.market_service as svc

    svc._market_service = None
    yield
    svc._market_service = None


@pytest.mark.asyncio
async def test_feed_returns_markets():
    with patch(
        "app.adapters.hyperliquid.HyperliquidAdapter.fetch_markets",
        new_callable=AsyncMock,
        return_value=MOCK_RAW_MARKETS,
    ):
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await client.get("/markets/feed")

    assert response.status_code == 200
    body = response.json()
    assert body["error"] is None
    assert len(body["data"]) == 2
    assert body["data"][0]["id"] == "mkt-001"
    assert body["data"][0]["yes_price"] == 28
    assert body["meta"]["count"] == 2


@pytest.mark.asyncio
async def test_feed_respects_limit():
    with patch(
        "app.adapters.hyperliquid.HyperliquidAdapter.fetch_markets",
        new_callable=AsyncMock,
        return_value=MOCK_RAW_MARKETS,
    ):
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await client.get("/markets/feed?limit=1")

    assert response.status_code == 200
    body = response.json()
    assert len(body["data"]) == 1


@pytest.mark.asyncio
async def test_feed_empty_when_adapter_fails():
    with patch(
        "app.adapters.hyperliquid.HyperliquidAdapter.fetch_markets",
        new_callable=AsyncMock,
        return_value=[],
    ):
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await client.get("/markets/feed")

    assert response.status_code == 200
    body = response.json()
    assert body["data"] == []


@pytest.mark.asyncio
async def test_odds_returns_market_odds():
    with patch(
        "app.adapters.hyperliquid.HyperliquidAdapter.fetch_market_odds",
        new_callable=AsyncMock,
        return_value=MOCK_ODDS,
    ):
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await client.get("/markets/mkt-001/odds")

    assert response.status_code == 200
    body = response.json()
    assert body["data"]["market_id"] == "mkt-001"
    assert body["data"]["yes_price"] == 30.0


@pytest.mark.asyncio
async def test_odds_returns_error_on_failure():
    with patch(
        "app.adapters.hyperliquid.HyperliquidAdapter.fetch_market_odds",
        new_callable=AsyncMock,
        return_value={"market_id": "mkt-999", "error": "Not found"},
    ):
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await client.get("/markets/mkt-999/odds")

    assert response.status_code == 200
    body = response.json()
    assert body["error"] == "Not found"
    assert body["data"] is None
