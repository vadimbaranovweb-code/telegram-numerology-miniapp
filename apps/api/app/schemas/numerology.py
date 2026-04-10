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
