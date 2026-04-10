from datetime import date

from pydantic import BaseModel


class DailyInsightResponse(BaseModel):
    insight_date: date
    headline: str
    body: str
    reflection: str
    generated: bool
    source: str
