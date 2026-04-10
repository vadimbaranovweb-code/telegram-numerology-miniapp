from app.schemas.events import AnalyticsEventsRequest, AnalyticsEventsResponse


def ingest_analytics_events(payload: AnalyticsEventsRequest) -> AnalyticsEventsResponse:
    last_event_name = payload.events[-1].event_name if payload.events else None

    return AnalyticsEventsResponse(
        accepted=True,
        received_events=len(payload.events),
        last_event_name=last_event_name,
    )
