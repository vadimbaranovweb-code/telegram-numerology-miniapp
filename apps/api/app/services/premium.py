from uuid import uuid4
from typing import Optional

from app.core.settings import get_settings
from app.schemas.premium import (
    PremiumCheckoutSessionResponse,
    TelegramPaymentConfirmationResponse,
    TelegramInvoicePrice,
    TelegramStarsInvoicePayload,
    PremiumUnlockResponse,
)
from app.services.app_state import get_session_app_state, mark_session_premium_state
from app.services.offers import get_offer_by_key
from app.services.telegram_payments import (
    create_telegram_invoice_link,
    extract_invoice_slug,
)


def create_premium_checkout_session(
    *,
    session_token: str,
    offer_key: str,
    compatibility_request_id: Optional[str] = None,
) -> PremiumCheckoutSessionResponse:
    stored_state = get_session_app_state(session_token)
    offer = get_offer_by_key(offer_key)
    settings = get_settings()
    provider_configured = _is_telegram_stars_provider_configured()
    invoice = _build_telegram_stars_invoice(
        offer_title=offer.title,
        offer_key=offer.offer_key,
        session_token=session_token,
        stars_amount=offer.stars_amount,
        compatibility_request_id=compatibility_request_id,
    )
    exported_invoice_url = create_telegram_invoice_link(invoice)
    exported_invoice_slug = (
        extract_invoice_slug(exported_invoice_url)
        if exported_invoice_url is not None
        else None
    )
    invoice_slug = exported_invoice_slug or _resolve_invoice_slug(settings)
    invoice_url = exported_invoice_url or (
        _build_invoice_url(invoice_slug) if invoice_slug else None
    )

    if stored_state is None:
        raise ValueError("Could not create checkout session for this session.")

    deep_link = None
    if compatibility_request_id:
        deep_link = f"tg://resolve?domain=numerology&startapp=compat_{compatibility_request_id}"

    return PremiumCheckoutSessionResponse(
        checkout_session_id=f"checkout_{uuid4().hex[:12]}",
        offer_key=offer.offer_key,
        provider_configured=provider_configured,
        invoice_slug=invoice_slug,
        invoice_url=invoice_url,
        invoice=invoice,
        stars_amount=offer.stars_amount,
        deep_link=deep_link,
    )


def unlock_premium_offer(
    *,
    session_token: str,
    offer_key: str,
) -> PremiumUnlockResponse:
    stored_state = mark_session_premium_state(session_token)

    if stored_state is None:
        fallback_state = get_session_app_state(session_token)

        if fallback_state is None:
            raise ValueError("Could not unlock premium for this session.")

        stored_state = fallback_state

    return PremiumUnlockResponse(
        unlocked=stored_state.user.is_premium,
        offer_key=offer_key,
        user=stored_state.user,
    )


def confirm_telegram_payment(
    *,
    session_token: str,
    offer_key: str,
    telegram_payment_charge_id: str,
    provider_payment_charge_id: Optional[str] = None,
) -> TelegramPaymentConfirmationResponse:
    stored_state = mark_session_premium_state(session_token)

    if stored_state is None:
        fallback_state = get_session_app_state(session_token)

        if fallback_state is None:
            raise ValueError("Could not confirm premium payment for this session.")

        stored_state = fallback_state

    return TelegramPaymentConfirmationResponse(
        confirmed=stored_state.user.is_premium,
        offer_key=offer_key,
        telegram_payment_charge_id=telegram_payment_charge_id,
        provider_payment_charge_id=provider_payment_charge_id,
        user=stored_state.user,
    )


def _is_telegram_stars_provider_configured() -> bool:
    settings = get_settings()

    if settings.premium_payment_provider != "telegram_stars":
        return False

    # Telegram Stars does not require a third-party provider token —
    # only the bot token and username are needed to issue invoices.
    return bool(settings.telegram_bot_token) and bool(settings.telegram_bot_username)


def _resolve_invoice_slug(settings) -> Optional[str]:
    if not _is_telegram_stars_provider_configured():
        return None

    return settings.telegram_stars_test_invoice_slug


def _build_invoice_url(invoice_slug: str) -> str:
    return f"https://t.me/${invoice_slug}"


def _build_telegram_stars_invoice(
    *,
    offer_title: str,
    offer_key: str,
    session_token: str,
    stars_amount: int,
    compatibility_request_id: Optional[str] = None,
) -> TelegramStarsInvoicePayload:
    suffix = compatibility_request_id or uuid4().hex[:12]
    start_parameter = f"premium-{offer_key}-{suffix}"

    return TelegramStarsInvoicePayload(
        title=offer_title,
        description=(
            "Unlock the full compatibility reading with deeper cards and the saved premium continuation."
        ),
        payload=f"premium:{offer_key}:{session_token}:{suffix}",
        prices=[
            TelegramInvoicePrice(
                label=offer_title,
                amount=stars_amount,
            )
        ],
        start_parameter=start_parameter[:64],
    )
