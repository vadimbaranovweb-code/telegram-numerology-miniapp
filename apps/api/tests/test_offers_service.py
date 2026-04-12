from app.services.offers import get_offer_by_key, list_offers


def test_list_offers_returns_compatibility_offer() -> None:
    result = list_offers()

    assert len(result.offers) == 1
    assert result.offers[0].offer_key == "compatibility_unlock_monthly"
    assert result.offers[0].stars_amount == 10


def test_list_offers_can_filter_by_context() -> None:
    result = list_offers(context="compatibility")

    assert result.context == "compatibility"
    assert len(result.offers) == 1
    assert result.offers[0].context == "compatibility"


def test_get_offer_by_key_returns_matching_offer() -> None:
    result = get_offer_by_key("compatibility_unlock_monthly")

    assert result.title == "Compatibility Unlock"
    assert result.price_local == 0.13
