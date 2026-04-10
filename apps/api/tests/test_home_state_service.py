from datetime import date

from app.schemas.auth import TelegramBootstrapProfile
from app.schemas.profile import AppProfile
from app.services.home_state import build_home_state
from app.services.numerology.service import calculate_core_numbers


def test_build_home_state_for_empty_bootstrap() -> None:
    result = build_home_state(
        app_profile=None,
        profile=TelegramBootstrapProfile(
            onboarding_completed=False,
            daily_opt_in=False,
        ),
        first_reading=None,
        compatibility_preview_available=False,
        is_premium=False,
    )

    assert result.profile_ready is False
    assert result.current_view == "onboarding"
    assert result.focus_section == "overview"
    assert result.entry_section == "onboarding"
    assert result.section_badges == {"onboarding": "Start here"}
    assert result.section_descriptions == {
        "onboarding": "Save the birth date that unlocks the rest of the app.",
    }
    assert result.section_states == {"onboarding": "active"}
    assert result.section_actions == {"onboarding": "complete_onboarding"}
    assert result.available_sections == ["onboarding"]
    assert result.section_order == ["onboarding"]
    assert result.today_state == "locked"
    assert result.compatibility_state == "locked"
    assert result.resume_point == "onboarding"
    assert result.headline == "Start with your birth date."
    assert (
        result.supporting_text
        == "We use it to calculate your core numbers and open your personal reading."
    )
    assert result.next_step == "Complete onboarding"
    assert result.primary_action == "complete_onboarding"
    assert result.unfinished_flow == "onboarding"


def test_build_home_state_for_ready_home_with_saved_compatibility_preview() -> None:
    result = build_home_state(
        app_profile=AppProfile(
            display_name="Anna",
            birth_date="1998-06-14",
            daily_opt_in=True,
            onboarding_completed=True,
        ),
        profile=TelegramBootstrapProfile(
            onboarding_completed=True,
            daily_opt_in=True,
        ),
        first_reading=calculate_core_numbers(
            date(1998, 6, 14),
            "Anna",
            current_date=date(2026, 4, 9),
        ),
        compatibility_preview_available=True,
        is_premium=False,
    )

    assert result.profile_ready is True
    assert result.current_view == "home"
    assert result.focus_section == "compatibility"
    assert result.entry_section == "compatibility"
    assert result.section_badges == {
        "overview": "Ready",
        "reading": "Saved",
        "today": "Ready now",
        "compatibility": "Preview saved",
    }
    assert result.section_descriptions == {
        "overview": "A quick summary of what is ready right now.",
        "profile": "Your saved birth date and display details.",
        "reading": "Your core numerology reading and numbers.",
        "today": "A single daily insight based on your current cycle.",
        "compatibility": "Your latest preview is saved and ready to continue.",
    }
    assert result.section_states == {
        "overview": "ready",
        "profile": "saved",
        "reading": "saved",
        "today": "ready",
        "compatibility": "previewed",
    }
    assert result.section_actions == {
        "overview": "review_home",
        "profile": "review_profile",
        "reading": "open_reading",
        "today": "open_today",
        "compatibility": "continue_compatibility",
    }
    assert result.available_sections == [
        "overview",
        "profile",
        "reading",
        "today",
        "compatibility",
    ]
    assert result.section_order == [
        "overview",
        "profile",
        "reading",
        "today",
        "compatibility",
    ]
    assert result.today_state == "ready"
    assert result.compatibility_state == "previewed"
    assert result.resume_point == "compatibility_preview"
    assert result.headline == "Your compatibility preview is ready to pick up."
    assert (
        result.supporting_text
        == "Your reading is saved, today's insight is available, and the latest compatibility preview is waiting for you."
    )
    assert result.next_step == "Continue compatibility"
    assert result.primary_action == "continue_compatibility"
    assert result.unfinished_flow is None


def test_build_home_state_for_today_resume_point() -> None:
    result = build_home_state(
        app_profile=AppProfile(
            display_name="Anna",
            birth_date="1998-06-14",
            daily_opt_in=True,
            onboarding_completed=True,
        ),
        profile=TelegramBootstrapProfile(
            onboarding_completed=True,
            daily_opt_in=True,
        ),
        first_reading=calculate_core_numbers(
            date(1998, 6, 14),
            "Anna",
            current_date=date(2026, 4, 9),
        ),
        compatibility_preview_available=False,
        is_premium=False,
    )

    assert result.current_view == "home"
    assert result.focus_section == "today"
    assert result.entry_section == "today"
    assert result.section_badges == {
        "overview": "Ready",
        "reading": "Saved",
        "today": "Ready now",
        "compatibility": "Available",
    }
    assert result.section_descriptions == {
        "overview": "A quick summary of what is ready right now.",
        "profile": "Your saved birth date and display details.",
        "reading": "Your core numerology reading and numbers.",
        "today": "A single daily insight based on your current cycle.",
        "compatibility": "Start a compatibility preview from your saved reading.",
    }
    assert result.section_states == {
        "overview": "ready",
        "profile": "saved",
        "reading": "saved",
        "today": "ready",
        "compatibility": "ready",
    }
    assert result.section_actions == {
        "overview": "review_home",
        "profile": "review_profile",
        "reading": "open_reading",
        "today": "open_today",
        "compatibility": "open_compatibility",
    }
    assert result.available_sections == ["overview", "profile", "reading", "today", "compatibility"]
    assert result.resume_point == "today"
    assert result.headline == "Today's insight is ready."
    assert result.next_step == "Open today's card"
    assert result.primary_action == "open_today"


def test_build_home_state_marks_saved_preview_as_premium_when_unlock_is_active() -> None:
    result = build_home_state(
        app_profile=AppProfile(
            display_name="Anna",
            birth_date="1998-06-14",
            daily_opt_in=True,
            onboarding_completed=True,
        ),
        profile=TelegramBootstrapProfile(
            onboarding_completed=True,
            daily_opt_in=True,
        ),
        first_reading=calculate_core_numbers(
            date(1998, 6, 14),
            "Anna",
            current_date=date(2026, 4, 9),
        ),
        compatibility_preview_available=True,
        is_premium=True,
    )

    assert result.section_badges["compatibility"] == "Premium active"
    assert (
        result.section_descriptions["compatibility"]
        == "Your saved compatibility remains the active return point, and premium continuation is already available."
    )
    assert result.section_states["compatibility"] == "previewed"
    assert result.section_actions["compatibility"] == "continue_compatibility"
    assert result.headline == "Your premium compatibility access is active."
    assert (
        result.supporting_text
        == "Your saved compatibility is still the active return point, and premium continuation is available in this session."
    )
    assert result.next_step == "Continue compatibility"
