from typing import Optional

from pydantic import BaseModel

from app.schemas.auth import TelegramBootstrapProfile, TelegramBootstrapUser
from app.schemas.compatibility import CompatibilityPreviewResponse
from app.schemas.numerology import NumerologyCalculationResponse
from app.schemas.profile import AppProfile


class BootstrapHomeState(BaseModel):
    profile_ready: bool
    today_available: bool
    has_first_reading: bool
    compatibility_available: bool
    focus_section: str
    entry_section: str
    section_badges: dict[str, str]
    section_descriptions: dict[str, str]
    section_states: dict[str, str]
    section_actions: dict[str, str]
    available_sections: list[str]
    section_order: list[str]
    today_state: str
    compatibility_state: str
    current_view: str
    resume_point: str
    headline: str
    supporting_text: str
    next_step: str
    primary_action: str
    unfinished_flow: Optional[str] = None


class BootstrapResponse(BaseModel):
    restoration_mode: str
    user: TelegramBootstrapUser
    profile: TelegramBootstrapProfile
    home_state: BootstrapHomeState
    app_profile: Optional[AppProfile] = None
    first_reading: Optional[NumerologyCalculationResponse] = None
    compatibility_preview: Optional[CompatibilityPreviewResponse] = None


class BootstrapSnapshotRequest(BaseModel):
    session_token: str
    app_profile: AppProfile
    first_reading: NumerologyCalculationResponse
