from fastapi import HTTPException
from fastapi.testclient import TestClient

import src.api as api
from src.auth import get_current_user


def _auth_header(token: str = "dummy-token") -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def test_story_requires_authentication():
    client = TestClient(api.app)
    response = client.post("/story", json={"user_input": "A story about kindness"})
    assert response.status_code == 401
    assert response.json()["detail"] in {"Unauthorized.", "Not authenticated"}


def test_story_accepts_authenticated_user(monkeypatch):
    api.app.dependency_overrides[get_current_user] = lambda: {"sub": "user-123"}

    def fake_run_story_engine(user_input, feedback=None, request_id=None, **kwargs):
        return "A calm bedtime story with a happy ending."

    monkeypatch.setattr(api, "run_story_engine", fake_run_story_engine)
    client = TestClient(api.app)
    response = client.post(
        "/story",
        json={"user_input": "A story about kindness"},
        headers=_auth_header(),
    )
    api.app.dependency_overrides.clear()

    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "success"
    assert payload["story"]


def test_story_rejects_invalid_token(monkeypatch):
    def invalid_user():
        raise HTTPException(status_code=401, detail="Invalid or expired token.")

    api.app.dependency_overrides[get_current_user] = invalid_user
    client = TestClient(api.app)
    response = client.post(
        "/story",
        json={"user_input": "A story about kindness"},
        headers=_auth_header("invalid"),
    )
    api.app.dependency_overrides.clear()

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid or expired token."
