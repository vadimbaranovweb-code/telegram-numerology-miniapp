"""Production entry point: reads env vars and starts long-polling loop."""

import logging
import os

from bot.polling import run_polling

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)


def main() -> None:
    token = os.environ["TELEGRAM_BOT_TOKEN"]
    api_base_url = os.getenv(
        "BOT_BACKEND_API_BASE_URL",
        "http://127.0.0.1:8001/api/v1",
    )
    poll_timeout = int(os.getenv("BOT_POLL_TIMEOUT", "30"))

    run_polling(token=token, api_base_url=api_base_url, poll_timeout=poll_timeout)


if __name__ == "__main__":
    main()
