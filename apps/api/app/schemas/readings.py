from pydantic import BaseModel, Field

from app.schemas.numerology import NumerologyCalculationResponse


class FirstReadingRequest(BaseModel):
    session_token: str = Field(description="Temporary app session token")
    force_regenerate: bool = Field(default=False)


class FirstReadingResponse(NumerologyCalculationResponse):
    pass
