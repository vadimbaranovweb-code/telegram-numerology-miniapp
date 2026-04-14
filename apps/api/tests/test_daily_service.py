from datetime import date

from app.services.daily import build_daily_insight


def test_build_daily_insight() -> None:
    result = build_daily_insight(
        birth_date=date(1998, 6, 14),
        current_date=date(2026, 4, 9),
    )

    assert result.insight_date == date(2026, 4, 9)
    assert result.generated is True
    assert result.source == "deterministic_daily_v2"
    assert result.headline == "Сегодня тишина и ясность важнее шума."
    assert "жизненного пути 2" in result.body
    assert "персональный месяц 7" in result.body
