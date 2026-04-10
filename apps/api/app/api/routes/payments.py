from fastapi import APIRouter

from app.schemas.payments import (
    TelegramPaymentWebhookRequest,
    TelegramPaymentWebhookResponse,
)
from app.services.payments import process_telegram_payment_webhook


router = APIRouter()


@router.post("/webhook/telegram", response_model=TelegramPaymentWebhookResponse)
def telegram_payment_webhook(
    payload: TelegramPaymentWebhookRequest,
) -> TelegramPaymentWebhookResponse:
    return process_telegram_payment_webhook(payload)
