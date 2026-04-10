from datetime import datetime, timezone

from app.schemas.onboarding import (
    OnboardingCompleteResponse,
    OnboardingProfileRequest,
    OnboardingProfileResponse,
)
from app.schemas.profile import AppProfile
from app.services.app_state import (
    mark_onboarding_completed,
    save_onboarding_profile_state,
)


def save_onboarding_profile(
    payload: OnboardingProfileRequest,
) -> OnboardingProfileResponse:
    profile = AppProfile(
        display_name=payload.display_name,
        birth_date=payload.birth_date,
        daily_opt_in=payload.daily_opt_in,
        onboarding_completed=False,
    )
    save_onboarding_profile_state(
        session_token=payload.session_token,
        profile=profile,
    )
    return OnboardingProfileResponse(
        profile_saved=True,
        profile=profile,
    )


def complete_onboarding(session_token: str) -> OnboardingCompleteResponse:
    mark_onboarding_completed(session_token)
    return OnboardingCompleteResponse(
        onboarding_completed=True,
        completed_at=datetime.now(timezone.utc),
    )
