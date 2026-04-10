import json

from bot.services.payments import (
    build_telegram_payment_webhook_payload,
    process_successful_payment_update,
    post_telegram_payment_webhook_payload,
)


def test_build_telegram_payment_webhook_payload_from_successful_payment_update() -> None:
    result = build_telegram_payment_webhook_payload(
        {
            "update_id": 1,
            "message": {
                "message_id": 10,
                "successful_payment": {
                    "currency": "XTR",
                    "total_amount": 350,
                    "invoice_payload": (
                        "premium:compatibility_unlock_monthly:tg_session_123:compat_abc123"
                    ),
                    "telegram_payment_charge_id": "tg_charge_123",
                    "provider_payment_charge_id": "provider_charge_456",
                },
            },
        }
    )

    assert result == {
        "successful_payment": {
            "currency": "XTR",
            "total_amount": 350,
            "invoice_payload": (
                "premium:compatibility_unlock_monthly:tg_session_123:compat_abc123"
            ),
            "telegram_payment_charge_id": "tg_charge_123",
            "provider_payment_charge_id": "provider_charge_456",
        }
    }


def test_build_telegram_payment_webhook_payload_returns_none_without_successful_payment() -> None:
    result = build_telegram_payment_webhook_payload(
        {
            "update_id": 1,
            "message": {
                "message_id": 10,
                "text": "hello",
            },
        }
    )

    assert result is None


def test_build_telegram_payment_webhook_payload_rejects_incomplete_payment_payload() -> None:
    try:
        build_telegram_payment_webhook_payload(
            {
                "update_id": 1,
                "message": {
                    "message_id": 10,
                    "successful_payment": {
                        "currency": "XTR",
                        "total_amount": 350,
                        "invoice_payload": "",
                        "telegram_payment_charge_id": "tg_charge_123",
                    },
                },
            }
        )
    except ValueError as error:
        assert (
            str(error)
            == "Telegram successful_payment payload is missing required fields: invoice_payload."
        )
    else:
        raise AssertionError("Expected incomplete successful_payment payload to raise ValueError.")


def test_post_telegram_payment_webhook_payload_posts_to_backend_endpoint() -> None:
    captured = {}

    class FakeResponse:
        def __enter__(self):
            return self

        def __exit__(self, exc_type, exc, tb):
            return False

        def read(self) -> bytes:
            return json.dumps({"data": {"processed": True}}).encode("utf-8")

    def fake_opener(req, timeout=10):
        captured["url"] = req.full_url
        captured["method"] = req.get_method()
        captured["body"] = req.data.decode("utf-8")
        captured["timeout"] = timeout
        return FakeResponse()

    result = post_telegram_payment_webhook_payload(
        api_base_url="http://127.0.0.1:8001/api/v1",
        payload={
            "successful_payment": {
                "currency": "XTR",
                "total_amount": 350,
                "invoice_payload": (
                    "premium:compatibility_unlock_monthly:tg_session_123:compat_abc123"
                ),
                "telegram_payment_charge_id": "tg_charge_123",
                "provider_payment_charge_id": "provider_charge_456",
            }
        },
        opener=fake_opener,
    )

    assert captured["url"] == "http://127.0.0.1:8001/api/v1/payments/webhook/telegram"
    assert captured["method"] == "POST"
    assert captured["timeout"] == 10
    assert (
        json.loads(captured["body"])["successful_payment"]["telegram_payment_charge_id"]
        == "tg_charge_123"
    )
    assert result == {"data": {"processed": True}}


def test_process_successful_payment_update_builds_and_posts_payload() -> None:
    captured = {}

    class FakeResponse:
        def __enter__(self):
            return self

        def __exit__(self, exc_type, exc, tb):
            return False

        def read(self) -> bytes:
            return json.dumps({"data": {"processed": True, "offer_key": "compatibility_unlock_monthly"}}).encode(
                "utf-8"
            )

    def fake_opener(req, timeout=10):
        captured["url"] = req.full_url
        captured["body"] = json.loads(req.data.decode("utf-8"))
        captured["timeout"] = timeout
        return FakeResponse()

    result = process_successful_payment_update(
        api_base_url="http://127.0.0.1:8001/api/v1",
        update={
            "message": {
                "successful_payment": {
                    "currency": "XTR",
                    "total_amount": 350,
                    "invoice_payload": (
                        "premium:compatibility_unlock_monthly:tg_session_123:compat_abc123"
                    ),
                    "telegram_payment_charge_id": "tg_charge_123",
                    "provider_payment_charge_id": "provider_charge_456",
                }
            }
        },
        opener=fake_opener,
    )

    assert captured["url"] == "http://127.0.0.1:8001/api/v1/payments/webhook/telegram"
    assert captured["timeout"] == 10
    assert (
        captured["body"]["successful_payment"]["invoice_payload"]
        == "premium:compatibility_unlock_monthly:tg_session_123:compat_abc123"
    )
    assert result == {
        "data": {
            "processed": True,
            "offer_key": "compatibility_unlock_monthly",
        }
    }


def test_process_successful_payment_update_returns_none_without_payment_event() -> None:
    result = process_successful_payment_update(
        api_base_url="http://127.0.0.1:8001/api/v1",
        update={"message": {"text": "hello"}},
    )

    assert result is None
