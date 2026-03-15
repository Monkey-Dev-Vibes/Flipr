
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


# --- Trade execution placeholder test ---


@pytest.mark.asyncio
async def test_execute_trade_returns_not_implemented():
    adapter = HyperliquidAdapter()
    trade = TradeRequest(
        market_id="mkt-1",
        intent="yes",
        amount=10.0,
        locked_price=65.0,
    )
    result = await adapter.execute_trade(trade)
    assert isinstance(result, TradeResult)
    assert result.success is False
    assert "Sprint 7" in result.error
