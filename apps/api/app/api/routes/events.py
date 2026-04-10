from fastapi import APIRouter

from app.schemas.events import AnalyticsEventsRequest, AnalyticsEventsResponse
from app.services.events import ingest_analytics_events


router = APIRouter()


@router.post("", response_model=AnalyticsEventsResponse)
def ingest_events(payload: AnalyticsEventsRequest) -> AnalyticsEventsResponse:
    return ingest_analytics_events(payload)
