from fastapi import APIRouter

from app.schemas.auth import TelegramAuthRequest, TelegramAuthResponse
from app.services.auth import build_telegram_auth_response


router = APIRouter()


@router.post("/telegram", response_model=TelegramAuthResponse)
def auth_telegram(payload: TelegramAuthRequest) -> TelegramAuthResponse:
    return build_telegram_auth_response(payload.init_data)
