"""Anthropic API client wrapper for Flipr's AI curation pipeline."""

import logging
from typing import Optional

import anthropic

from app.core.config import settings

logger = logging.getLogger(__name__)

# Model used for market curation
CURATION_MODEL = "claude-sonnet-4-20250514"

# Singleton client instance
_client: Optional[anthropic.AsyncAnthropic] = None


def get_anthropic_client() -> anthropic.AsyncAnthropic:
    """Get or create the singleton async Anthropic client."""
    global _client
    if _client is None:
        if not settings.anthropic_api_key:
            raise ValueError(
                "ANTHROPIC_API_KEY is not set. Add it to your .env file."
            )
        _client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)
    return _client
