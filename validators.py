"""
VALIDATORS FOR THE AI AGENT DEPLOYMENT ENGINEER TAKEHOME
"""

from typing import Tuple

# Pre-Generation Validators
# This can be set in a config but simplifying for now
BANNED_WORDS = {
    "kill",
    "murder",
    "blood",
    "gun",
    "weapon",
    "sex",
    "drugs",
    "suicide"
}

def validate_user_input(user_input: str) -> Tuple[bool, str]:
    """
    Validates the user's input before story generation.

    Returns (is_valid, error_message)
    """

    if not user_input or not user_input.strip():
        return False, "Story request cannot be empty."

    lowered = user_input.lower().strip()

    for word in BANNED_WORDS:
        if word in lowered:
            return False, (
                "This story request includes themes that are not appropriate "
                "for a children's bedtime story. Please rephrase."
            )
    
    return True, ""

# Post-Generation Validators

MIN_WORDS = 400
MAX_WORDS = 600

POSITIVE_ENDING_KEYWORDS = {
    "happy",
    "smiled",
    "together",
    "learned",
    "kind",
    "safe",
    "peaceful",
}

def validate_story_length(story: str) -> bool:
    words = story.split()
    return MIN_WORDS <= len(words) <= MAX_WORDS

def has_positive_ending(story: str) -> bool:
    last_paragraph = story.strip().split("\n")[-1].lower()
    return any(keyword in last_paragraph for keyword in POSITIVE_ENDING_KEYWORDS)

def validate_judge_result(judge_result: dict) -> bool:
    """
    Validates the judge output.
    Expects verdict = PASS or FAIL.
    """
    return judge_result.get("verdict") == "PASS"


def validate_final_story(story: str, judge_result: dict) -> Tuple[bool, str]:
    """
    Final validation before returning the story to the user.
    """

    if not validate_story_length(story):
        return False, "Story length is outside the acceptable range."

    if not validate_judge_result(judge_result):
        return False, "Story did not meet quality requirements."

    if not has_positive_ending(story):
        return False, "Story does not appear to have a clear, positive ending."

    return True, ""

