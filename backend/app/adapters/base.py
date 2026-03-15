from abc import ABC, abstractmethod
from typing import Dict, List

from app.models.market import RawMarket, TradeRequest, TradeResult


class BaseMarketAdapter(ABC):
    """Abstract base class for protocol market adapters.

    Each adapter connects to a specific prediction market protocol
    (e.g., Hyperliquid, Polymarket) and provides a unified interface
    for fetching markets and executing trades.
    """

    @property
    @abstractmethod
    def source_name(self) -> str:
        """Return the protocol name (e.g., 'hyperliquid')."""
        ...

    @abstractmethod
    async def fetch_markets(self) -> List[RawMarket]:
        """Fetch all active prediction markets from the protocol."""
        ...

    @abstractmethod
    async def fetch_market_odds(self, market_id: str) -> Dict:
        """Fetch current odds for a specific market.

        Returns dict with keys: market_id, yes_price, no_price, last_updated
        """
        ...

    @abstractmethod
    async def execute_trade(self, trade: TradeRequest) -> TradeResult:
        """Execute a trade on the protocol.

        Must use Fill-Or-Kill (FOK) order type for safety.
        """
        ...

    async def close(self) -> None:
        """Clean up resources (e.g., HTTP clients). Override if needed."""
        pass
