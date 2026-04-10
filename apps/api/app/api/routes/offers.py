from typing import Optional

from fastapi import APIRouter

from app.schemas.offers import OfferContext, OffersResponse
from app.services.offers import list_offers


router = APIRouter()


@router.get("", response_model=OffersResponse)
def get_offers(context: Optional[OfferContext] = None) -> OffersResponse:
    return list_offers(context=context)
