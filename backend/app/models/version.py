"""
Template Version model for version control
"""

from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, JSON, Text
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

from app.core.database import Base


class TemplateVersion(Base):
    __tablename__ = "template_versions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    template_id = Column(UUID(as_uuid=True), ForeignKey('templates.id', ondelete='CASCADE'), nullable=False)

    version = Column(Integer, nullable=False)
    content = Column(JSON, nullable=False)
    comment = Column(Text, nullable=True)

    # Who created this version
    created_by = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<TemplateVersion {self.template_id} v{self.version}>"
