"""Tests for share endpoints."""

import pytest
from httpx import AsyncClient, ASGITransport

from app.main import app
from app.core.security import get_current_user


MOCK_USER = {"sub": "test-user-123", "iss": "privy.io"}


async def mock_get_current_user():
    return MOCK_USER


@pytest.fixture(autouse=True)
def override_auth():
    app.dependency_overrides[get_current_user] = mock_get_current_user
    yield
    app.dependency_overrides.clear()


@pytest.fixture
def client():
    transport = ASGITransport(app=app)
    return AsyncClient(transport=transport, base_url="http://test")


@pytest.mark.asyncio
async def test_create_share_returns_url(client):
    response = await client.post(
        "/share",
        json={
            "type": "trade-win",
            "question": "Will BTC hit $100K?",
            "intent": "yes",
            "percentGain": 15.5,
            "amount": 25.0,
            "winStreak": 3,
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["error"] is None
    assert "shareUrl" in data["data"]
    assert data["data"]["shareUrl"].startswith("https://flipr.app/s/")


@pytest.mark.asyncio
async def test_get_share_not_found(client):
    response = await client.get("/share/nonexistent")
    assert response.status_code == 200
    data = response.json()
    assert data["data"] is None
    assert data["error"] == "Share not found"


@pytest.mark.asyncio
async def test_create_and_get_share(client):
    create_response = await client.post(
        "/share",
        json={
            "type": "portfolio",
            "percentGain": 42.3,
            "amount": 1250.0,
        },
    )
    assert create_response.status_code == 200
    share_id = create_response.json()["data"]["id"]

    get_response = await client.get(f"/share/{share_id}")
    assert get_response.status_code == 200
    data = get_response.json()["data"]
    assert data["type"] == "portfolio"
    assert data["percentGain"] == 42.3
    assert "og" in data
    assert "Flipr" in data["og"]["title"]
