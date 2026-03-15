"""AI curation service — transforms raw markets into curated card content."""

import json
import logging
from typing import Dict, List

from app.ai.client import CURATION_MODEL, get_anthropic_client
from app.ai.prompts import CURATION_SYSTEM_PROMPT, CURATION_USER_PROMPT
from app.core.config import settings
from app.models.market import CuratedMarket, RawMarket

logger = logging.getLogger(__name__)

# Max markets to send in a single curation request
BATCH_SIZE = 20


async def curate_markets(
    raw_markets: List[RawMarket],
) -> List[CuratedMarket]:
    """Curate a list of raw markets using Claude.

    If ANTHROPIC_API_KEY is not configured, falls back to naive curation.
    Otherwise sends markets to Claude in batches, parses the JSON response,
    and merges AI-generated headlines/descriptions with raw market data.
    Any markets the AI misses also get fallback curation.
    """
    if not raw_markets:
        return []

    if not settings.anthropic_api_key:
        logger.warning("ANTHROPIC_API_KEY not set — using fallback curation")
        return [_fallback_curate(m) for m in raw_markets]

    # Build lookup for merging AI output back with raw data
    raw_by_id: Dict[str, RawMarket] = {m.id: m for m in raw_markets}
    curated: List[CuratedMarket] = []

    # Process in batches
    for i in range(0, len(raw_markets), BATCH_SIZE):
        batch = raw_markets[i : i + BATCH_SIZE]
        ai_results = await _curate_batch(batch)

        for result in ai_results:
            market_id = result.get("market_id", "")
            raw = raw_by_id.get(market_id)
            if raw is None:
                logger.warning("AI returned unknown market_id: %s", market_id)
                continue

            curated.append(
                CuratedMarket(
                    id=raw.id,
                    question=raw.question,
                    headline=result.get("headline", raw.question[:60]),
                    description=result.get("description", raw.question),
                    category=raw.category,
                    yes_price=raw.yes_price,
                    no_price=raw.no_price,
                    volume=raw.volume,
                    expires_at=raw.expires_at,
                    source=raw.source,
                )
            )
            # Remove from lookup so we know which ones weren't curated
            raw_by_id.pop(market_id, None)

    # Fallback: any markets the AI missed get naive curation
    for raw in raw_by_id.values():
        curated.append(_fallback_curate(raw))

    return curated


async def _curate_batch(
    batch: List[RawMarket],
) -> List[Dict]:
    """Send a batch of markets to Claude and parse the JSON response."""
    markets_for_prompt = [
        {
            "market_id": m.id,
            "question": m.question,
            "category": m.category,
            "yes_price": m.yes_price,
            "no_price": m.no_price,
        }
        for m in batch
    ]
    user_prompt = CURATION_USER_PROMPT.format(
        markets_json=json.dumps(markets_for_prompt, indent=2)
    )

    try:
        client = get_anthropic_client()
        response = await client.messages.create(
            model=CURATION_MODEL,
            max_tokens=2048,
            system=CURATION_SYSTEM_PROMPT,
            messages=[{"role": "user", "content": user_prompt}],
        )

        text = response.content[0].text
        results = json.loads(text)

        if not isinstance(results, list):
            logger.error("AI curation returned non-list: %s", type(results))
            return []

        return results

    except json.JSONDecodeError as e:
        logger.error("Failed to parse AI curation JSON: %s", e)
        return []
    except Exception as e:
        logger.error("AI curation API call failed: %s", e)
        return []


def _fallback_curate(raw: RawMarket) -> CuratedMarket:
    """Naive fallback when AI curation is unavailable for a market."""
    words = raw.question.split()
    headline = " ".join(words[:6])
    if len(words) > 6:
        headline += "..."

    return CuratedMarket(
        id=raw.id,
        question=raw.question,
        headline=headline,
        description=raw.question,
        category=raw.category,
        yes_price=raw.yes_price,
        no_price=raw.no_price,
        volume=raw.volume,
        expires_at=raw.expires_at,
        source=raw.source,
    )
