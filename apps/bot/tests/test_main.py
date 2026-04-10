import json
from pathlib import Path

from bot.main import build_runtime_config, handle_update, main


def test_build_runtime_config_uses_default_backend_api_base_url(monkeypatch) -> None:
    monkeypatch.delenv("BOT_BACKEND_API_BASE_URL", raising=False)

    result = build_runtime_config()

    assert result.api_base_url == "http://127.0.0.1:8001/api/v1"


def test_build_runtime_config_uses_env_backend_api_base_url(monkeypatch) -> None:
    monkeypatch.setenv("BOT_BACKEND_API_BASE_URL", "https://api.example.com/api/v1")

    result = build_runtime_config()

    assert result.api_base_url == "https://api.example.com/api/v1"


def test_handle_update_routes_successful_payment_using_runtime_config(monkeypatch) -> None:
    monkeypatch.setenv("BOT_BACKEND_API_BASE_URL", "https://api.example.com/api/v1")
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
        captured["timeout"] = timeout
        return FakeResponse()

    result = handle_update(
        {
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

    assert (
        captured["url"]
        == "https://api.example.com/api/v1/payments/webhook/telegram"
    )
    assert captured["timeout"] == 10
    assert result == {"data": {"processed": True}}


def test_main_reads_update_file_and_writes_json_result(
    monkeypatch,
    tmp_path: Path,
    capsys,
) -> None:
    monkeypatch.setenv("BOT_BACKEND_API_BASE_URL", "https://api.example.com/api/v1")

    update_path = tmp_path / "update.json"
    update_path.write_text(
        json.dumps(
            {
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
            }
        ),
        encoding="utf-8",
    )

    class FakeResponse:
        def __enter__(self):
            return self

        def __exit__(self, exc_type, exc, tb):
            return False

        def read(self) -> bytes:
            return json.dumps({"data": {"processed": True}}).encode("utf-8")

    def fake_process_telegram_update(*, config, update, opener=None):
        assert config.api_base_url == "https://api.example.com/api/v1"
        assert update["message"]["successful_payment"]["telegram_payment_charge_id"] == "tg_charge_123"
        return {"data": {"processed": True}}

    monkeypatch.setattr("bot.main.handle_update", lambda update: fake_process_telegram_update(config=build_runtime_config(), update=update))

    exit_code = main([str(update_path)])

    captured = capsys.readouterr()
    assert exit_code == 0
    assert json.loads(captured.out) == {"data": {"processed": True}}
