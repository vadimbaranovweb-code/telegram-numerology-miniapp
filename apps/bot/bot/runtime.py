import json
import logging
from dataclasses import dataclass
from typing import Any, Optional
from urllib import request

from bot.handlers.payments import handle_successful_payment_update

logger = logging.getLogger(__name__)

TELEGRAM_API_BASE = "https://api.telegram.org"


@dataclass(frozen=True)
class BotRuntimeConfig:
    api_base_url: str
    bot_token: str = ""


def process_telegram_update(
    *,
    config: BotRuntimeConfig,
    update: dict[str, Any],
    opener: Any = None,
) -> Optional[dict[str, Any]]:
    if _has_pre_checkout_query(update):
        _answer_pre_checkout_query(
            bot_token=config.bot_token,
            pre_checkout_query_id=update["pre_checkout_query"]["id"],
            opener=opener,
        )
        return None

    if _has_successful_payment(update):
        if opener is None:
            return handle_successful_payment_update(
                api_base_url=config.api_base_url,
                update=update,
            )

        return handle_successful_payment_update(
            api_base_url=config.api_base_url,
            update=update,
            opener=opener,
        )

    return None


def _has_pre_checkout_query(update: dict[str, Any]) -> bool:
    return isinstance(update.get("pre_checkout_query"), dict)


def _answer_pre_checkout_query(
    *,
    bot_token: str,
    pre_checkout_query_id: str,
    opener: Any = None,
) -> None:
    if not bot_token:
        logger.warning("bot_token not set, cannot answer pre_checkout_query")
        return

    url = f"{TELEGRAM_API_BASE}/bot{bot_token}/answerPreCheckoutQuery"
    payload = json.dumps({"pre_checkout_query_id": pre_checkout_query_id, "ok": True}).encode()
    req = request.Request(url, data=payload, headers={"Content-Type": "application/json"}, method="POST")

    _opener = opener if opener is not None else request.urlopen
    try:
        with _opener(req, timeout=8) as resp:
            result = json.loads(resp.read().decode())
            if not result.get("ok"):
                logger.error("answerPreCheckoutQuery failed: %s", result)
            else:
                logger.info("answerPreCheckoutQuery ok for %s", pre_checkout_query_id)
    except Exception:
        logger.exception("Failed to call answerPreCheckoutQuery")


def _has_successful_payment(update: dict[str, Any]) -> bool:
    message = update.get("message")

    if not isinstance(message, dict):
        return False

    return isinstance(message.get("successful_payment"), dict)
