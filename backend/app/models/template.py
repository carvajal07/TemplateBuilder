"""
Template model
"""

from sqlalchemy import Column, String, DateTime, Enum as SQLEnum, ForeignKey, Integer, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from app.core.database import Base


class TemplateType(str, enum.Enum):
    PDF = "pdf"
    EMAIL = "email"


class Template(Base):
    __tablename__ = "templates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    type = Column(SQLEnum(TemplateType), nullable=False)

    # JSON content with all elements
    content = Column(JSON, nullable=False, default=dict)

    # Metadata
    page_size = Column(JSON, nullable=True)
    variables = Column(JSON, nullable=True, default=list)
    styles = Column(JSON, nullable=True, default=list)
    metadata = Column(JSON, nullable=True, default=dict)

    # Tags for categorization
    tags = Column(JSON, nullable=True, default=list)

    # Owner
    owner_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)

    # Thumbnails
    thumbnail_url = Column(String(500), nullable=True)

    # Versioning
    version = Column(Integer, default=1, nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<Template {self.name} ({self.type})>"
