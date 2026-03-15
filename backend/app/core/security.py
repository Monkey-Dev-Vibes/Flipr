"""Privy JWT verification and auth dependency for FastAPI."""

from __future__ import annotations

import logging
import time
from typing import Optional, Tuple

import httpx
import jwt
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import settings
from app.models.user import UserSession

logger = logging.getLogger(__name__)

_bearer_scheme = HTTPBearer(auto_error=False)

# Cached JWKS keys with TTL
_JWKS_TTL_SECONDS = 3600  # 1 hour
_jwks_cache: Tuple[dict, float] | None = None  # (data, fetched_at)


async def _get_jwks() -> dict:
    """Fetch and cache Privy JWKS public keys (1-hour TTL)."""
    global _jwks_cache
    if _jwks_cache is not None:
        data, fetched_at = _jwks_cache
        if time.monotonic() - fetched_at < _JWKS_TTL_SECONDS:
            return data

    jwks_url = settings.privy_jwks_url.format(app_id=settings.privy_app_id)
    async with httpx.AsyncClient() as client:
        resp = await client.get(jwks_url)
        resp.raise_for_status()
        data = resp.json()
        _jwks_cache = (data, time.monotonic())
        return data


def clear_jwks_cache() -> None:
    """Clear JWKS cache (useful for testing or key rotation)."""
    global _jwks_cache
    _jwks_cache = None


def _find_key(jwk_set: jwt.PyJWKSet, kid: str) -> Optional[jwt.PyJWK]:
    """Find a signing key in a JWK set by key ID."""
    for key in jwk_set.keys:
        if key.key_id == kid:
            return key
    return None


async def _verify_privy_token(token: str) -> dict:
    """Verify a Privy access token and return its claims."""
    jwks_data = await _get_jwks()
    jwk_set = jwt.PyJWKSet.from_dict(jwks_data)

    # Get the signing key from the token header
    header = jwt.get_unverified_header(token)
    kid = header.get("kid")
    if not kid:
        raise ValueError("Token header missing 'kid'")

    signing_key = _find_key(jwk_set, kid)

    if signing_key is None:
        # Try refreshing JWKS in case of key rotation
        clear_jwks_cache()
        jwks_data = await _get_jwks()
        jwk_set = jwt.PyJWKSet.from_dict(jwks_data)
        signing_key = _find_key(jwk_set, kid)

    if signing_key is None:
        raise ValueError(f"No matching key found for kid: {kid}")

    claims = jwt.decode(
        token,
        signing_key.key,
        algorithms=["ES256"],
        issuer="privy.io",
        audience=settings.privy_app_id,
    )
    return claims


async def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer_scheme),
) -> UserSession:
    """FastAPI dependency: extract and verify the Privy JWT, return UserSession."""
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        claims = await _verify_privy_token(credentials.credentials)
    except (jwt.PyJWTError, ValueError, httpx.HTTPError) as exc:
        logger.warning("JWT verification failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    privy_user_id = claims.get("sub", "")
    return UserSession(privy_user_id=privy_user_id)


async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer_scheme),
) -> Optional[UserSession]:
    """FastAPI dependency: optionally extract user (no 401 if missing)."""
    if credentials is None:
        return None

    try:
        claims = await _verify_privy_token(credentials.credentials)
        privy_user_id = claims.get("sub", "")
        return UserSession(privy_user_id=privy_user_id)
    except (jwt.PyJWTError, ValueError, httpx.HTTPError):
        return None
