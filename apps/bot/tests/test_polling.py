"""Tests for bot/polling.py — _get_updates and run_polling behaviour."""

import json
from io import BytesIO
from types import SimpleNamespace
from typing import Any
from unittest.mock import MagicMock, patch

import pytest

from bot.polling import _get_updates, run_polling


def _make_opener(responses: list[dict[str, Any]]):
    """Return a mock opener that yields successive JSON responses."""
    queue = list(responses)

    def opener(req, timeout=None):
        if not queue:
            raise RuntimeError("No more mock responses")
        body = json.dumps(queue.pop(0)).encode("utf-8")
        resp = MagicMock()
        resp.read.return_value = body
        resp.__enter__ = lambda s: s
        resp.__exit__ = MagicMock(return_value=False)
        return resp

    return opener


class TestGetUpdates:
    def test_returns_updates_on_ok(self):
        updates = [{"update_id": 1, "message": {"text": "hi"}}]
        opener = _make_opener([{"ok": True, "result": updates}])

        result = _get_updates(token="tok", offset=0, timeout=1, opener=opener)

        assert result == updates

    def test_raises_on_not_ok(self):
        opener = _make_opener([{"ok": False, "description": "bad token"}])

        with pytest.raises(RuntimeError, match="not-ok"):
            _get_updates(token="tok", offset=0, timeout=1, opener=opener)

    def test_raises_when_result_not_list(self):
        opener = _make_opener([{"ok": True, "result": "oops"}])

        with pytest.raises(RuntimeError, match="not a list"):
            _get_updates(token="tok", offset=0, timeout=1, opener=opener)

    def test_returns_empty_list_when_no_updates(self):
        opener = _make_opener([{"ok": True, "result": []}])

        result = _get_updates(token="tok", offset=0, timeout=1, opener=opener)

        assert result == []


class TestRunPolling:
    def test_processes_successful_payment_update(self):
        payment_update = {
            "update_id": 42,
            "message": {
                "successful_payment": {
                    "currency": "XTR",
                    "total_amount": 350,
                    "invoice_payload": "premium:compatibility_unlock_monthly:tg_session_abc:suffix",
                    "telegram_payment_charge_id": "charge_1",
                    "provider_payment_charge_id": "prov_1",
                }
            },
        }

        responses = [
            {"ok": True, "result": [payment_update]},
            KeyboardInterrupt,
        ]

        call_count = 0

        def opener(req, timeout=None):
            nonlocal call_count
            call_count += 1
            if call_count == 1:
                body = json.dumps(responses[0]).encode("utf-8")
                resp = MagicMock()
                resp.read.return_value = body
                resp.__enter__ = lambda s: s
                resp.__exit__ = MagicMock(return_value=False)
                return resp
            raise KeyboardInterrupt

        processed = []

        def fake_process(*, config, update, **kwargs):
            processed.append(update)

        with patch("bot.polling._get_updates") as mock_get, patch(
            "bot.polling.process_telegram_update", side_effect=fake_process
        ):
            mock_get.side_effect = [
                [payment_update],
                KeyboardInterrupt(),
            ]

            run_polling(token="tok", api_base_url="http://localhost/api/v1")

        assert len(processed) == 1
        assert processed[0]["update_id"] == 42

    def test_retries_after_get_updates_failure(self):
        """Polling loop should sleep and retry on getUpdates error, not crash."""
        call_count = 0

        def fake_get(**kwargs):
            nonlocal call_count
            call_count += 1
            if call_count == 1:
                raise RuntimeError("network error")
            raise KeyboardInterrupt

        with patch("bot.polling._get_updates", side_effect=fake_get), patch(
            "bot.polling.time.sleep"
        ) as mock_sleep:
            run_polling(token="tok", api_base_url="http://localhost/api/v1")

        mock_sleep.assert_called_once()

    def test_continues_after_process_update_failure(self):
        """Polling loop should catch per-update errors and continue."""
        updates = [
            {"update_id": 10, "message": {"successful_payment": {}}},
            {"update_id": 11, "message": {"text": "hello"}},
        ]

        get_call = 0

        def fake_get(**kwargs):
            nonlocal get_call
            get_call += 1
            if get_call == 1:
                return updates
            raise KeyboardInterrupt

        process_call = 0

        def fake_process(*, config, update, **kwargs):
            nonlocal process_call
            process_call += 1
            if update["update_id"] == 10:
                raise RuntimeError("processing failed")

        with patch("bot.polling._get_updates", side_effect=fake_get), patch(
            "bot.polling.process_telegram_update", side_effect=fake_process
        ):
            run_polling(token="tok", api_base_url="http://localhost/api/v1")

        assert process_call == 2
