from datetime import date
from typing import Optional

from pydantic import BaseModel, Field


class NumerologyCalculationRequest(BaseModel):
    birth_date: date = Field(description="User birth date in ISO format")
    full_name: Optional[str] = Field(
        default=None,
        description="Optional full name used for Destiny and Soul Urge calculations",
    )


class ReadingPreviewCard(BaseModel):
    label: str
    headline: str
    body: str


class ReadingPreview(BaseModel):
    title: str
    summary: str
    cards: list[ReadingPreviewCard]


class PersonalityScores(BaseModel):
    leadership: int
    intuition: int
    creativity: int
    logic: int
    empathy: int


class PinnacleInfo(BaseModel):
    number: int
    start_age: int
    end_age: Optional[int] = None
    is_current: bool


class AiInsights(BaseModel):
    life_path_headline: str
    life_path_body: str
    year_energy_body: str
    personality_summary: str
    strength_headline: str
    strength_body: str
    shadow_headline: str
    shadow_body: str
    pinnacle_body: str
    karmic_body: str


class NumerologyCalculationResponse(BaseModel):
    birth_date: date
    life_path_number: int
    destiny_number: Optional[int] = None
    soul_urge_number: Optional[int] = None
    personal_year_number: int
    personal_month_number: int
    calculation_system: str
    calculation_version: str
    reading_preview: ReadingPreview
    personality_scores: Optional[PersonalityScores] = None
    pinnacles: list[PinnacleInfo] = Field(default_factory=list)
    karmic_lessons: list[int] = Field(default_factory=list)
    pythagorean_matrix: dict[int, int] = Field(default_factory=dict)
    ai_insights: Optional[AiInsights] = None
