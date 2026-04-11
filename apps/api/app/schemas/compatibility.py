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


class CompatibilityZoneScores(BaseModel):
    romance: int       # 0-100
    communication: int
    values: int
    dynamics: int
    longevity: int


class CompatibilityAiInsights(BaseModel):
    chemistry_headline: str
    chemistry_body: str
    destiny_headline: str
    destiny_body: str
    tension_body: str
    deep_connection_body: str
    best_periods_body: str
    advice: str


class CompatibilityPreviewResponse(BaseModel):
    compatibility_request_id: str
    preview: CompatibilityPreviewPayload
    paywall: CompatibilityPaywallPreview
    source_life_path: int = 0
    target_life_path: int = 0
    compatibility_score: int = 0
    zone_scores: Optional[CompatibilityZoneScores] = None
    ai_insights: Optional[CompatibilityAiInsights] = None
