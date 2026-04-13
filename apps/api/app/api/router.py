from fastapi import APIRouter

from app.api.routes.auth import router as auth_router
from app.api.routes.illustrations import router as illustrations_router
from app.api.routes.bootstrap import router as bootstrap_router
from app.api.routes.compatibility import router as compatibility_router
from app.api.routes.horoscope import router as horoscope_router
from app.api.routes.daily import router as daily_router
from app.api.routes.events import router as events_router
from app.api.routes.health import router as health_router
from app.api.routes.numerology import router as numerology_router
from app.api.routes.onboarding import router as onboarding_router
from app.api.routes.offers import router as offers_router
from app.api.routes.payments import router as payments_router
from app.api.routes.premium import router as premium_router
from app.api.routes.profile import router as profile_router
from app.api.routes.readings import router as readings_router


api_router = APIRouter()
api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(bootstrap_router, prefix="/bootstrap", tags=["bootstrap"])
api_router.include_router(
    compatibility_router,
    prefix="/compatibility",
    tags=["compatibility"],
)
api_router.include_router(daily_router, prefix="/daily", tags=["daily"])
api_router.include_router(events_router, prefix="/events", tags=["events"])
api_router.include_router(health_router, prefix="/health", tags=["health"])
api_router.include_router(horoscope_router, prefix="/horoscope", tags=["horoscope"])
api_router.include_router(numerology_router, prefix="/numerology", tags=["numerology"])
api_router.include_router(onboarding_router, prefix="/onboarding", tags=["onboarding"])
api_router.include_router(offers_router, prefix="/offers", tags=["offers"])
api_router.include_router(payments_router, prefix="/payments", tags=["payments"])
api_router.include_router(premium_router, prefix="/premium", tags=["premium"])
api_router.include_router(profile_router, prefix="/profile", tags=["profile"])
api_router.include_router(readings_router, prefix="/readings", tags=["readings"])
api_router.include_router(illustrations_router, prefix="/illustrations", tags=["illustrations"])
