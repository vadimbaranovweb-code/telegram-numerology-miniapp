from app.services.app_state import reset_app_state_store
from app.services.auth import build_telegram_auth_response
from app.services.payments import process_telegram_payment_webhook


def test_process_telegram_payment_webhook_confirms_premium_payment() -> None:
    reset_app_state_store()
    auth_response = build_telegram_auth_response(
        'query_id=abc123&user=%7B%22id%22%3A1%2C%22first_name%22%3A%22Anna%22%7D&auth_date=123456'
    )

    result = process_telegram_payment_webhook(
        {
            "successful_payment": {
                "currency": "XTR",
                "total_amount": 350,
                "invoice_payload": (
                    f"premium:compatibility_unlock_monthly:{auth_response.session_token}:compat_abc123"
                ),
                "telegram_payment_charge_id": "tg_charge_123",
                "provider_payment_charge_id": "provider_charge_456",
            },
        }
    )

    assert result.processed is True
    assert result.offer_key == "compatibility_unlock_monthly"
    assert result.confirmation.confirmed is True
    assert result.confirmation.telegram_payment_charge_id == "tg_charge_123"
    assert result.confirmation.user.is_premium is True


def test_process_telegram_payment_webhook_rejects_unknown_payload_prefix() -> None:
    reset_app_state_store()
    auth_response = build_telegram_auth_response(
        'query_id=abc123&user=%7B%22id%22%3A1%2C%22first_name%22%3A%22Anna%22%7D&auth_date=123456'
    )

    try:
        process_telegram_payment_webhook(
            {
                "session_token": auth_response.session_token,
                "successful_payment": {
                    "currency": "XTR",
                    "total_amount": 350,
                    "invoice_payload": (
                        f"other:compatibility_unlock_monthly:{auth_response.session_token}:compat_abc123"
                    ),
                    "telegram_payment_charge_id": "tg_charge_123",
                    "provider_payment_charge_id": "provider_charge_456",
                },
            }
        )
    except ValueError as error:
        assert str(error) == "Unsupported Telegram invoice payload."
    else:
        raise AssertionError("Expected invalid invoice payload to raise ValueError.")


def test_process_telegram_payment_webhook_rejects_payload_without_session_token() -> None:
    reset_app_state_store()
    auth_response = build_telegram_auth_response(
        'query_id=abc123&user=%7B%22id%22%3A1%2C%22first_name%22%3A%22Anna%22%7D&auth_date=123456'
    )

    try:
        process_telegram_payment_webhook(
            {
                "session_token": auth_response.session_token,
                "successful_payment": {
                    "currency": "XTR",
                    "total_amount": 350,
                    "invoice_payload": "premium:compatibility_unlock_monthly:compat_abc123",
                    "telegram_payment_charge_id": "tg_charge_123",
                    "provider_payment_charge_id": "provider_charge_456",
                },
            }
        )
    except ValueError as error:
        assert (
            str(error)
            == "Could not extract offer key and session token from Telegram invoice payload."
        )
    else:
        raise AssertionError("Expected incomplete invoice payload to raise ValueError.")
