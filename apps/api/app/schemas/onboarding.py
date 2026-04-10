from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.profile import AppProfile


class OnboardingProfileRequest(BaseModel):
    session_token: str = Field(description="Temporary app session token")
    display_name: Optional[str] = Field(
        default=None,
        description="Optional display name",
    )
    birth_date: str = Field(description="Birth date in ISO format")
    daily_opt_in: bool = Field(default=False)


class OnboardingProfileResponse(BaseModel):
    profile_saved: bool
    profile: AppProfile


class OnboardingCompleteRequest(BaseModel):
    session_token: str = Field(description="Temporary app session token")


class OnboardingCompleteResponse(BaseModel):
    onboarding_completed: bool
    completed_at: datetime
