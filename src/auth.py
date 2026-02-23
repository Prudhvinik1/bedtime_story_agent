import json
import time
import urllib.error
import urllib.request
from typing import Any

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from src.config import settings

security = HTTPBearer(auto_error=False)

_jwks_cache: dict[str, Any] | None = None
_jwks_cache_ts = 0.0


def _fetch_jwks() -> dict[str, Any]:
    global _jwks_cache
    global _jwks_cache_ts

    now = time.time()
    if _jwks_cache and (now - _jwks_cache_ts) < settings.supabase_jwks_cache_ttl_seconds:
        return _jwks_cache

    if not settings.supabase_jwks_url:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server auth configuration error.",
        )

    try:
        with urllib.request.urlopen(settings.supabase_jwks_url, timeout=5) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to verify authentication at this time.",
        )

    _jwks_cache = payload
    _jwks_cache_ts = now
    return payload


def _verify_supabase_jwt(token: str) -> dict[str, Any]:
    try:
        unverified_header = jwt.get_unverified_header(token)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token.",
        )

    kid = unverified_header.get("kid")
    alg = unverified_header.get("alg")
    if not kid or not alg or alg not in settings.supabase_allowed_algorithms:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token.",
        )

    jwks = _fetch_jwks()
    matching_key = next((key for key in jwks.get("keys", []) if key.get("kid") == kid), None)
    if not matching_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token.",
        )

    try:
        return jwt.decode(
            token,
            matching_key,
            algorithms=[alg],
            audience=settings.supabase_audience,
            issuer=settings.supabase_issuer,
        )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token.",
        )


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
) -> dict[str, Any]:
    if credentials is None or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized.",
        )
    return _verify_supabase_jwt(credentials.credentials)
