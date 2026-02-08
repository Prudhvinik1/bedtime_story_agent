import streamlit as st
from dotenv import load_dotenv
from src.story_engine import run_story_engine

load_dotenv(".env.local")

st.set_page_config(page_title="Bedtime Story Generator", page_icon="🌙")

st.title("🌙 Bedtime Story Generator")
st.write("Create a safe, comforting bedtime story for children aged 5–10.")

# ---- User Input ----
user_input = st.text_area(
    "What kind of bedtime story would you like?",
    placeholder="A story about a shy dragon who learns to make friends...",
    height=120
)

# ---- Session State ----
if "story" not in st.session_state:
    st.session_state.story = None

# ---- Generate Story ----
if st.button("Generate Story"):
    if not user_input.strip():
        st.warning("Please enter a story request.")
    else:
        with st.spinner("Creating a bedtime story..."):
            st.session_state.story = run_story_engine(user_input)

# ---- Display Story ----
if st.session_state.story:
    st.subheader("📖 Your Bedtime Story")
    st.write(st.session_state.story)

    st.divider()
    st.subheader("Would you like to change something?")

    col1, col2, col3 = st.columns(3)

    feedback = None

    with col1:
        if st.button("Make it shorter"):
            feedback = "Make the story shorter and more concise."

    with col2:
        if st.button("Make it funnier"):
            feedback = "Make the story a bit funnier and more playful."

    with col3:
        if st.button("Change something else"):
            feedback = st.text_input("What would you like to change?")

    if feedback:
        with st.spinner("Updating the story..."):
            st.session_state.story = run_story_engine(user_input, feedback=feedback)
            st.experimental_rerun()
