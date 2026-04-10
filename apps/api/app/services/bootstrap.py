from hashlib import sha1

from app.schemas.auth import TelegramBootstrapProfile, TelegramBootstrapUser
from app.schemas.bootstrap import BootstrapResponse
from app.schemas.numerology import NumerologyCalculationResponse
from app.schemas.profile import AppProfile
from app.services.app_state import (
    clear_session_app_state,
    get_session_app_state,
    save_first_reading_state,
)
from app.services.home_state import build_home_state


def build_bootstrap_response(session_token: str) -> BootstrapResponse:
    stored_state = get_session_app_state(session_token)

    if stored_state is not None:
        home_state = build_home_state(
            app_profile=stored_state.app_profile,
            profile=stored_state.profile,
            first_reading=stored_state.first_reading,
            compatibility_preview_available=stored_state.compatibility_preview is not None,
            is_premium=stored_state.user.is_premium,
        )

        return BootstrapResponse(
            restoration_mode=_resolve_restoration_mode(
                has_app_profile=stored_state.app_profile is not None,
                has_first_reading=stored_state.first_reading is not None,
                has_compatibility_preview=stored_state.compatibility_preview is not None,
            ),
            user=stored_state.user,
            profile=stored_state.profile,
            home_state=home_state,
            app_profile=stored_state.app_profile,
            first_reading=stored_state.first_reading,
            compatibility_preview=stored_state.compatibility_preview,
        )

    token_suffix = sha1(session_token.encode("utf-8")).hexdigest()[:8]
    return BootstrapResponse(
        restoration_mode="empty",
        user=TelegramBootstrapUser(
            id=f"tg_user_{token_suffix}",
            display_name=None,
            is_premium=False,
            premium_status="free",
        ),
        profile=TelegramBootstrapProfile(
            onboarding_completed=False,
            daily_opt_in=False,
        ),
        home_state=build_home_state(
            app_profile=None,
            profile=TelegramBootstrapProfile(
                onboarding_completed=False,
                daily_opt_in=False,
            ),
            first_reading=None,
            compatibility_preview_available=False,
            is_premium=False,
        ),
        app_profile=None,
    )


def save_bootstrap_snapshot(
    *,
    session_token: str,
    profile_snapshot: AppProfile,
    first_reading: NumerologyCalculationResponse,
) -> BootstrapResponse:
    save_first_reading_state(
        session_token=session_token,
        profile=profile_snapshot,
        first_reading=first_reading,
    )
    return build_bootstrap_response(session_token)


def reset_bootstrap_snapshot(session_token: str) -> BootstrapResponse:
    clear_session_app_state(session_token)
    return build_bootstrap_response(session_token)


def _resolve_restoration_mode(
    *,
    has_app_profile: bool,
    has_first_reading: bool,
    has_compatibility_preview: bool,
) -> str:
    if has_compatibility_preview:
        return "restored_home"

    if has_first_reading:
        return "restored_reading"

    if has_app_profile:
        return "restored_profile"

    return "empty"
