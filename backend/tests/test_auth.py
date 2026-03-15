"""Tests for authentication endpoints and middleware."""

from unittest.mock import AsyncMock, patch

import pytest
from httpx import ASGITransport, AsyncClient

from app.core.security import get_optional_user
from app.main import app
from app.models.user import UserSession


# --- POST /auth/verify ---


@pytest.mark.asyncio
async def test_verify_returns_401_without_token():
    """Verify endpoint rejects requests with no Authorization header."""
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.post("/auth/verify")

    assert response.status_code == 401


@pytest.mark.asyncio
async def test_verify_returns_401_with_bad_token():
    """Verify endpoint rejects invalid tokens."""
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.post(
            "/auth/verify",
            headers={"Authorization": "Bearer invalid.token.here"},
        )

    assert response.status_code == 401


@pytest.mark.asyncio
async def test_verify_returns_session_with_valid_token():
    """Verify endpoint returns user session data when token is valid."""
    with patch(
        "app.core.security._verify_privy_token",
        new_callable=AsyncMock,
        return_value={"sub": "did:privy:test123"},
    ):
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await client.post(
                "/auth/verify",
                headers={"Authorization": "Bearer valid.mock.token"},
            )

    assert response.status_code == 200
    data = response.json()
    assert data["data"]["user_id"] == "did:privy:test123"
    assert data["meta"]["verified"] is True


# --- Protected endpoints require auth ---


@pytest.mark.asyncio
async def test_market_feed_requires_auth():
    """Market feed endpoint returns 401 without auth token."""
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get("/markets/feed")

    assert response.status_code == 401


@pytest.mark.asyncio
async def test_market_odds_requires_auth():
    """Market odds endpoint returns 401 without auth token."""
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get("/markets/some-market-id/odds")

    assert response.status_code == 401


@pytest.mark.asyncio
async def test_market_feed_accessible_with_auth():
    """Market feed endpoint is accessible with valid auth token."""
    with patch(
        "app.core.security._verify_privy_token",
        new_callable=AsyncMock,
        return_value={"sub": "did:privy:test123"},
    ):
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await client.get(
                "/markets/feed",
                headers={"Authorization": "Bearer valid.mock.token"},
            )

    assert response.status_code == 200
    data = response.json()
    assert "data" in data


# --- User session model ---


def test_user_session_model():
    """UserSession model creates correctly with defaults."""
    session = UserSession(privy_user_id="did:privy:abc")
    assert session.privy_user_id == "did:privy:abc"
    assert session.wallet_address is None
    assert session.balance == 0.0


def test_user_session_model_with_wallet():
    """UserSession model accepts wallet and balance."""
    session = UserSession(
        privy_user_id="did:privy:abc",
        wallet_address="0x1234567890abcdef",
        balance=100.50,
    )
    assert session.wallet_address == "0x1234567890abcdef"
    assert session.balance == 100.50


# --- get_optional_user dependency ---


@pytest.mark.asyncio
async def test_optional_user_returns_none_without_token():
    """get_optional_user returns None when no credentials provided."""
    result = await get_optional_user(credentials=None)
    assert result is None


@pytest.mark.asyncio
async def test_optional_user_returns_session_with_valid_token():
    """get_optional_user returns UserSession when token is valid."""
    from fastapi.security import HTTPAuthorizationCredentials

    creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials="valid.mock.token")

    with patch(
        "app.core.security._verify_privy_token",
        new_callable=AsyncMock,
        return_value={"sub": "did:privy:optional123"},
    ):
        result = await get_optional_user(credentials=creds)

    assert result is not None
    assert result.privy_user_id == "did:privy:optional123"


@pytest.mark.asyncio
async def test_optional_user_returns_none_with_bad_token():
    """get_optional_user returns None (not 401) when token is invalid."""
    from fastapi.security import HTTPAuthorizationCredentials

    creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials="bad.token")

    with patch(
        "app.core.security._verify_privy_token",
        new_callable=AsyncMock,
        side_effect=ValueError("bad token"),
    ):
        result = await get_optional_user(credentials=creds)

    assert result is None
