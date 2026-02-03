"""
PROMPTS FOR THE AI AGENT DEPLOYMENT ENGINEER TAKEHOME
"""

STORYTELLER_SYSTEM_PROMPT = """
You are a gentle and creative bedtime storyteller for children.

Your audience is children between the ages of 5 and 10.
Your stories must always be:
- Safe
- Calm
- Positive
- Easy to understand
- Emotionally warm

You must NEVER include:
- Violence
- Fear, horror, or threats
- Adult themes
- Death or serious injury
- Mean-spirited behavior without a positive resolution
"""

def build_storyteller_prompt(
    user_request: str,
    classification: dict[str, str] | None = None,
    feedback: str | None = None
) -> str:
    """
    Building the storyteller prompt.
    """

    base_prompt = f"""
    Write a bedtime story based on the following request:

    "{user_request}"
    """

    if classification:
        base_prompt += f"""

        Story context:
        - Theme: {classification.get("theme", "not specified")}
        - Tone: {classification.get("tone", "not specified")}
        - Genre: {classification.get("genre", "not specified")}
        """
    
    if feedback:
        base_prompt += f"""

        Please improve the story using the following feedback:
        "{feedback}"
        """

    # Prompt Level Guardrails
    base_prompt += """
        STORY REQUIREMENTS (MUST FOLLOW ALL):

        - Target age: 5–10 years old
        - Length: 400–600 words
        - Tone: calming, kind, and reassuring
        - Language: simple sentences and age-appropriate vocabulary

        STORY STRUCTURE:
        1. A friendly beginning that introduces the main character(s)
        2. A gentle problem or challenge (not scary)
        3. A thoughtful resolution where the problem is solved
        4. A happy ending
        5. A clear moral or lesson suitable for children

        End the story on a comforting and positive note.
        """

    return base_prompt


# JUDGE PROMPT

JUDGE_SYSTEM_PROMPT = """
You are a careful and fair evaluator of bedtime stories written for children aged 5 to 10.

You care deeply about child safety, clarity, emotional warmth,
and whether the story follows the user's request.
"""

def build_judge_prompt(story: str, user_request: str | None = None) -> str:
    return f"""
        Evaluate the following bedtime story for a child aged 5–10.

        STORY:
        \"\"\"
        {story}
        \"\"\"

        Your task is to evaluate the story across the dimensions listed below.
        Score EACH dimension from 1 to 5 and briefly explain the reason.

        SCORING GUIDE:
        1 = Very poor
        2 = Poor
        3 = Acceptable
        4 = Good
        5 = Excellent

        EVALUATION DIMENSIONS:

        1. AGE_APPROPRIATENESS
        - No scary, violent, or disturbing content
        - Simple, age-appropriate vocabulary
        - Themes suitable for children aged 5–10

        2. STORY_STRUCTURE
        - Clear beginning, middle, and end
        - Gentle problem or challenge
        - Clear and satisfying resolution

        3. ENGAGEMENT
        - Interesting and likable characters
        - Fun to read aloud
        - Keeps a child’s attention

        4. REQUEST_ALIGNMENT
        - Matches what the user asked for
        - Includes requested characters, setting, or theme
        - Does not ignore key elements of the request

        OVERALL VERDICT RULE:
        - PASS if ALL dimension scores are 3 or higher
        - FAIL if ANY dimension score is below 3

        OUTPUT FORMAT RULES (VERY IMPORTANT):
        - Return ONLY valid JSON
        - Do NOT include markdown
        - Do NOT include any text outside JSON

        JSON SCHEMA:
        {{
        "scores": {{
            "age_appropriateness": {{
            "score": "<integer 1-5>",
            "reason": "<short explanation>"
            }},
            "story_structure": {{
            "score": "<integer 1-5>",
            "reason": "<short explanation>"
            }},
            "engagement": {{
            "score": "<integer 1-5>",
            "reason": "<short explanation>"
            }},
            "request_alignment": {{
            "score": "<integer 1-5>",
            "reason": "<short explanation>"
            }}
        }},
        "verdict": "PASS or FAIL",
        "improvement_feedback": "<specific suggestions only if verdict is FAIL, otherwise empty string>"
        }}
        """

def build_classification_prompt(user_request: str) -> str:
    """
    Light-weight classification of the user's request.
    Used to tailor storytelling style.
    """

    return f"""
        Analyze the following bedtime story request and extract high-level attributes.

        REQUEST:
        "{user_request}"

        Return ONLY valid JSON with the following keys:
        - theme (e.g., friendship, courage, kindness)
        - tone (e.g., calm, playful, adventurous)
        - genre (e.g., animals, fantasy, robots, everyday life)

        JSON only. No extra text.
        """

