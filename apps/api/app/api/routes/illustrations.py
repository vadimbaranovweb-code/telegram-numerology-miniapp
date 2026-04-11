from fastapi import APIRouter, HTTPException
from fastapi.responses import Response

from app.core.settings import get_settings
from app.services import illustrations as illus_service

router = APIRouter()

VALID_LIFE_PATHS = set(range(1, 10))
VALID_CARD_TYPES = {
    "core_energy",
    "current_timing",
    "inner_drive",
    "strength",
    "blind_spot",
    "relationship_style",
}


@router.get("/serve/{life_path}/{card_type}")
async def serve_illustration(life_path: int, card_type: str) -> Response:
    if life_path not in VALID_LIFE_PATHS:
        raise HTTPException(status_code=400, detail="Invalid life_path (must be 1-9)")
    if card_type not in VALID_CARD_TYPES:
        raise HTTPException(status_code=400, detail=f"Unknown card_type: {card_type}")

    settings = get_settings()
    if not settings.openai_api_key:
        raise HTTPException(status_code=503, detail="Illustration service not configured")

    try:
        image_bytes = await illus_service.get_or_generate(life_path, card_type, settings.openai_api_key)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Illustration generation failed: {exc}") from exc

    return Response(
        content=image_bytes,
        media_type="image/png",
        headers={"Cache-Control": "public, max-age=86400"},
    )
