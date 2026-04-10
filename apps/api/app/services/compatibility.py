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
from app.services.app_state import save_compatibility_preview_state
from app.services.numerology.service import calculate_life_path_number
from app.services.offers import get_offer_by_key


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
    session_token: Optional[str] = None,
) -> CompatibilityPreviewResponse:
    source_life_path = calculate_life_path_number(source_birth_date)
    target_life_path = calculate_life_path_number(target_birth_date)
    difference = abs(source_life_path - target_life_path)
    target_name = target_display_name.strip() if target_display_name else "this person"

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
    )
