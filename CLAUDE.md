# Claude Code — Project Instructions

## Что это за проект

Telegram Numerology Mini App — бот + mini app для персональной нумерологии.
Монорепо: `apps/api` (FastAPI), `apps/miniapp` (Next.js), `apps/bot` (Python stdlib).

## Документация

Source-of-truth документы в `/Users/vadimbaranov/Documents/New project/docs/telegram-numerology-miniapp/`:
- `19-locked-mvp-summary.md` — locked MVP scope
- `20-stack-decisions.md` — технологические решения
- `13-api-contract.md` — API контракт
- `09-screen-ux-spec.md` — UX спецификация
- `24-deployment-status.md` — текущие URL и env vars

## Production URLs

- Backend: `https://telegram-numerology-miniapp-production.up.railway.app`
- Frontend: `https://telegram-numerology-miniapp-zng6.vercel.app`
- Bot: Railway (тот же проект, отдельный сервис, `apps/bot`)
- GitHub: `https://github.com/vadimbaranovweb-code/telegram-numerology-miniapp`

## Как запускать локально

```bash
# Backend
cd apps/api && . .venv/bin/activate
uvicorn app.main:app --host 127.0.0.1 --port 8001

# Frontend
cd apps/miniapp && npm run dev -- --hostname 127.0.0.1 --port 3000
```

## Полезные проверки

```bash
# Backend тесты
cd apps/api
./.venv/bin/pytest tests/

# Bot тесты
PYTHONPATH='apps/bot' ./.venv/bin/pytest apps/bot/tests/

# Frontend lint + build
cd apps/miniapp && npm run lint && npm run build

# Payment smoke (backend должен быть запущен)
cd apps/api
PYTHONPATH='apps/bot' ./.venv/bin/python -m bot.payment_smoke \
  --prepare-context --use-checkout-session --verify-bootstrap-premium
```

## Ключевые принципы

- Маленькие шаги — не раздувать архитектуру
- Не выпиливать local fallback
- Не ломать текущий Telegram flow
- Не добавлять abstractions без нужды
- Сохранять working end-to-end behavior
- Отвечать на русском

## Текущее состояние (апрель 2026)

- Код: полностью готов к production
- Backend: задеплоен на Railway
- Frontend: задеплоен на Vercel
- Bot: задеплоен на Railway
- Telegram Setup: BotFather настроен, Menu Button установлен
- E2E live test: следующий шаг
