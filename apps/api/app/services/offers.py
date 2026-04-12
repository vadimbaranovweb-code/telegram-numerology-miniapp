from typing import Optional

from app.schemas.offers import OfferContext, OffersResponse, PremiumOffer


COMPATIBILITY_UNLOCK_OFFER = PremiumOffer(
    offer_id="offer_compatibility_unlock_monthly",
    offer_key="compatibility_unlock_monthly",
    title="Compatibility Unlock",
    billing_period="monthly",
    price_local=0.13,
    currency="USD",
    stars_amount=10,
    context="compatibility",
)


def list_offers(*, context: Optional[OfferContext] = None) -> OffersResponse:
    offers = [COMPATIBILITY_UNLOCK_OFFER]

    if context is not None:
        offers = [offer for offer in offers if offer.context == context]

    return OffersResponse(
        offers=offers,
        context=context,
    )


def get_offer_by_key(offer_key: str) -> PremiumOffer:
    offers = {
        COMPATIBILITY_UNLOCK_OFFER.offer_key: COMPATIBILITY_UNLOCK_OFFER,
    }

    try:
        return offers[offer_key]
    except KeyError as error:
        raise ValueError(f"Unknown premium offer: {offer_key}") from error
