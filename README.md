# Telegram Numerology Mini App

MVP project scaffold for a Telegram `bot + mini app hybrid` product in the numerology category.

## Structure

```text
apps/
  miniapp/
  api/
  bot/
packages/
  content/
  schemas/
docs/
scripts/
```

## Apps

### `apps/miniapp`

Next.js frontend for:

- onboarding
- first reading
- daily view
- compatibility flow
- paywall

### `apps/api`

FastAPI backend for:

- Telegram auth validation
- profile persistence
- numerology calculations
- reading generation
- compatibility
- payments
- analytics ingestion

### `apps/bot`

Telegram bot service for:

- start flow
- deep links
- daily delivery
- invite/share flows

## Packages

### `packages/content`

Stores:

- numerology knowledge base
- prompt templates
- reading templates

### `packages/schemas`

Stores:

- reading schemas
- compatibility schemas
- daily schemas
- event schemas

## Getting started

1. Copy `.env.example` into local env files as needed.
2. Scaffold `apps/miniapp` with Next.js.
3. Scaffold `apps/api` with FastAPI.
4. Scaffold `apps/bot` with `python-telegram-bot`.
5. Wire Telegram Mini App auth and local API.

## Source of truth

Product and implementation docs live in:

- [docs/telegram-numerology-miniapp](/Users/vadimbaranov/Documents/New%20project/docs/telegram-numerology-miniapp/README.md)
