from datetime import date

from fastapi import HTTPException

from app.schemas.readings import FirstReadingResponse
from app.services.numerology.service import calculate_core_numbers
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
    first_reading = calculate_core_numbers(
        birth_date=date.fromisoformat(app_profile.birth_date),
        full_name=app_profile.display_name,
    )
    save_first_reading_state(
        session_token=session_token,
        profile=app_profile,
        first_reading=first_reading,
    )
    return FirstReadingResponse(**first_reading.model_dump())
