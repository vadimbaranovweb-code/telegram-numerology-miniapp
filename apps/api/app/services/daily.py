from datetime import date
from typing import Optional

from app.schemas.daily import DailyInsightResponse
from app.services.numerology.service import (
    calculate_life_path_number,
    calculate_personal_month_number,
    calculate_personal_year_number,
)


LIFE_PATH_FOCUS = {
    1: "act before overthinking",
    2: "listen before reacting",
    3: "say the important thing clearly",
    4: "protect structure over mood",
    5: "leave room for movement",
    6: "care without taking over everything",
    7: "step back and notice the deeper pattern",
    8: "choose the move with real leverage",
    9: "release what is already complete",
}

PERSONAL_MONTH_HEADLINES = {
    1: "Today asks for a cleaner start than yesterday did.",
    2: "Today works best through patience, not force.",
    3: "Today rewards expression and visible energy.",
    4: "Today becomes stronger when you stay consistent.",
    5: "Today can shift fast, so stay flexible.",
    6: "Today puts attention on care and relationships.",
    7: "Today favors quiet clarity over noise.",
    8: "Today is strongest when you act with precision.",
    9: "Today carries closure energy more than expansion.",
}


def build_daily_insight(
    *,
    birth_date: date,
    current_date: Optional[date] = None,
) -> DailyInsightResponse:
    today = current_date or date.today()
    life_path_number = calculate_life_path_number(birth_date)
    personal_year_number = calculate_personal_year_number(birth_date, today)
    personal_month_number = calculate_personal_month_number(personal_year_number, today)
    focus = LIFE_PATH_FOCUS[life_path_number]
    headline = PERSONAL_MONTH_HEADLINES[personal_month_number]

    return DailyInsightResponse(
        insight_date=today,
        headline=headline,
        body=(
            f"Your Life Path {life_path_number} and Personal Month "
            f"{personal_month_number} suggest the best move today is to {focus}. "
            "Keep the signal simple and do the next grounded thing."
        ),
        reflection=(
            "What one choice would feel lighter by tonight if you stopped "
            "forcing the wrong pace?"
        ),
        generated=True,
        source="deterministic_daily_v1",
    )
