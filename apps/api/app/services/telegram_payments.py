import json
from typing import Any, Optional
from urllib.error import URLError
from urllib import parse, request

from app.core.settings import get_settings
from app.schemas.premium import TelegramStarsInvoicePayload


def create_telegram_invoice_link(
    invoice: TelegramStarsInvoicePayload,
) -> Optional[str]:
    settings = get_settings()

    if (
        settings.premium_payment_provider != "telegram_stars"
        or not settings.telegram_stars_export_invoice_links
        or not settings.telegram_bot_token
    ):
        return None

    url = f"https://api.telegram.org/bot{settings.telegram_bot_token}/createInvoiceLink"
    payload = {
        "title": invoice.title,
        "description": invoice.description,
        "payload": invoice.payload,
        # Telegram Stars invoices use an empty provider token.
        "provider_token": "",
        "currency": invoice.currency,
        "prices": [price.model_dump(mode="json") for price in invoice.prices],
    }

    try:
        response = _post_json(url, payload)
    except URLError:
        return None

    result = response.get("result")

    if isinstance(result, str) and result:
        return result

    return None


def extract_invoice_slug(invoice_url: str) -> Optional[str]:
    parsed = parse.urlparse(invoice_url)

    if parsed.scheme == "tg":
        slug = parse.parse_qs(parsed.query).get("slug", [None])[0]
        return slug

    if parsed.netloc not in {"t.me", "telegram.me", "www.t.me"}:
        return None

    path = parsed.path.strip("/")
    if path.startswith("$"):
        return path[1:] or None
    if path.startswith("invoice/"):
        slug = path.partition("/")[2]
        return slug or None

    return None


def _post_json(url: str, payload: dict[str, Any]) -> dict[str, Any]:
    req = request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    with request.urlopen(req, timeout=10) as response:
        return json.loads(response.read().decode("utf-8"))
