from unittest.mock import AsyncMock, patch

import httpx
import pytest

from app.adapters.base import BaseMarketAdapter
from app.adapters.hyperliquid import HyperliquidAdapter, _categorize
from app.models.market import TradeRequest, TradeResult


# --- BaseMarketAdapter contract tests ---


def test_hyperliquid_adapter_is_base_adapter():
    adapter = HyperliquidAdapter()
    assert isinstance(adapter, BaseMarketAdapter)


def test_hyperliquid_source_name():
    adapter = HyperliquidAdapter()
    assert adapter.source_name == "hyperliquid"


# --- Category inference tests ---


@pytest.mark.parametrize(
    "question,expected",
    [
        ("Will Bitcoin hit $100k?", "Crypto"),
        ("Will the Fed cut rates?", "Finance"),
        ("Will Trump win the election?", "Politics"),
        ("Will Apple release AR glasses?", "Tech"),
        ("Will the NBA finals go to 7 games?", "Sports"),
        ("Will a new Taylor Swift album drop?", "Entertainment"),
        ("Will it rain tomorrow?", "General"),
    ],
)
def test_categorize(question, expected):
    assert _categorize(question) == expected


# --- Market parsing tests ---


def test_parse_market_decimal_prices():
    adapter = HyperliquidAdapter()
    item = {
        "id": "mkt-1",
        "question": "Will Bitcoin hit $200k?",
        "yesPrice": 0.65,
        "noPrice": 0.35,
        "volume": 100000,
        "expiresAt": "2026-12-31T23:59:59Z",
    }
    market = adapter._parse_market(item)
    assert market is not None
    assert market.id == "mkt-1"
    assert market.yes_price == 65.0
    assert market.no_price == 35.0
    assert market.category == "Crypto"
    assert market.source == "hyperliquid"


def test_parse_market_cent_prices():
    adapter = HyperliquidAdapter()
    item = {
        "marketId": "mkt-2",
        "name": "Will the Fed raise rates?",
        "yes_price": 42,
        "no_price": 58,
        "totalVolume": 500000,
        "endDate": "2026-06-30T00:00:00+00:00",
    }
    market = adapter._parse_market(item)
    assert market is not None
    assert market.id == "mkt-2"
    assert market.yes_price == 42.0
    assert market.no_price == 58.0
    assert market.category == "Finance"


def test_parse_market_missing_id_returns_none():
    adapter = HyperliquidAdapter()
    item = {"question": "No ID here", "yesPrice": 0.5, "noPrice": 0.5}
    assert adapter._parse_market(item) is None


def test_parse_market_missing_question_returns_none():
    adapter = HyperliquidAdapter()
    item = {"id": "mkt-3", "yesPrice": 0.5, "noPrice": 0.5}
    assert adapter._parse_market(item) is None


# --- Trade execution tests ---


def _make_trade(market_id="mkt-1", intent="yes", amount=10.0, locked_price=65.0):
    return TradeRequest(
        market_id=market_id, intent=intent, amount=amount, locked_price=locked_price
    )


def _mock_exchange_response(json_data, status_code=200):
    """Create a mock httpx.Response for the exchange API."""
    return httpx.Response(
        status_code=status_code,
        json=json_data,
        request=httpx.Request("POST", "https://test/exchange"),
    )


@pytest.mark.asyncio
async def test_execute_trade_filled():
    """Successful fill returns TradeResult with executed price."""
    adapter = HyperliquidAdapter()
    mock_response = _mock_exchange_response(
        {
            "status": "ok",
            "response": {"data": {"statuses": [{"filled": {"avgPx": "0.64"}}]}},
        }
    )
    with patch.object(
        adapter._client, "post", new_callable=AsyncMock, return_value=mock_response
    ):
        result = await adapter.execute_trade(_make_trade())

    assert isinstance(result, TradeResult)
    assert result.success is True
    assert result.executed_price == 64.0
    assert result.market_id == "mkt-1"


@pytest.mark.asyncio
async def test_execute_trade_exchange_error():
    """Exchange returns an error status in the order response."""
    adapter = HyperliquidAdapter()
    mock_response = _mock_exchange_response(
        {
            "status": "ok",
            "response": {"data": {"statuses": [{"error": "Insufficient margin"}]}},
        }
    )
    with patch.object(
        adapter._client, "post", new_callable=AsyncMock, return_value=mock_response
    ):
        result = await adapter.execute_trade(_make_trade())

    assert result.success is False
    assert result.error == "Insufficient margin"


@pytest.mark.asyncio
async def test_execute_trade_fok_not_filled():
    """FOK order not filled returns clean failure."""
    adapter = HyperliquidAdapter()
    mock_response = _mock_exchange_response(
        {
            "status": "err",
            "response": {"error": "No liquidity at requested price"},
        }
    )
    with patch.object(
        adapter._client, "post", new_callable=AsyncMock, return_value=mock_response
    ):
        result = await adapter.execute_trade(_make_trade())

    assert result.success is False
    assert "liquidity" in result.error.lower()


@pytest.mark.asyncio
async def test_execute_trade_timeout():
    """Timeout during trade returns user-friendly error."""
    adapter = HyperliquidAdapter()
    with patch.object(
        adapter._client,
        "post",
        new_callable=AsyncMock,
        side_effect=httpx.ReadTimeout("timed out"),
    ):
        result = await adapter.execute_trade(_make_trade())

    assert result.success is False
    assert "timed out" in result.error.lower()


@pytest.mark.asyncio
async def test_execute_trade_zero_price():
    """Trade with locked_price=0 returns error without HTTP call."""
    adapter = HyperliquidAdapter()
    trade = _make_trade(locked_price=0)
    result = await adapter.execute_trade(trade)

    assert result.success is False
    assert "invalid" in result.error.lower()
