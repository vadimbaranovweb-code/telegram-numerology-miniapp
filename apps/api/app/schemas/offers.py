from typing import Literal, Optional

from pydantic import BaseModel


OfferContext = Literal["compatibility"]


class PremiumOffer(BaseModel):
    offer_id: str
    offer_key: str
    title: str
    billing_period: Literal["monthly"]
    price_local: float
    currency: str
    stars_amount: int
    context: OfferContext


class OffersResponse(BaseModel):
    offers: list[PremiumOffer]
    context: Optional[OfferContext] = None
