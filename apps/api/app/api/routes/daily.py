from datetime import date

from fastapi import APIRouter, Query

from app.schemas.daily import DailyInsightResponse
from app.services.daily import build_daily_insight


router = APIRouter()


@router.get("/today", response_model=DailyInsightResponse)
def get_daily_insight_today(
    birth_date: date = Query(description="Birth date in ISO format"),
) -> DailyInsightResponse:
    return build_daily_insight(birth_date=birth_date)
