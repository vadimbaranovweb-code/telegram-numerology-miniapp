from fastapi import APIRouter

from app.schemas.compatibility import CompatibilityPreviewRequest, CompatibilityPreviewResponse
from app.services.compatibility import build_compatibility_preview


router = APIRouter()


@router.post("/preview", response_model=CompatibilityPreviewResponse)
def preview_compatibility(
    payload: CompatibilityPreviewRequest,
) -> CompatibilityPreviewResponse:
    return build_compatibility_preview(
        session_token=payload.session_token,
        source_birth_date=payload.source_birth_date,
        target_birth_date=payload.target_birth_date,
        relationship_context=payload.relationship_context,
        target_display_name=payload.target_display_name,
    )
