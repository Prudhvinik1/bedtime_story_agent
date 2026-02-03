from prompts import *
from validators import *
from utils import call_model
import json

MAX_RETRIES = 2

def classify_request(user_input) -> dict | None:
    """

    Classifies the user's request into a theme, tone, and genre.
    """

    prompt = build_classification_prompt(user_input)
    try:
        response = call_model(user_prompt=prompt)
        return json.loads(response)

    except json.JSONDecodeError:
        print(f"Error classifying request: {response}")
        return None
    


def generate_story(user_input, classification, feedback=None) -> str:
    """
    Generates a bedtime story based on the user's request.
    """

    prompt = build_storyteller_prompt(user_input, classification, feedback)
    
    try:
        story = call_model(user_prompt=prompt, system_prompt=STORYTELLER_SYSTEM_PROMPT)
        print(f"Generated story: {story}")
        return story.strip()

    except Exception as e:
        print(f"Error generating story: {e}")
        return None
    

def judge_story(story, user_input) -> dict:
    """
    Judges the story based on the user's request.
    """
    prompt = build_judge_prompt(story, user_input)

    try:
        response = call_model(user_prompt=prompt, system_prompt=JUDGE_SYSTEM_PROMPT)
        return json.loads(response)

    except json.JSONDecodeError:
        print(f"Error judging story: {response}")
        return None
    

def run_story_engine(user_input, feedback=None, max_retries=3) -> str:
    """
    Runs the story engine.
    """

    try:
        # Validate User Input
        is_valid, error_message = validate_user_input(user_input)
        if not is_valid:
            # Log Error
            print(f"Error validating user input: {error_message}")
            return error_message
        
        # Classify Request
        classification = classify_request(user_input)
        
        story = None
        judge_result = None

        for attempt in range(max_retries+1):
            print(f"Attempt {attempt+1} of {max_retries+1} to generate story...")
        
            # Generate Story
            story = generate_story(user_input, classification, feedback)
            
            if not story:
                print("Failed to generate story. Retrying...")
                continue
       
           
            judge_result = judge_story(story, user_input)
            print(f"Judge result: {judge_result}")
            if not judge_result:
                # Log Error and Continue
                print("Judge failed to return valid JSON, retrying...")
                continue
            
        
        
            is_valid, error_message = validate_final_story(story, judge_result)
            if is_valid:
                print("Story passed all validations. Returning story...")

                return story
            
            # Prepare Feedback for Next Generation

            feedback = judge_result.get("improvement_feedback", "")
            print(f"Story failed validation, retrying with feedback '{feedback}'...")
        
        return (
        "Sorry, I couldn’t create a suitable bedtime story this time. "
        "Please try rephrasing your request."
    )
    
    except Exception as e:
        print(f"Error running story engine: {e}")
        return (
        "Sorry, I couldn’t create a suitable bedtime story this time. "
        "Please try rephrasing your request."
    )