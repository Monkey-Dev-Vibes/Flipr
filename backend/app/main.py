from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.api.auth import router as auth_router
from app.api.health import router as health_router
from app.api.markets import router as markets_router
from app.api.onboarding import router as onboarding_router
from app.api.trades import router as trades_router
from app.core.config import APP_VERSION, settings
from app.core.rate_limit import limiter
from app.services.market_service import get_market_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: begin the 5-minute curation cron job
    service = get_market_service()
    service.start_cron()
    yield
    # Shutdown: stop cron and close the adapter's HTTP client
    service.stop_cron()
    await service.adapter.close()


app = FastAPI(
    title=settings.app_name,
    version=APP_VERSION,
    docs_url="/docs" if settings.debug else None,
    redoc_url=None,
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(health_router)
app.include_router(markets_router)
app.include_router(onboarding_router)
app.include_router(trades_router)
