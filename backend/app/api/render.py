"""
Render API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response
from pydantic import BaseModel
from typing import Dict, Any, Optional
from uuid import UUID

from app.core.security import get_current_user
from app.services.rendering.pdf_renderer import PDFRenderer
from app.services.rendering.email_renderer import EmailRenderer

router = APIRouter()


# ============================================================================
# SCHEMAS
# ============================================================================

class RenderPDFRequest(BaseModel):
    template_xml: str
    data: Dict[str, Any] = {}
    options: Dict[str, Any] = {}


class RenderEmailRequest(BaseModel):
    template_data: Dict[str, Any]
    data: Dict[str, Any] = {}


# ============================================================================
# ENDPOINTS
# ============================================================================

@router.post("/pdf")
async def render_pdf(
    request: RenderPDFRequest,
    current_user: dict = Depends(get_current_user)
):
    """Render template to PDF"""
    try:
        renderer = PDFRenderer()
        pdf_bytes = renderer.render(
            request.template_xml,
            request.data,
            request.options
        )

        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": "attachment; filename=template.pdf"
            }
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error rendering PDF: {str(e)}"
        )


@router.post("/email")
async def render_email(
    request: RenderEmailRequest,
    current_user: dict = Depends(get_current_user)
):
    """Render template to Email HTML"""
    try:
        renderer = EmailRenderer()
        result = renderer.render(
            request.template_data,
            request.data
        )

        return {
            "success": True,
            "html": result['html'],
            "text": result['text']
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error rendering email: {str(e)}"
        )


@router.post("/preview")
async def generate_preview(
    request: RenderPDFRequest,
    current_user: dict = Depends(get_current_user)
):
    """Generate preview image of template"""
    try:
        # Use PDF renderer with lower DPI for preview
        options = request.options.copy()
        options['dpi'] = 150  # Lower DPI for faster preview

        renderer = PDFRenderer()
        pdf_bytes = renderer.render(
            request.template_xml,
            request.data,
            options
        )

        # TODO: Convert PDF to PNG for preview
        # For now, return PDF

        return Response(
            content=pdf_bytes,
            media_type="application/pdf"
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating preview: {str(e)}"
        )
