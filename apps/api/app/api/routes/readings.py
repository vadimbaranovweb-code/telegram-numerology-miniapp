from fastapi import APIRouter

from app.schemas.readings import FirstReadingRequest, FirstReadingResponse
from app.services.readings import build_first_reading


router = APIRouter()


@router.post("/first", response_model=FirstReadingResponse)
def create_first_reading(payload: FirstReadingRequest) -> FirstReadingResponse:
    return build_first_reading(
        session_token=payload.session_token,
        force_regenerate=payload.force_regenerate,
    )
