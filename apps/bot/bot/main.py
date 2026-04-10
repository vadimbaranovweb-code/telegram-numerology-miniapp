import json
import os
import sys
from typing import Any, Optional

from bot.runtime import BotRuntimeConfig, process_telegram_update


def build_runtime_config() -> BotRuntimeConfig:
    api_base_url = os.getenv(
        "BOT_BACKEND_API_BASE_URL",
        "http://127.0.0.1:8001/api/v1",
    )

    return BotRuntimeConfig(api_base_url=api_base_url)


def handle_update(
    update: dict[str, Any],
    *,
    opener: Any = None,
) -> Optional[dict[str, Any]]:
    config = build_runtime_config()

    if opener is None:
        return process_telegram_update(
            config=config,
            update=update,
        )

    return process_telegram_update(
        config=config,
        update=update,
        opener=opener,
    )


def main(argv: Optional[list[str]] = None) -> int:
    args = argv if argv is not None else sys.argv[1:]

    if len(args) > 1:
        raise ValueError("Usage: python -m bot.main [update-json-file]")

    if args:
        with open(args[0], "r", encoding="utf-8") as file:
            update = json.load(file)
    else:
        update = json.load(sys.stdin)

    result = handle_update(update)
    json.dump(result, sys.stdout, ensure_ascii=True)
    sys.stdout.write("\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
