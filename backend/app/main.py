"""
Universal Template Builder - Main Application
FastAPI entry point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import socketio

from app.core.config import settings
from app.core.database import engine, Base
from app.api import api_router
from app.core.logging import setup_logging

# Setup logging
logger = setup_logging()

# Socket.IO setup
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins=settings.CORS_ORIGINS.split(','),
    ping_interval=settings.WEBSOCKET_PING_INTERVAL,
    ping_timeout=settings.WEBSOCKET_PING_TIMEOUT,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context manager"""
    # Startup
    logger.info("Starting Universal Template Builder API")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"Debug mode: {settings.DEBUG}")

    # Create database tables
    async with engine.begin() as conn:
        if settings.DEBUG:
            await conn.run_sync(Base.metadata.create_all)

    yield

    # Shutdown
    logger.info("Shutting down Universal Template Builder API")


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="API for creating and managing PDF and Email templates",
    docs_url="/api/docs" if settings.DEBUG else None,
    redoc_url="/api/redoc" if settings.DEBUG else None,
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(','),
    allow_credentials=settings.CORS_CREDENTIALS,
    allow_methods=settings.CORS_METHODS.split(','),
    allow_headers=settings.CORS_HEADERS.split(','),
)

# GZip Middleware
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Include API routes
app.include_router(api_router, prefix="/api/v1")

# Socket.IO app
socket_app = socketio.ASGIApp(
    sio,
    other_asgi_app=app,
    socketio_path='/ws/socket.io'
)


# ============================================================================
# SOCKET.IO EVENTS
# ============================================================================

@sio.event
async def connect(sid, environ):
    """Handle client connection"""
    logger.info(f"Client connected: {sid}")


@sio.event
async def disconnect(sid):
    """Handle client disconnection"""
    logger.info(f"Client disconnected: {sid}")


@sio.event
async def join_template(sid, data):
    """Join template editing session"""
    template_id = data.get('templateId')
    user_id = data.get('userId')

    if not template_id or not user_id:
        return {'error': 'Missing templateId or userId'}

    # Join room
    await sio.enter_room(sid, template_id)

    # Notify others
    await sio.emit(
        'user_joined',
        {'userId': user_id, 'username': data.get('username', 'Anonymous')},
        room=template_id,
        skip_sid=sid
    )

    logger.info(f"User {user_id} joined template {template_id}")
    return {'success': True}


@sio.event
async def leave_template(sid, data):
    """Leave template editing session"""
    template_id = data.get('templateId')
    user_id = data.get('userId')

    if template_id:
        await sio.leave_room(sid, template_id)

        # Notify others
        await sio.emit(
            'user_left',
            {'userId': user_id},
            room=template_id
        )

        logger.info(f"User {user_id} left template {template_id}")

    return {'success': True}


@sio.event
async def template_change(sid, data):
    """Broadcast template change to all users in room"""
    template_id = data.get('templateId')
    change = data.get('change')
    user_id = data.get('userId')

    if not template_id or not change:
        return {'error': 'Missing templateId or change'}

    # Broadcast to all users in room except sender
    await sio.emit(
        'template_change',
        {'change': change, 'userId': user_id},
        room=template_id,
        skip_sid=sid
    )

    return {'success': True}


@sio.event
async def cursor_move(sid, data):
    """Broadcast cursor position to all users in room"""
    template_id = data.get('templateId')
    user_id = data.get('userId')
    position = data.get('position')

    if template_id and position:
        await sio.emit(
            'cursor_update',
            {'userId': user_id, 'position': position},
            room=template_id,
            skip_sid=sid
        )


# ============================================================================
# ROOT ENDPOINTS
# ============================================================================

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/api/docs" if settings.DEBUG else None,
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:socket_app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower(),
    )
