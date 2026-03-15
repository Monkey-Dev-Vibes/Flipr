"""Tests for onboarding endpoints."""

from unittest.mock import AsyncMock, patch

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


# --- Helpers ---


def _make_auth_headers():
    return {"Authorization": "Bearer valid.mock.token"}


def _privy_patch(user_id: str = "did:privy:testuser"):
    return patch(
        "app.core.security._verify_privy_token",
        new_callable=AsyncMock,
        return_value={"sub": user_id},
    )


# --- Fixtures ---


@pytest.fixture(autouse=True)
def clear_claimed_users():
    """Clear the in-memory _claimed_users set before each test to avoid pollution."""
    import app.api.onboarding as onboarding_module

    onboarding_module._claimed_users.clear()
    yield
    onboarding_module._claimed_users.clear()


# --- POST /onboarding/grant ---


@pytest.mark.asyncio
async def test_grant_without_auth_returns_401():
    """Onboarding grant endpoint rejects requests with no Authorization header."""
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.post("/onboarding/grant")

    assert response.status_code == 401


@pytest.mark.asyncio
async def test_grant_with_valid_auth_returns_grant():
    """First-time grant returns grant_amount=1.0 and already_claimed=false."""
    with _privy_patch():
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await client.post(
                "/onboarding/grant",
                headers=_make_auth_headers(),
            )

    assert response.status_code == 200
    body = response.json()
    assert body["data"]["grant_amount"] == 1.0
    assert body["data"]["already_claimed"] is False


@pytest.mark.asyncio
async def test_grant_idempotent_second_call_returns_already_claimed():
    """Second call for the same user returns already_claimed=true."""
    with _privy_patch():
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            # First call — claims the grant
            first = await client.post(
                "/onboarding/grant",
                headers=_make_auth_headers(),
            )
            # Second call — should be idempotent
            second = await client.post(
                "/onboarding/grant",
                headers=_make_auth_headers(),
            )

    assert first.status_code == 200
    assert first.json()["data"]["already_claimed"] is False

    assert second.status_code == 200
    assert second.json()["data"]["already_claimed"] is True


@pytest.mark.asyncio
async def test_grant_response_shape():
    """Response conforms to OnboardingGrantResponse: data dict with required keys."""
    with _privy_patch("did:privy:shapecheck"):
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await client.post(
                "/onboarding/grant",
                headers=_make_auth_headers(),
            )

    assert response.status_code == 200
    body = response.json()

    # Top-level envelope
    assert "data" in body

    data = body["data"]
    assert "user_id" in data
    assert "grant_amount" in data
    assert "already_claimed" in data
    assert "balance" in data

    # Value types
    assert data["user_id"] == "did:privy:shapecheck"
    assert isinstance(data["grant_amount"], float)
    assert isinstance(data["already_claimed"], bool)
    assert isinstance(data["balance"], float)
