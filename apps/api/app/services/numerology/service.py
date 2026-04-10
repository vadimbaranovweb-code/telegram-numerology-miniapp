from datetime import date
from typing import Optional

from app.schemas.numerology import (
    NumerologyCalculationResponse,
    ReadingPreview,
    ReadingPreviewCard,
)


CALCULATION_SYSTEM = "pythagorean"
CALCULATION_VERSION = "v1"
PYTHAGOREAN_MAP = {
    "A": 1,
    "B": 2,
    "C": 3,
    "D": 4,
    "E": 5,
    "F": 6,
    "G": 7,
    "H": 8,
    "I": 9,
    "J": 1,
    "K": 2,
    "L": 3,
    "M": 4,
    "N": 5,
    "O": 6,
    "P": 7,
    "Q": 8,
    "R": 9,
    "S": 1,
    "T": 2,
    "U": 3,
    "V": 4,
    "W": 5,
    "X": 6,
    "Y": 7,
    "Z": 8,
}
VOWELS = {"A", "E", "I", "O", "U"}

LIFE_PATH_HEADLINES = {
    1: "You are wired to initiate, not wait.",
    2: "You read the emotional tone before anyone speaks.",
    3: "You create momentum through expression and charm.",
    4: "You trust structure, patience, and reliability.",
    5: "You move best when life stays open and dynamic.",
    6: "You naturally carry care, duty, and emotional weight.",
    7: "You move toward depth, insight, and inner clarity.",
    8: "You are drawn to impact, leverage, and real-world results.",
    9: "You see the bigger meaning faster than most people.",
}

PERSONAL_YEAR_NOTES = {
    1: "This is a reset year. New starts matter more than perfect certainty.",
    2: "This year asks for patience, partnership, and emotional intelligence.",
    3: "This year rewards visibility, creativity, and saying more of what you mean.",
    4: "This year is about structure, commitment, and building something durable.",
    5: "This year brings movement, change, and pressure to stay flexible.",
    6: "This year pulls attention toward love, responsibility, and home.",
    7: "This year is quieter, deeper, and more inward than it first appears.",
    8: "This year amplifies ambition, money themes, and personal authority.",
    9: "This year closes cycles and asks what is ready to be released.",
}

PERSONAL_MONTH_NOTES = {
    1: "This month favors a clean decision and a clearer beginning.",
    2: "This month rewards softer timing and careful conversations.",
    3: "This month is strongest when you stay visible and expressive.",
    4: "This month wants consistency more than speed.",
    5: "This month can shift quickly, so loosen your grip a little.",
    6: "This month highlights relationships, care, and responsibility.",
    7: "This month is better for reflection than noise.",
    8: "This month rewards discipline, ambition, and sharper focus.",
    9: "This month carries closure energy and emotional clearing.",
}


def _reduce_to_digit(value: int) -> int:
    while value > 9:
        value = sum(int(char) for char in str(value))
    return value


def _sum_digits_from_string(value: str) -> int:
    return sum(int(char) for char in value if char.isdigit())


def _normalize_name(name: str) -> str:
    return "".join(char.upper() for char in name if char.isalpha())


def _sum_name_letters(name: str, vowels_only: bool = False) -> int:
    normalized_name = _normalize_name(name)
    total = 0

    for char in normalized_name:
        if vowels_only and char not in VOWELS:
            continue
        total += PYTHAGOREAN_MAP.get(char, 0)

    return total


def calculate_life_path_number(birth_date: date) -> int:
    return _reduce_to_digit(_sum_digits_from_string(birth_date.isoformat()))


def calculate_destiny_number(full_name: str) -> int:
    return _reduce_to_digit(_sum_name_letters(full_name))


def calculate_soul_urge_number(full_name: str) -> int:
    return _reduce_to_digit(_sum_name_letters(full_name, vowels_only=True))


def calculate_personal_year_number(birth_date: date, current_date: date) -> int:
    total = _sum_digits_from_string(f"{birth_date.month:02d}{birth_date.day:02d}{current_date.year}")
    return _reduce_to_digit(total)


def calculate_personal_month_number(personal_year_number: int, current_date: date) -> int:
    return _reduce_to_digit(personal_year_number + current_date.month)


def build_reading_preview(
    *,
    full_name: Optional[str],
    life_path_number: int,
    soul_urge_number: Optional[int],
    personal_year_number: int,
    personal_month_number: int,
) -> ReadingPreview:
    greeting_name = full_name.strip() if full_name else "You"

    return ReadingPreview(
        title=f"{greeting_name}, here is your first reading preview",
        summary=(
            "These first cards turn your numbers into a readable pattern, "
            "not just a list of digits."
        ),
        cards=[
            ReadingPreviewCard(
                label="Core Energy",
                headline=(
                    LIFE_PATH_HEADLINES.get(life_path_number)
                    or "Your path becomes clearer when you understand your natural rhythm."
                ),
                body=(
                    f"Your Life Path {life_path_number} suggests the strongest signal "
                    "in your profile is how you move through the world, make decisions, "
                    "and restore trust in yourself."
                ),
            ),
            ReadingPreviewCard(
                label="Current Timing",
                headline=(
                    f"Personal Year {personal_year_number}, "
                    f"Personal Month {personal_month_number}"
                ),
                body=(
                    f"{PERSONAL_YEAR_NOTES[personal_year_number]} "
                    f"{PERSONAL_MONTH_NOTES[personal_month_number]}"
                ),
            ),
            ReadingPreviewCard(
                label="Inner Drive",
                headline=(
                    f"Soul Urge {soul_urge_number} reveals what feels emotionally true."
                    if soul_urge_number is not None
                    else "Your deeper motivation becomes sharper once we map your full name."
                ),
                body=(
                    "When your outer path and inner pull align, your decisions become "
                    "much cleaner. This number helps explain what feels satisfying "
                    "underneath the surface."
                    if soul_urge_number is not None
                    else "Right now we can show your path and timing. Adding a full name "
                    "gives us the next layer of emotional depth."
                ),
            ),
        ],
    )


def calculate_core_numbers(
    birth_date: date,
    full_name: Optional[str] = None,
    current_date: Optional[date] = None,
) -> NumerologyCalculationResponse:
    today = current_date or date.today()
    personal_year_number = calculate_personal_year_number(birth_date, today)
    life_path_number = calculate_life_path_number(birth_date)
    destiny_number = calculate_destiny_number(full_name) if full_name else None
    soul_urge_number = calculate_soul_urge_number(full_name) if full_name else None

    return NumerologyCalculationResponse(
        birth_date=birth_date,
        life_path_number=life_path_number,
        destiny_number=destiny_number,
        soul_urge_number=soul_urge_number,
        personal_year_number=personal_year_number,
        personal_month_number=calculate_personal_month_number(personal_year_number, today),
        calculation_system=CALCULATION_SYSTEM,
        calculation_version=CALCULATION_VERSION,
        reading_preview=build_reading_preview(
            full_name=full_name,
            life_path_number=life_path_number,
            soul_urge_number=soul_urge_number,
            personal_year_number=personal_year_number,
            personal_month_number=calculate_personal_month_number(personal_year_number, today),
        ),
    )
