from dataclasses import dataclass
from typing import Optional

from app.schemas.auth import (
    TelegramBootstrapProfile,
    TelegramBootstrapUser,
    TelegramEntryContext,
)
from app.schemas.compatibility import CompatibilityPreviewResponse
from app.schemas.numerology import NumerologyCalculationResponse
from app.schemas.profile import AppProfile


@dataclass
class TemporarySessionState:
    user: TelegramBootstrapUser
    profile: TelegramBootstrapProfile
    entry_context: TelegramEntryContext
    app_profile: Optional[AppProfile] = None
    first_reading: Optional[NumerologyCalculationResponse] = None
    compatibility_preview: Optional[CompatibilityPreviewResponse] = None


_SESSION_STATE_BY_TOKEN: dict[str, TemporarySessionState] = {}


def upsert_session_auth_state(
    *,
    session_token: str,
    user: TelegramBootstrapUser,
    profile: TelegramBootstrapProfile,
    entry_context: TelegramEntryContext,
) -> TemporarySessionState:
    existing_state = _SESSION_STATE_BY_TOKEN.get(session_token)

    if existing_state is None:
        existing_state = TemporarySessionState(
            user=user,
            profile=profile,
            entry_context=entry_context,
        )
        _SESSION_STATE_BY_TOKEN[session_token] = existing_state
        return existing_state

    existing_state.user = user.model_copy(
        update={
            "display_name": existing_state.app_profile.display_name
            if existing_state.app_profile
            and existing_state.app_profile.display_name
            else user.display_name,
        },
    )
    existing_state.profile = existing_state.profile.model_copy(
        update={
            "onboarding_completed": (
                existing_state.app_profile.onboarding_completed
                if existing_state.app_profile
                else profile.onboarding_completed
            ),
            "daily_opt_in": (
                existing_state.app_profile.daily_opt_in
                if existing_state.app_profile
                else profile.daily_opt_in
            ),
        },
    )
    existing_state.entry_context = entry_context
    return existing_state


def store_session_snapshot(
    *,
    session_token: str,
    app_profile: AppProfile,
    first_reading: NumerologyCalculationResponse,
) -> TemporarySessionState:
    existing_state = _SESSION_STATE_BY_TOKEN.get(session_token)

    if existing_state is None:
        existing_state = TemporarySessionState(
            user=TelegramBootstrapUser(id="tg_user_unknown"),
            profile=TelegramBootstrapProfile(),
            entry_context=TelegramEntryContext(),
        )
        _SESSION_STATE_BY_TOKEN[session_token] = existing_state

    existing_state.app_profile = app_profile
    existing_state.first_reading = first_reading
    existing_state.user = existing_state.user.model_copy(
        update={
            "display_name": app_profile.display_name
            or existing_state.user.display_name,
        },
    )
    existing_state.profile = existing_state.profile.model_copy(
        update={
            "onboarding_completed": app_profile.onboarding_completed,
            "daily_opt_in": app_profile.daily_opt_in,
        },
    )
    return existing_state


def get_session_state(session_token: str) -> Optional[TemporarySessionState]:
    return _SESSION_STATE_BY_TOKEN.get(session_token)


def save_app_profile_for_session(
    *,
    session_token: str,
    app_profile: AppProfile,
) -> TemporarySessionState:
    existing_state = _SESSION_STATE_BY_TOKEN.get(session_token)

    if existing_state is None:
        existing_state = TemporarySessionState(
            user=TelegramBootstrapUser(id="tg_user_unknown"),
            profile=TelegramBootstrapProfile(),
            entry_context=TelegramEntryContext(),
        )
        _SESSION_STATE_BY_TOKEN[session_token] = existing_state

    existing_state.app_profile = app_profile
    existing_state.user = existing_state.user.model_copy(
        update={
            "display_name": app_profile.display_name
            or existing_state.user.display_name,
        },
    )
    existing_state.profile = existing_state.profile.model_copy(
        update={
            "onboarding_completed": app_profile.onboarding_completed,
            "daily_opt_in": app_profile.daily_opt_in,
        },
    )
    return existing_state


def save_compatibility_preview_for_session(
    *,
    session_token: str,
    compatibility_preview: CompatibilityPreviewResponse,
) -> TemporarySessionState:
    existing_state = _SESSION_STATE_BY_TOKEN.get(session_token)

    if existing_state is None:
        existing_state = TemporarySessionState(
            user=TelegramBootstrapUser(id="tg_user_unknown"),
            profile=TelegramBootstrapProfile(),
            entry_context=TelegramEntryContext(),
        )
        _SESSION_STATE_BY_TOKEN[session_token] = existing_state

    existing_state.compatibility_preview = compatibility_preview
    return existing_state


def mark_premium_for_session(session_token: str) -> Optional[TemporarySessionState]:
    existing_state = _SESSION_STATE_BY_TOKEN.get(session_token)

    if existing_state is None:
        return None

    existing_state.user = existing_state.user.model_copy(
        update={
            "is_premium": True,
            "premium_status": "premium",
        },
    )
    return existing_state


def complete_onboarding_for_session(session_token: str) -> Optional[TemporarySessionState]:
    existing_state = _SESSION_STATE_BY_TOKEN.get(session_token)

    if existing_state is None:
        return None

    if existing_state.app_profile is not None:
        existing_state.app_profile = existing_state.app_profile.model_copy(
            update={"onboarding_completed": True},
        )

    existing_state.profile = existing_state.profile.model_copy(
        update={"onboarding_completed": True},
    )
    return existing_state


def clear_session_snapshot(session_token: str) -> None:
    existing_state = _SESSION_STATE_BY_TOKEN.get(session_token)

    if existing_state is None:
        return

    existing_state.app_profile = None
    existing_state.first_reading = None
    existing_state.compatibility_preview = None
    existing_state.profile = existing_state.profile.model_copy(
        update={
            "onboarding_completed": False,
            "daily_opt_in": False,
        },
    )


def reset_session_state_store() -> None:
    _SESSION_STATE_BY_TOKEN.clear()
