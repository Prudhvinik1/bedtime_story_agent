import json
import logging
import sys
from datetime import datetime, timezone
from typing import Any, Dict

DEFAULT_LOGGER_NAME = "story_pipeline"


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload: Dict[str, Any] = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }

        extra_fields = getattr(record, "extra_fields", None)
        if isinstance(extra_fields, dict):
            payload.update(extra_fields)

        return json.dumps(payload, ensure_ascii=True)


def get_logger(name: str = DEFAULT_LOGGER_NAME, level: int = logging.INFO) -> logging.Logger:
    logger = logging.getLogger(name)
    logger.setLevel(level)

    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(JsonFormatter())
        logger.addHandler(handler)
        logger.propagate = False

    return logger


def log_event(logger: logging.Logger, event: str, **fields: Any) -> None:
    cleaned_fields: Dict[str, Any] = {key: value for key, value in fields.items() if value is not None}
    cleaned_fields["event"] = event
    logger.info(event, extra={"extra_fields": cleaned_fields})
