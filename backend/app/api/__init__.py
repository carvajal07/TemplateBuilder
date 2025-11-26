"""
API Routes
"""

from fastapi import APIRouter
from app.api import templates, assets, auth, render

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(templates.router, prefix="/templates", tags=["templates"])
api_router.include_router(assets.router, prefix="/assets", tags=["assets"])
api_router.include_router(render.router, prefix="/render", tags=["render"])
