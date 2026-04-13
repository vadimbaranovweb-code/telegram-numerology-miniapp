from datetime import date

from app.services.horoscope import (
    get_zodiac_sign,
    build_zodiac_info,
    build_daily_forecast,
    build_personal_reading,
    build_zodiac_compatibility,
    build_horoscope,
    build_horoscope_compatibility,
)


class TestGetZodiacSign:
    def test_aries(self):
        assert get_zodiac_sign(date(1990, 3, 25)) == "aries"

    def test_aries_boundary_start(self):
        assert get_zodiac_sign(date(1990, 3, 21)) == "aries"

    def test_aries_boundary_end(self):
        assert get_zodiac_sign(date(1990, 4, 19)) == "aries"

    def test_taurus(self):
        assert get_zodiac_sign(date(1990, 5, 1)) == "taurus"

    def test_cancer(self):
        assert get_zodiac_sign(date(1990, 7, 10)) == "cancer"

    def test_capricorn_december(self):
        assert get_zodiac_sign(date(1990, 12, 25)) == "capricorn"

    def test_capricorn_january(self):
        assert get_zodiac_sign(date(1990, 1, 10)) == "capricorn"

    def test_aquarius(self):
        assert get_zodiac_sign(date(1990, 2, 5)) == "aquarius"

    def test_pisces(self):
        assert get_zodiac_sign(date(1990, 3, 10)) == "pisces"

    def test_all_12_signs_reachable(self):
        test_dates = [
            (date(2000, 3, 25), "aries"),
            (date(2000, 4, 25), "taurus"),
            (date(2000, 5, 25), "gemini"),
            (date(2000, 6, 25), "cancer"),
            (date(2000, 7, 25), "leo"),
            (date(2000, 8, 25), "virgo"),
            (date(2000, 9, 25), "libra"),
            (date(2000, 10, 25), "scorpio"),
            (date(2000, 11, 25), "sagittarius"),
            (date(2000, 12, 25), "capricorn"),
            (date(2000, 1, 25), "aquarius"),
            (date(2000, 2, 25), "pisces"),
        ]
        for d, expected in test_dates:
            assert get_zodiac_sign(d) == expected, f"Failed for {d}: expected {expected}"


class TestBuildZodiacInfo:
    def test_returns_complete_info(self):
        info = build_zodiac_info("leo")
        assert info.sign == "leo"
        assert info.sign_ru == "Лев"
        assert info.symbol == "♌"
        assert info.element == "fire"
        assert info.element_ru == "Огонь"
        assert info.ruling_planet == "Солнце"
        assert "июля" in info.date_range
        assert len(info.description) > 20


class TestBuildDailyForecast:
    def test_returns_forecast(self):
        forecast = build_daily_forecast("aries", date(2026, 4, 13))
        assert forecast.headline
        assert forecast.body
        assert 1 <= forecast.lucky_number <= 99
        assert forecast.focus_area

    def test_deterministic(self):
        f1 = build_daily_forecast("aries", date(2026, 4, 13))
        f2 = build_daily_forecast("aries", date(2026, 4, 13))
        assert f1.headline == f2.headline
        assert f1.lucky_number == f2.lucky_number

    def test_different_signs_differ(self):
        f1 = build_daily_forecast("aries", date(2026, 4, 13))
        f2 = build_daily_forecast("libra", date(2026, 4, 13))
        # Different signs on the same day should generally differ
        assert f1.headline != f2.headline or f1.lucky_number != f2.lucky_number


class TestBuildPersonalReading:
    def test_returns_reading(self):
        reading = build_personal_reading("scorpio")
        assert reading.rising_sign == "aquarius"
        assert reading.moon_sign == "virgo"
        assert len(reading.strengths) >= 3
        assert len(reading.weaknesses) >= 3
        assert reading.element_summary
        assert reading.summary


class TestBuildZodiacCompatibility:
    def test_returns_compatibility(self):
        compat = build_zodiac_compatibility("aries", "leo")
        assert compat.score == 90
        assert compat.source_sign == "aries"
        assert compat.target_sign == "leo"
        assert compat.headline
        assert compat.body
        assert len(compat.strengths) >= 1
        assert len(compat.challenges) >= 1

    def test_symmetric(self):
        c1 = build_zodiac_compatibility("aries", "leo")
        c2 = build_zodiac_compatibility("leo", "aries")
        assert c1.score == c2.score


class TestBuildHoroscope:
    def test_full_reading(self):
        result = build_horoscope(date(1990, 8, 15))
        assert result.birth_date == date(1990, 8, 15)
        assert result.zodiac.sign == "leo"
        assert result.daily_forecast.headline
        assert result.personal_reading.rising_sign
        assert len(result.cards) >= 4

    def test_cards_have_content(self):
        result = build_horoscope(date(1990, 3, 25))
        for card in result.cards:
            assert card.label
            assert card.headline
            assert card.body


class TestBuildHoroscopeCompatibility:
    def test_full_compat(self):
        result = build_horoscope_compatibility(
            source_birth_date=date(1990, 3, 25),
            target_birth_date=date(1992, 7, 15),
        )
        assert result.source_zodiac.sign == "aries"
        assert result.target_zodiac.sign == "cancer"
        assert result.compatibility.score > 0
        assert len(result.cards) >= 3
