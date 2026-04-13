from fastapi import APIRouter

from app.schemas.horoscope import (
    HoroscopeCompatibilityRequest,
    HoroscopeCompatibilityResponse,
    HoroscopeReadingRequest,
    HoroscopeReadingResponse,
)
from app.services.horoscope import build_horoscope, build_horoscope_compatibility


router = APIRouter()


@router.post("/reading", response_model=HoroscopeReadingResponse)
def get_horoscope_reading(
    payload: HoroscopeReadingRequest,
) -> HoroscopeReadingResponse:
    return build_horoscope(
        birth_date=payload.birth_date,
        full_name=payload.full_name,
    )


@router.post("/compatibility", response_model=HoroscopeCompatibilityResponse)
def get_horoscope_compatibility(
    payload: HoroscopeCompatibilityRequest,
) -> HoroscopeCompatibilityResponse:
    return build_horoscope_compatibility(
        source_birth_date=payload.source_birth_date,
        target_birth_date=payload.target_birth_date,
        target_display_name=payload.target_display_name,
    )
