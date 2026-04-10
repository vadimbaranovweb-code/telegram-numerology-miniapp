import json
from pathlib import Path

from bot.payment_smoke import (
    DEFAULT_SMOKE_INIT_DATA,
    SESSION_TOKEN_PLACEHOLDER,
    build_smoke_update,
    fetch_bootstrap_state,
    fetch_checkout_invoice_payload,
    prepare_smoke_context,
)


def test_build_smoke_update_replaces_session_token_placeholder(
    tmp_path: Path,
) -> None:
    fixture_path = tmp_path / "payment-update.json"
    fixture_path.write_text(
        json.dumps(
            {
                "message": {
                    "successful_payment": {
                        "invoice_payload": (
                            f"premium:compatibility_unlock_monthly:{SESSION_TOKEN_PLACEHOLDER}:compat_abc123"
                        )
                    }
                }
            }
        ),
        encoding="utf-8",
    )

    result = build_smoke_update(
        session_token="tg_session_live_123",
        fixture_path=str(fixture_path),
    )

    assert (
        result["message"]["successful_payment"]["invoice_payload"]
        == "premium:compatibility_unlock_monthly:tg_session_live_123:compat_abc123"
    )


def test_build_smoke_update_can_use_invoice_payload_from_checkout_session(
    tmp_path: Path,
) -> None:
    fixture_path = tmp_path / "payment-update.json"
    fixture_path.write_text(
        json.dumps(
            {
                "message": {
                    "successful_payment": {
                        "invoice_payload": (
                            f"premium:compatibility_unlock_monthly:{SESSION_TOKEN_PLACEHOLDER}:compat_abc123"
                        )
                    }
                }
            }
        ),
        encoding="utf-8",
    )

    result = build_smoke_update(
        session_token="tg_session_live_123",
        fixture_path=str(fixture_path),
        invoice_payload="premium:compatibility_unlock_monthly:tg_session_live_123:compat_live_789",
    )

    assert (
        result["message"]["successful_payment"]["invoice_payload"]
        == "premium:compatibility_unlock_monthly:tg_session_live_123:compat_live_789"
    )


def test_fetch_checkout_invoice_payload_uses_backend_checkout_session() -> None:
    captured: dict[str, object] = {}

    class DummyResponse:
        def __enter__(self) -> "DummyResponse":
            return self

        def __exit__(self, exc_type, exc, tb) -> None:
            return None

        def read(self) -> bytes:
            return json.dumps(
                {
                    "invoice": {
                        "payload": "premium:compatibility_unlock_monthly:tg_session_live_123:compat_live_789"
                    }
                }
            ).encode("utf-8")

    def fake_opener(req, timeout=10):  # type: ignore[no-untyped-def]
        captured["url"] = req.full_url
        captured["body"] = json.loads(req.data.decode("utf-8"))
        captured["timeout"] = timeout
        return DummyResponse()

    result = fetch_checkout_invoice_payload(
        api_base_url="http://127.0.0.1:8001/api/v1",
        session_token="tg_session_live_123",
        compatibility_request_id="compat_live_789",
        opener=fake_opener,
    )

    assert result == "premium:compatibility_unlock_monthly:tg_session_live_123:compat_live_789"
    assert (
        captured["url"]
        == "http://127.0.0.1:8001/api/v1/premium/checkout-session"
    )
    assert captured["body"] == {
        "session_token": "tg_session_live_123",
        "offer_key": "compatibility_unlock_monthly",
        "compatibility_request_id": "compat_live_789",
    }
    assert captured["timeout"] == 10


def test_fetch_bootstrap_state_requests_bootstrap_for_session_token() -> None:
    captured: dict[str, object] = {}

    class DummyResponse:
        def __enter__(self) -> "DummyResponse":
            return self

        def __exit__(self, exc_type, exc, tb) -> None:
            return None

        def read(self) -> bytes:
            return json.dumps(
                {
                    "user": {
                        "is_premium": True,
                        "premium_status": "premium",
                    }
                }
            ).encode("utf-8")

    def fake_opener(req, timeout=10):  # type: ignore[no-untyped-def]
        captured["url"] = req.full_url
        captured["timeout"] = timeout
        return DummyResponse()

    result = fetch_bootstrap_state(
        api_base_url="http://127.0.0.1:8001/api/v1",
        session_token="tg_session_live_123",
        opener=fake_opener,
    )

    assert result == {
        "user": {
            "is_premium": True,
            "premium_status": "premium",
        }
    }
    assert (
        captured["url"]
        == "http://127.0.0.1:8001/api/v1/bootstrap?session_token=tg_session_live_123"
    )
    assert captured["timeout"] == 10


def test_prepare_smoke_context_creates_session_and_preview() -> None:
    captured_requests: list[dict[str, object]] = []

    class DummyResponse:
        def __init__(self, payload: dict[str, object]) -> None:
            self.payload = payload

        def __enter__(self) -> "DummyResponse":
            return self

        def __exit__(self, exc_type, exc, tb) -> None:
            return None

        def read(self) -> bytes:
            return json.dumps(self.payload).encode("utf-8")

    def fake_opener(req, timeout=10):  # type: ignore[no-untyped-def]
        payload = json.loads(req.data.decode("utf-8"))
        captured_requests.append(
            {
                "url": req.full_url,
                "body": payload,
                "timeout": timeout,
            }
        )

        if req.full_url.endswith("/auth/telegram"):
            return DummyResponse({"session_token": "tg_session_live_123"})

        if req.full_url.endswith("/compatibility/preview"):
            return DummyResponse({"compatibility_request_id": "compat_live_789"})

        raise AssertionError(f"Unexpected URL {req.full_url}")

    result = prepare_smoke_context(
        api_base_url="http://127.0.0.1:8001/api/v1",
        init_data=DEFAULT_SMOKE_INIT_DATA,
        opener=fake_opener,
    )

    assert result == {
        "session_token": "tg_session_live_123",
        "compatibility_request_id": "compat_live_789",
    }
    assert captured_requests == [
        {
            "url": "http://127.0.0.1:8001/api/v1/auth/telegram",
            "body": {"init_data": DEFAULT_SMOKE_INIT_DATA},
            "timeout": 10,
        },
        {
            "url": "http://127.0.0.1:8001/api/v1/compatibility/preview",
            "body": {
                "session_token": "tg_session_live_123",
                "source_birth_date": "1998-06-14",
                "target_birth_date": "1997-11-22",
                "relationship_context": "romantic",
                "target_display_name": "Smoke Match",
            },
            "timeout": 10,
        },
    ]
