import dotenv
from src.story_engine import run_story_engine

dotenv.load_dotenv(".env.local")

"""
Before submitting the assignment, describe here in a few sentences what you would have built next if you spent 2 more hours on this project:

- I would dive deeper into the story generation process.
- Finer Age Banding and more detailed story arc templates.
- More detailed logging and error handling.
- Failure Escalation and Recovery.
- Online RLHF system to continuously improve the story generation process by implementing Parent Feedback Mode
- Voice Generation for the story.
- Memory for remembering previous stories and feedback.
- Class Based Design for more extensibility and modularity.
"""

example_requests = "A story about a girl named Alice and her best friend Bob, who happens to be a cat."


def main():
    user_input = input("What kind of story do you want to hear? ")
    response = run_story_engine(user_input)
    print(response)

    while True:
        print("\nWould you like to:")
        print("1. Accept the story")
        print("2. Make it shorter")
        print("3. Make it funnier")
        print("4. Change something else")

        choice = input("Enter your choice (1-4): ").strip()

        if choice == "1":
            print("Glad you liked the story! 🌙")
            break

        feedback_map = {
            "2": "Make the story shorter and more concise.",
            "3": "Make the story a bit funnier and more playful.",
            "4": input("What would you like to change? ")
        }

        feedback = feedback_map.get(choice)
        if not feedback:
            print("Invalid choice. Please try again.")
            continue

        story = run_story_engine(user_input, feedback=feedback)
        print("\n--- UPDATED BEDTIME STORY ---\n")
        print(story)


if __name__ == "__main__":
    main()