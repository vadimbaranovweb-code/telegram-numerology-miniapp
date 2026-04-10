from fastapi import APIRouter, Query

from app.schemas.bootstrap import BootstrapResponse, BootstrapSnapshotRequest
from app.services.bootstrap import (
    build_bootstrap_response,
    reset_bootstrap_snapshot,
    save_bootstrap_snapshot,
)


router = APIRouter()


@router.get("", response_model=BootstrapResponse)
def get_bootstrap(
    session_token: str = Query(description="Temporary app session token"),
) -> BootstrapResponse:
    return build_bootstrap_response(session_token)


@router.post("/snapshot", response_model=BootstrapResponse)
def save_snapshot(payload: BootstrapSnapshotRequest) -> BootstrapResponse:
    return save_bootstrap_snapshot(
        session_token=payload.session_token,
        profile_snapshot=payload.app_profile,
        first_reading=payload.first_reading,
    )


@router.delete("/snapshot", response_model=BootstrapResponse)
def delete_snapshot(
    session_token: str = Query(description="Temporary app session token"),
) -> BootstrapResponse:
    return reset_bootstrap_snapshot(session_token)
