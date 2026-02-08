import json
import time
import uuid

from src.logging_utils import get_logger, log_event
from src.prompts import *
from src.utils import call_model
from src.validators import *

MAX_RETRIES = 2

def classify_request(user_input, logger=None, request_id: str | None = None) -> dict | None:
    """

    Classifies the user's request into a theme, tone, and genre.
    """

    prompt = build_classification_prompt(user_input)
    logger = logger or get_logger()
    started_at = time.monotonic()
    try:
        response = call_model(user_prompt=prompt, logger=logger, request_id=request_id)
        parsed = json.loads(response)
        log_event(
            logger,
            "classify_request",
            request_id=request_id,
            status="success",
            latency_ms=int((time.monotonic() - started_at) * 1000),
        )
        return parsed

    except json.JSONDecodeError:
        log_event(
            logger,
            "classify_request",
            request_id=request_id,
            status="fail",
            error="invalid_json",
            latency_ms=int((time.monotonic() - started_at) * 1000),
        )
        return None
    

def generate_story(user_input, classification, feedback=None, logger=None, request_id: str | None = None) -> str:
    """
    Generates a bedtime story based on the user's request.
    """

    prompt = build_storyteller_prompt(user_input, classification, feedback)
    logger = logger or get_logger()
    started_at = time.monotonic()
    
    try:
        story = call_model(
            user_prompt=prompt,
            system_prompt=STORYTELLER_SYSTEM_PROMPT,
            logger=logger,
            request_id=request_id,
        )
        cleaned_story = story.strip()
        log_event(
            logger,
            "generate_story",
            request_id=request_id,
            status="success",
            latency_ms=int((time.monotonic() - started_at) * 1000),
            word_count=len(cleaned_story.split()),
        )
        return cleaned_story

    except Exception as e:
        log_event(
            logger,
            "generate_story",
            request_id=request_id,
            status="fail",
            error=str(e),
            latency_ms=int((time.monotonic() - started_at) * 1000),
        )
        return None
    

def judge_story(story, user_input, logger=None, request_id: str | None = None) -> dict:
    """
    Judges the story based on the user's request.
    """
    prompt = build_judge_prompt(story, user_input)
    logger = logger or get_logger()
    started_at = time.monotonic()

    try:
        response = call_model(
            user_prompt=prompt,
            system_prompt=JUDGE_SYSTEM_PROMPT,
            logger=logger,
            request_id=request_id,
        )
        parsed = json.loads(response)
        log_event(
            logger,
            "judge_story",
            request_id=request_id,
            status="success",
            latency_ms=int((time.monotonic() - started_at) * 1000),
            verdict=parsed.get("verdict"),
        )
        return parsed

    except json.JSONDecodeError:
        log_event(
            logger,
            "judge_story",
            request_id=request_id,
            status="fail",
            error="invalid_json",
            latency_ms=int((time.monotonic() - started_at) * 1000),
        )
        return None
    

def run_story_engine(user_input, feedback=None, max_retries=3, logger=None, request_id: str | None = None) -> str:
    """
    Runs the story engine.
    """

    try:
        logger = logger or get_logger()
        request_id = request_id or uuid.uuid4().hex
        log_event(
            logger,
            "run_story_engine_start",
            request_id=request_id,
            max_retries=max_retries,
        )
        # Validate User Input
        is_valid, error_message = validate_user_input(user_input)
        if not is_valid:
            # Log Error
            log_event(
                logger,
                "validate_input",
                request_id=request_id,
                status="fail",
                error=error_message,
            )
            return error_message
        
        # Classify Request
        log_event(
            logger,
            "validate_input",
            request_id=request_id,
            status="success",
        )
        classification = classify_request(user_input, logger=logger, request_id=request_id)
        
        story = None
        judge_result = None

        for attempt in range(max_retries+1):
            log_event(
                logger,
                "generation_attempt",
                request_id=request_id,
                attempt=attempt + 1,
                max_attempts=max_retries + 1,
            )
        
            # Generate Story
            story = generate_story(
                user_input,
                classification,
                feedback,
                logger=logger,
                request_id=request_id,
            )
            
            if not story:
                log_event(
                    logger,
                    "generate_story",
                    request_id=request_id,
                    status="retry",
                    attempt=attempt + 1,
                )
                continue
       
           
            judge_result = judge_story(story, user_input, logger=logger, request_id=request_id)
            if not judge_result:
                # Log Error and Continue
                log_event(
                    logger,
                    "judge_story",
                    request_id=request_id,
                    status="retry",
                    attempt=attempt + 1,
                )
                continue
            
        
        
            is_valid, error_message = validate_final_story(story, judge_result)
            if is_valid:
                log_event(
                    logger,
                    "validate_final_story",
                    request_id=request_id,
                    status="success",
                )
                log_event(
                    logger,
                    "run_story_engine_end",
                    request_id=request_id,
                    status="success",
                )

                return story
            
            # Prepare Feedback for Next Generation

            feedback = judge_result.get("improvement_feedback", "")
            log_event(
                logger,
                "validate_final_story",
                request_id=request_id,
                status="fail",
                error=error_message,
                feedback=feedback,
            )
        
        log_event(
            logger,
            "run_story_engine_end",
            request_id=request_id,
            status="fail",
        )
        return (
        "Sorry, I couldn’t create a suitable bedtime story this time. "
        "Please try rephrasing your request."
    )
    
    except Exception as e:
        log_event(
            logger or get_logger(),
            "run_story_engine_error",
            request_id=request_id,
            status="fail",
            error=str(e),
        )
        return (
        "Sorry, I couldn’t create a suitable bedtime story this time. "
        "Please try rephrasing your request."
    )