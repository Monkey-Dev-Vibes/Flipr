"""Tests for the AI curation pipeline."""

from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.ai.curation import _fallback_curate, curate_markets
from app.models.market import RawMarket


def _make_raw(market_id: str = "mkt-001", question: str = "Will Bitcoin hit $150k by end of year?") -> RawMarket:
    return RawMarket(
        id=market_id,
        question=question,
        category="Crypto",
        yes_price=28,
        no_price=72,
        volume=2100000,
        expires_at=datetime(2026, 12, 31, tzinfo=timezone.utc),
        source="test",
    )


# --- Fallback curation tests ---


def test_fallback_curate_short_question():
    """Short questions should be used as-is for headline."""
    raw = _make_raw(question="Bitcoin to moon?")
    curated = _fallback_curate(raw)

    assert curated.id == raw.id
    assert curated.headline == "Bitcoin to moon?"
    assert curated.description == raw.question
    assert curated.yes_price == raw.yes_price


def test_fallback_curate_long_question():
    """Long questions should be truncated to 6 words with ellipsis."""
    raw = _make_raw(question="Will Bitcoin hit $150k by end of the year?")
    curated = _fallback_curate(raw)

    assert curated.headline == "Will Bitcoin hit $150k by end..."
    assert curated.description == raw.question


def test_fallback_curate_preserves_all_fields():
    """All raw market fields should carry through to curated output."""
    raw = _make_raw()
    curated = _fallback_curate(raw)

    assert curated.id == raw.id
    assert curated.question == raw.question
    assert curated.category == raw.category
    assert curated.yes_price == raw.yes_price
    assert curated.no_price == raw.no_price
    assert curated.volume == raw.volume
    assert curated.expires_at == raw.expires_at
    assert curated.source == raw.source


# --- AI curation tests ---


@pytest.mark.asyncio
async def test_curate_markets_empty_list():
    """Empty input should return empty output without calling API."""
    result = await curate_markets([])
    assert result == []


@pytest.mark.asyncio
@patch("app.ai.curation.settings")
@patch("app.ai.curation.get_anthropic_client")
async def test_curate_markets_success(mock_get_client, mock_settings):
    """Successful AI curation should merge AI output with raw market data."""
    mock_settings.anthropic_api_key = "test-key"
    mock_response = MagicMock()
    mock_response.content = [
        MagicMock(
            text='[{"market_id": "mkt-001", "headline": "Bitcoin 150k Incoming", "description": "Bitcoin might hit $150k. Traders are watching closely."}]'
        )
    ]

    mock_client = AsyncMock()
    mock_client.messages.create = AsyncMock(return_value=mock_response)
    mock_get_client.return_value = mock_client

    raw = [_make_raw()]
    result = await curate_markets(raw)

    assert len(result) == 1
    assert result[0].id == "mkt-001"
    assert result[0].headline == "Bitcoin 150k Incoming"
    assert result[0].description == "Bitcoin might hit $150k. Traders are watching closely."
    assert result[0].yes_price == 28
    assert result[0].category == "Crypto"


@pytest.mark.asyncio
@patch("app.ai.curation.settings")
@patch("app.ai.curation.get_anthropic_client")
async def test_curate_markets_api_failure_falls_back(mock_get_client, mock_settings):
    """When the API call fails, all markets should get fallback curation."""
    mock_settings.anthropic_api_key = "test-key"
    mock_client = AsyncMock()
    mock_client.messages.create = AsyncMock(side_effect=Exception("API down"))
    mock_get_client.return_value = mock_client

    raw = [_make_raw()]
    result = await curate_markets(raw)

    assert len(result) == 1
    assert result[0].id == "mkt-001"
    # Fallback headline is first 6 words
    assert "Will Bitcoin hit" in result[0].headline


@pytest.mark.asyncio
@patch("app.ai.curation.settings")
@patch("app.ai.curation.get_anthropic_client")
async def test_curate_markets_partial_response(mock_get_client, mock_settings):
    """If AI only curates some markets, the rest should get fallback curation."""
    mock_settings.anthropic_api_key = "test-key"
    mock_response = MagicMock()
    mock_response.content = [
        MagicMock(
            text='[{"market_id": "mkt-001", "headline": "BTC Surge", "description": "Bitcoin is surging. Will it last?"}]'
        )
    ]

    mock_client = AsyncMock()
    mock_client.messages.create = AsyncMock(return_value=mock_response)
    mock_get_client.return_value = mock_client

    raw = [_make_raw("mkt-001"), _make_raw("mkt-002", "Will GTA VI be delayed?")]
    result = await curate_markets(raw)

    assert len(result) == 2
    by_id = {m.id: m for m in result}
    # mkt-001 should have AI-curated headline
    assert by_id["mkt-001"].headline == "BTC Surge"
    assert by_id["mkt-001"].description == "Bitcoin is surging. Will it last?"
    # mkt-002 should have fallback headline (first 6 words)
    assert by_id["mkt-002"].headline == "Will GTA VI be delayed?"


@pytest.mark.asyncio
@patch("app.ai.curation.settings")
@patch("app.ai.curation.get_anthropic_client")
async def test_curate_markets_invalid_json_falls_back(mock_get_client, mock_settings):
    """Invalid JSON from AI should trigger fallback for all markets."""
    mock_settings.anthropic_api_key = "test-key"
    mock_response = MagicMock()
    mock_response.content = [MagicMock(text="not valid json {{{")]

    mock_client = AsyncMock()
    mock_client.messages.create = AsyncMock(return_value=mock_response)
    mock_get_client.return_value = mock_client

    raw = [_make_raw()]
    result = await curate_markets(raw)

    assert len(result) == 1
    assert result[0].id == "mkt-001"
    # Should be fallback-curated
    assert "Will Bitcoin hit" in result[0].headline
