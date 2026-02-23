FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY src/ /app/src/

RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir openai fastapi uvicorn python-dotenv pydantic-settings

EXPOSE 8080

CMD ["uvicorn", "src.api:app", "--host", "0.0.0.0", "--port", "8080"]
