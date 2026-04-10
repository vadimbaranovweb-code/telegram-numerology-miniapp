from typing import Union

from app.schemas.payments import TelegramPaymentWebhookRequest, TelegramPaymentWebhookResponse
from app.services.premium import confirm_telegram_payment


def process_telegram_payment_webhook(
    payload: Union[TelegramPaymentWebhookRequest, dict],
) -> TelegramPaymentWebhookResponse:
    parsed_payload = TelegramPaymentWebhookRequest.model_validate(payload)

    offer_key, extracted_session_token = _extract_payment_context_from_invoice_payload(
        parsed_payload.successful_payment.invoice_payload
    )

    confirmation = confirm_telegram_payment(
        session_token=parsed_payload.session_token or extracted_session_token,
        offer_key=offer_key,
        telegram_payment_charge_id=parsed_payload.successful_payment.telegram_payment_charge_id,
        provider_payment_charge_id=parsed_payload.successful_payment.provider_payment_charge_id,
    )

    return TelegramPaymentWebhookResponse(
        processed=confirmation.confirmed,
        offer_key=offer_key,
        confirmation=confirmation,
    )


def _extract_payment_context_from_invoice_payload(invoice_payload: str) -> tuple[str, str]:
    prefix = "premium:"

    if not invoice_payload.startswith(prefix):
        raise ValueError("Unsupported Telegram invoice payload.")

    parts = invoice_payload.split(":", 3)

    if len(parts) < 4 or not parts[1] or not parts[2]:
        raise ValueError(
            "Could not extract offer key and session token from Telegram invoice payload."
        )

    return parts[1], parts[2]
