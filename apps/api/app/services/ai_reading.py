import json
import logging
from datetime import date
from typing import Optional

from app.schemas.numerology import AiInsights

logger = logging.getLogger(__name__)

LIFE_PATH_MEANINGS_RU = {
    1: "первопроходец, лидер, независимость",
    2: "дипломат, интуиция, партнёрство",
    3: "творчество, самовыражение, общение",
    4: "стабильность, труд, практичность",
    5: "свобода, перемены, приключения",
    6: "забота, ответственность, гармония",
    7: "мудрость, анализ, духовность",
    8: "амбиции, власть, материальный успех",
    9: "служение, сострадание, завершённость",
}

PERSONAL_YEAR_MEANINGS_RU = {
    1: "новое начало, первый шаг",
    2: "терпение, партнёрство",
    3: "творчество, общение",
    4: "труд, структура",
    5: "перемены, свобода",
    6: "любовь, ответственность",
    7: "рефлексия, духовный поиск",
    8: "амбиции, финансы",
    9: "завершение, отпускание",
}


def _build_prompt(
    *,
    full_name: Optional[str],
    birth_date: date,
    life_path_number: int,
    destiny_number: Optional[int],
    soul_urge_number: Optional[int],
    personal_year_number: int,
    personal_month_number: int,
    pinnacles: list,
    karmic_lessons: list[int],
) -> str:
    life_path_meaning = LIFE_PATH_MEANINGS_RU.get(life_path_number, "")
    year_meaning = PERSONAL_YEAR_MEANINGS_RU.get(personal_year_number, "")
    month_meaning = PERSONAL_YEAR_MEANINGS_RU.get(personal_month_number, "")

    current_pinnacle = next((p for p in pinnacles if getattr(p, "is_current", False)), None)
    pinnacle_desc = ""
    if current_pinnacle is not None:
        pinnacle_num = getattr(current_pinnacle, "number", "?")
        start_age = getattr(current_pinnacle, "start_age", "?")
        end_age = getattr(current_pinnacle, "end_age", None)
        pinnacle_desc = (
            f"Пинакль {pinnacle_num} (с {start_age} лет"
            + (f" до {end_age} лет" if end_age else " и далее")
            + ")"
        )

    karmic_str = ", ".join(str(n) for n in karmic_lessons) if karmic_lessons else "нет"
    name_str = full_name if full_name else "не указано"
    destiny_str = str(destiny_number) if destiny_number is not None else "не рассчитан"
    soul_str = str(soul_urge_number) if soul_urge_number is not None else "не рассчитан"

    return f"""Ты нумеролог-аналитик. Напиши персонализированный нумерологический расклад на русском языке.

Данные пользователя:
- Имя: {name_str}
- Дата рождения: {birth_date.isoformat()}
- Число жизненного пути: {life_path_number} ({life_path_meaning})
- Число судьбы: {destiny_str}
- Число душевного порыва: {soul_str}
- Личный год: {personal_year_number} ({year_meaning})
- Личный месяц: {personal_month_number} ({month_meaning})
- Текущий пинакль: {pinnacle_desc if pinnacle_desc else "не определён"}
- Кармические уроки (отсутствующие цифры): {karmic_str}

Верни строго JSON-объект с этими ключами (все значения на русском языке):
- life_path_headline: короткий цепляющий заголовок о жизненном пути, максимум 10 слов
- life_path_body: 2-3 персонализированных предложения о жизненном пути
- year_energy_body: 2 предложения об энергии личного года и личного месяца прямо сейчас
- personality_summary: 1 предложение — общий портрет личности
- strength_headline: заголовок для раздела о сильных сторонах
- strength_body: 2 предложения о природных сильных сторонах
- shadow_headline: заголовок для раздела о слепых пятнах / теневой стороне
- shadow_body: 2 предложения о слепом пятне
- pinnacle_body: 2 предложения о текущем жизненном пинакле и его теме
- karmic_body: 2 предложения о кармических уроках (каких цифр нет, что это означает)

Отвечай только JSON, без пояснений."""


def generate_ai_insights(
    *,
    full_name: Optional[str],
    birth_date: date,
    life_path_number: int,
    destiny_number: Optional[int],
    soul_urge_number: Optional[int],
    personal_year_number: int,
    personal_month_number: int,
    pinnacles: list,
    karmic_lessons: list[int],
    api_key: str,
) -> Optional[AiInsights]:
    try:
        from openai import OpenAI  # lazy import to avoid hard dependency at module load

        client = OpenAI(api_key=api_key)

        prompt = _build_prompt(
            full_name=full_name,
            birth_date=birth_date,
            life_path_number=life_path_number,
            destiny_number=destiny_number,
            soul_urge_number=soul_urge_number,
            personal_year_number=personal_year_number,
            personal_month_number=personal_month_number,
            pinnacles=pinnacles,
            karmic_lessons=karmic_lessons,
        )

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0.7,
        )

        raw = response.choices[0].message.content
        if not raw:
            logger.warning("ai_reading: OpenAI returned empty content")
            return None

        data = json.loads(raw)
        return AiInsights(**data)

    except Exception as exc:
        logger.warning("ai_reading: failed to generate AI insights: %s", exc)
        return None
