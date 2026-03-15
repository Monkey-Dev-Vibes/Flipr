import logging
import random
from typing import Optional

from app.adapters.base import BaseMarketAdapter
from app.core.config import settings
from app.models.market import TradeRequest, TradeResult

logger = logging.getLogger(__name__)

# Platform convenience fee in USD (per PRD §2.2)
PLATFORM_FEE = 0.50

# Maximum allowed slippage between locked price and current price (cents)
MAX_SLIPPAGE = 5.0


class TradeService:
    """Handles trade execution, fee calculation, and order routing."""

    def __init__(self, adapter: BaseMarketAdapter) -> None:
        self._adapter = adapter

    @property
    def adapter(self) -> BaseMarketAdapter:
        return self._adapter

    async def execute_trade(self, trade: TradeRequest) -> TradeResult:
        """Execute a trade with fee calculation and slippage protection.

        Flow:
        1. Fetch current odds and check slippage against locked_price
        2. If slippage > MAX_SLIPPAGE, reject the trade
        3. Execute FOK order via adapter
        4. Apply platform fee on success
        """
        # Debug mode: simulate trades with mock results
        if settings.debug:
            return self._mock_execute(trade)

        # 1. Pre-trade slippage check
        try:
            current_odds = await self._adapter.fetch_market_odds(trade.market_id)
        except Exception as e:
            logger.error("Failed to fetch odds for slippage check: %s", e)
            return TradeResult(
                success=False,
                market_id=trade.market_id,
                intent=trade.intent,
                amount=trade.amount,
                error="Unable to verify current odds. Please try again.",
            )

        if "error" in current_odds:
            return TradeResult(
                success=False,
                market_id=trade.market_id,
                intent=trade.intent,
                amount=trade.amount,
                error=f"Market odds unavailable: {current_odds['error']}",
            )

        # Compare locked price to current price
        price_key = "yes_price" if trade.intent == "yes" else "no_price"
        current_price = float(current_odds.get(price_key, 0))
        slippage = abs(current_price - trade.locked_price)

        if slippage > MAX_SLIPPAGE:
            logger.warning(
                "Trade rejected: slippage %.1f¢ > %.1f¢ (market=%s, locked=%.1f, current=%.1f)",
                slippage,
                MAX_SLIPPAGE,
                trade.market_id,
                trade.locked_price,
                current_price,
            )
            return TradeResult(
                success=False,
                market_id=trade.market_id,
                intent=trade.intent,
                amount=trade.amount,
                error=f"Price moved too much ({slippage:.1f}¢ slippage). Please refresh and try again.",
            )

        # 2. Execute through adapter (FOK order)
        result = await self._adapter.execute_trade(trade)

        # 3. Apply fee on success
        if result.success:
            result.fee = PLATFORM_FEE
            logger.info(
                "Trade executed: market=%s intent=%s amount=$%.2f fee=$%.2f price=%.1f¢",
                result.market_id,
                result.intent,
                result.amount,
                result.fee,
                result.executed_price or 0,
            )
        else:
            logger.warning(
                "Trade failed: market=%s intent=%s error=%s",
                result.market_id,
                result.intent,
                result.error,
            )

        return result

    @staticmethod
    def _mock_execute(trade: TradeRequest) -> TradeResult:
        """Simulate a trade in debug mode. ~80% success rate."""
        succeeds = random.random() < 0.8
        if succeeds:
            executed_price = trade.locked_price + random.uniform(-2, 2)
            logger.info(
                "[MOCK] Trade executed: market=%s intent=%s amount=$%.2f",
                trade.market_id, trade.intent, trade.amount,
            )
            return TradeResult(
                success=True,
                market_id=trade.market_id,
                intent=trade.intent,
                amount=trade.amount,
                executed_price=round(executed_price, 1),
                fee=PLATFORM_FEE,
            )
        else:
            logger.info("[MOCK] Trade failed: market=%s", trade.market_id)
            return TradeResult(
                success=False,
                market_id=trade.market_id,
                intent=trade.intent,
                amount=trade.amount,
                error="[Mock] Insufficient liquidity. Try again.",
            )


# Singleton instance
_trade_service: Optional[TradeService] = None


def get_trade_service() -> TradeService:
    """Get or create the trade service singleton.

    Shares the adapter from MarketService to avoid duplicate HTTP clients.
    """
    global _trade_service
    if _trade_service is None:
        from app.services.market_service import get_market_service

        _trade_service = TradeService(adapter=get_market_service().adapter)
    return _trade_service
