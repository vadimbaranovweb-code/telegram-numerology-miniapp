from hashlib import sha1
from typing import Optional
from urllib.parse import parse_qs, unquote

from app.schemas.auth import (
    TelegramAuthResponse,
    TelegramBootstrapProfile,
    TelegramBootstrapUser,
    TelegramEntryContext,
)
from app.services.app_state import upsert_session_app_auth_state


def build_telegram_auth_response(init_data: str) -> TelegramAuthResponse:
    parsed = parse_qs(init_data, keep_blank_values=True)
    user_blob = parsed.get("user", [None])[0]

    display_name = None
    if user_blob:
        display_name = extract_user_display_name(user_blob)

    token_suffix = sha1(init_data.encode("utf-8")).hexdigest()[:16]

    response = TelegramAuthResponse(
        session_token=f"tg_session_{token_suffix}",
        user=TelegramBootstrapUser(
            id=f"tg_user_{token_suffix[:8]}",
            display_name=display_name,
            is_premium=False,
            premium_status="free",
        ),
        profile=TelegramBootstrapProfile(
            onboarding_completed=False,
            daily_opt_in=False,
        ),
        entry_context=TelegramEntryContext(
            source="telegram_webapp",
            campaign=parsed.get("start_param", [None])[0],
            invite_token=parsed.get("invite_token", [None])[0],
        ),
    )

    upsert_session_app_auth_state(
        session_token=response.session_token,
        user=response.user,
        profile=response.profile,
        entry_context=response.entry_context,
    )

    return response


def extract_user_display_name(user_blob: str) -> Optional[str]:
    decoded = unquote(user_blob)

    for marker in ['"username":"', '"first_name":"']:
        if marker not in decoded:
            continue

        value = decoded.split(marker, 1)[1].split('"', 1)[0]
        if value:
            return value

    return None
