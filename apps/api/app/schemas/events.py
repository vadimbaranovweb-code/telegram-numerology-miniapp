from datetime import datetime
from typing import Dict, List, Optional, Union

from pydantic import BaseModel, Field


EventPropertyValue = Union[str, int, float, bool, None]


class AnalyticsEventPayload(BaseModel):
    event_name: str = Field(description="Stable analytics event name")
    timestamp: datetime
    properties: Dict[str, EventPropertyValue] = Field(default_factory=dict)


class AnalyticsEventsRequest(BaseModel):
    events: List[AnalyticsEventPayload]


class AnalyticsEventsResponse(BaseModel):
    accepted: bool
    received_events: int
    last_event_name: Optional[str] = None
