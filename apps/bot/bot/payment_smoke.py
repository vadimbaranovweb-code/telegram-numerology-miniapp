import argparse
import json
import os
from pathlib import Path
import sys
from typing import Any, Optional
from urllib import request

from bot.main import handle_update


DEFAULT_FIXTURE_PATH = (
    Path(__file__).resolve().parents[1]
    / "fixtures"
    / "successful_payment.update.example.json"
)
SESSION_TOKEN_PLACEHOLDER = "tg_session_replace_me"
DEFAULT_API_BASE_URL = os.getenv(
    "BOT_BACKEND_API_BASE_URL",
    "http://127.0.0.1:8001/api/v1",
)
DEFAULT_OFFER_KEY = "compatibility_unlock_monthly"
DEFAULT_SMOKE_INIT_DATA = (
    "query_id=smoke123&user=%7B%22id%22%3A4242%2C%22first_name%22%3A%22Smoke%22%7D&auth_date=123456"
)
DEFAULT_SOURCE_BIRTH_DATE = "1998-06-14"
DEFAULT_TARGET_BIRTH_DATE = "1997-11-22"
DEFAULT_RELATIONSHIP_CONTEXT = "romantic"
DEFAULT_TARGET_DISPLAY_NAME = "Smoke Match"


def build_smoke_update(
    *,
    session_token: str,
    fixture_path: Optional[str] = None,
    invoice_payload: Optional[str] = None,
) -> dict[str, Any]:
    path = Path(fixture_path) if fixture_path is not None else DEFAULT_FIXTURE_PATH

    with path.open("r", encoding="utf-8") as file:
        payload = json.load(file)

    if invoice_payload is None:
        fixture_invoice_payload = payload["message"]["successful_payment"]["invoice_payload"]
        payload["message"]["successful_payment"]["invoice_payload"] = (
            fixture_invoice_payload.replace(
                SESSION_TOKEN_PLACEHOLDER,
                session_token,
            )
        )
    else:
        payload["message"]["successful_payment"]["invoice_payload"] = invoice_payload

    return payload


def fetch_checkout_invoice_payload(
    *,
    api_base_url: str,
    session_token: str,
    offer_key: str = DEFAULT_OFFER_KEY,
    compatibility_request_id: Optional[str] = None,
    opener: Any = request.urlopen,
) -> str:
    endpoint = f"{api_base_url.rstrip('/')}/premium/checkout-session"
    request_payload: dict[str, Any] = {
        "session_token": session_token,
        "offer_key": offer_key,
    }

    if compatibility_request_id is not None:
        request_payload["compatibility_request_id"] = compatibility_request_id

    req = request.Request(
        endpoint,
        data=json.dumps(request_payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    with opener(req, timeout=10) as response:
        checkout_session = json.loads(response.read().decode("utf-8"))

    invoice_payload = (
        checkout_session.get("invoice", {}) if isinstance(checkout_session, dict) else {}
    ).get("payload")

    if not isinstance(invoice_payload, str) or not invoice_payload:
        raise ValueError("Checkout session did not return an invoice payload for smoke verification.")

    return invoice_payload


def fetch_bootstrap_state(
    *,
    api_base_url: str,
    session_token: str,
    opener: Any = request.urlopen,
) -> dict[str, Any]:
    endpoint = (
        f"{api_base_url.rstrip('/')}/bootstrap?session_token="
        f"{request.quote(session_token, safe='')}"
    )

    req = request.Request(endpoint, method="GET")

    with opener(req, timeout=10) as response:
        bootstrap_state = json.loads(response.read().decode("utf-8"))

    if not isinstance(bootstrap_state, dict):
        raise ValueError("Bootstrap endpoint returned an unexpected response shape.")

    return bootstrap_state


def prepare_smoke_context(
    *,
    api_base_url: str,
    init_data: str = DEFAULT_SMOKE_INIT_DATA,
    source_birth_date: str = DEFAULT_SOURCE_BIRTH_DATE,
    target_birth_date: str = DEFAULT_TARGET_BIRTH_DATE,
    relationship_context: str = DEFAULT_RELATIONSHIP_CONTEXT,
    target_display_name: str = DEFAULT_TARGET_DISPLAY_NAME,
    opener: Any = request.urlopen,
) -> dict[str, str]:
    auth_response = _post_json(
        f"{api_base_url.rstrip('/')}/auth/telegram",
        {"init_data": init_data},
        opener=opener,
    )
    session_token = auth_response.get("session_token")

    if not isinstance(session_token, str) or not session_token:
        raise ValueError("Auth step did not return a session token for smoke verification.")

    compatibility_response = _post_json(
        f"{api_base_url.rstrip('/')}/compatibility/preview",
        {
            "session_token": session_token,
            "source_birth_date": source_birth_date,
            "target_birth_date": target_birth_date,
            "relationship_context": relationship_context,
            "target_display_name": target_display_name,
        },
        opener=opener,
    )
    compatibility_request_id = compatibility_response.get("compatibility_request_id")

    if not isinstance(compatibility_request_id, str) or not compatibility_request_id:
        raise ValueError(
            "Compatibility preview step did not return a compatibility request id."
        )

    return {
        "session_token": session_token,
        "compatibility_request_id": compatibility_request_id,
    }


def _post_json(
    url: str,
    payload: dict[str, Any],
    *,
    opener: Any = request.urlopen,
) -> dict[str, Any]:
    req = request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    with opener(req, timeout=10) as response:
        result = json.loads(response.read().decode("utf-8"))

    if not isinstance(result, dict):
        raise ValueError("Endpoint returned an unexpected response shape.")

    return result


def main(argv: Optional[list[str]] = None) -> int:
    parser = argparse.ArgumentParser(
        description="Run a local Telegram payment smoke update through the bot harness."
    )
    parser.add_argument("--session-token")
    parser.add_argument("--fixture-path", default=str(DEFAULT_FIXTURE_PATH))
    parser.add_argument("--api-base-url", default=DEFAULT_API_BASE_URL)
    parser.add_argument("--offer-key", default=DEFAULT_OFFER_KEY)
    parser.add_argument("--compatibility-request-id")
    parser.add_argument(
        "--prepare-context",
        action="store_true",
        help="Prepare a fresh smoke session via backend auth and compatibility preview before replaying payment.",
    )
    parser.add_argument("--init-data", default=DEFAULT_SMOKE_INIT_DATA)
    parser.add_argument("--source-birth-date", default=DEFAULT_SOURCE_BIRTH_DATE)
    parser.add_argument("--target-birth-date", default=DEFAULT_TARGET_BIRTH_DATE)
    parser.add_argument("--relationship-context", default=DEFAULT_RELATIONSHIP_CONTEXT)
    parser.add_argument("--target-display-name", default=DEFAULT_TARGET_DISPLAY_NAME)
    parser.add_argument(
        "--use-checkout-session",
        action="store_true",
        help="Fetch the invoice payload from backend /premium/checkout-session before replaying the successful_payment update.",
    )
    parser.add_argument(
        "--verify-bootstrap-premium",
        action="store_true",
        help="Fetch bootstrap after the smoke replay and assert that the session is premium.",
    )
    args = parser.parse_args(argv)

    session_token = args.session_token
    compatibility_request_id = args.compatibility_request_id

    if args.prepare_context:
        prepared_context = prepare_smoke_context(
            api_base_url=args.api_base_url,
            init_data=args.init_data,
            source_birth_date=args.source_birth_date,
            target_birth_date=args.target_birth_date,
            relationship_context=args.relationship_context,
            target_display_name=args.target_display_name,
        )
        session_token = prepared_context["session_token"]
        compatibility_request_id = prepared_context["compatibility_request_id"]

    if not session_token:
        raise ValueError(
            "Provide --session-token or enable --prepare-context for smoke verification."
        )

    invoice_payload = None
    if args.use_checkout_session:
        invoice_payload = fetch_checkout_invoice_payload(
            api_base_url=args.api_base_url,
            session_token=session_token,
            offer_key=args.offer_key,
            compatibility_request_id=compatibility_request_id,
        )

    update = build_smoke_update(
        session_token=session_token,
        fixture_path=args.fixture_path,
        invoice_payload=invoice_payload,
    )
    result = handle_update(update)

    output: dict[str, Any] = {
        "session_token": session_token,
        "compatibility_request_id": compatibility_request_id,
        "payment_result": result,
    }

    if args.verify_bootstrap_premium:
        bootstrap_state = fetch_bootstrap_state(
            api_base_url=args.api_base_url,
            session_token=session_token,
        )
        output["bootstrap_state"] = bootstrap_state

        is_premium = (
            bootstrap_state.get("user", {})
            if isinstance(bootstrap_state, dict)
            else {}
        ).get("is_premium")
        if is_premium is not True:
            raise ValueError(
                "Smoke verification finished, but bootstrap does not show an active premium session."
            )

    json.dump(output, sys.stdout, ensure_ascii=True)
    sys.stdout.write("\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
