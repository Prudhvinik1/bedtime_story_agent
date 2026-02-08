from src.validators import (
    MIN_WORDS,
    MAX_WORDS,
    validate_user_input,
    validate_story_length,
    has_positive_ending,
    validate_final_story,
)


def test_validate_user_input_empty():
    is_valid, error = validate_user_input("")
    assert not is_valid
    assert "cannot be empty" in error.lower()


def test_validate_user_input_banned_word():
    is_valid, error = validate_user_input("A story about a gun")
    assert not is_valid
    assert "not appropriate" in error.lower()


def test_validate_story_length_bounds():
    story = "word " * (MIN_WORDS - 1)
    assert not validate_story_length(story)

    story = "word " * MIN_WORDS
    assert validate_story_length(story)

    story = "word " * MAX_WORDS
    assert validate_story_length(story)

    story = "word " * (MAX_WORDS + 1)
    assert not validate_story_length(story)


def test_has_positive_ending():
    story = "Once upon a time.\nEveryone felt happy together."
    assert has_positive_ending(story)


def test_validate_final_story_passes():
    story = ("word " * (MIN_WORDS - 1)) + "happy"
    judge_result = {"verdict": "PASS"}
    is_valid, error = validate_final_story(story, judge_result)
    assert is_valid
    assert error == ""
