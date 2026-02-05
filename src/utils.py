import os
import time
from typing import Optional

from openai import OpenAI

from src.logging_utils import get_logger, log_event

def call_model(
    user_prompt: str,
    system_prompt: str | None = None,
    max_tokens: int = 3000,
    temperature: float = 0.1,
    logger=None,
    request_id: Optional[str] = None,
) -> str:
    api_key = os.getenv("OPENAI_API_KEY")
    client = OpenAI(api_key=api_key)

    logger = logger or get_logger()
    started_at = time.monotonic()
    log_event(
        logger,
        "llm_call_start",
        request_id=request_id,
        model="gpt-3.5-turbo",
        max_tokens=max_tokens,
        temperature=temperature,
    )

    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": user_prompt})

    try:
        resp = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages,
            max_tokens=max_tokens,
            temperature=temperature,
        )
        return resp.choices[0].message.content
    finally:
        duration_ms = int((time.monotonic() - started_at) * 1000)
        log_event(
            logger,
            "llm_call_end",
            request_id=request_id,
            model="gpt-3.5-turbo",
            latency_ms=duration_ms,
        )
