from typing import Optional

from app.schemas.auth import TelegramBootstrapProfile
from app.schemas.bootstrap import BootstrapHomeState
from app.schemas.numerology import NumerologyCalculationResponse
from app.schemas.profile import AppProfile


def build_home_state(
    *,
    app_profile: Optional[AppProfile],
    profile: TelegramBootstrapProfile,
    first_reading: Optional[NumerologyCalculationResponse],
    compatibility_preview_available: bool,
    is_premium: bool,
) -> BootstrapHomeState:
    profile_ready = app_profile is not None
    has_first_reading = first_reading is not None
    today_available = profile.daily_opt_in and has_first_reading
    compatibility_available = has_first_reading

    if not profile_ready:
        current_view = "onboarding"
    elif not has_first_reading:
        current_view = "first_reading"
    else:
        current_view = "home"

    summary = build_home_summary(
        current_view=current_view,
        today_available=today_available,
        compatibility_preview_available=compatibility_preview_available,
        is_premium=is_premium,
    )
    section_order = build_section_order(
        current_view=current_view,
        today_available=today_available,
        compatibility_available=compatibility_available,
    )
    available_sections = [
        section
        for section in section_order
        if section not in {"today", "compatibility"}
        or (section == "today" and today_available)
        or (section == "compatibility" and compatibility_available)
    ]
    resume_point = resolve_resume_point(
        current_view=current_view,
        today_available=today_available,
        compatibility_preview_available=compatibility_preview_available,
    )

    return BootstrapHomeState(
        profile_ready=profile_ready,
        today_available=today_available,
        has_first_reading=has_first_reading,
        compatibility_available=compatibility_available,
        focus_section=resolve_focus_section(
            current_view=current_view,
            today_available=today_available,
            compatibility_preview_available=compatibility_preview_available,
        ),
        entry_section=resolve_entry_section(
            current_view=current_view,
            today_available=today_available,
            compatibility_preview_available=compatibility_preview_available,
        ),
        section_badges=build_section_badges(
            current_view=current_view,
            today_available=today_available,
            compatibility_available=compatibility_available,
            compatibility_preview_available=compatibility_preview_available,
            is_premium=is_premium,
        ),
        section_descriptions=build_section_descriptions(
            current_view=current_view,
            today_available=today_available,
            compatibility_available=compatibility_available,
            compatibility_preview_available=compatibility_preview_available,
            is_premium=is_premium,
        ),
        section_states=build_section_states(
            current_view=current_view,
            today_available=today_available,
            compatibility_available=compatibility_available,
            compatibility_preview_available=compatibility_preview_available,
        ),
        section_actions=build_section_actions(
            current_view=current_view,
            today_available=today_available,
            compatibility_available=compatibility_available,
            compatibility_preview_available=compatibility_preview_available,
        ),
        available_sections=available_sections,
        section_order=section_order,
        today_state=resolve_today_state(
            has_first_reading=has_first_reading,
            daily_opt_in=profile.daily_opt_in,
        ),
        compatibility_state=resolve_compatibility_state(
            compatibility_available=compatibility_available,
            compatibility_preview_available=compatibility_preview_available,
        ),
        current_view=current_view,
        resume_point=resume_point,
        headline=summary["headline"],
        supporting_text=summary["supporting_text"],
        next_step=summary["next_step"],
        primary_action=resolve_primary_action(
            current_view=current_view,
            today_available=today_available,
            compatibility_preview_available=compatibility_preview_available,
        ),
        unfinished_flow=resolve_unfinished_flow(
            profile_ready=profile_ready,
            has_first_reading=has_first_reading,
        ),
    )


def resolve_unfinished_flow(
    *,
    profile_ready: bool,
    has_first_reading: bool,
) -> Optional[str]:
    if not profile_ready:
        return "onboarding"

    if not has_first_reading:
        return "first_reading"

    return None


def resolve_today_state(
    *,
    has_first_reading: bool,
    daily_opt_in: bool,
) -> str:
    if not has_first_reading:
        return "locked"

    if not daily_opt_in:
        return "opted_out"

    return "ready"


def resolve_compatibility_state(
    *,
    compatibility_available: bool,
    compatibility_preview_available: bool,
) -> str:
    if not compatibility_available:
        return "locked"

    if compatibility_preview_available:
        return "previewed"

    return "ready"


def build_home_summary(
    *,
    current_view: str,
    today_available: bool,
    compatibility_preview_available: bool,
    is_premium: bool,
) -> dict[str, str]:
    if current_view == "onboarding":
        return {
            "headline": "Start with your birth date.",
            "supporting_text": (
                "We use it to calculate your core numbers and open your personal reading."
            ),
            "next_step": "Complete onboarding",
        }

    if current_view == "first_reading":
        return {
            "headline": "Your profile is saved. Your first reading is next.",
            "supporting_text": (
                "Your details are in place. Now we can generate the five-card reading that unlocks the full app flow."
            ),
            "next_step": "Generate first reading",
        }

    if compatibility_preview_available:
        if is_premium:
            return {
                "headline": "Your premium compatibility access is active.",
                "supporting_text": (
                    "Your saved compatibility is still the active return point, and premium continuation is available in this session."
                ),
                "next_step": "Continue compatibility",
            }
        return {
            "headline": "Your compatibility preview is ready to pick up.",
            "supporting_text": (
                "Your reading is saved, today's insight is available, and the latest compatibility preview is waiting for you."
            ),
            "next_step": "Continue compatibility",
        }

    if today_available:
        return {
            "headline": "Today's insight is ready.",
            "supporting_text": (
                "Your first reading is saved and daily guidance is turned on, so you can jump straight into today's card."
            ),
            "next_step": "Open today's card",
        }

    return {
        "headline": "Your reading is ready to explore.",
        "supporting_text": (
            "You can revisit your core numbers now and continue into compatibility whenever you want."
        ),
        "next_step": "Explore compatibility",
    }


def resolve_resume_point(
    *,
    current_view: str,
    today_available: bool,
    compatibility_preview_available: bool,
) -> str:
    if current_view == "onboarding":
        return "onboarding"

    if current_view == "first_reading":
        return "first_reading"

    if compatibility_preview_available:
        return "compatibility_preview"

    if today_available:
        return "today"

    return "home"


def resolve_focus_section(
    *,
    current_view: str,
    today_available: bool,
    compatibility_preview_available: bool,
) -> str:
    if current_view != "home":
        return "overview"

    if compatibility_preview_available:
        return "compatibility"

    if today_available:
        return "today"

    return "overview"


def resolve_primary_action(
    *,
    current_view: str,
    today_available: bool,
    compatibility_preview_available: bool,
) -> str:
    if current_view == "onboarding":
        return "complete_onboarding"

    if current_view == "first_reading":
        return "generate_first_reading"

    if compatibility_preview_available:
        return "continue_compatibility"

    if today_available:
        return "open_today"

    return "open_compatibility"


def resolve_entry_section(
    *,
    current_view: str,
    today_available: bool,
    compatibility_preview_available: bool,
) -> str:
    if current_view == "onboarding":
        return "onboarding"

    if current_view == "first_reading":
        return "first_reading"

    if compatibility_preview_available:
        return "compatibility"

    if today_available:
        return "today"

    return "overview"


def build_section_badges(
    *,
    current_view: str,
    today_available: bool,
    compatibility_available: bool,
    compatibility_preview_available: bool,
    is_premium: bool,
) -> dict[str, str]:
    if current_view == "onboarding":
        return {"onboarding": "Start here"}

    if current_view == "first_reading":
        return {
            "profile": "Saved",
            "first_reading": "Next",
        }

    badges = {
        "overview": "Ready",
        "reading": "Saved",
    }

    if today_available:
        badges["today"] = "Ready now"

    if compatibility_preview_available and is_premium:
        badges["compatibility"] = "Premium active"
    elif compatibility_preview_available:
        badges["compatibility"] = "Preview saved"
    elif compatibility_available:
        badges["compatibility"] = "Available"

    return badges


def build_section_descriptions(
    *,
    current_view: str,
    today_available: bool,
    compatibility_available: bool,
    compatibility_preview_available: bool,
    is_premium: bool,
) -> dict[str, str]:
    if current_view == "onboarding":
        return {
            "onboarding": "Save the birth date that unlocks the rest of the app.",
        }

    if current_view == "first_reading":
        return {
            "profile": "Your saved details are ready to use.",
            "first_reading": "Generate the five-card reading that opens the home flow.",
        }

    descriptions = {
        "overview": "A quick summary of what is ready right now.",
        "profile": "Your saved birth date and display details.",
        "reading": "Your core numerology reading and numbers.",
    }

    if today_available:
        descriptions["today"] = "A single daily insight based on your current cycle."

    if compatibility_preview_available and is_premium:
        descriptions["compatibility"] = (
            "Your saved compatibility remains the active return point, and premium continuation is already available."
        )
    elif compatibility_preview_available:
        descriptions["compatibility"] = (
            "Your latest preview is saved and ready to continue."
        )
    elif compatibility_available:
        descriptions["compatibility"] = (
            "Start a compatibility preview from your saved reading."
        )

    return descriptions


def build_section_states(
    *,
    current_view: str,
    today_available: bool,
    compatibility_available: bool,
    compatibility_preview_available: bool,
) -> dict[str, str]:
    if current_view == "onboarding":
        return {
            "onboarding": "active",
        }

    if current_view == "first_reading":
        return {
            "profile": "saved",
            "first_reading": "active",
        }

    states = {
        "overview": "ready",
        "profile": "saved",
        "reading": "saved",
    }

    if today_available:
        states["today"] = "ready"

    if compatibility_preview_available:
        states["compatibility"] = "previewed"
    elif compatibility_available:
        states["compatibility"] = "ready"

    return states


def build_section_actions(
    *,
    current_view: str,
    today_available: bool,
    compatibility_available: bool,
    compatibility_preview_available: bool,
) -> dict[str, str]:
    if current_view == "onboarding":
        return {
            "onboarding": "complete_onboarding",
        }

    if current_view == "first_reading":
        return {
            "profile": "review_profile",
            "first_reading": "generate_first_reading",
        }

    actions = {
        "overview": "review_home",
        "profile": "review_profile",
        "reading": "open_reading",
    }

    if today_available:
        actions["today"] = "open_today"

    if compatibility_preview_available:
        actions["compatibility"] = "continue_compatibility"
    elif compatibility_available:
        actions["compatibility"] = "open_compatibility"

    return actions


def build_section_order(
    *,
    current_view: str,
    today_available: bool,
    compatibility_available: bool,
) -> list[str]:
    if current_view == "onboarding":
        return ["onboarding"]

    if current_view == "first_reading":
        return ["profile", "first_reading"]

    ordered_sections = ["overview", "profile", "reading"]

    if today_available:
        ordered_sections.append("today")

    if compatibility_available:
        ordered_sections.append("compatibility")

    return ordered_sections
