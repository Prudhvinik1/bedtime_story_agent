import time
from typing import Optional

from openai import OpenAI

from src.config import settings
from src.logging_utils import get_logger, log_event

DEFAULT_MODEL = settings.openai_model
DEFAULT_TIMEOUT_SECONDS = settings.openai_timeout_seconds

def call_model(
    user_prompt: str,
    system_prompt: str | None = None,
    max_tokens: int = 3000,
    temperature: float = 0.1,
    logger=None,
    request_id: Optional[str] = None,
    model: str = DEFAULT_MODEL,
    timeout_seconds: float = DEFAULT_TIMEOUT_SECONDS,
) -> str:
    client = OpenAI(api_key=settings.openai_api_key)

    logger = logger or get_logger()
    started_at = time.monotonic()
    log_event(
        logger,
        "llm_call_start",
        request_id=request_id,
        model=model,
        max_tokens=max_tokens,
        temperature=temperature,
        timeout_seconds=timeout_seconds,
    )

    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": user_prompt})

    try:
        resp = client.chat.completions.create(
            model=model,
            messages=messages,
            max_tokens=max_tokens,
            temperature=temperature,
            timeout=timeout_seconds,
        )
        return resp.choices[0].message.content
    finally:
        duration_ms = int((time.monotonic() - started_at) * 1000)
        log_event(
            logger,
            "llm_call_end",
            request_id=request_id,
            model=model,
            latency_ms=duration_ms,
        )
