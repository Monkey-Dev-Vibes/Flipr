import pytest
from httpx import ASGITransport, AsyncClient

from app.core.config import APP_VERSION
from app.main import app


@pytest.mark.asyncio
async def test_health_returns_ok():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get("/health")

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "flipr-api"
    assert data["version"] == APP_VERSION
