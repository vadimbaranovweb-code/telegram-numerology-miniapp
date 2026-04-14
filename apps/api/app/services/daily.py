from datetime import date
from typing import Optional

from app.schemas.daily import DailyInsightResponse
from app.services.numerology.service import (
    calculate_life_path_number,
    calculate_personal_month_number,
    calculate_personal_year_number,
)


LIFE_PATH_FOCUS = {
    1: "действовать, а не обдумывать",
    2: "сначала выслушать, потом реагировать",
    3: "сказать важное чётко и прямо",
    4: "держать структуру, а не идти на поводу у настроения",
    5: "оставить пространство для манёвра",
    6: "заботиться, не забирая всё на себя",
    7: "отступить и заметить глубинный паттерн",
    8: "выбрать ход с реальным рычагом влияния",
    9: "отпустить то, что уже завершено",
}

PERSONAL_MONTH_HEADLINES = {
    1: "Сегодня просит более чистого старта, чем вчера.",
    2: "Сегодня лучше работает терпение, а не давление.",
    3: "Сегодня вознаграждает самовыражение и видимую энергию.",
    4: "Сегодня становится сильнее, когда ты последователен.",
    5: "Сегодня всё может быстро измениться — будь гибким.",
    6: "Сегодня фокус на заботе и отношениях.",
    7: "Сегодня тишина и ясность важнее шума.",
    8: "Сегодня сила в точных, выверенных действиях.",
    9: "Сегодня энергия завершения сильнее расширения.",
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
            f"Твоё число жизненного пути {life_path_number} и персональный месяц "
            f"{personal_month_number} подсказывают: лучший ход сегодня — {focus}. "
            "Держи фокус простым и делай следующий заземлённый шаг."
        ),
        reflection=(
            "Какое одно решение к вечеру принесёт облегчение, "
            "если перестать форсировать неправильный темп?"
        ),
        generated=True,
        source="deterministic_daily_v2",
    )
