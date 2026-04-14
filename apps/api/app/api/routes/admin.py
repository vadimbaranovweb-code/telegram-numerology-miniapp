from typing import Optional

from fastapi import APIRouter, Header, HTTPException, status
from pydantic import BaseModel, Field

from app.core.settings import get_settings
from app.schemas.auth import (
    TelegramBootstrapProfile,
    TelegramBootstrapUser,
    TelegramEntryContext,
)
from app.services.app_state import (
    get_session_app_state,
    mark_session_premium_state,
    upsert_session_app_auth_state,
)
from app.services.auth import build_session_token_for_user


router = APIRouter()


class GrantPremiumRequest(BaseModel):
    telegram_user_id: str = Field(description="Telegram numeric user id, e.g. '12345678'")


class GrantPremiumResponse(BaseModel):
    telegram_user_id: str
    session_token: str
    is_premium: bool


def _require_admin_token(provided: Optional[str]) -> None:
    settings = get_settings()
    expected = settings.admin_token

    if not expected:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Admin endpoints are disabled (ADMIN_TOKEN not set).",
        )

    if not provided or provided != expected:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin token.",
        )


@router.post("/grant-premium", response_model=GrantPremiumResponse)
def grant_premium(
    payload: GrantPremiumRequest,
    x_admin_token: Optional[str] = Header(default=None, alias="X-Admin-Token"),
) -> GrantPremiumResponse:
    """Grant premium to a Telegram user by id, bypassing payment.

    Intended for one-off recovery (e.g., restoring state lost to a
    Railway /tmp wipe) or comping specific users. Protected by a
    shared secret via the X-Admin-Token header.
    """
    _require_admin_token(x_admin_token)

    session_token = build_session_token_for_user(payload.telegram_user_id)

    # Ensure a state row exists for this session_token so mark_premium can update it.
    if get_session_app_state(session_token) is None:
        upsert_session_app_auth_state(
            session_token=session_token,
            user=TelegramBootstrapUser(
                id=f"tg_user_{session_token.removeprefix('tg_session_')[:8]}",
                display_name=None,
                is_premium=False,
                premium_status="free",
            ),
            profile=TelegramBootstrapProfile(
                onboarding_completed=False,
                daily_opt_in=False,
            ),
            entry_context=TelegramEntryContext(source="admin_grant"),
        )

    stored_state = mark_session_premium_state(session_token)

    if stored_state is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to mark premium.",
        )

    return GrantPremiumResponse(
        telegram_user_id=payload.telegram_user_id,
        session_token=session_token,
        is_premium=stored_state.user.is_premium,
    )
