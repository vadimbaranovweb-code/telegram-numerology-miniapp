import pytest
from fastapi import HTTPException

from app.schemas.onboarding import OnboardingProfileRequest
from app.services.app_state import reset_app_state_store
from app.services.bootstrap import build_bootstrap_response
from app.services.onboarding import complete_onboarding, save_onboarding_profile
from app.services.readings import build_first_reading


def test_build_first_reading_requires_saved_profile() -> None:
    reset_app_state_store()

    with pytest.raises(HTTPException) as error:
        build_first_reading(session_token="tg_session_demo123")

    assert error.value.status_code == 400


def test_build_first_reading_persists_reading_in_session_state() -> None:
    reset_app_state_store()
    session_token = "tg_session_demo123"

    save_onboarding_profile(
        OnboardingProfileRequest(
            session_token=session_token,
            birth_date="1998-06-14",
            display_name="Anna",
            daily_opt_in=True,
        ),
    )
    complete_onboarding(session_token)

    reading = build_first_reading(session_token=session_token)

    assert reading.birth_date.isoformat() == "1998-06-14"
    assert reading.reading_preview.title == "Anna, here is your first reading preview"

    bootstrap = build_bootstrap_response(session_token)
    assert bootstrap.home_state.has_first_reading is True
    assert bootstrap.home_state.unfinished_flow is None
    assert bootstrap.first_reading is not None
