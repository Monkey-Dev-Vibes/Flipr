from fastapi import Request
from slowapi import Limiter
from slowapi.util import get_remote_address


def get_user_key(request: Request) -> str:
    """Extract rate limit key: Privy user ID from header, or fall back to IP."""
    user_id = request.headers.get("X-User-Id")
    if user_id:
        return user_id
    return get_remote_address(request)


limiter = Limiter(key_func=get_user_key)
