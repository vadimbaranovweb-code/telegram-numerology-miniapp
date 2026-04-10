from typing import Literal, Optional

from pydantic import BaseModel, Field


class TelegramAuthRequest(BaseModel):
    init_data: str = Field(description="Telegram WebApp init data string")


class TelegramBootstrapUser(BaseModel):
    id: str
    display_name: Optional[str] = None
    is_premium: bool = False
    premium_status: Literal["free", "premium"] = "free"


class TelegramBootstrapProfile(BaseModel):
    onboarding_completed: bool = False
    daily_opt_in: bool = False


class TelegramEntryContext(BaseModel):
    source: str = "telegram_webapp"
    campaign: Optional[str] = None
    invite_token: Optional[str] = None


class TelegramAuthResponse(BaseModel):
    session_token: str
    user: TelegramBootstrapUser
    profile: TelegramBootstrapProfile
    entry_context: TelegramEntryContext
