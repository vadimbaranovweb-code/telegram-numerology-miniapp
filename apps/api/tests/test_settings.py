from app.core.settings import Settings


def test_settings_default_to_sqlite_app_state_store() -> None:
    settings = Settings(_env_file=None)

    assert settings.app_state_store_mode == "sqlite"
    assert settings.app_state_store_path.endswith(".sqlite3")
    assert settings.app_state_store_sqlite_write_legacy is True
    assert settings.app_state_store_sqlite_auto_migrate is True
    assert settings.premium_payment_provider == "simulated"
    assert settings.telegram_bot_token is None
    assert settings.telegram_bot_username is None
    assert settings.telegram_stars_test_invoice_slug is None
    assert settings.telegram_stars_export_invoice_links is False


def test_settings_can_enable_telegram_stars_provider() -> None:
    settings = Settings(
        _env_file=None,
        premium_payment_provider="telegram_stars",
        telegram_bot_token="123:abc",
        telegram_bot_username="numerology_bot",
        telegram_stars_test_invoice_slug="invoice-slug",
        telegram_stars_export_invoice_links=True,
    )

    assert settings.premium_payment_provider == "telegram_stars"
    assert settings.telegram_bot_token == "123:abc"
    assert settings.telegram_bot_username == "numerology_bot"
    assert settings.telegram_stars_test_invoice_slug == "invoice-slug"
    assert settings.telegram_stars_export_invoice_links is True
