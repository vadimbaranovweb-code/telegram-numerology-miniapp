from functools import lru_cache
from typing import List, Literal, Optional

from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    app_name: str = "Telegram Numerology API"
    app_version: str = "0.1.0"
    api_prefix: str = "/api/v1"
    cors_origins: List[str] = Field(
        default_factory=lambda: [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:3001",
            "http://127.0.0.1:3001",
        ]
    )
    app_state_store_mode: Literal["memory", "file", "sqlite"] = "sqlite"
    app_state_store_path: str = "/tmp/telegram-numerology-miniapp-app-state.sqlite3"
    app_state_store_sqlite_write_legacy: bool = True
    app_state_store_sqlite_auto_migrate: bool = True
    premium_payment_provider: Literal["simulated", "telegram_stars"] = "simulated"
    telegram_bot_token: Optional[str] = None
    telegram_bot_username: Optional[str] = None
    # Telegram Stars does not use a third-party provider token.
    # Set telegram_stars_export_invoice_links=true to call createInvoiceLink API.
    telegram_stars_test_invoice_slug: Optional[str] = None
    telegram_stars_export_invoice_links: bool = False
    openai_api_key: Optional[str] = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
