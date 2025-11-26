"""
Templates API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
from uuid import UUID

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.template import Template, TemplateType
from pydantic import BaseModel

router = APIRouter()


# ============================================================================
# SCHEMAS
# ============================================================================

class TemplateCreate(BaseModel):
    name: str
    description: Optional[str] = None
    type: TemplateType
    content: dict = {}
    page_size: Optional[dict] = None
    variables: List[dict] = []
    styles: List[dict] = []
    metadata: dict = {}
    tags: List[str] = []


class TemplateUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    content: Optional[dict] = None
    page_size: Optional[dict] = None
    variables: Optional[List[dict]] = None
    styles: Optional[List[dict]] = None
    metadata: Optional[dict] = None
    tags: Optional[List[str]] = None


class TemplateResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    type: TemplateType
    content: dict
    page_size: Optional[dict]
    variables: List[dict]
    styles: List[dict]
    metadata: dict
    tags: List[str]
    owner_id: UUID
    thumbnail_url: Optional[str]
    version: int
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True


# ============================================================================
# ENDPOINTS
# ============================================================================

@router.post("/", response_model=TemplateResponse, status_code=status.HTTP_201_CREATED)
async def create_template(
    template_data: TemplateCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new template"""
    template = Template(
        name=template_data.name,
        description=template_data.description,
        type=template_data.type,
        content=template_data.content,
        page_size=template_data.page_size,
        variables=template_data.variables,
        styles=template_data.styles,
        metadata=template_data.metadata,
        tags=template_data.tags,
        owner_id=current_user["id"],
    )

    db.add(template)
    await db.commit()
    await db.refresh(template)

    return template


@router.get("/", response_model=List[TemplateResponse])
async def list_templates(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    type: Optional[TemplateType] = None,
    search: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List templates"""
    query = select(Template).where(Template.owner_id == current_user["id"])

    if type:
        query = query.where(Template.type == type)

    if search:
        query = query.where(Template.name.ilike(f"%{search}%"))

    query = query.offset(skip).limit(limit).order_by(Template.updated_at.desc())

    result = await db.execute(query)
    templates = result.scalars().all()

    return templates


@router.get("/{template_id}", response_model=TemplateResponse)
async def get_template(
    template_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get template by ID"""
    result = await db.execute(
        select(Template).where(
            Template.id == template_id,
            Template.owner_id == current_user["id"]
        )
    )
    template = result.scalar_one_or_none()

    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    return template


@router.put("/{template_id}", response_model=TemplateResponse)
async def update_template(
    template_id: UUID,
    template_data: TemplateUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update template"""
    result = await db.execute(
        select(Template).where(
            Template.id == template_id,
            Template.owner_id == current_user["id"]
        )
    )
    template = result.scalar_one_or_none()

    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    # Update fields
    update_data = template_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(template, field, value)

    # Increment version
    template.version += 1

    await db.commit()
    await db.refresh(template)

    return template


@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_template(
    template_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete template"""
    result = await db.execute(
        select(Template).where(
            Template.id == template_id,
            Template.owner_id == current_user["id"]
        )
    )
    template = result.scalar_one_or_none()

    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    await db.delete(template)
    await db.commit()

    return None


@router.post("/{template_id}/duplicate", response_model=TemplateResponse)
async def duplicate_template(
    template_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Duplicate template"""
    result = await db.execute(
        select(Template).where(
            Template.id == template_id,
            Template.owner_id == current_user["id"]
        )
    )
    template = result.scalar_one_or_none()

    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    # Create duplicate
    new_template = Template(
        name=f"{template.name} (Copy)",
        description=template.description,
        type=template.type,
        content=template.content,
        page_size=template.page_size,
        variables=template.variables,
        styles=template.styles,
        metadata=template.metadata,
        tags=template.tags,
        owner_id=current_user["id"],
    )

    db.add(new_template)
    await db.commit()
    await db.refresh(new_template)

    return new_template


@router.get("/{template_id}/export")
async def export_template(
    template_id: UUID,
    format: str = Query("xml", regex="^(xml|json)$"),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Export template as XML or JSON"""
    result = await db.execute(
        select(Template).where(
            Template.id == template_id,
            Template.owner_id == current_user["id"]
        )
    )
    template = result.scalar_one_or_none()

    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    if format == "xml":
        # TODO: Convert to XML
        from app.services.xml.xml_generator import XMLGenerator
        generator = XMLGenerator()
        xml_string = generator.generate(template.content)
        return {"format": "xml", "data": xml_string}
    else:
        return {"format": "json", "data": template.content}


@router.post("/import")
async def import_template(
    xml_data: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Import template from XML"""
    from app.services.xml.xml_parser import XMLParser

    parser = XMLParser()
    try:
        parsed = parser.parse(xml_data)

        # Create template
        template = Template(
            name=parsed.get('layout_name', 'Imported Template'),
            type=TemplateType.PDF,  # Default to PDF
            content=parsed,
            owner_id=current_user["id"],
        )

        db.add(template)
        await db.commit()
        await db.refresh(template)

        return template

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid XML: {str(e)}")
