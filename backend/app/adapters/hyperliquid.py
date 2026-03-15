import logging
import re
from datetime import datetime, timezone
from typing import List, Optional

import httpx

from app.adapters.base import BaseMarketAdapter
from app.core.config import settings
from app.models.market import RawMarket, TradeRequest, TradeResult

logger = logging.getLogger(__name__)

# Hyperliquid HIP-4 API endpoints
MAINNET_INFO_URL = "https://api.hyperliquid.xyz/info"
TESTNET_INFO_URL = "https://api.hyperliquid-testnet.xyz/info"

# Category mapping for common market topics
CATEGORY_KEYWORDS = {
    "btc": "Crypto",
    "bitcoin": "Crypto",
    "eth": "Crypto",
    "ethereum": "Crypto",
    "crypto": "Crypto",
    "fed": "Finance",
    "rate": "Finance",
    "gdp": "Finance",
    "inflation": "Finance",
    "stock": "Finance",
    "election": "Politics",
    "president": "Politics",
    "vote": "Politics",
    "trump": "Politics",
    "biden": "Politics",
    "ai": "Tech",
    "apple": "Tech",
    "google": "Tech",
    "microsoft": "Tech",
    "super bowl": "Sports",
    "nba": "Sports",
    "nfl": "Sports",
    "world cup": "Sports",
    "oscar": "Entertainment",
    "movie": "Entertainment",
    "album": "Entertainment",
    "taylor": "Entertainment",
}


def _categorize(question: str) -> str:
    """Infer category from market question text."""
    lower = question.lower()
    for keyword, category in CATEGORY_KEYWORDS.items():
        # Use word boundary for short keywords to avoid false matches (e.g., "ai" in "rain")
        if len(keyword) <= 3:
            if re.search(r"\b" + re.escape(keyword) + r"\b", lower):
                return category
        elif keyword in lower:
            return category
    return "General"


class HyperliquidAdapter(BaseMarketAdapter):
    """Adapter for Hyperliquid HIP-4 prediction markets."""

    def __init__(self) -> None:
        self._base_url = TESTNET_INFO_URL if settings.hyperliquid_testnet else MAINNET_INFO_URL
        self._client = httpx.AsyncClient(timeout=10.0)

    @property
    def source_name(self) -> str:
        return "hyperliquid"

    async def close(self) -> None:
        """Close the underlying HTTP client."""
        await self._client.aclose()

    async def fetch_markets(self) -> List[RawMarket]:
        """Fetch active HIP-4 prediction markets from Hyperliquid."""
        try:
            response = await self._client.post(
                self._base_url,
                json={"type": "predictionsMarketsInfo"},
            )
            response.raise_for_status()
            data = response.json()
        except httpx.HTTPError as e:
            logger.error("Failed to fetch Hyperliquid markets: %s", e)
            return []

        markets: List[RawMarket] = []
        raw_markets = data if isinstance(data, list) else data.get("markets", data.get("data", []))

        for item in raw_markets:
            try:
                market = self._parse_market(item)
                if market:
                    markets.append(market)
            except (KeyError, ValueError, TypeError) as e:
                logger.warning("Skipping malformed market entry: %s", e)
                continue

        logger.info("Fetched %d markets from Hyperliquid", len(markets))
        return markets

    async def fetch_market_odds(self, market_id: str) -> dict:
        """Fetch current odds for a specific HIP-4 market."""
        try:
            response = await self._client.post(
                self._base_url,
                json={"type": "predictionsMarketInfo", "marketId": market_id},
            )
            response.raise_for_status()
            data = response.json()
        except httpx.HTTPError as e:
            logger.error("Failed to fetch odds for market %s: %s", market_id, e)
            return {"market_id": market_id, "error": str(e)}

        # Parse odds from response
        yes_price = float(data.get("yesPrice", data.get("yes_price", 50)))
        no_price = float(data.get("noPrice", data.get("no_price", 50)))

        return {
            "market_id": market_id,
            "yes_price": yes_price,
            "no_price": no_price,
            "last_updated": datetime.now(timezone.utc).isoformat(),
        }

    async def execute_trade(self, trade: TradeRequest) -> TradeResult:
        """Execute a FOK trade on Hyperliquid.

        Note: Full trade execution will be implemented in Sprint 7.
        This placeholder validates the interface contract.
        """
        # Sprint 7 will implement signed L1 transaction routing
        return TradeResult(
            success=False,
            market_id=trade.market_id,
            intent=trade.intent,
            amount=trade.amount,
            error="Trade execution not yet implemented (Sprint 7)",
        )

    def _parse_market(self, item: dict) -> Optional[RawMarket]:
        """Parse a raw Hyperliquid market entry into a RawMarket model."""
        market_id = item.get("id") or item.get("marketId") or item.get("market_id")
        question = item.get("question") or item.get("name") or item.get("title")

        if not market_id or not question:
            return None

        # Parse prices — Hyperliquid may return as decimal (0.65) or cents (65)
        yes_raw = float(item.get("yesPrice", item.get("yes_price", 50)))
        no_raw = float(item.get("noPrice", item.get("no_price", 50)))

        # Normalize to cents (0-100): infer format from both prices together.
        # If either price > 1.0, both are already in cents. Otherwise both are decimal.
        is_decimal = yes_raw <= 1.0 and no_raw <= 1.0
        yes_price = yes_raw * 100 if is_decimal else yes_raw
        no_price = no_raw * 100 if is_decimal else no_raw

        volume = float(item.get("volume", item.get("totalVolume", 0)))
        expires_str = item.get("expiresAt") or item.get("expires_at") or item.get("endDate")
        expires_at = (
            datetime.fromisoformat(expires_str.replace("Z", "+00:00"))
            if expires_str
            else datetime(2099, 12, 31, tzinfo=timezone.utc)
        )

        return RawMarket(
            id=str(market_id),
            question=question,
            category=_categorize(question),
            yes_price=yes_price,
            no_price=no_price,
            volume=volume,
            expires_at=expires_at,
            source=self.source_name,
        )
