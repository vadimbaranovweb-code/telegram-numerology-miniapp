import json

from bot.handlers.payments import handle_successful_payment_update


def test_handle_successful_payment_update_delegates_to_processing_flow() -> None:
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
        captured["body"] = json.loads(req.data.decode("utf-8"))
        captured["timeout"] = timeout
        return FakeResponse()

    result = handle_successful_payment_update(
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
        captured["body"]["successful_payment"]["telegram_payment_charge_id"]
        == "tg_charge_123"
    )
    assert result == {"data": {"processed": True}}


def test_handle_successful_payment_update_returns_none_for_non_payment_update() -> None:
    result = handle_successful_payment_update(
        api_base_url="http://127.0.0.1:8001/api/v1",
        update={"message": {"text": "hello"}},
    )

    assert result is None
