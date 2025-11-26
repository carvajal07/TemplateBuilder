"""
Assets API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from uuid import UUID
import aiofiles
import os
from pathlib import Path

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.config import settings
from app.models.asset import Asset, AssetType
from pydantic import BaseModel

router = APIRouter()


# ============================================================================
# SCHEMAS
# ============================================================================

class AssetResponse(BaseModel):
    id: UUID
    name: str
    type: AssetType
    url: str
    thumbnail_url: Optional[str]
    size: int
    mime_type: str
    metadata: dict
    tags: List[str]
    uploaded_by: UUID
    uploaded_at: str

    class Config:
        from_attributes = True


# ============================================================================
# ENDPOINTS
# ============================================================================

@router.post("/upload", response_model=AssetResponse, status_code=status.HTTP_201_CREATED)
async def upload_asset(
    file: UploadFile = File(...),
    asset_type: AssetType = Query(AssetType.IMAGE),
    tags: List[str] = Query([]),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Upload asset (image, font, icon)"""

    # Validate file type
    allowed_types = {
        AssetType.IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'],
        AssetType.FONT: ['font/ttf', 'font/otf', 'application/x-font-ttf'],
        AssetType.ICON: ['image/svg+xml', 'image/png'],
    }

    if file.content_type not in allowed_types.get(asset_type, []):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type for {asset_type}"
        )

    # Read file
    file_content = await file.read()
    file_size = len(file_content)

    # Check size limit
    max_size = settings.MAX_IMAGE_SIZE_MB * 1024 * 1024
    if file_size > max_size:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Max size: {settings.MAX_IMAGE_SIZE_MB}MB"
        )

    # Save file
    if settings.STORAGE_TYPE == 'local':
        # Save to local storage
        storage_path = Path(settings.LOCAL_STORAGE_PATH)
        storage_path.mkdir(parents=True, exist_ok=True)

        file_path = storage_path / f"{current_user['id']}_{file.filename}"

        async with aiofiles.open(file_path, 'wb') as f:
            await f.write(file_content)

        file_url = f"/storage/{file_path.name}"

    else:
        # TODO: Upload to S3/MinIO
        file_url = ""

    # Create asset record
    asset = Asset(
        name=file.filename,
        type=asset_type,
        url=file_url,
        size=file_size,
        mime_type=file.content_type,
        tags=tags,
        uploaded_by=current_user["id"],
    )

    db.add(asset)
    await db.commit()
    await db.refresh(asset)

    return asset


@router.get("/", response_model=List[AssetResponse])
async def list_assets(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    type: Optional[AssetType] = None,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List assets"""
    query = select(Asset).where(Asset.uploaded_by == current_user["id"])

    if type:
        query = query.where(Asset.type == type)

    query = query.offset(skip).limit(limit).order_by(Asset.uploaded_at.desc())

    result = await db.execute(query)
    assets = result.scalars().all()

    return assets


@router.get("/{asset_id}", response_model=AssetResponse)
async def get_asset(
    asset_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get asset by ID"""
    result = await db.execute(
        select(Asset).where(
            Asset.id == asset_id,
            Asset.uploaded_by == current_user["id"]
        )
    )
    asset = result.scalar_one_or_none()

    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    return asset


@router.delete("/{asset_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_asset(
    asset_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete asset"""
    result = await db.execute(
        select(Asset).where(
            Asset.id == asset_id,
            Asset.uploaded_by == current_user["id"]
        )
    )
    asset = result.scalar_one_or_none()

    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    # Delete file
    if settings.STORAGE_TYPE == 'local':
        file_path = Path(settings.LOCAL_STORAGE_PATH) / asset.url.split('/')[-1]
        if file_path.exists():
            file_path.unlink()

    # Delete record
    await db.delete(asset)
    await db.commit()

    return None
