from fastapi import APIRouter

from app.schemas.numerology import NumerologyCalculationRequest, NumerologyCalculationResponse
from app.services.numerology.service import calculate_core_numbers


router = APIRouter()


@router.post("/calculate", response_model=NumerologyCalculationResponse)
def calculate_numerology(
    payload: NumerologyCalculationRequest,
) -> NumerologyCalculationResponse:
    return calculate_core_numbers(payload.birth_date, payload.full_name)
