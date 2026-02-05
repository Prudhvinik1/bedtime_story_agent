import os
import time
import uuid
from typing import Dict, Optional, Tuple

import uvicorn
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from src.logging_utils import get_logger, log_event
from src.story_engine import run_story_engine

MAX_INPUT_CHARS = int(os.getenv("MAX_INPUT_CHARS", "1000"))
RATE_LIMIT_WINDOW_SECONDS = int(os.getenv("RATE_LIMIT_WINDOW_SECONDS", "60"))
RATE_LIMIT_MAX_REQUESTS = int(os.getenv("RATE_LIMIT_MAX_REQUESTS", "30"))

_rate_limit_state: Dict[str, Tuple[float, int]] = {}
_logger = get_logger()

class StoryRequest(BaseModel):
    user_input: str = Field(..., min_length=1, max_length=MAX_INPUT_CHARS)
    feedback: Optional[str] = None

class StoryResponse(BaseModel):
    story: str
    feedback: Optional[str] = None
    error: Optional[str] = None
    status: str = "success"
    request_id: Optional[str] = None

app = FastAPI()


@app.middleware("http")
async def request_context(request: Request, call_next):
    started_at = time.monotonic()
    request_id = uuid.uuid4().hex
    request.state.request_id = request_id

    client_ip = request.client.host if request.client else "unknown"
    window_start, count = _rate_limit_state.get(client_ip, (time.time(), 0))
    now = time.time()
    if now - window_start > RATE_LIMIT_WINDOW_SECONDS:
        window_start, count = now, 0
    count += 1
    _rate_limit_state[client_ip] = (window_start, count)
    if count > RATE_LIMIT_MAX_REQUESTS:
        response = JSONResponse(
            status_code=429,
            content={"status": "error", "error": "Rate limit exceeded.", "request_id": request_id},
        )
    else:
        response = await call_next(request)

    response.headers["X-Request-Id"] = request_id
    duration_ms = int((time.monotonic() - started_at) * 1000)
    log_event(
        _logger,
        "http_request",
        request_id=request_id,
        method=request.method,
        path=request.url.path,
        status_code=response.status_code,
        latency_ms=duration_ms,
        client_ip=client_ip,
    )
    return response

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/story")
def generate_story(request: StoryRequest, http_request: Request):
    try:
        request_id = getattr(http_request.state, "request_id", None)
        if not request.user_input.strip():
            response = StoryResponse(
                story="",
                error="Story request cannot be empty.",
                status="error",
                request_id=request_id,
            )
            return JSONResponse(status_code=400, content=response.model_dump())
        story = run_story_engine(
            request.user_input,
            request.feedback,
            request_id=request_id,
        )
        lower_story = story.lower() if isinstance(story, str) else ""
        if (
            not story
            or lower_story.startswith("sorry,")
            or "not appropriate" in lower_story
            or "cannot be empty" in lower_story
        ):
            response = StoryResponse(
                story="",
                error=story or "Story generation failed.",
                status="error",
                request_id=request_id,
            )
            return JSONResponse(status_code=400, content=response.model_dump())
        return StoryResponse(
            story=story,
            feedback=request.feedback,
            request_id=request_id,
        )
    except Exception as e:
        request_id = getattr(http_request.state, "request_id", None)
        log_event(
            _logger,
            "story_generation_error",
            request_id=request_id,
            error=str(e),
        )
        response = StoryResponse(
            story="",
            error="Internal server error.",
            status="error",
            request_id=request_id,
        )
        return JSONResponse(status_code=500, content=response.model_dump())

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)