from app.core.settings import get_settings
from app.schemas.premium import TelegramInvoicePrice, TelegramStarsInvoicePayload
from app.services.telegram_payments import (
    create_telegram_invoice_link,
    extract_invoice_slug,
)


def test_extract_invoice_slug_from_t_me_dollar_link() -> None:
    result = extract_invoice_slug("https://t.me/$invoice-test-slug")

    assert result == "invoice-test-slug"


def test_extract_invoice_slug_from_tg_link() -> None:
    result = extract_invoice_slug("tg://invoice?slug=invoice-test-slug")

    assert result == "invoice-test-slug"


def test_create_telegram_invoice_link_returns_none_when_export_is_disabled(
    monkeypatch,
) -> None:
    monkeypatch.setenv("PREMIUM_PAYMENT_PROVIDER", "telegram_stars")
    monkeypatch.setenv("TELEGRAM_BOT_TOKEN", "123:abc")
    monkeypatch.setenv("TELEGRAM_STARS_EXPORT_INVOICE_LINKS", "false")
    get_settings.cache_clear()

    result = create_telegram_invoice_link(
        TelegramStarsInvoicePayload(
            title="Compatibility Unlock",
            description="Unlock the full compatibility reading.",
            payload="premium:compatibility_unlock_monthly:test",
            prices=[TelegramInvoicePrice(label="Compatibility Unlock", amount=350)],
            start_parameter="premium-compatibility-test",
        )
    )

    assert result is None
