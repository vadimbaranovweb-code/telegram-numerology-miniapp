from datetime import date

from app.schemas.profile import AppProfile
from app.services.app_state import reset_app_state_store, save_onboarding_profile_state
from app.services.bootstrap import (
    build_bootstrap_response,
    reset_bootstrap_snapshot,
    save_bootstrap_snapshot,
)
from app.services.compatibility import build_compatibility_preview
from app.services.numerology.service import calculate_core_numbers
from app.services.premium import unlock_premium_offer


def test_build_bootstrap_response() -> None:
    reset_app_state_store()
    result = build_bootstrap_response("tg_session_demo123")

    assert result.restoration_mode == "empty"
    assert result.user.id.startswith("tg_user_")
    assert result.profile.onboarding_completed is False
    assert result.home_state.profile_ready is False
    assert result.home_state.today_available is False
    assert result.home_state.compatibility_available is False
    assert result.home_state.today_state == "locked"
    assert result.home_state.compatibility_state == "locked"
    assert result.home_state.current_view == "onboarding"
    assert result.home_state.unfinished_flow == "onboarding"


def test_bootstrap_response_returns_saved_snapshot() -> None:
    reset_app_state_store()
    session_token = "tg_session_demo123"

    save_bootstrap_snapshot(
        session_token=session_token,
        profile_snapshot=AppProfile(
            display_name="Anna",
            birth_date="1998-06-14",
            daily_opt_in=True,
            onboarding_completed=True,
        ),
        first_reading=calculate_core_numbers(
            date(1998, 6, 14),
            "Anna",
            current_date=date(2026, 4, 9),
        ),
    )

    result = build_bootstrap_response(session_token)

    assert result.restoration_mode == "restored_reading"
    assert result.user.display_name == "Anna"
    assert result.profile.onboarding_completed is True
    assert result.home_state.profile_ready is True
    assert result.home_state.today_available is True
    assert result.home_state.has_first_reading is True
    assert result.home_state.compatibility_available is True
    assert result.home_state.today_state == "ready"
    assert result.home_state.compatibility_state == "ready"
    assert result.home_state.current_view == "home"
    assert result.home_state.unfinished_flow is None
    assert result.app_profile is not None
    assert result.first_reading is not None


def test_bootstrap_response_returns_saved_profile_without_reading() -> None:
    reset_app_state_store()
    session_token = "tg_session_demo123"

    save_onboarding_profile_state(
        session_token=session_token,
        profile=AppProfile(
            display_name="Anna",
            birth_date="1998-06-14",
            daily_opt_in=True,
            onboarding_completed=False,
        ),
    )

    result = build_bootstrap_response(session_token)

    assert result.restoration_mode == "restored_profile"
    assert result.user.display_name == "Anna"
    assert result.profile.daily_opt_in is True
    assert result.home_state.profile_ready is True
    assert result.home_state.has_first_reading is False
    assert result.home_state.compatibility_available is False
    assert result.home_state.today_state == "locked"
    assert result.home_state.compatibility_state == "locked"
    assert result.home_state.current_view == "first_reading"
    assert result.home_state.unfinished_flow == "first_reading"
    assert result.app_profile is not None
    assert result.first_reading is None


def test_reset_bootstrap_snapshot_clears_saved_flow() -> None:
    reset_app_state_store()
    session_token = "tg_session_demo123"

    save_bootstrap_snapshot(
        session_token=session_token,
        profile_snapshot=AppProfile(
            display_name="Anna",
            birth_date="1998-06-14",
            daily_opt_in=True,
            onboarding_completed=True,
        ),
        first_reading=calculate_core_numbers(date(1998, 6, 14), "Anna"),
    )

    result = reset_bootstrap_snapshot(session_token)

    assert result.restoration_mode == "empty"
    assert result.profile.onboarding_completed is False
    assert result.home_state.profile_ready is False
    assert result.home_state.has_first_reading is False
    assert result.home_state.today_state == "locked"
    assert result.home_state.compatibility_state == "locked"
    assert result.home_state.current_view == "onboarding"
    assert result.home_state.unfinished_flow == "onboarding"
    assert result.app_profile is None
    assert result.first_reading is None


def test_bootstrap_response_marks_today_opted_out_after_reading() -> None:
    reset_app_state_store()
    session_token = "tg_session_opted_out"

    save_bootstrap_snapshot(
        session_token=session_token,
        profile_snapshot=AppProfile(
            display_name="Mia",
            birth_date="1993-02-11",
            daily_opt_in=False,
            onboarding_completed=True,
        ),
        first_reading=calculate_core_numbers(
            date(1993, 2, 11),
            "Mia",
            current_date=date(2026, 4, 9),
        ),
    )

    result = build_bootstrap_response(session_token)

    assert result.restoration_mode == "restored_reading"
    assert result.home_state.today_available is False
    assert result.home_state.today_state == "opted_out"
    assert result.home_state.compatibility_state == "ready"


def test_bootstrap_response_returns_saved_compatibility_preview() -> None:
    reset_app_state_store()
    session_token = "tg_session_compatibility"

    save_bootstrap_snapshot(
        session_token=session_token,
        profile_snapshot=AppProfile(
            display_name="Anna",
            birth_date="1998-06-14",
            daily_opt_in=True,
            onboarding_completed=True,
        ),
        first_reading=calculate_core_numbers(
            date(1998, 6, 14),
            "Anna",
            current_date=date(2026, 4, 9),
        ),
    )
    build_compatibility_preview(
        session_token=session_token,
        source_birth_date=date(1998, 6, 14),
        target_birth_date=date(1997, 11, 22),
        relationship_context="romantic",
        target_display_name="Max",
    )

    result = build_bootstrap_response(session_token)

    assert result.restoration_mode == "restored_home"
    assert result.compatibility_preview is not None
    assert result.compatibility_preview.preview.locked is True
    assert result.home_state.compatibility_state == "previewed"


def test_bootstrap_response_returns_premium_user_after_unlock() -> None:
    reset_app_state_store()
    session_token = "tg_session_premium"

    save_bootstrap_snapshot(
        session_token=session_token,
        profile_snapshot=AppProfile(
            display_name="Anna",
            birth_date="1998-06-14",
            daily_opt_in=True,
            onboarding_completed=True,
        ),
        first_reading=calculate_core_numbers(
            date(1998, 6, 14),
            "Anna",
            current_date=date(2026, 4, 9),
        ),
    )

    unlock_premium_offer(
        session_token=session_token,
        offer_key="compatibility_unlock_monthly",
    )

    result = build_bootstrap_response(session_token)

    assert result.user.is_premium is True
    assert result.user.premium_status == "premium"


def test_bootstrap_response_marks_compatibility_home_copy_as_premium_after_unlock() -> None:
    reset_app_state_store()
    session_token = "tg_session_premium_home"

    save_bootstrap_snapshot(
        session_token=session_token,
        profile_snapshot=AppProfile(
            display_name="Anna",
            birth_date="1998-06-14",
            daily_opt_in=True,
            onboarding_completed=True,
        ),
        first_reading=calculate_core_numbers(
            date(1998, 6, 14),
            "Anna",
            current_date=date(2026, 4, 9),
        ),
    )
    build_compatibility_preview(
        session_token=session_token,
        source_birth_date=date(1998, 6, 14),
        target_birth_date=date(1997, 11, 22),
        relationship_context="romantic",
        target_display_name="Max",
    )
    unlock_premium_offer(
        session_token=session_token,
        offer_key="compatibility_unlock_monthly",
    )

    result = build_bootstrap_response(session_token)

    assert result.user.is_premium is True
    assert result.home_state.compatibility_state == "previewed"
    assert result.home_state.section_badges["compatibility"] == "Premium active"
    assert (
        result.home_state.section_descriptions["compatibility"]
        == "Your saved compatibility remains the active return point, and premium continuation is already available."
    )
    assert result.home_state.headline == "Your premium compatibility access is active."
    assert (
        result.home_state.supporting_text
        == "Your saved compatibility is still the active return point, and premium continuation is available in this session."
    )
