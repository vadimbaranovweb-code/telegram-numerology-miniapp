from datetime import date
from typing import Literal, Optional

from pydantic import BaseModel, Field


ZodiacSign = Literal[
    "aries", "taurus", "gemini", "cancer", "leo", "virgo",
    "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
]

Element = Literal["fire", "earth", "air", "water"]


class HoroscopeReadingRequest(BaseModel):
    birth_date: date = Field(description="User birth date in ISO format")
    full_name: Optional[str] = Field(default=None)


class HoroscopeCompatibilityRequest(BaseModel):
    source_birth_date: date
    target_birth_date: date
    target_display_name: Optional[str] = Field(default=None)


class ZodiacCard(BaseModel):
    label: str
    headline: str
    body: str


class ZodiacInfo(BaseModel):
    sign: ZodiacSign
    sign_ru: str
    symbol: str
    element: Element
    element_ru: str
    ruling_planet: str
    date_range: str
    description: str


class DailyForecast(BaseModel):
    headline: str
    body: str
    lucky_number: int
    focus_area: str


class PersonalReading(BaseModel):
    rising_sign: ZodiacSign
    rising_sign_ru: str
    moon_sign: ZodiacSign
    moon_sign_ru: str
    strengths: list[str]
    weaknesses: list[str]
    element_summary: str
    summary: str


class ZodiacCompatibility(BaseModel):
    source_sign: ZodiacSign
    source_sign_ru: str
    target_sign: ZodiacSign
    target_sign_ru: str
    score: int  # 0-100
    headline: str
    body: str
    strengths: list[str]
    challenges: list[str]


class HoroscopeAiInsights(BaseModel):
    personal_body: str
    daily_extended: str
    life_guidance: str


class HoroscopeCompatAiInsights(BaseModel):
    compatibility_body: str
    advice: str


class HoroscopeReadingResponse(BaseModel):
    birth_date: date
    zodiac: ZodiacInfo
    daily_forecast: DailyForecast
    personal_reading: PersonalReading
    cards: list[ZodiacCard]
    ai_insights: Optional[HoroscopeAiInsights] = None


class HoroscopeCompatibilityResponse(BaseModel):
    source_zodiac: ZodiacInfo
    target_zodiac: ZodiacInfo
    compatibility: ZodiacCompatibility
    cards: list[ZodiacCard]
    ai_insights: Optional[HoroscopeCompatAiInsights] = None
