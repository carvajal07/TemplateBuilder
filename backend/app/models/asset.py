"""
Asset model for storing images, fonts, etc.
"""

from sqlalchemy import Column, String, DateTime, Enum as SQLEnum, ForeignKey, Integer, JSON
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
import enum

from app.core.database import Base


class AssetType(str, enum.Enum):
    IMAGE = "image"
    FONT = "font"
    ICON = "icon"
    TEMPLATE = "template"


class Asset(Base):
    __tablename__ = "assets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    type = Column(SQLEnum(AssetType), nullable=False)

    # Storage URLs
    url = Column(String(1000), nullable=False)
    thumbnail_url = Column(String(1000), nullable=True)

    # File info
    size = Column(Integer, nullable=False)  # bytes
    mime_type = Column(String(100), nullable=False)

    # Metadata
    metadata = Column(JSON, nullable=True, default=dict)
    tags = Column(JSON, nullable=True, default=list)

    # Owner
    uploaded_by = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)

    # Timestamps
    uploaded_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<Asset {self.name} ({self.type})>"
