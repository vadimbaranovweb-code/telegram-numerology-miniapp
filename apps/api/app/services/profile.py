from app.schemas.profile import ProfilePreviewRequest, ProfilePreviewResponse


def build_profile_preview(payload: ProfilePreviewRequest) -> ProfilePreviewResponse:
    # Temporary development-only preview response until DB persistence is wired in.
    return ProfilePreviewResponse(
        display_name=payload.display_name,
        birth_date=payload.birth_date,
        daily_opt_in=payload.daily_opt_in,
        onboarding_completed=True,
        storage_mode="in_memory_preview",
    )
