"""Long-polling loop for Telegram getUpdates — stdlib only, no third-party deps."""

import json
import logging
import time
from typing import Any
from urllib import request

from bot.runtime import BotRuntimeConfig, process_telegram_update

logger = logging.getLogger(__name__)

TELEGRAM_API_BASE = "https://api.telegram.org"
_DEFAULT_POLL_TIMEOUT = 30
_RETRY_SLEEP = 5


def run_polling(
    *,
    token: str,
    api_base_url: str,
    poll_timeout: int = _DEFAULT_POLL_TIMEOUT,
) -> None:
    """Run Telegram long-polling loop until interrupted."""
    config = BotRuntimeConfig(api_base_url=api_base_url, bot_token=token)
    offset = 0

    logger.info("Bot polling started (poll_timeout=%ds).", poll_timeout)

    while True:
        try:
            updates = _get_updates(token=token, offset=offset, timeout=poll_timeout)
        except KeyboardInterrupt:
            logger.info("Bot polling stopped.")
            return
        except Exception:
            logger.exception("getUpdates failed, retrying in %ds.", _RETRY_SLEEP)
            time.sleep(_RETRY_SLEEP)
            continue

        for update in updates:
            update_id: int = update.get("update_id", 0)
            try:
                process_telegram_update(config=config, update=update)
            except Exception:
                logger.exception("Failed to process update %d.", update_id)
            offset = update_id + 1


def _get_updates(
    *,
    token: str,
    offset: int,
    timeout: int,
    opener: Any = request.urlopen,
) -> list[dict[str, Any]]:
    allowed = "message,pre_checkout_query"
    url = (
        f"{TELEGRAM_API_BASE}/bot{token}/getUpdates"
        f"?offset={offset}&timeout={timeout}&allowed_updates={allowed}"
    )
    req = request.Request(url, method="GET")

    with opener(req, timeout=timeout + 10) as resp:
        data: dict[str, Any] = json.loads(resp.read().decode("utf-8"))

    if not data.get("ok"):
        raise RuntimeError(f"getUpdates returned not-ok: {data}")

    result = data.get("result", [])

    if not isinstance(result, list):
        raise RuntimeError(f"getUpdates result is not a list: {result!r}")

    return result
