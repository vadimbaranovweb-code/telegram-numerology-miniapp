from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.premium import TelegramPaymentConfirmationResponse


class TelegramSuccessfulPaymentPayload(BaseModel):
    currency: str
    total_amount: int
    invoice_payload: str
    telegram_payment_charge_id: str
    provider_payment_charge_id: Optional[str] = None


class TelegramPaymentWebhookRequest(BaseModel):
    session_token: Optional[str] = Field(
        default=None,
        description="Temporary app session token. Optional when it is encoded into invoice_payload.",
    )
    successful_payment: TelegramSuccessfulPaymentPayload


class TelegramPaymentWebhookResponse(BaseModel):
    processed: bool
    offer_key: str
    confirmation: TelegramPaymentConfirmationResponse
