from datetime import date
from typing import Optional

from app.schemas.horoscope import (
    DailyForecast,
    Element,
    HoroscopeCompatAiInsights,
    HoroscopeCompatibilityResponse,
    HoroscopeReadingResponse,
    PersonalReading,
    ZodiacCard,
    ZodiacCompatibility,
    ZodiacInfo,
    ZodiacSign,
    HoroscopeAiInsights,
)

# ─── Zodiac signs table ──────────────────────────────────────────────

_ZODIAC_TABLE: list[dict] = [
    {"sign": "aries",       "ru": "Овен",       "symbol": "♈", "element": "fire",  "element_ru": "Огонь", "planet": "Марс",    "sm": 3, "sd": 21, "em": 4, "ed": 19},
    {"sign": "taurus",      "ru": "Телец",      "symbol": "♉", "element": "earth", "element_ru": "Земля", "planet": "Венера",   "sm": 4, "sd": 20, "em": 5, "ed": 20},
    {"sign": "gemini",      "ru": "Близнецы",   "symbol": "♊", "element": "air",   "element_ru": "Воздух","planet": "Меркурий", "sm": 5, "sd": 21, "em": 6, "ed": 20},
    {"sign": "cancer",      "ru": "Рак",        "symbol": "♋", "element": "water", "element_ru": "Вода",  "planet": "Луна",     "sm": 6, "sd": 21, "em": 7, "ed": 22},
    {"sign": "leo",         "ru": "Лев",        "symbol": "♌", "element": "fire",  "element_ru": "Огонь", "planet": "Солнце",   "sm": 7, "sd": 23, "em": 8, "ed": 22},
    {"sign": "virgo",       "ru": "Дева",       "symbol": "♍", "element": "earth", "element_ru": "Земля", "planet": "Меркурий", "sm": 8, "sd": 23, "em": 9, "ed": 22},
    {"sign": "libra",       "ru": "Весы",       "symbol": "♎", "element": "air",   "element_ru": "Воздух","planet": "Венера",   "sm": 9, "sd": 23, "em": 10,"ed": 22},
    {"sign": "scorpio",     "ru": "Скорпион",   "symbol": "♏", "element": "water", "element_ru": "Вода",  "planet": "Плутон",   "sm": 10,"sd": 23, "em": 11,"ed": 21},
    {"sign": "sagittarius", "ru": "Стрелец",    "symbol": "♐", "element": "fire",  "element_ru": "Огонь", "planet": "Юпитер",   "sm": 11,"sd": 22, "em": 12,"ed": 21},
    {"sign": "capricorn",   "ru": "Козерог",    "symbol": "♑", "element": "earth", "element_ru": "Земля", "planet": "Сатурн",   "sm": 12,"sd": 22, "em": 1, "ed": 19},
    {"sign": "aquarius",    "ru": "Водолей",    "symbol": "♒", "element": "air",   "element_ru": "Воздух","planet": "Уран",     "sm": 1, "sd": 20, "em": 2, "ed": 18},
    {"sign": "pisces",      "ru": "Рыбы",       "symbol": "♓", "element": "water", "element_ru": "Вода",  "planet": "Нептун",   "sm": 2, "sd": 19, "em": 3, "ed": 20},
]

_DATE_RANGES: dict[ZodiacSign, str] = {
    "aries": "21 марта — 19 апреля",
    "taurus": "20 апреля — 20 мая",
    "gemini": "21 мая — 20 июня",
    "cancer": "21 июня — 22 июля",
    "leo": "23 июля — 22 августа",
    "virgo": "23 августа — 22 сентября",
    "libra": "23 сентября — 22 октября",
    "scorpio": "23 октября — 21 ноября",
    "sagittarius": "22 ноября — 21 декабря",
    "capricorn": "22 декабря — 19 января",
    "aquarius": "20 января — 18 февраля",
    "pisces": "19 февраля — 20 марта",
}

# ─── Descriptions ────────────────────────────────────────────────────

_DESCRIPTIONS: dict[ZodiacSign, str] = {
    "aries": "Прирождённый лидер с неукротимой энергией. Овен первым бросается в новые проекты и не боится рисковать. Его огонь вдохновляет окружающих на действие.",
    "taurus": "Надёжный и чувственный знак, ценящий стабильность и красоту. Телец строит прочный фундамент во всём — от отношений до финансов. Его терпение — его суперсила.",
    "gemini": "Мастер коммуникации с быстрым умом и безграничным любопытством. Близнецы видят мир через призму идей и связей. Их адаптивность открывает любые двери.",
    "cancer": "Глубоко интуитивный и заботливый знак. Рак создаёт безопасное пространство для близких и обладает удивительной эмоциональной мудростью. Его сила — в уязвимости.",
    "leo": "Яркая и щедрая натура, рождённая сиять. Лев притягивает людей своей харизмой и согревает каждого своим теплом. Его творческий огонь неисчерпаем.",
    "virgo": "Аналитический ум с тонким чувством деталей. Дева видит совершенство там, где другие видят хаос. Её практичность и преданность делают невозможное возможным.",
    "libra": "Миротворец с врождённым чувством гармонии и справедливости. Весы создают красоту в отношениях и пространстве. Их дипломатичность — настоящий дар.",
    "scorpio": "Глубокий и трансформирующий знак с невероятной интуицией. Скорпион видит суть вещей и не боится тьмы. Его страсть и преданность не знают границ.",
    "sagittarius": "Вечный искатель с философским складом ума. Стрелец расширяет горизонты — свои и чужие. Его оптимизм и жажда приключений заразительны.",
    "capricorn": "Стратег с железной волей и долгосрочным видением. Козерог поднимается к вершинам шаг за шагом. Его дисциплина и амбиции вызывают уважение.",
    "aquarius": "Визионер и свободный мыслитель. Водолей видит будущее раньше других и не боится быть уникальным. Его гуманизм и оригинальность меняют мир.",
    "pisces": "Мечтатель с глубочайшей эмпатией и творческим даром. Рыбы чувствуют невидимые потоки и вдохновляют через искусство и сострадание. Их интуиция безгранична.",
}

# ─── Strengths / Weaknesses ─────────────────────────────────────────

_STRENGTHS: dict[ZodiacSign, list[str]] = {
    "aries": ["Решительность", "Смелость", "Энтузиазм", "Лидерство"],
    "taurus": ["Надёжность", "Терпение", "Практичность", "Верность"],
    "gemini": ["Общительность", "Адаптивность", "Интеллект", "Остроумие"],
    "cancer": ["Забота", "Интуиция", "Эмпатия", "Преданность"],
    "leo": ["Харизма", "Щедрость", "Творчество", "Уверенность"],
    "virgo": ["Аналитичность", "Трудолюбие", "Внимание к деталям", "Скромность"],
    "libra": ["Дипломатичность", "Чувство красоты", "Справедливость", "Обаяние"],
    "scorpio": ["Глубина", "Страсть", "Проницательность", "Стойкость"],
    "sagittarius": ["Оптимизм", "Честность", "Философия", "Свободолюбие"],
    "capricorn": ["Дисциплина", "Амбициозность", "Ответственность", "Стратегичность"],
    "aquarius": ["Оригинальность", "Гуманизм", "Независимость", "Прогрессивность"],
    "pisces": ["Эмпатия", "Творчество", "Интуиция", "Духовность"],
}

_WEAKNESSES: dict[ZodiacSign, list[str]] = {
    "aries": ["Импульсивность", "Нетерпеливость", "Агрессивность"],
    "taurus": ["Упрямство", "Лень", "Ревнивость"],
    "gemini": ["Поверхностность", "Непостоянство", "Нервозность"],
    "cancer": ["Обидчивость", "Манипулятивность", "Замкнутость"],
    "leo": ["Эгоцентризм", "Гордыня", "Драматизм"],
    "virgo": ["Перфекционизм", "Критичность", "Тревожность"],
    "libra": ["Нерешительность", "Избегание конфликтов", "Зависимость"],
    "scorpio": ["Ревность", "Мстительность", "Подозрительность"],
    "sagittarius": ["Безответственность", "Бестактность", "Непоследовательность"],
    "capricorn": ["Холодность", "Пессимизм", "Трудоголизм"],
    "aquarius": ["Отстранённость", "Упрямство", "Непредсказуемость"],
    "pisces": ["Escapism", "Наивность", "Самопожертвование"],
}

# ─── Rising / Moon sign approximations (without birth time) ─────────

_RISING_APPROX: dict[ZodiacSign, ZodiacSign] = {
    "aries": "cancer",       "taurus": "leo",
    "gemini": "virgo",       "cancer": "libra",
    "leo": "scorpio",        "virgo": "sagittarius",
    "libra": "capricorn",    "scorpio": "aquarius",
    "sagittarius": "pisces", "capricorn": "aries",
    "aquarius": "taurus",    "pisces": "gemini",
}

_MOON_APPROX: dict[ZodiacSign, ZodiacSign] = {
    "aries": "scorpio",      "taurus": "pisces",
    "gemini": "aquarius",    "cancer": "taurus",
    "leo": "sagittarius",    "virgo": "cancer",
    "libra": "gemini",       "scorpio": "virgo",
    "sagittarius": "aries",  "capricorn": "leo",
    "aquarius": "libra",     "pisces": "capricorn",
}

# ─── Daily forecasts (12 variants per sign, cycled by day_of_year) ──

_DAILY_POOL: list[dict[str, str]] = [
    {"headline": "День новых начал",   "body": "Энергия дня благоприятна для старта проектов. Действуй смело — звёзды на твоей стороне.", "focus": "Инициатива"},
    {"headline": "Фокус на отношения", "body": "Сегодня важно уделить внимание близким. Искренний разговор укрепит связь.", "focus": "Отношения"},
    {"headline": "Финансовые потоки",  "body": "Благоприятный день для финансовых решений. Обрати внимание на неожиданные возможности.", "focus": "Финансы"},
    {"headline": "Творческий поток",   "body": "Вдохновение витает в воздухе. Позволь себе эксперименты и нестандартные решения.", "focus": "Творчество"},
    {"headline": "Время рефлексии",    "body": "Возьми паузу и послушай внутренний голос. Сегодня интуиция сильнее логики.", "focus": "Самопознание"},
    {"headline": "Энергия действия",   "body": "Физическая активность принесёт ясность ума. Движение — ключ к решению застарелых вопросов.", "focus": "Активность"},
    {"headline": "Социальные связи",   "body": "Расширяй круг знакомств. Сегодня случайная встреча может стать судьбоносной.", "focus": "Нетворкинг"},
    {"headline": "Внутренняя сила",    "body": "Испытания дня — это тренажёр для духа. Каждое препятствие делает тебя сильнее.", "focus": "Устойчивость"},
    {"headline": "Гармония пространства","body": "Обнови что-то в своём окружении. Даже маленькие перемены могут сдвинуть энергию.", "focus": "Пространство"},
    {"headline": "Обучение и рост",    "body": "Идеальный день для изучения нового. Знания, полученные сегодня, пригодятся скоро.", "focus": "Саморазвитие"},
    {"headline": "Эмоциональная ясность","body": "Чувства подскажут верное направление. Не игнорируй своё сердце — оно знает путь.", "focus": "Эмоции"},
    {"headline": "Стратегическое мышление","body": "Планируй на перспективу. Сегодня решения определят вектор следующих недель.", "focus": "Планирование"},
]

# ─── Zodiac compatibility matrix (symmetric, 78 unique pairs) ───────

_ZODIAC_COMPAT: dict[tuple[str, str], int] = {
    ("aries","aries"): 75, ("aries","taurus"): 55, ("aries","gemini"): 80, ("aries","cancer"): 45,
    ("aries","leo"): 90, ("aries","virgo"): 50, ("aries","libra"): 70, ("aries","scorpio"): 65,
    ("aries","sagittarius"): 93, ("aries","capricorn"): 48, ("aries","aquarius"): 78, ("aries","pisces"): 55,
    ("taurus","taurus"): 85, ("taurus","gemini"): 45, ("taurus","cancer"): 88, ("taurus","leo"): 62,
    ("taurus","virgo"): 90, ("taurus","libra"): 58, ("taurus","scorpio"): 82, ("taurus","sagittarius"): 40,
    ("taurus","capricorn"): 92, ("taurus","aquarius"): 42, ("taurus","pisces"): 80,
    ("gemini","gemini"): 70, ("gemini","cancer"): 50, ("gemini","leo"): 78, ("gemini","virgo"): 60,
    ("gemini","libra"): 88, ("gemini","scorpio"): 40, ("gemini","sagittarius"): 82, ("gemini","capricorn"): 45,
    ("gemini","aquarius"): 90, ("gemini","pisces"): 48,
    ("cancer","cancer"): 80, ("cancer","leo"): 55, ("cancer","virgo"): 75, ("cancer","libra"): 50,
    ("cancer","scorpio"): 92, ("cancer","sagittarius"): 38, ("cancer","capricorn"): 70, ("cancer","aquarius"): 40,
    ("cancer","pisces"): 95,
    ("leo","leo"): 78, ("leo","virgo"): 52, ("leo","libra"): 80, ("leo","scorpio"): 68,
    ("leo","sagittarius"): 88, ("leo","capricorn"): 50, ("leo","aquarius"): 72, ("leo","pisces"): 55,
    ("virgo","virgo"): 82, ("virgo","libra"): 58, ("virgo","scorpio"): 78, ("virgo","sagittarius"): 45,
    ("virgo","capricorn"): 88, ("virgo","aquarius"): 48, ("virgo","pisces"): 65,
    ("libra","libra"): 75, ("libra","scorpio"): 55, ("libra","sagittarius"): 72, ("libra","capricorn"): 50,
    ("libra","aquarius"): 85, ("libra","pisces"): 55,
    ("scorpio","scorpio"): 78, ("scorpio","sagittarius"): 52, ("scorpio","capricorn"): 80,
    ("scorpio","aquarius"): 48, ("scorpio","pisces"): 88,
    ("sagittarius","sagittarius"): 80, ("sagittarius","capricorn"): 45, ("sagittarius","aquarius"): 82,
    ("sagittarius","pisces"): 55,
    ("capricorn","capricorn"): 85, ("capricorn","aquarius"): 52, ("capricorn","pisces"): 60,
    ("aquarius","aquarius"): 78, ("aquarius","pisces"): 50,
    ("pisces","pisces"): 82,
}

_ELEMENT_STRENGTHS: dict[tuple[Element, Element], list[str]] = {
    ("fire", "fire"): ["Взрывная энергия", "Взаимное вдохновение", "Страстность"],
    ("fire", "air"): ["Интеллектуальная искра", "Динамичность", "Взаимный рост"],
    ("fire", "earth"): ["Баланс мечты и реальности", "Стабилизация энергии"],
    ("fire", "water"): ["Эмоциональная глубина", "Трансформация через страсть"],
    ("earth", "earth"): ["Надёжность", "Совместное строительство", "Стабильность"],
    ("earth", "air"): ["Практичность + идеи", "Расширение горизонтов"],
    ("earth", "water"): ["Плодородие", "Эмоциональная безопасность", "Нежность"],
    ("air", "air"): ["Интеллектуальная связь", "Свобода мысли", "Лёгкость"],
    ("air", "water"): ["Глубина + лёгкость", "Творческий синтез"],
    ("water", "water"): ["Глубокая эмпатия", "Духовная связь", "Интуиция"],
}

_ELEMENT_CHALLENGES: dict[tuple[Element, Element], list[str]] = {
    ("fire", "fire"): ["Борьба за лидерство", "Выгорание"],
    ("fire", "air"): ["Нестабильность", "Рассеянность энергии"],
    ("fire", "earth"): ["Конфликт темпа", "Фрустрация от ограничений"],
    ("fire", "water"): ["Эмоциональные бури", "Разная скорость обработки чувств"],
    ("earth", "earth"): ["Застой", "Скука от рутины"],
    ("earth", "air"): ["Непонимание мотивов", "Конфликт свободы и стабильности"],
    ("earth", "water"): ["Эмоциональная перегрузка", "Медлительность"],
    ("air", "air"): ["Отсутствие заземления", "Поверхностность связи"],
    ("air", "water"): ["Рациональное vs эмоциональное", "Непонимание"],
    ("water", "water"): ["Утопание в эмоциях", "Потеря границ"],
}

# ─── Element summary templates ──────────────────────────────────────

_ELEMENT_SUMMARY: dict[Element, str] = {
    "fire": "Огненная стихия даёт тебе неукротимую энергию и страсть к жизни. Ты действуешь первым и вдохновляешь других своей решимостью.",
    "earth": "Земная стихия наделяет тебя стабильностью и практичностью. Ты строишь прочное основание и ценишь реальные результаты.",
    "air": "Воздушная стихия дарит тебе быстрый ум и социальную лёгкость. Ты мыслишь свободно и соединяешь людей через идеи.",
    "water": "Водная стихия погружает тебя в мир эмоций и интуиции. Ты чувствуешь глубже других и обладаешь даром сострадания.",
}

# ─── Sign list for index lookup ──────────────────────────────────────

_SIGN_ORDER: list[ZodiacSign] = [
    "aries", "taurus", "gemini", "cancer", "leo", "virgo",
    "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
]


# ═══════════════════════════════════════════════════════════════════════
# Public functions
# ═══════════════════════════════════════════════════════════════════════


def get_zodiac_sign(birth_date: date) -> ZodiacSign:
    """Determine zodiac sign from birth date, handling Capricorn's year boundary."""
    m, d = birth_date.month, birth_date.day
    for z in _ZODIAC_TABLE:
        if z["sm"] <= z["em"]:
            # Normal range (same year)
            if (m == z["sm"] and d >= z["sd"]) or (m == z["em"] and d <= z["ed"]) or (z["sm"] < m < z["em"]):
                return z["sign"]
        else:
            # Year-crossing (Capricorn: Dec 22 – Jan 19)
            if (m == z["sm"] and d >= z["sd"]) or (m == z["em"] and d <= z["ed"]) or m > z["sm"] or m < z["em"]:
                return z["sign"]
    return "capricorn"


def _get_sign_meta(sign: ZodiacSign) -> dict:
    for z in _ZODIAC_TABLE:
        if z["sign"] == sign:
            return z
    return _ZODIAC_TABLE[0]


def _sign_ru(sign: ZodiacSign) -> str:
    return _get_sign_meta(sign)["ru"]


def build_zodiac_info(sign: ZodiacSign) -> ZodiacInfo:
    meta = _get_sign_meta(sign)
    return ZodiacInfo(
        sign=sign,
        sign_ru=meta["ru"],
        symbol=meta["symbol"],
        element=meta["element"],
        element_ru=meta["element_ru"],
        ruling_planet=meta["planet"],
        date_range=_DATE_RANGES[sign],
        description=_DESCRIPTIONS[sign],
    )


def build_daily_forecast(sign: ZodiacSign, current_date: Optional[date] = None) -> DailyForecast:
    today = current_date or date.today()
    sign_idx = _SIGN_ORDER.index(sign)
    day_of_year = today.timetuple().tm_yday
    pool_idx = (sign_idx * 31 + day_of_year) % len(_DAILY_POOL)
    entry = _DAILY_POOL[pool_idx]
    lucky = (sign_idx * 7 + day_of_year * 3) % 99 + 1
    return DailyForecast(
        headline=entry["headline"],
        body=entry["body"],
        lucky_number=lucky,
        focus_area=entry["focus"],
    )


def build_personal_reading(sign: ZodiacSign) -> PersonalReading:
    meta = _get_sign_meta(sign)
    rising = _RISING_APPROX[sign]
    moon = _MOON_APPROX[sign]
    return PersonalReading(
        rising_sign=rising,
        rising_sign_ru=_sign_ru(rising),
        moon_sign=moon,
        moon_sign_ru=_sign_ru(moon),
        strengths=_STRENGTHS[sign],
        weaknesses=_WEAKNESSES[sign],
        element_summary=_ELEMENT_SUMMARY[meta["element"]],
        summary=f"{meta['ru']} под управлением {meta['planet']}. {_DESCRIPTIONS[sign]}",
    )


def _compat_score(a: ZodiacSign, b: ZodiacSign) -> int:
    key = (min(a, b), max(a, b)) if a <= b else (min(b, a), max(b, a))
    # Sort alphabetically for consistent lookup
    pair = tuple(sorted([a, b]))
    return _ZODIAC_COMPAT.get(pair, 60)


def _element_pair(a: ZodiacSign, b: ZodiacSign) -> tuple[Element, Element]:
    ea = _get_sign_meta(a)["element"]
    eb = _get_sign_meta(b)["element"]
    return tuple(sorted([ea, eb]))


def build_zodiac_compatibility(
    source_sign: ZodiacSign,
    target_sign: ZodiacSign,
    target_display_name: Optional[str] = None,
) -> ZodiacCompatibility:
    score = _compat_score(source_sign, target_sign)
    ep = _element_pair(source_sign, target_sign)
    strengths = _ELEMENT_STRENGTHS.get(ep, ["Уникальная связь"])
    challenges = _ELEMENT_CHALLENGES.get(ep, ["Необходимость компромиссов"])
    target_label = target_display_name or _sign_ru(target_sign)

    if score >= 80:
        headline = f"{_sign_ru(source_sign)} и {target_label} — мощный союз"
        body = "Ваши энергии гармонично дополняют друг друга. Эта связь способна принести глубокое понимание и рост."
    elif score >= 60:
        headline = f"{_sign_ru(source_sign)} и {target_label} — интересный контраст"
        body = "Разные подходы создают динамику. При взаимном уважении различия становятся силой."
    else:
        headline = f"{_sign_ru(source_sign)} и {target_label} — вызов и рост"
        body = "Эта связь требует усилий, но именно в преодолении различий рождается самое глубокое понимание."

    return ZodiacCompatibility(
        source_sign=source_sign,
        source_sign_ru=_sign_ru(source_sign),
        target_sign=target_sign,
        target_sign_ru=_sign_ru(target_sign),
        score=score,
        headline=headline,
        body=body,
        strengths=strengths,
        challenges=challenges,
    )


def _build_reading_cards(zodiac: ZodiacInfo, reading: PersonalReading, forecast: DailyForecast) -> list[ZodiacCard]:
    return [
        ZodiacCard(
            label="Твой знак",
            headline=f"{zodiac.symbol} {zodiac.sign_ru}",
            body=zodiac.description,
        ),
        ZodiacCard(
            label="Стихия",
            headline=f"Стихия {zodiac.element_ru}",
            body=reading.element_summary,
        ),
        ZodiacCard(
            label="Восходящий знак",
            headline=f"Восходящий: {reading.rising_sign_ru}",
            body=f"Приблизительный восходящий знак определяет твою внешнюю подачу и первое впечатление, которое ты производишь.",
        ),
        ZodiacCard(
            label="Лунный знак",
            headline=f"Луна в {reading.moon_sign_ru}",
            body=f"Лунный знак отвечает за эмоциональный мир и интуитивные реакции.",
        ),
        ZodiacCard(
            label="Прогноз дня",
            headline=forecast.headline,
            body=forecast.body,
        ),
    ]


def _build_compat_cards(source: ZodiacInfo, target: ZodiacInfo, compat: ZodiacCompatibility) -> list[ZodiacCard]:
    return [
        ZodiacCard(
            label="Совместимость",
            headline=compat.headline,
            body=compat.body,
        ),
        ZodiacCard(
            label="Сильные стороны",
            headline="Что вас объединяет",
            body=". ".join(compat.strengths) + ".",
        ),
        ZodiacCard(
            label="Вызовы",
            headline="Зоны роста",
            body=". ".join(compat.challenges) + ".",
        ),
    ]


def build_horoscope(
    birth_date: date,
    full_name: Optional[str] = None,
    current_date: Optional[date] = None,
    ai_insights: Optional[HoroscopeAiInsights] = None,
) -> HoroscopeReadingResponse:
    sign = get_zodiac_sign(birth_date)
    zodiac = build_zodiac_info(sign)
    forecast = build_daily_forecast(sign, current_date)
    reading = build_personal_reading(sign)
    cards = _build_reading_cards(zodiac, reading, forecast)

    return HoroscopeReadingResponse(
        birth_date=birth_date,
        zodiac=zodiac,
        daily_forecast=forecast,
        personal_reading=reading,
        cards=cards,
        ai_insights=ai_insights,
    )


def build_horoscope_compatibility(
    source_birth_date: date,
    target_birth_date: date,
    target_display_name: Optional[str] = None,
    ai_insights: Optional[HoroscopeCompatAiInsights] = None,
) -> HoroscopeCompatibilityResponse:
    source_sign = get_zodiac_sign(source_birth_date)
    target_sign = get_zodiac_sign(target_birth_date)
    source_zodiac = build_zodiac_info(source_sign)
    target_zodiac = build_zodiac_info(target_sign)
    compat = build_zodiac_compatibility(source_sign, target_sign, target_display_name)
    cards = _build_compat_cards(source_zodiac, target_zodiac, compat)

    return HoroscopeCompatibilityResponse(
        source_zodiac=source_zodiac,
        target_zodiac=target_zodiac,
        compatibility=compat,
        cards=cards,
        ai_insights=ai_insights,
    )
