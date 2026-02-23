# Hippocratic AI Coding Assignment
Welcome to the [Hippocratic AI](https://www.hippocraticai.com) coding assignment

## Instructions
The attached code is a simple python script skeleton. Your goal is to take any simple bedtime story request and use prompting to tell a story appropriate for ages 5 to 10.
- Incorporate a LLM judge to improve the quality of the story
- Provide a block diagram of the system you create that illustrates the flow of the prompts and the interaction between judge, storyteller, user, and any other components you add
- Do not change the openAI model that is being used. 
- Please use your own openAI key, but do not include it in your final submission.
- Otherwise, you may change any code you like or add any files

---

## Rules
- This assignment is open-ended
- You may use any resources you like with the following restrictions
   - They must be resources that would be available to you if you worked here (so no other humans, no closed AIs, no unlicensed code, etc.)
   - Allowed resources include but not limited to Stack overflow, random blogs, chatGPT et al
   - You have to be able to explain how the code works, even if chatGPT wrote it
- DO NOT PUSH THE API KEY TO GITHUB. OpenAI will automatically delete it

## Architecture Diagram

![Architecture Diagram](architecture%20diagram.png)

## Steps to Run

### 1) Create a virtual environment (optional but recommended)
```bash
python -m venv .venv
source .venv/bin/activate
```

### 2) Install dependencies
```bash
pip install -r requirements.txt
# Optional (for Streamlit UI and tests):
pip install streamlit pytest pytest-cov
```

### 3) Add your OpenAI API key
Create a file named `.env.local` in the project root:

```bash
OPENAI_API_KEY=your_key_here
```

### 4) Run the app

#### Option A: Streamlit UI
```bash
streamlit run src/app.py
```

#### Option B: CLI
```bash
python -m src.main
```

#### Option C: API (FastAPI)
```bash
uvicorn src.api:app --reload --port 8000
```

### 5) Configuration (optional)
The API supports the following environment variables:
- `OPENAI_MODEL` (default: `gpt-3.5-turbo`)
- `OPENAI_TIMEOUT_SECONDS` (default: `30`)
- `MAX_INPUT_CHARS` (default: `1000`)
- `RATE_LIMIT_WINDOW_SECONDS` (default: `60`)
- `RATE_LIMIT_MAX_REQUESTS` (default: `30`)
---

