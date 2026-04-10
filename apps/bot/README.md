# Bot

Planned stack:

- Python
- python-telegram-bot

This app will contain Telegram bot handlers and delivery logic.

Current minimal payment seam:

- `bot/services/payments.py` contains a pure adapter that converts a Telegram
  `successful_payment` update into the backend payload expected by
  `/api/v1/payments/webhook/telegram`
- the same module now contains a minimal POST helper that can send this payload
  to the backend API without requiring the full bot runtime yet
- it also contains `process_successful_payment_update(...)`, a tiny orchestration
  helper that ties adapter + POST call together for the future bot runtime
- `bot/handlers/payments.py` now provides a minimal handler stub that future bot
  runtime code can call directly on `successful_payment` updates
- `bot/runtime.py` now provides a minimal runtime skeleton entrypoint that can
  route Telegram updates into the payment handler path without full polling or
  webhook infrastructure
- `bot/main.py` now provides a tiny env-configured entry module that future bot
  runtime bootstrap code can call directly for update handling
- this keeps payment-completion wiring incremental before the full bot runtime
  is implemented

Minimal local harness:

```bash
BOT_BACKEND_API_BASE_URL=http://127.0.0.1:8001/api/v1 \
python -m bot.main path/to/update.json
```

If no file path is passed, `bot.main` reads the Telegram update JSON from stdin.

Suggested local payment smoke-run:

1. Start backend on `http://127.0.0.1:8001`.
2. Run the prepared practical verification path:

```bash
cd /Users/vadimbaranov/Documents/New\ project/telegram-numerology-miniapp/apps/api
PYTHONPATH='/Users/vadimbaranov/Documents/New project/telegram-numerology-miniapp/apps/bot' \
./.venv/bin/python -m bot.payment_smoke \
--prepare-context \
--use-checkout-session \
--verify-bootstrap-premium \
```

What `--prepare-context` does:

- calls backend `/api/v1/auth/telegram`
- creates a fresh smoke session token
- calls `/api/v1/compatibility/preview`
- gets a fresh `compatibility_request_id`
- then continues through checkout-session replay and bootstrap verification

Fallback path if you want to replay the fixture against an existing session token:

```bash
cd /Users/vadimbaranov/Documents/New\ project/telegram-numerology-miniapp/apps/api
PYTHONPATH='/Users/vadimbaranov/Documents/New project/telegram-numerology-miniapp/apps/bot' \
./.venv/bin/python -m bot.payment_smoke \
--session-token tg_session_real_value
```

Expected result:

- with `--use-checkout-session`, the smoke script first asks backend `/api/v1/premium/checkout-session` for the real invoice payload used by the current checkout seam
- then it fills the fixture in [successful_payment.update.example.json](/Users/vadimbaranov/Documents/New%20project/telegram-numerology-miniapp/apps/bot/fixtures/successful_payment.update.example.json)
- the bot harness posts the resulting payment payload to `/api/v1/payments/webhook/telegram`
- with `--verify-bootstrap-premium`, the script then fetches `/api/v1/bootstrap` for the same session token and asserts `user.is_premium = true`
- the CLI prints JSON with `session_token`, `compatibility_request_id`, `payment_result`, and `bootstrap_state`
