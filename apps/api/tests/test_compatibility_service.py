from datetime import date

from app.services.app_state import get_session_app_state, reset_app_state_store
from app.services.compatibility import build_compatibility_preview


def test_build_compatibility_preview() -> None:
    result = build_compatibility_preview(
        source_birth_date=date(1998, 6, 14),
        target_birth_date=date(1997, 11, 22),
        relationship_context="romantic",
        target_display_name="Max",
    )

    assert result.compatibility_request_id.startswith("compat_")
    assert result.preview.locked is True
    assert len(result.preview.cards) == 3
    assert result.paywall.offer_key == "compatibility_unlock_monthly"
    assert result.paywall.price_local == 0.13
    assert result.paywall.currency == "USD"
    assert result.paywall.stars_amount == 199
    assert "Max" in result.preview.summary


def test_build_compatibility_preview_persists_when_session_token_is_provided() -> None:
    reset_app_state_store()
    session_token = "tg_session_compatibility_store"

    result = build_compatibility_preview(
        session_token=session_token,
        source_birth_date=date(1998, 6, 14),
        target_birth_date=date(1997, 11, 22),
        relationship_context="romantic",
        target_display_name="Max",
    )

    session_state = get_session_app_state(session_token)

    assert session_state is not None
    assert session_state.compatibility_preview is not None
    assert (
        session_state.compatibility_preview.compatibility_request_id
        == result.compatibility_request_id
    )
