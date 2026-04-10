from dataclasses import dataclass
from typing import Any, Optional

from bot.handlers.payments import handle_successful_payment_update


@dataclass(frozen=True)
class BotRuntimeConfig:
    api_base_url: str


def process_telegram_update(
    *,
    config: BotRuntimeConfig,
    update: dict[str, Any],
    opener: Any = None,
) -> Optional[dict[str, Any]]:
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


def _has_successful_payment(update: dict[str, Any]) -> bool:
    message = update.get("message")

    if not isinstance(message, dict):
        return False

    return isinstance(message.get("successful_payment"), dict)
