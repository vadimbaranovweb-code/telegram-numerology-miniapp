# API

FastAPI backend for the Telegram Numerology Mini App.

## Initial scope

- app bootstrap
- health endpoint
- numerology calculations
- auth, readings, daily, compatibility, payments

## Current premium/payment seam

Backend now exposes:

- `GET /api/v1/offers` for the active offer catalog
- `POST /api/v1/payments/webhook/telegram` for generic Telegram payment payload ingestion
- `POST /api/v1/premium/checkout-session` for a Telegram Stars checkout session seam
- `POST /api/v1/premium/confirm-telegram-payment` for server-side confirmation of a successful Telegram payment
- `POST /api/v1/premium/unlock` as the current simulated entitlement fallback

Telegram Stars provider config can now be prepared through env vars:

```bash
PREMIUM_PAYMENT_PROVIDER=telegram_stars
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_BOT_USERNAME=your_bot_username
TELEGRAM_STARS_PROVIDER_TOKEN=your_stars_provider_token
TELEGRAM_STARS_TEST_INVOICE_SLUG=exported_invoice_slug_for_manual_testing
TELEGRAM_STARS_EXPORT_INVOICE_LINKS=true
```

Until invoice creation is wired, checkout sessions remain simulated, but they now
report whether the Telegram Stars provider config is present.

If `TELEGRAM_STARS_TEST_INVOICE_SLUG` is set together with the Telegram Stars
provider config, checkout sessions also return an `invoice_url` that the mini
app can open via `Telegram.WebApp.openInvoice` for manual verification.

If `TELEGRAM_STARS_EXPORT_INVOICE_LINKS=true` and `TELEGRAM_BOT_TOKEN` is set,
backend will try to create an invoice link through Telegram Bot API
`createInvoiceLink`. If that export path doesn't return a link, backend still
falls back to the test slug seam or the simulated flow.

## Run target

Planned local command:

```bash
uvicorn app.main:app --reload
```

## Local persistence

Default local app-state persistence now uses SQLite.

Useful env vars:

```bash
APP_STATE_STORE_MODE=sqlite
APP_STATE_STORE_PATH=/tmp/telegram-numerology-miniapp-app-state.sqlite3
APP_STATE_STORE_SQLITE_WRITE_LEGACY=true
APP_STATE_STORE_SQLITE_AUTO_MIGRATE=true
```

Optional fallback modes remain available:

```bash
APP_STATE_STORE_MODE=file
APP_STATE_STORE_MODE=memory
```

During the transition, SQLite can keep mirroring writes into the legacy
`session_app_state` table. Set `APP_STATE_STORE_SQLITE_WRITE_LEGACY=false`
when you want SQLite to write only to the v2 tables.

If you want runtime to avoid automatic legacy backfill entirely, set
`APP_STATE_STORE_SQLITE_AUTO_MIGRATE=false` and run the migration script
manually before starting the app.

Manual migration command for an existing SQLite app-state file:

```bash
python scripts/migrate_legacy_app_state_to_v2.py
```
