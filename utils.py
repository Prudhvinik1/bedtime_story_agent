import os
import openai

def call_model(
    user_prompt: str,
    system_prompt: str | None = None,
    max_tokens: int = 3000,
    temperature: float = 0.1,
) -> str:
    openai.api_key = os.getenv("OPENAI_API_KEY")

    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": user_prompt})

    resp = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=messages,
        max_tokens=max_tokens,
        temperature=temperature,
    )

    return resp.choices[0].message["content"]
