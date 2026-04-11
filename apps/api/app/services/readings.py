from datetime import date

from fastapi import HTTPException

from app.core.settings import get_settings
from app.schemas.readings import FirstReadingResponse
from app.services.ai_reading import generate_ai_insights
from app.services.numerology.service import (
    calculate_core_numbers,
    calculate_karmic_lessons,
    calculate_pinnacles,
    calculate_personal_year_number,
    calculate_life_path_number,
    calculate_personal_month_number,
    calculate_destiny_number,
    calculate_soul_urge_number,
)
from app.services.app_state import get_session_app_state, save_first_reading_state


def build_first_reading(
    *,
    session_token: str,
    force_regenerate: bool = False,
) -> FirstReadingResponse:
    session_state = get_session_app_state(session_token)

    if session_state is None or session_state.app_profile is None:
        raise HTTPException(
            status_code=400,
            detail="Onboarding profile must be saved before first reading generation.",
        )

    if session_state.first_reading is not None and not force_regenerate:
        return FirstReadingResponse(**session_state.first_reading.model_dump())

    app_profile = session_state.app_profile
    birth_date = date.fromisoformat(app_profile.birth_date)
    today = date.today()

    # Pre-calculate values needed for AI insights
    life_path_number = calculate_life_path_number(birth_date)
    personal_year_number = calculate_personal_year_number(birth_date, today)
    personal_month_number = calculate_personal_month_number(personal_year_number, today)
    pinnacles = calculate_pinnacles(birth_date, life_path_number, today)
    karmic_lessons = calculate_karmic_lessons(birth_date)

    # Pre-calculate name-based numbers so AI prompt has full context
    destiny_number = calculate_destiny_number(app_profile.display_name) if app_profile.display_name else None
    soul_urge_number = calculate_soul_urge_number(app_profile.display_name) if app_profile.display_name else None

    # Generate AI insights if OpenAI key is configured
    settings = get_settings()
    ai_insights = None
    if settings.openai_api_key:
        ai_insights = generate_ai_insights(
            full_name=app_profile.display_name,
            birth_date=birth_date,
            life_path_number=life_path_number,
            destiny_number=destiny_number,
            soul_urge_number=soul_urge_number,
            personal_year_number=personal_year_number,
            personal_month_number=personal_month_number,
            pinnacles=pinnacles,
            karmic_lessons=karmic_lessons,
            api_key=settings.openai_api_key,
        )

    first_reading = calculate_core_numbers(
        birth_date=birth_date,
        full_name=app_profile.display_name,
        ai_insights=ai_insights,
    )
    save_first_reading_state(
        session_token=session_token,
        profile=app_profile,
        first_reading=first_reading,
    )
    return FirstReadingResponse(**first_reading.model_dump())
