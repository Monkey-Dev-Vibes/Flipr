from unittest.mock import AsyncMock, patch

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app
from app.models.market import TradeRequest, TradeResult
from app.services.trade_service import PLATFORM_FEE, TradeService

AUTH_HEADERS = {"Authorization": "Bearer test.mock.token"}

MOCK_ODDS = {
    "market_id": "mkt-001",
    "yes_price": 65.0,
    "no_price": 35.0,
    "last_updated": "2026-03-15T00:00:00+00:00",
}

MOCK_ODDS_SLIPPED = {
    "market_id": "mkt-001",
    "yes_price": 75.0,
    "no_price": 25.0,
    "last_updated": "2026-03-15T00:00:00+00:00",
}


@pytest.fixture(autouse=True)
def _reset_services():
    """Reset singleton services between tests."""
    import app.services.market_service as msvc
    import app.services.trade_service as tsvc

    msvc._market_service = None
    tsvc._trade_service = None
    yield
    msvc._market_service = None
    tsvc._trade_service = None


def _mock_auth():
    return patch(
        "app.core.security._verify_privy_token",
        new_callable=AsyncMock,
        return_value={"sub": "did:privy:test123"},
    )


# --- TradeService unit tests ---


@pytest.mark.asyncio
async def test_trade_service_success():
    """Successful trade with fee applied."""
    adapter = AsyncMock()
    adapter.fetch_market_odds = AsyncMock(return_value=MOCK_ODDS)
    adapter.execute_trade = AsyncMock(
        return_value=TradeResult(
            success=True,
            market_id="mkt-001",
            intent="yes",
            amount=10.0,
            executed_price=65.0,
        )
    )

    service = TradeService(adapter=adapter)
    trade = TradeRequest(
        market_id="mkt-001", intent="yes", amount=10.0, locked_price=65.0
    )
    result = await service.execute_trade(trade)

    assert result.success is True
    assert result.fee == PLATFORM_FEE
    assert result.executed_price == 65.0
    adapter.execute_trade.assert_called_once()


@pytest.mark.asyncio
async def test_trade_service_rejects_slippage():
    """Trade rejected when price has moved >5 cents."""
    adapter = AsyncMock()
    adapter.fetch_market_odds = AsyncMock(return_value=MOCK_ODDS_SLIPPED)

    service = TradeService(adapter=adapter)
    trade = TradeRequest(
        market_id="mkt-001", intent="yes", amount=10.0, locked_price=65.0
    )
    result = await service.execute_trade(trade)

    assert result.success is False
    assert "slippage" in result.error.lower()
    adapter.execute_trade.assert_not_called()


@pytest.mark.asyncio
async def test_trade_service_handles_odds_error():
    """Trade fails gracefully when odds fetch returns an error."""
    adapter = AsyncMock()
    adapter.fetch_market_odds = AsyncMock(
        return_value={"market_id": "mkt-001", "error": "Network timeout"}
    )

    service = TradeService(adapter=adapter)
    trade = TradeRequest(
        market_id="mkt-001", intent="yes", amount=10.0, locked_price=65.0
    )
    result = await service.execute_trade(trade)

    assert result.success is False
    assert "unavailable" in result.error.lower()


@pytest.mark.asyncio
async def test_trade_service_handles_odds_exception():
    """Trade fails gracefully when odds fetch raises an exception."""
    adapter = AsyncMock()
    adapter.fetch_market_odds = AsyncMock(side_effect=Exception("Connection refused"))

    service = TradeService(adapter=adapter)
    trade = TradeRequest(
        market_id="mkt-001", intent="yes", amount=10.0, locked_price=65.0
    )
    result = await service.execute_trade(trade)

    assert result.success is False
    assert "verify current odds" in result.error.lower()


@pytest.mark.asyncio
async def test_trade_service_adapter_failure():
    """Trade fails when adapter execute_trade returns failure."""
    adapter = AsyncMock()
    adapter.fetch_market_odds = AsyncMock(return_value=MOCK_ODDS)
    adapter.execute_trade = AsyncMock(
        return_value=TradeResult(
            success=False,
            market_id="mkt-001",
            intent="yes",
            amount=10.0,
            error="Order not filled (FOK)",
        )
    )

    service = TradeService(adapter=adapter)
    trade = TradeRequest(
        market_id="mkt-001", intent="yes", amount=10.0, locked_price=65.0
    )
    result = await service.execute_trade(trade)

    assert result.success is False
    assert result.fee is None


# --- API endpoint tests ---


@pytest.mark.asyncio
async def test_execute_trade_endpoint_success():
    with (
        _mock_auth(),
        patch(
            "app.adapters.hyperliquid.HyperliquidAdapter.fetch_market_odds",
            new_callable=AsyncMock,
            return_value=MOCK_ODDS,
        ),
        patch(
            "app.adapters.hyperliquid.HyperliquidAdapter.execute_trade",
            new_callable=AsyncMock,
            return_value=TradeResult(
                success=True,
                market_id="mkt-001",
                intent="yes",
                amount=10.0,
                executed_price=65.0,
            ),
        ),
    ):
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await client.post(
                "/trade/execute",
                headers=AUTH_HEADERS,
                json={
                    "market_id": "mkt-001",
                    "intent": "yes",
                    "amount": 10.0,
                    "locked_price": 65.0,
                },
            )

    assert response.status_code == 200
    body = response.json()
    assert body["data"]["success"] is True
    assert body["data"]["executed_price"] == 65.0
    assert body["data"]["fee"] == PLATFORM_FEE
    assert body["meta"]["total_charge"] == 10.0 + PLATFORM_FEE


@pytest.mark.asyncio
async def test_execute_trade_endpoint_slippage_rejection():
    with (
        _mock_auth(),
        patch(
            "app.adapters.hyperliquid.HyperliquidAdapter.fetch_market_odds",
            new_callable=AsyncMock,
            return_value=MOCK_ODDS_SLIPPED,
        ),
    ):
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await client.post(
                "/trade/execute",
                headers=AUTH_HEADERS,
                json={
                    "market_id": "mkt-001",
                    "intent": "yes",
                    "amount": 10.0,
                    "locked_price": 65.0,
                },
            )

    assert response.status_code == 200
    body = response.json()
    assert body["data"]["success"] is False
    assert "slippage" in body["error"].lower()


@pytest.mark.asyncio
async def test_execute_trade_requires_auth():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.post(
            "/trade/execute",
            json={
                "market_id": "mkt-001",
                "intent": "yes",
                "amount": 10.0,
                "locked_price": 65.0,
            },
        )

    assert response.status_code in (401, 403)


@pytest.mark.asyncio
async def test_execute_trade_validates_intent():
    with _mock_auth():
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await client.post(
                "/trade/execute",
                headers=AUTH_HEADERS,
                json={
                    "market_id": "mkt-001",
                    "intent": "maybe",
                    "amount": 10.0,
                    "locked_price": 65.0,
                },
            )

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_execute_trade_validates_amount():
    with _mock_auth():
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await client.post(
                "/trade/execute",
                headers=AUTH_HEADERS,
                json={
                    "market_id": "mkt-001",
                    "intent": "yes",
                    "amount": -5.0,
                    "locked_price": 65.0,
                },
            )

    assert response.status_code == 422
