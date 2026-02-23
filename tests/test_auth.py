from fastapi import HTTPException

import src.auth as auth


def test_get_current_user_missing_credentials():
    try:
        auth.get_current_user(credentials=None)
        assert False, "Expected HTTPException for missing credentials"
    except HTTPException as exc:
        assert exc.status_code == 401
        assert exc.detail == "Unauthorized."


def test_verify_supabase_jwt_rejects_missing_kid(monkeypatch):
    monkeypatch.setattr(auth.jwt, "get_unverified_header", lambda _token: {"alg": "RS256"})
    try:
        auth._verify_supabase_jwt("token")
        assert False, "Expected HTTPException for missing kid"
    except HTTPException as exc:
        assert exc.status_code == 401
        assert exc.detail == "Invalid or expired token."


def test_verify_supabase_jwt_success(monkeypatch):
    monkeypatch.setattr(auth.jwt, "get_unverified_header", lambda _token: {"kid": "k1", "alg": "RS256"})
    monkeypatch.setattr(auth, "_fetch_jwks", lambda: {"keys": [{"kid": "k1", "kty": "RSA"}]})
    monkeypatch.setattr(
        auth.jwt,
        "decode",
        lambda token, key, algorithms, audience, issuer: {"sub": "user-123", "role": "authenticated"},
    )

    payload = auth._verify_supabase_jwt("valid-token")
    assert payload["sub"] == "user-123"
