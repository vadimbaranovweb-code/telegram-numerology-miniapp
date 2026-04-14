from datetime import date
from typing import Optional
from uuid import uuid4

from app.schemas.compatibility import (
    CompatibilityPaywallPreview,
    CompatibilityPreviewCard,
    CompatibilityPreviewPayload,
    CompatibilityPreviewResponse,
    RelationshipContext,
)
from app.services.ai_compatibility import generate_compatibility_insights
from app.services.app_state import save_compatibility_preview_state
from app.services.numerology.service import calculate_life_path_number
from app.services.offers import get_offer_by_key
from app.core.settings import get_settings


# Base compatibility scores for life path pairs (symmetric matrix)
_BASE_COMPAT: dict[tuple[int, int], int] = {
    (1, 1): 75, (1, 2): 60, (1, 3): 85, (1, 4): 55, (1, 5): 90, (1, 6): 65, (1, 7): 70, (1, 8): 80, (1, 9): 70,
    (2, 2): 80, (2, 3): 70, (2, 4): 75, (2, 5): 55, (2, 6): 90, (2, 7): 65, (2, 8): 60, (2, 9): 85,
    (3, 3): 85, (3, 4): 50, (3, 5): 80, (3, 6): 75, (3, 7): 70, (3, 8): 65, (3, 9): 80,
    (4, 4): 80, (4, 5): 45, (4, 6): 70, (4, 7): 75, (4, 8): 85, (4, 9): 60,
    (5, 5): 70, (5, 6): 60, (5, 7): 75, (5, 8): 55, (5, 9): 80,
    (6, 6): 85, (6, 7): 70, (6, 8): 65, (6, 9): 90,
    (7, 7): 80, (7, 8): 70, (7, 9): 75,
    (8, 8): 75, (8, 9): 65,
    (9, 9): 85,
}

# Zone modifiers by relationship context [romance, communication, values, dynamics, longevity]
_ZONE_MODIFIERS: dict[str, list[int]] = {
    "romantic": [+12, 0,  +5, +8, -5],
    "friend":   [-5,  +10, +8, 0,  +5],
    "work":     [-10, +5,  +5, +12, +8],
}


def _get_base_score(a: int, b: int) -> int:
    key = (min(a, b), max(a, b))
    return _BASE_COMPAT.get(key, 65)


def _calculate_zone_scores(base: int, context: str) -> "CompatibilityZoneScores":
    from app.schemas.compatibility import CompatibilityZoneScores
    mods = _ZONE_MODIFIERS.get(context, [0, 0, 0, 0, 0])

    def clamp(v: int) -> int:
        return max(10, min(99, v))

    return CompatibilityZoneScores(
        romance=clamp(base + mods[0]),
        communication=clamp(base + mods[1]),
        values=clamp(base + mods[2]),
        dynamics=clamp(base + mods[3]),
        longevity=clamp(base + mods[4]),
    )


CONTEXT_TITLES: dict[RelationshipContext, str] = {
    "romantic": "Your connection has chemistry, but not the same rhythm.",
    "friend": "You support each other best when roles stay clear.",
    "work": "This match gets stronger when expectations are explicit.",
}

CONTEXT_NOTES: dict[RelationshipContext, str] = {
    "romantic": "The attraction is real, but pacing and emotional timing matter.",
    "friend": "The bond works when mutual support does not turn into emotional guesswork.",
    "work": "The strongest results come from clarity, boundaries, and well-defined ownership.",
}


def build_compatibility_preview(
    *,
    source_birth_date: date,
    target_birth_date: date,
    relationship_context: RelationshipContext,
    target_display_name: Optional[str] = None,
    source_display_name: Optional[str] = None,
    session_token: Optional[str] = None,
) -> CompatibilityPreviewResponse:
    source_life_path = calculate_life_path_number(source_birth_date)
    target_life_path = calculate_life_path_number(target_birth_date)
    difference = abs(source_life_path - target_life_path)
    target_name = target_display_name.strip() if target_display_name else "this person"

    compatibility_score = _get_base_score(source_life_path, target_life_path)
    zone_scores = _calculate_zone_scores(compatibility_score, relationship_context)

    settings = get_settings()
    ai_insights = None
    if settings.openai_api_key:
        ai_insights = generate_compatibility_insights(
            source_life_path=source_life_path,
            target_life_path=target_life_path,
            source_name=source_display_name,
            target_name=target_display_name,
            relationship_context=relationship_context,
            compatibility_score=compatibility_score,
            zone_scores=zone_scores.model_dump(),
            api_key=settings.openai_api_key,
        )

    if difference <= 1:
        dynamic_headline = "Easy understanding, shared pacing"
        dynamic_body = (
            f"Your Life Path {source_life_path} and their Life Path "
            f"{target_life_path} naturally read each other quickly. "
            "The bond feels easier when neither side overexplains every move."
        )
        tension_headline = "Comfort can hide the hard conversation"
        tension_body = (
            "Because the rhythm feels familiar, the first source of tension may be "
            "what both of you quietly avoid naming."
        )
    elif difference <= 3:
        dynamic_headline = "Strong pull, different pacing"
        dynamic_body = (
            f"Your Life Path {source_life_path} and their Life Path "
            f"{target_life_path} create useful contrast. "
            "There is energy here, but it works best when one person does not rush the other."
        )
        tension_headline = "Misread timing is the first pressure point"
        tension_body = (
            "The connection can feel uneven when one side wants movement and the other "
            "needs more emotional or practical setup."
        )
    else:
        dynamic_headline = "Different wiring, high learning potential"
        dynamic_body = (
            f"This pairing brings Life Path {source_life_path} together with "
            f"Life Path {target_life_path}. The strongest value comes from difference, "
            "not sameness."
        )
        tension_headline = "The gap shows up in priorities first"
        tension_body = (
            "The deeper challenge is not attraction or respect, but what each person "
            "thinks should happen next and why."
        )

    response = CompatibilityPreviewResponse(
        compatibility_request_id=f"compat_{uuid4().hex[:12]}",
        source_life_path=source_life_path,
        target_life_path=target_life_path,
        compatibility_score=compatibility_score,
        zone_scores=zone_scores,
        ai_insights=ai_insights,
        preview=CompatibilityPreviewPayload(
            title=CONTEXT_TITLES[relationship_context],
            summary=(
                f"With {target_name}, {CONTEXT_NOTES[relationship_context]} "
                "This preview shows the first visible layer before the deeper read."
            ),
            cards=[
                CompatibilityPreviewCard(
                    type="dynamic",
                    headline=dynamic_headline,
                    body=dynamic_body,
                ),
                CompatibilityPreviewCard(
                    type="tension_hint",
                    headline=tension_headline,
                    body=tension_body,
                ),
                CompatibilityPreviewCard(
                    type="locked_depth",
                    headline="Deeper compatibility layers stay locked for now",
                    body=(
                        "The full read will later expand this into communication style, "
                        "emotional friction, and long-term fit."
                    ),
                ),
            ],
            locked=True,
        ),
        paywall=_build_compatibility_paywall_preview(),
    )

    if session_token:
        save_compatibility_preview_state(
            session_token=session_token,
            compatibility_preview=response,
        )

    return response


def _build_compatibility_paywall_preview() -> CompatibilityPaywallPreview:
    offer = get_offer_by_key("compatibility_unlock_monthly")

    return CompatibilityPaywallPreview(
        offer_key=offer.offer_key,
        price_local=offer.price_local,
        currency=offer.currency,
        stars_amount=offer.stars_amount,
    )
