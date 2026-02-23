from fastapi.testclient import TestClient

import src.api as api
from src.auth import get_current_user

FAKE_USER = {"sub": "test-user-123"}


def _override_auth():
    api.app.dependency_overrides[get_current_user] = lambda: FAKE_USER


def _clear_auth():
    api.app.dependency_overrides.pop(get_current_user, None)


def test_health_check():
    client = TestClient(api.app)
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_story_success(monkeypatch):
    api._rate_limit_state.clear()
    api.RATE_LIMIT_MAX_REQUESTS = 1000
    _override_auth()
    try:
        def fake_run_story_engine(user_input, feedback=None, request_id=None, **kwargs):
            return "A calm story with a happy ending."

        monkeypatch.setattr(api, "run_story_engine", fake_run_story_engine)
        client = TestClient(api.app)

        response = client.post("/story", json={"user_input": "A story about kindness"})
        payload = response.json()

        assert response.status_code == 200
        assert payload["status"] == "success"
        assert payload["story"]
        assert payload["request_id"]
        assert response.headers.get("X-Request-Id") == payload["request_id"]
    finally:
        _clear_auth()


def test_story_validation_error(monkeypatch):
    api._rate_limit_state.clear()
    api.RATE_LIMIT_MAX_REQUESTS = 1000
    _override_auth()
    try:
        def fake_run_story_engine(user_input, feedback=None, request_id=None, **kwargs):
            return "Story request cannot be empty."

        monkeypatch.setattr(api, "run_story_engine", fake_run_story_engine)
        client = TestClient(api.app)

        response = client.post("/story", json={"user_input": "   "})
        payload = response.json()

        assert response.status_code == 400
        assert payload["status"] == "error"
        assert "cannot be empty" in payload["error"].lower()
    finally:
        _clear_auth()
