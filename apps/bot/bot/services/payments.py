import json
from typing import Any, Optional
from urllib import request


def build_telegram_payment_webhook_payload(update: dict[str, Any]) -> Optional[dict[str, Any]]:
    message = update.get("message")

    if not isinstance(message, dict):
        return None

    successful_payment = message.get("successful_payment")

    if successful_payment is None:
        return None

    if not isinstance(successful_payment, dict):
        raise ValueError("Telegram successful_payment payload must be an object.")

    required_fields = (
        "currency",
        "total_amount",
        "invoice_payload",
        "telegram_payment_charge_id",
    )

    missing_fields = [
        field_name
        for field_name in required_fields
        if successful_payment.get(field_name) in (None, "")
    ]
    if missing_fields:
        raise ValueError(
            f"Telegram successful_payment payload is missing required fields: {', '.join(missing_fields)}."
        )

    return {
        "successful_payment": {
            "currency": successful_payment["currency"],
            "total_amount": successful_payment["total_amount"],
            "invoice_payload": successful_payment["invoice_payload"],
            "telegram_payment_charge_id": successful_payment["telegram_payment_charge_id"],
            "provider_payment_charge_id": successful_payment.get(
                "provider_payment_charge_id"
            ),
        }
    }


def post_telegram_payment_webhook_payload(
    *,
    api_base_url: str,
    payload: dict[str, Any],
    opener: Any = request.urlopen,
) -> dict[str, Any]:
    endpoint = f"{api_base_url.rstrip('/')}/payments/webhook/telegram"
    req = request.Request(
        endpoint,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    with opener(req, timeout=10) as response:
        return json.loads(response.read().decode("utf-8"))


def process_successful_payment_update(
    *,
    api_base_url: str,
    update: dict[str, Any],
    opener: Any = request.urlopen,
) -> Optional[dict[str, Any]]:
    payload = build_telegram_payment_webhook_payload(update)

    if payload is None:
        return None

    return post_telegram_payment_webhook_payload(
        api_base_url=api_base_url,
        payload=payload,
        opener=opener,
    )
