from datetime import datetime, timezone

from app.schemas.events import AnalyticsEventPayload, AnalyticsEventsRequest
from app.services.events import ingest_analytics_events


def test_ingest_analytics_events() -> None:
    payload = AnalyticsEventsRequest(
        events=[
            AnalyticsEventPayload(
                event_name="paywall_viewed",
                timestamp=datetime(2026, 4, 9, 10, 15, tzinfo=timezone.utc),
                properties={
                    "paywall_context": "compatibility",
                    "offer_set_id": "main_paywall_v1",
                },
            )
        ]
    )

    result = ingest_analytics_events(payload)

    assert result.accepted is True
    assert result.received_events == 1
    assert result.last_event_name == "paywall_viewed"
