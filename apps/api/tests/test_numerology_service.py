from datetime import date

from app.services.numerology.service import (
    calculate_core_numbers,
    calculate_destiny_number,
    calculate_life_path_number,
    calculate_personal_month_number,
    calculate_personal_year_number,
    calculate_soul_urge_number,
)


def test_calculate_life_path_number() -> None:
    result = calculate_life_path_number(date(1998, 6, 14))

    assert result == 2


def test_calculate_destiny_number_from_name() -> None:
    result = calculate_destiny_number("Anna")

    assert result == 3


def test_calculate_soul_urge_number_from_name() -> None:
    result = calculate_soul_urge_number("Anna")

    assert result == 2


def test_calculate_personal_year_number() -> None:
    result = calculate_personal_year_number(
        birth_date=date(1998, 6, 14),
        current_date=date(2026, 4, 9),
    )

    assert result == 3


def test_calculate_personal_month_number() -> None:
    result = calculate_personal_month_number(
        personal_year_number=3,
        current_date=date(2026, 4, 9),
    )

    assert result == 7


def test_calculate_core_numbers_with_name() -> None:
    result = calculate_core_numbers(
        birth_date=date(1998, 6, 14),
        full_name="Anna",
        current_date=date(2026, 4, 9),
    )

    assert result.life_path_number == 2
    assert result.destiny_number == 3
    assert result.soul_urge_number == 2
    assert result.personal_year_number == 3
    assert result.personal_month_number == 7
    assert result.reading_preview.title == "Anna, here is your first reading preview"
    assert len(result.reading_preview.cards) == 3
    assert result.reading_preview.cards[2].label == "Inner Drive"


def test_calculate_core_numbers_without_name() -> None:
    result = calculate_core_numbers(
        birth_date=date(1998, 6, 14),
        current_date=date(2026, 4, 9),
    )

    assert result.destiny_number is None
    assert result.soul_urge_number is None
    assert result.reading_preview.title == "You, here is your first reading preview"
    assert "Adding a full name gives us the next layer of emotional depth." in (
        result.reading_preview.cards[2].body
    )
