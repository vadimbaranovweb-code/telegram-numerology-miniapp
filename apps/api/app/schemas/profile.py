from typing import Optional

from pydantic import BaseModel, Field


class AppProfile(BaseModel):
    display_name: Optional[str] = None
    birth_date: str
    daily_opt_in: bool
    onboarding_completed: bool


class ProfilePreviewRequest(BaseModel):
    display_name: Optional[str] = Field(default=None, description="Optional display name")
    birth_date: str = Field(description="Birth date in ISO format")
    daily_opt_in: bool = Field(default=False)


class ProfilePreviewResponse(AppProfile):
    storage_mode: str
