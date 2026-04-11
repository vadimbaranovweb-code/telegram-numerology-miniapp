import json
from typing import Optional

from app.schemas.compatibility import CompatibilityAiInsights


ARCHETYPES_RU = {
    1: "Первопроходец", 2: "Дипломат", 3: "Творец", 4: "Строитель",
    5: "Искатель", 6: "Хранитель", 7: "Мыслитель", 8: "Властитель", 9: "Мудрец",
}
CONTEXT_RU = {"romantic": "романтические", "friend": "дружеские", "work": "рабочие"}


def generate_compatibility_insights(
    *,
    source_life_path: int,
    target_life_path: int,
    source_name: Optional[str],
    target_name: Optional[str],
    relationship_context: str,  # "romantic" | "friend" | "work"
    compatibility_score: int,
    zone_scores: dict,
    api_key: str,
) -> Optional[CompatibilityAiInsights]:
    try:
        from openai import OpenAI

        client = OpenAI(api_key=api_key)

        source_archetype = ARCHETYPES_RU.get(source_life_path, str(source_life_path))
        target_archetype = ARCHETYPES_RU.get(target_life_path, str(target_life_path))
        context_ru = CONTEXT_RU.get(relationship_context, relationship_context)
        source_label = source_name or "Пользователь"
        target_label = target_name or "Партнёр"

        prompt = f"""Ты нумерологический аналитик. Дай персонализированный анализ совместимости двух людей.

Данные:
- {source_label}: Число жизненного пути {source_life_path} ({source_archetype})
- {target_label}: Число жизненного пути {target_life_path} ({target_archetype})
- Тип отношений: {context_ru}
- Общий балл совместимости: {compatibility_score}/100
- Зоны совместимости: романтика {zone_scores.get('romance', 0)}/100, коммуникация {zone_scores.get('communication', 0)}/100, ценности {zone_scores.get('values', 0)}/100, динамика {zone_scores.get('dynamics', 0)}/100, долгосрочность {zone_scores.get('longevity', 0)}/100

Ответь строго в формате JSON (без markdown, без пояснений) с ровно этими 8 полями на русском языке:
{{
  "chemistry_headline": "Краткий заголовок о том, что происходит, когда встречаются эти две энергии (максимум 10 слов)",
  "chemistry_body": "2-3 предложения об энергетической динамике между числами жизненного пути {source_life_path} и {target_life_path}",
  "destiny_headline": "Заголовок о совместной судьбе этой пары (максимум 8 слов)",
  "destiny_body": "2 предложения о том, что означает совместный путь этой пары",
  "tension_body": "2 предложения о конкретных точках напряжения для пары {source_life_path}-{target_life_path} в контексте {context_ru} отношений",
  "deep_connection_body": "2 предложения о глубокой совместимости на уровне души для этой пары",
  "best_periods_body": "2 предложения о том, когда эти отношения наиболее сильны (какие личные годовые энергии совпадают)",
  "advice": "Одна конкретная практическая рекомендация именно для этой пары"
}}"""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            temperature=0.75,
            response_format={"type": "json_object"},
            messages=[
                {
                    "role": "system",
                    "content": "Ты нумерологический аналитик. Отвечай только валидным JSON без markdown-блоков.",
                },
                {"role": "user", "content": prompt},
            ],
        )

        raw = response.choices[0].message.content or "{}"
        data = json.loads(raw)

        return CompatibilityAiInsights(
            chemistry_headline=data["chemistry_headline"],
            chemistry_body=data["chemistry_body"],
            destiny_headline=data["destiny_headline"],
            destiny_body=data["destiny_body"],
            tension_body=data["tension_body"],
            deep_connection_body=data["deep_connection_body"],
            best_periods_body=data["best_periods_body"],
            advice=data["advice"],
        )
    except Exception:
        return None
