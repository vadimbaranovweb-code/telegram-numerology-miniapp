import pytest
from fastapi import HTTPException

from app.api.routes.admin import GrantPremiumRequest, grant_premium
from app.core.settings import get_settings
from app.services.app_state import reset_app_state_store
from app.services.auth import (
    build_session_token_for_user,
    build_telegram_auth_response,
)


def test_grant_premium_requires_token_to_be_configured(monkeypatch) -> None:
    reset_app_state_store()
    monkeypatch.delenv("ADMIN_TOKEN", raising=False)
    get_settings.cache_clear()

    with pytest.raises(HTTPException) as exc:
        grant_premium(GrantPremiumRequest(telegram_user_id="42"), x_admin_token="anything")
    assert exc.value.status_code == 503


def test_grant_premium_rejects_wrong_token(monkeypatch) -> None:
    reset_app_state_store()
    monkeypatch.setenv("ADMIN_TOKEN", "correct-secret")
    get_settings.cache_clear()

    with pytest.raises(HTTPException) as exc:
        grant_premium(GrantPremiumRequest(telegram_user_id="42"), x_admin_token="wrong")
    assert exc.value.status_code == 401


def test_grant_premium_creates_state_for_new_user(monkeypatch) -> None:
    reset_app_state_store()
    monkeypatch.setenv("ADMIN_TOKEN", "s3cret")
    get_settings.cache_clear()

    result = grant_premium(
        GrantPremiumRequest(telegram_user_id="42"), x_admin_token="s3cret"
    )

    assert result.is_premium is True
    assert result.telegram_user_id == "42"
    assert result.session_token == build_session_token_for_user("42")


def test_grant_premium_is_visible_on_subsequent_auth(monkeypatch) -> None:
    """End-to-end: grant premium via admin, then verify the user sees it
    in the auth response on the next app open (any device)."""
    reset_app_state_store()
    monkeypatch.setenv("ADMIN_TOKEN", "s3cret")
    get_settings.cache_clear()

    grant_premium(GrantPremiumRequest(telegram_user_id="7"), x_admin_token="s3cret")

    auth = build_telegram_auth_response(
        'query_id=abc&user=%7B%22id%22%3A7%2C%22first_name%22%3A%22X%22%7D&auth_date=1'
    )
    assert auth.user.is_premium is True
    assert auth.user.premium_status == "premium"
