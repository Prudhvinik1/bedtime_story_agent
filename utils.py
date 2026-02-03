import os
from openai import OpenAI

def call_model(
    user_prompt: str,
    system_prompt: str | None = None,
    max_tokens: int = 3000,
    temperature: float = 0.1,
) -> str:
    api_key = os.getenv("OPENAI_API_KEY")
    client = OpenAI(api_key=api_key)

    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": user_prompt})

    resp = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=messages,
        max_tokens=max_tokens,
        temperature=temperature,
    )

    return resp.choices[0].message.content
