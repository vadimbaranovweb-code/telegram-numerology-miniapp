from app.services.app_state import reset_app_state_store
from app.schemas.onboarding import OnboardingProfileRequest
from app.services.bootstrap import build_bootstrap_response
from app.services.onboarding import complete_onboarding, save_onboarding_profile


def test_save_onboarding_profile_persists_temporary_profile() -> None:
    reset_app_state_store()
    session_token = "tg_session_demo123"

    response = save_onboarding_profile(
        OnboardingProfileRequest(
            session_token=session_token,
            birth_date="1998-06-14",
            display_name="Anna",
            daily_opt_in=True,
        ),
    )

    assert response.profile_saved is True
    assert response.profile.display_name == "Anna"
    assert response.profile.onboarding_completed is False

    bootstrap = build_bootstrap_response(session_token)
    assert bootstrap.app_profile is not None
    assert bootstrap.app_profile.birth_date == "1998-06-14"
    assert bootstrap.home_state.unfinished_flow == "first_reading"


def test_complete_onboarding_marks_session_state_completed() -> None:
    reset_app_state_store()
    session_token = "tg_session_demo123"

    save_onboarding_profile(
        OnboardingProfileRequest(
            session_token=session_token,
            birth_date="1998-06-14",
            display_name="Anna",
            daily_opt_in=False,
        ),
    )

    response = complete_onboarding(session_token)

    assert response.onboarding_completed is True

    bootstrap = build_bootstrap_response(session_token)
    assert bootstrap.profile.onboarding_completed is True
    assert bootstrap.app_profile is not None
    assert bootstrap.app_profile.onboarding_completed is True
