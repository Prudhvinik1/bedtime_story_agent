import json

from src.logging_utils import get_logger, log_event


def test_log_event_emits_json(capsys):
    logger = get_logger("test_logger")
    log_event(logger, "unit_test", request_id="req-123", stage="test")

    captured = capsys.readouterr().out.strip()
    payload = json.loads(captured)

    assert payload["event"] == "unit_test"
    assert payload["request_id"] == "req-123"
    assert payload["stage"] == "test"
    assert payload["level"] == "INFO"
