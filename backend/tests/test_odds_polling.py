"""Tests for real-time odds polling and slippage-related scenarios."""

from unittest.mock import AsyncMock, patch

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


AUTH_HEADERS = {"Authorization": "Bearer test.mock.token"}


@pytest.fixture(autouse=True)
def _reset_services():
    """Reset singleton services between tests."""
    import app.services.market_service as svc

    svc._market_service = None
    yield
    svc._market_service = None


def _mock_auth():
    return patch(
        "app.core.security._verify_privy_token",
        new_callable=AsyncMock,
        return_value={"sub": "did:privy:test123"},
    )


@pytest.mark.asyncio
async def test_odds_polling_returns_updated_prices():
    """Simulate sequential polls returning different prices (odds movement)."""
    prices = [
        {
            "market_id": "mkt-1",
            "yes_price": 45.0,
            "no_price": 55.0,
            "last_updated": "t1",
        },
        {
            "market_id": "mkt-1",
            "yes_price": 48.0,
            "no_price": 52.0,
            "last_updated": "t2",
        },
        {
            "market_id": "mkt-1",
            "yes_price": 51.0,
            "no_price": 49.0,
            "last_updated": "t3",
        },
    ]
    mock_odds = AsyncMock(side_effect=prices)

    with (
        _mock_auth(),
        patch(
            "app.adapters.hyperliquid.HyperliquidAdapter.fetch_market_odds",
            mock_odds,
        ),
    ):
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            # Three rapid polls
            r1 = await client.get("/markets/mkt-1/odds", headers=AUTH_HEADERS)
            r2 = await client.get("/markets/mkt-1/odds", headers=AUTH_HEADERS)
            r3 = await client.get("/markets/mkt-1/odds", headers=AUTH_HEADERS)

    assert r1.json()["data"]["yes_price"] == 45.0
    assert r2.json()["data"]["yes_price"] == 48.0
    assert r3.json()["data"]["yes_price"] == 51.0
    assert mock_odds.call_count == 3


@pytest.mark.asyncio
async def test_odds_with_large_shift():
    """Ensure the endpoint returns accurate data even during a large price swing."""
    shifted_odds = {
        "market_id": "mkt-1",
        "yes_price": 80.0,
        "no_price": 20.0,
        "last_updated": "t1",
    }

    with (
        _mock_auth(),
        patch(
            "app.adapters.hyperliquid.HyperliquidAdapter.fetch_market_odds",
            new_callable=AsyncMock,
            return_value=shifted_odds,
        ),
    ):
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await client.get("/markets/mkt-1/odds", headers=AUTH_HEADERS)

    body = response.json()
    assert body["data"]["yes_price"] == 80.0
    assert body["data"]["no_price"] == 20.0


@pytest.mark.asyncio
async def test_odds_requires_auth():
    """Polling endpoint requires authentication."""
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get("/markets/mkt-1/odds")

    assert response.status_code == 401


@pytest.mark.asyncio
async def test_odds_adapter_error_returns_error_field():
    """When the adapter fails, the error field is populated."""
    with (
        _mock_auth(),
        patch(
            "app.adapters.hyperliquid.HyperliquidAdapter.fetch_market_odds",
            new_callable=AsyncMock,
            return_value={"market_id": "mkt-1", "error": "Connection timeout"},
        ),
    ):
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await client.get("/markets/mkt-1/odds", headers=AUTH_HEADERS)

    body = response.json()
    assert body["error"] == "Connection timeout"
    assert body["data"] is None
