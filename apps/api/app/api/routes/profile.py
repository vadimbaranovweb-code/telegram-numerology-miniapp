from fastapi import APIRouter

from app.schemas.profile import ProfilePreviewRequest, ProfilePreviewResponse
from app.services.profile import build_profile_preview


router = APIRouter()


@router.post("/preview", response_model=ProfilePreviewResponse)
def preview_profile(payload: ProfilePreviewRequest) -> ProfilePreviewResponse:
    return build_profile_preview(payload)
