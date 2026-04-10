from fastapi import APIRouter

from app.schemas.premium import (
    PremiumCheckoutSessionRequest,
    PremiumCheckoutSessionResponse,
    TelegramPaymentConfirmationRequest,
    TelegramPaymentConfirmationResponse,
    PremiumUnlockRequest,
    PremiumUnlockResponse,
)
from app.services.premium import (
    confirm_telegram_payment,
    create_premium_checkout_session,
    unlock_premium_offer,
)


router = APIRouter()


@router.post("/checkout-session", response_model=PremiumCheckoutSessionResponse)
def create_checkout_session(
    payload: PremiumCheckoutSessionRequest,
) -> PremiumCheckoutSessionResponse:
    return create_premium_checkout_session(
        session_token=payload.session_token,
        offer_key=payload.offer_key,
        compatibility_request_id=payload.compatibility_request_id,
    )


@router.post("/unlock", response_model=PremiumUnlockResponse)
def unlock_premium(payload: PremiumUnlockRequest) -> PremiumUnlockResponse:
    return unlock_premium_offer(
        session_token=payload.session_token,
        offer_key=payload.offer_key,
    )


@router.post(
    "/confirm-telegram-payment",
    response_model=TelegramPaymentConfirmationResponse,
)
def confirm_payment(
    payload: TelegramPaymentConfirmationRequest,
) -> TelegramPaymentConfirmationResponse:
    return confirm_telegram_payment(
        session_token=payload.session_token,
        offer_key=payload.offer_key,
        telegram_payment_charge_id=payload.telegram_payment_charge_id,
        provider_payment_charge_id=payload.provider_payment_charge_id,
    )
