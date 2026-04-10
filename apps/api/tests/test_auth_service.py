from app.services.auth import build_telegram_auth_response
from app.services.app_state import reset_app_state_store
from app.services.bootstrap import build_bootstrap_response


def test_build_telegram_auth_response() -> None:
    reset_app_state_store()
    init_data = (
        'query_id=abc123&user=%7B%22id%22%3A1%2C%22first_name%22%3A%22Anna%22%2C'
        '%22username%22%3A%22anna%22%7D&auth_date=123456'
    )

    result = build_telegram_auth_response(init_data)

    assert result.session_token.startswith("tg_session_")
    assert result.user.id.startswith("tg_user_")
    assert result.user.display_name == "anna"
    assert result.entry_context.source == "telegram_webapp"

    bootstrap = build_bootstrap_response(result.session_token)
    assert bootstrap.user.display_name == "anna"
