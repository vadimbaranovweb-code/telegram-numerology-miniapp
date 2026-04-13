from datetime import date

from app.core.settings import get_settings
from app.services.app_state import reset_app_state_store
from app.services.auth import build_telegram_auth_response
from app.services.compatibility import build_compatibility_preview
from app.services.premium import (
    confirm_telegram_payment,
    create_premium_checkout_session,
    unlock_premium_offer,
)


def test_create_premium_checkout_session_returns_simulated_telegram_stars_session() -> None:
    reset_app_state_store()
    get_settings.cache_clear()
    auth_response = build_telegram_auth_response(
        'query_id=abc123&user=%7B%22id%22%3A1%2C%22first_name%22%3A%22Anna%22%7D&auth_date=123456'
    )
    preview = build_compatibility_preview(
        session_token=auth_response.session_token,
        source_birth_date=date(1998, 6, 14),
        target_birth_date=date(1997, 11, 22),
        relationship_context="romantic",
        target_display_name="Max",
    )

    result = create_premium_checkout_session(
        session_token=auth_response.session_token,
        offer_key="compatibility_unlock_monthly",
        compatibility_request_id=preview.compatibility_request_id,
    )

    assert result.checkout_session_id.startswith("checkout_")
    assert result.status == "ready"
    assert result.provider == "telegram_stars"
    assert result.mode == "simulated"
    assert result.provider_configured is False
    assert result.offer_key == "compatibility_unlock_monthly"
    assert result.invoice_slug is None
    assert result.invoice_url is None
    assert result.invoice is not None
    assert result.invoice.currency == "XTR"
    assert result.invoice.prices[0].amount == 199
    assert (
        result.invoice.payload
        == f"premium:compatibility_unlock_monthly:{auth_response.session_token}:{preview.compatibility_request_id}"
    )
    assert result.stars_amount == 199
    assert preview.compatibility_request_id in (result.deep_link or "")


def test_create_premium_checkout_session_reports_configured_provider(
    monkeypatch,
) -> None:
    reset_app_state_store()
    monkeypatch.setenv("PREMIUM_PAYMENT_PROVIDER", "telegram_stars")
    monkeypatch.setenv("TELEGRAM_BOT_TOKEN", "123:abc")
    monkeypatch.setenv("TELEGRAM_BOT_USERNAME", "numerology_bot")
    get_settings.cache_clear()

    auth_response = build_telegram_auth_response(
        'query_id=abc123&user=%7B%22id%22%3A1%2C%22first_name%22%3A%22Anna%22%7D&auth_date=123456'
    )

    result = create_premium_checkout_session(
        session_token=auth_response.session_token,
        offer_key="compatibility_unlock_monthly",
    )

    assert result.provider_configured is True
    assert result.invoice_slug is None
    assert result.invoice_url is None
    assert result.invoice is not None
    assert result.invoice.title == "Compatibility Unlock"


def test_create_premium_checkout_session_returns_invoice_url_when_test_slug_is_set(
    monkeypatch,
) -> None:
    reset_app_state_store()
    monkeypatch.setenv("PREMIUM_PAYMENT_PROVIDER", "telegram_stars")
    monkeypatch.setenv("TELEGRAM_BOT_TOKEN", "123:abc")
    monkeypatch.setenv("TELEGRAM_BOT_USERNAME", "numerology_bot")
    monkeypatch.setenv("TELEGRAM_STARS_TEST_INVOICE_SLUG", "invoice-test-slug")
    get_settings.cache_clear()

    auth_response = build_telegram_auth_response(
        'query_id=abc123&user=%7B%22id%22%3A1%2C%22first_name%22%3A%22Anna%22%7D&auth_date=123456'
    )

    result = create_premium_checkout_session(
        session_token=auth_response.session_token,
        offer_key="compatibility_unlock_monthly",
    )

    assert result.provider_configured is True
    assert result.invoice_slug == "invoice-test-slug"
    assert result.invoice_url == "https://t.me/$invoice-test-slug"


def test_create_premium_checkout_session_prefers_exported_invoice_url(
    monkeypatch,
) -> None:
    reset_app_state_store()
    monkeypatch.setenv("PREMIUM_PAYMENT_PROVIDER", "telegram_stars")
    monkeypatch.setenv("TELEGRAM_BOT_TOKEN", "123:abc")
    monkeypatch.setenv("TELEGRAM_BOT_USERNAME", "numerology_bot")
    monkeypatch.setenv("TELEGRAM_STARS_EXPORT_INVOICE_LINKS", "true")
    get_settings.cache_clear()

    auth_response = build_telegram_auth_response(
        'query_id=abc123&user=%7B%22id%22%3A1%2C%22first_name%22%3A%22Anna%22%7D&auth_date=123456'
    )

    from app import services as _services  # noqa: PLC0415
    from app.services import premium as premium_service  # noqa: PLC0415

    monkeypatch.setattr(
        premium_service,
        "create_telegram_invoice_link",
        lambda invoice: "https://t.me/$exported-invoice-slug",
    )

    result = create_premium_checkout_session(
        session_token=auth_response.session_token,
        offer_key="compatibility_unlock_monthly",
    )

    assert result.invoice_slug == "exported-invoice-slug"
    assert result.invoice_url == "https://t.me/$exported-invoice-slug"


def test_unlock_premium_offer_marks_user_as_premium() -> None:
    reset_app_state_store()
    auth_response = build_telegram_auth_response(
        'query_id=abc123&user=%7B%22id%22%3A1%2C%22first_name%22%3A%22Anna%22%7D&auth_date=123456'
    )

    result = unlock_premium_offer(
        session_token=auth_response.session_token,
        offer_key="compatibility_unlock_monthly",
    )

    assert result.unlocked is True
    assert result.offer_key == "compatibility_unlock_monthly"
    assert result.user.is_premium is True
    assert result.user.premium_status == "premium"


def test_confirm_telegram_payment_marks_user_as_premium() -> None:
    reset_app_state_store()
    auth_response = build_telegram_auth_response(
        'query_id=abc123&user=%7B%22id%22%3A1%2C%22first_name%22%3A%22Anna%22%7D&auth_date=123456'
    )

    result = confirm_telegram_payment(
        session_token=auth_response.session_token,
        offer_key="compatibility_unlock_monthly",
        telegram_payment_charge_id="tg_charge_123",
        provider_payment_charge_id="provider_charge_456",
    )

    assert result.confirmed is True
    assert result.payment_provider == "telegram_stars"
    assert result.offer_key == "compatibility_unlock_monthly"
    assert result.telegram_payment_charge_id == "tg_charge_123"
    assert result.provider_payment_charge_id == "provider_charge_456"
    assert result.user.is_premium is True
    assert result.user.premium_status == "premium"
