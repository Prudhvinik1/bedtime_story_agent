import json

import src.story_engine as story_engine
from src.prompts import JUDGE_SYSTEM_PROMPT, STORYTELLER_SYSTEM_PROMPT


def _make_story(word_count=400):
    return ("word " * (word_count - 1)) + "happy"


def test_classify_request_invalid_json(monkeypatch):
    def fake_call_model(*args, **kwargs):
        return "not-json"

    monkeypatch.setattr(story_engine, "call_model", fake_call_model)
    result = story_engine.classify_request("A story about kindness")
    assert result is None


def test_run_story_engine_success(monkeypatch):
    story = _make_story(400)
    judge_payload = {
        "scores": {},
        "verdict": "PASS",
        "improvement_feedback": "",
    }

    def fake_call_model(user_prompt, system_prompt=None, **kwargs):
        if system_prompt == STORYTELLER_SYSTEM_PROMPT:
            return story
        if system_prompt == JUDGE_SYSTEM_PROMPT:
            return json.dumps(judge_payload)
        return json.dumps({"theme": "friendship", "tone": "calm", "genre": "fantasy"})

    monkeypatch.setattr(story_engine, "call_model", fake_call_model)

    result = story_engine.run_story_engine("A gentle story about a dragon")
    assert "happy" in result


def test_run_story_engine_retries_on_judge_failure(monkeypatch):
    story = _make_story(400)
    judge_payload = {
        "scores": {},
        "verdict": "PASS",
        "improvement_feedback": "",
    }
    state = {"judge_calls": 0}

    def fake_call_model(user_prompt, system_prompt=None, **kwargs):
        if system_prompt == STORYTELLER_SYSTEM_PROMPT:
            return story
        if system_prompt == JUDGE_SYSTEM_PROMPT:
            state["judge_calls"] += 1
            if state["judge_calls"] == 1:
                return "not-json"
            return json.dumps(judge_payload)
        return json.dumps({"theme": "friendship", "tone": "calm", "genre": "fantasy"})

    monkeypatch.setattr(story_engine, "call_model", fake_call_model)

    result = story_engine.run_story_engine("A gentle story about a dragon", max_retries=1)
    assert "happy" in result
    assert state["judge_calls"] == 2


def test_run_story_engine_rejects_invalid_input():
    result = story_engine.run_story_engine("A story with murder")
    assert "not appropriate" in result.lower()
