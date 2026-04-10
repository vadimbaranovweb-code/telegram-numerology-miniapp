FROM python:3.11-slim

WORKDIR /app

# Bot uses Python stdlib only — no pip install needed.
COPY bot/ ./bot/

CMD ["python", "-m", "bot.serve"]
