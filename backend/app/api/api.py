from fastapi import APIRouter

from .endpoints import incidents, users, governance, ai

api_router = APIRouter()
api_router.include_router(incidents.router, prefix="/incidents", tags=["incidents"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(governance.router, prefix="/governance", tags=["governance"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])