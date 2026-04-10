from typing import Any, Optional

from bot.services.payments import process_successful_payment_update


def handle_successful_payment_update(
    *,
    api_base_url: str,
    update: dict[str, Any],
    opener: Any = None,
) -> Optional[dict[str, Any]]:
    if opener is None:
        return process_successful_payment_update(
            api_base_url=api_base_url,
            update=update,
        )

    return process_successful_payment_update(
        api_base_url=api_base_url,
        update=update,
        opener=opener,
    )
