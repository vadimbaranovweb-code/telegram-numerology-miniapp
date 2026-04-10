from typing import Literal, Optional

from pydantic import BaseModel, Field

from app.schemas.auth import TelegramBootstrapUser


class TelegramInvoicePrice(BaseModel):
    label: str
    amount: int


class TelegramStarsInvoicePayload(BaseModel):
    title: str
    description: str
    payload: str
    currency: Literal["XTR"] = "XTR"
    prices: list[TelegramInvoicePrice]
    start_parameter: str


class PremiumCheckoutSessionRequest(BaseModel):
    session_token: str = Field(description="Temporary app session token")
    offer_key: str = Field(description="Selected premium offer key")
    compatibility_request_id: Optional[str] = Field(
        default=None,
        description="Saved compatibility preview request id, when checkout starts from compatibility paywall",
    )


class PremiumCheckoutSessionResponse(BaseModel):
    checkout_session_id: str
    status: Literal["ready"] = "ready"
    provider: Literal["telegram_stars"] = "telegram_stars"
    mode: Literal["simulated"] = "simulated"
    provider_configured: bool = False
    offer_key: str
    invoice_slug: Optional[str] = None
    invoice_url: Optional[str] = None
    invoice: Optional[TelegramStarsInvoicePayload] = None
    stars_amount: int
    deep_link: Optional[str] = None


class PremiumUnlockRequest(BaseModel):
    session_token: str = Field(description="Temporary app session token")
    offer_key: str = Field(description="Selected premium offer key")


class TelegramPaymentConfirmationRequest(BaseModel):
    session_token: str = Field(description="Temporary app session token")
    offer_key: str = Field(description="Selected premium offer key")
    telegram_payment_charge_id: str = Field(
        description="Telegram payment charge identifier from successful payment payload"
    )
    provider_payment_charge_id: Optional[str] = Field(
        default=None,
        description="Provider payment charge identifier when present in Telegram payment payload",
    )


class PremiumUnlockResponse(BaseModel):
    unlocked: bool
    offer_key: str
    user: TelegramBootstrapUser


class TelegramPaymentConfirmationResponse(BaseModel):
    confirmed: bool
    payment_provider: Literal["telegram_stars"] = "telegram_stars"
    offer_key: str
    telegram_payment_charge_id: str
    provider_payment_charge_id: Optional[str] = None
    user: TelegramBootstrapUser
