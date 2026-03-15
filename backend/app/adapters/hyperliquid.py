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
MAINNET_EXCHANGE_URL = "https://api.hyperliquid.xyz/exchange"
TESTNET_EXCHANGE_URL = "https://api.hyperliquid-testnet.xyz/exchange"

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
        is_testnet = settings.hyperliquid_testnet
        self._base_url = TESTNET_INFO_URL if is_testnet else MAINNET_INFO_URL
        self._exchange_url = (
            TESTNET_EXCHANGE_URL if is_testnet else MAINNET_EXCHANGE_URL
        )
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
        raw_markets = (
            data
            if isinstance(data, list)
            else data.get("markets", data.get("data", []))
        )

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
        """Execute a Fill-Or-Kill (FOK) trade on Hyperliquid HIP-4.

        Submits an order to the Hyperliquid exchange API with FOK time-in-force
        so the trade either fills completely at the locked price or fails cleanly.
        """
        # Build the FOK order payload for HIP-4 prediction markets
        is_buy = trade.intent == "yes"
        # Price in decimal form (e.g., 65 cents → 0.65)
        limit_price = round(trade.locked_price / 100, 4)
        # Quantity in contracts (amount / price gives number of contracts)
        size = round(trade.amount / limit_price, 4) if limit_price > 0 else 0

        if size <= 0:
            return self._fail_result(
                trade, "Invalid trade size. Price too low to calculate position."
            )

        order_payload = {
            "type": "order",
            "orders": [
                {
                    "marketId": trade.market_id,
                    "isBuy": is_buy,
                    "limitPx": str(limit_price),
                    "sz": str(size),
                    "orderType": {"limit": {"tif": "FrontendMarket"}},
                    "reduceOnly": False,
                }
            ],
            "grouping": "na",
        }

        try:
            response = await self._client.post(
                self._exchange_url,
                json={"action": order_payload, "nonce": self._generate_nonce()},
            )
            response.raise_for_status()
            data = response.json()
        except httpx.TimeoutException:
            logger.error("Trade timed out for market %s", trade.market_id)
            return self._fail_result(
                trade, "Trade request timed out. Please try again."
            )
        except httpx.HTTPStatusError as e:
            logger.error("Trade HTTP error for market %s: %s", trade.market_id, e)
            return self._fail_result(
                trade, "Exchange returned an error. Please try again."
            )
        except httpx.HTTPError as e:
            logger.error("Trade network error for market %s: %s", trade.market_id, e)
            return self._fail_result(
                trade, "Network error during trade. Please try again."
            )

        # Parse exchange response
        status = data.get("status", "")
        statuses = data.get("response", {}).get("data", {}).get("statuses", [])

        if status == "ok" and statuses:
            first = statuses[0]
            if "filled" in first:
                filled = first["filled"]
                return TradeResult(
                    success=True,
                    market_id=trade.market_id,
                    intent=trade.intent,
                    amount=trade.amount,
                    executed_price=float(filled.get("avgPx", limit_price)) * 100,
                )
            elif "error" in first:
                return self._fail_result(trade, first["error"])

        # FOK not filled — trade failed cleanly
        error_msg = data.get("response", {}).get(
            "error", "Order not filled (FOK). Price may have moved."
        )
        return self._fail_result(trade, error_msg)

    @staticmethod
    def _fail_result(trade: TradeRequest, error: str) -> TradeResult:
        """Build a failure TradeResult from a trade request and error message."""
        return TradeResult(
            success=False,
            market_id=trade.market_id,
            intent=trade.intent,
            amount=trade.amount,
            error=error,
        )

    @staticmethod
    def _generate_nonce() -> int:
        """Generate a millisecond timestamp nonce for the exchange API."""
        return int(datetime.now(timezone.utc).timestamp() * 1000)

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
        expires_str = (
            item.get("expiresAt") or item.get("expires_at") or item.get("endDate")
        )
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
