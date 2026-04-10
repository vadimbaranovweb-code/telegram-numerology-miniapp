from datetime import date
from typing import Literal, Optional

from pydantic import BaseModel, Field


RelationshipContext = Literal["romantic", "friend", "work"]


class CompatibilityPreviewRequest(BaseModel):
    session_token: Optional[str] = Field(default=None)
    source_birth_date: date = Field(description="Current user birth date in ISO format")
    target_birth_date: date = Field(description="Target birth date in ISO format")
    relationship_context: RelationshipContext = "romantic"
    target_display_name: Optional[str] = Field(default=None)


class CompatibilityPreviewCard(BaseModel):
    type: str
    headline: str
    body: str


class CompatibilityPreviewPayload(BaseModel):
    title: str
    summary: str
    cards: list[CompatibilityPreviewCard]
    locked: bool


class CompatibilityPaywallPreview(BaseModel):
    offer_key: str
    price_local: float
    currency: str


class CompatibilityPreviewResponse(BaseModel):
    compatibility_request_id: str
    preview: CompatibilityPreviewPayload
    paywall: CompatibilityPaywallPreview
