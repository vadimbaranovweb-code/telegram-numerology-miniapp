from fastapi import APIRouter

from app.schemas.onboarding import (
    OnboardingCompleteRequest,
    OnboardingCompleteResponse,
    OnboardingProfileRequest,
    OnboardingProfileResponse,
)
from app.services.onboarding import complete_onboarding, save_onboarding_profile


router = APIRouter()


@router.post("/profile", response_model=OnboardingProfileResponse)
def save_profile(payload: OnboardingProfileRequest) -> OnboardingProfileResponse:
    return save_onboarding_profile(payload)


@router.post("/complete", response_model=OnboardingCompleteResponse)
def mark_onboarding_complete(
    payload: OnboardingCompleteRequest,
) -> OnboardingCompleteResponse:
    return complete_onboarding(payload.session_token)
