"""
PDF Renderer - Render templates to PDF using ReportLab
"""

from typing import Dict, Any, List, Optional
from io import BytesIO
import logging

from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4, letter, legal
from reportlab.lib.units import mm, inch
from reportlab.lib.colors import Color, black, white
from reportlab.platypus import Paragraph, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT, TA_JUSTIFY
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from PIL import Image
import qrcode
import barcode
from barcode.writer import ImageWriter

from app.services.xml.xml_parser import XMLParser

logger = logging.getLogger(__name__)


class PDFRenderer:
    """
    Renderer para generar PDFs desde plantillas XML
    """

    def __init__(self):
        self.parser = XMLParser()
        self.canvas = None
        self.page_width = 0
        self.page_height = 0
        self.dpi = 300  # DPI for conversion
        self.variables_data = {}

    def render(self, xml_string: str, data: Dict[str, Any] = None, options: Dict[str, Any] = None) -> bytes:
        """
        Render XML template to PDF

        Args:
            xml_string: XML template string
            data: Variable data for placeholders
            options: Rendering options (dpi, page_size, etc.)

        Returns:
            PDF bytes
        """
        # Parse XML
        template = self.parser.parse(xml_string)

        # Store variable data
        self.variables_data = data or {}

        # Apply options
        options = options or {}
        self.dpi = options.get('dpi', 300)

        # Create PDF buffer
        buffer = BytesIO()

        # Get first page to determine size
        if not template.get('pages'):
            raise ValueError("No pages found in template")

        first_page = template['pages'][0]
        self.page_width = self._convert_units(first_page.get('width', 0.21590))  # Default A4 width
        self.page_height = self._convert_units(first_page.get('height', 0.27940))  # Default A4 height

        # Create canvas
        self.canvas = canvas.Canvas(buffer, pagesize=(self.page_width, self.page_height))

        # Store styles
        self.styles = template.get('styles', {})

        # Register fonts
        self._register_fonts(self.styles.get('fonts', {}))

        # Render each page
        for page in template['pages']:
            self._render_page(page)

        # Save PDF
        self.canvas.save()

        # Get PDF bytes
        pdf_bytes = buffer.getvalue()
        buffer.close()

        return pdf_bytes

    def _render_page(self, page: Dict[str, Any]):
        """Render a single page"""
        logger.info(f"Rendering page: {page.get('name')}")

        # Set page size if specified
        page_width = self._convert_units(page.get('width', self.page_width))
        page_height = self._convert_units(page.get('height', self.page_height))

        self.canvas.setPageSize((page_width, page_height))

        # Render all elements on the page
        elements = page.get('elements', [])

        # Sort by z-index if available
        elements.sort(key=lambda e: e.get('z_index', 0))

        for element in elements:
            try:
                self._render_element(element)
            except Exception as e:
                logger.error(f"Error rendering element {element.get('id')}: {e}")

        # Show page
        self.canvas.showPage()

    def _render_element(self, element: Dict[str, Any]):
        """Render a single element"""
        element_type = element.get('type')

        if element_type == 'FlowArea':
            self._render_flow_area(element)
        elif element_type == 'ImageObject':
            self._render_image(element)
        elif element_type == 'PathObject':
            self._render_path(element)
        elif element_type == 'Barcode':
            self._render_barcode(element)
        elif element_type == 'Chart':
            self._render_chart(element)
        else:
            logger.warning(f"Unknown element type: {element_type}")

    def _render_flow_area(self, element: Dict[str, Any]):
        """Render FlowArea (text content)"""
        pos = element.get('position', {})
        size = element.get('size', {})

        x = self._convert_units(pos.get('x', 0))
        y = self._convert_units(pos.get('y', 0))
        width = self._convert_units(size.get('width', 0))
        height = self._convert_units(size.get('height', 0))

        # Convert Y coordinate (PDF origin is bottom-left)
        y = self.page_height - y - height

        flow_content = element.get('flow_content', {})
        content = flow_content.get('content', [])

        # Render text content
        text_object = self.canvas.beginText(x, y + height)

        for paragraph in content:
            for text_run in paragraph.get('text_runs', []):
                if text_run.get('type') == 'text':
                    text = text_run.get('text', '')

                    # Apply text style
                    style_id = text_run.get('style_id', 'Def.TextStyle')
                    style = self.styles.get('text_styles', {}).get(style_id, {})

                    font_size = self._convert_units(style.get('font_size', 0.004)) * 72  # Convert to points

                    # Set font
                    font_id = style.get('font_id', 'Def.Font')
                    sub_font = style.get('sub_font', 'Regular')
                    font_name = self._get_font_name(font_id, sub_font)

                    text_object.setFont(font_name, font_size)

                    # Set color
                    fill_style_id = style.get('fill_style_id', 'Def.BlackFill')
                    color = self._get_color(fill_style_id)
                    text_object.setFillColor(color)

                    # Add text
                    text_object.textLine(text)

                elif text_run.get('type') == 'variable':
                    # Resolve variable
                    var_id = text_run.get('variable_id', '')
                    var_value = self._resolve_variable(var_id)

                    if var_value:
                        style_id = text_run.get('style_id', 'Def.TextStyle')
                        style = self.styles.get('text_styles', {}).get(style_id, {})
                        font_size = self._convert_units(style.get('font_size', 0.004)) * 72

                        font_id = style.get('font_id', 'Def.Font')
                        sub_font = style.get('sub_font', 'Regular')
                        font_name = self._get_font_name(font_id, sub_font)

                        text_object.setFont(font_name, font_size)
                        text_object.textLine(str(var_value))

        self.canvas.drawText(text_object)

    def _render_image(self, element: Dict[str, Any]):
        """Render ImageObject"""
        pos = element.get('position', {})
        size = element.get('size', {})

        x = self._convert_units(pos.get('x', 0))
        y = self._convert_units(pos.get('y', 0))
        width = self._convert_units(size.get('width', 0))
        height = self._convert_units(size.get('height', 0))

        # Convert Y coordinate
        y = self.page_height - y - height

        image_data = element.get('image', {})
        image_location = image_data.get('location', '')

        if not image_location:
            logger.warning(f"No image location for element {element.get('id')}")
            return

        # Handle different image sources
        if image_location.startswith('vcs://'):
            # VCS path - convert to file path
            image_path = image_location.replace('vcs://', './')
        else:
            image_path = image_location

        try:
            # Draw image
            self.canvas.drawImage(
                image_path,
                x, y,
                width=width,
                height=height,
                preserveAspectRatio=True,
                mask='auto'
            )
        except Exception as e:
            logger.error(f"Error drawing image {image_path}: {e}")
            # Draw placeholder rectangle
            self.canvas.setStrokeColorRGB(0.8, 0.8, 0.8)
            self.canvas.setFillColorRGB(0.95, 0.95, 0.95)
            self.canvas.rect(x, y, width, height, fill=1)

    def _render_path(self, element: Dict[str, Any]):
        """Render PathObject (vector shapes)"""
        pos = element.get('position', {})
        size = element.get('size', {})

        x = self._convert_units(pos.get('x', 0))
        y = self._convert_units(pos.get('y', 0))
        width = self._convert_units(size.get('width', 0))
        height = self._convert_units(size.get('height', 0))

        # Convert Y coordinate
        y = self.page_height - y - height

        path_commands = element.get('path', [])

        if not path_commands:
            return

        # Create path
        path = self.canvas.beginPath()

        for cmd in path_commands:
            cmd_type = cmd.get('type')

            if cmd_type == 'MoveTo':
                path.moveTo(
                    x + self._convert_units(cmd.get('x', 0)),
                    y + self._convert_units(cmd.get('y', 0))
                )
            elif cmd_type == 'LineTo':
                path.lineTo(
                    x + self._convert_units(cmd.get('x', 0)),
                    y + self._convert_units(cmd.get('y', 0))
                )
            elif cmd_type == 'ClosePath':
                path.close()

        # Apply fill style
        fill_style_id = element.get('fill_style_id')
        if fill_style_id:
            color = self._get_color(fill_style_id)
            self.canvas.setFillColor(color)

        # Draw path
        self.canvas.drawPath(path, fill=1, stroke=0)

    def _render_barcode(self, element: Dict[str, Any]):
        """Render Barcode/QR Code"""
        pos = element.get('position', {})
        size = element.get('size', {})

        x = self._convert_units(pos.get('x', 0))
        y = self._convert_units(pos.get('y', 0))
        width = self._convert_units(size.get('width', 0))
        height = self._convert_units(size.get('height', 0))

        # Convert Y coordinate
        y = self.page_height - y - height

        generator = element.get('generator', {})
        barcode_type = generator.get('type', 'QR')

        # Get barcode data
        variable_id = element.get('variable_id')
        data = self._resolve_variable(variable_id) if variable_id else 'DEFAULT'

        if not data:
            data = 'DEFAULT'

        try:
            if barcode_type == 'QR':
                # Generate QR code
                qr = qrcode.QRCode(
                    version=1,
                    error_correction=qrcode.constants.ERROR_CORRECT_M,
                    box_size=10,
                    border=4,
                )
                qr.add_data(str(data))
                qr.make(fit=True)

                img = qr.make_image(fill_color="black", back_color="white")

                # Save to buffer
                buffer = BytesIO()
                img.save(buffer, format='PNG')
                buffer.seek(0)

                # Draw QR code
                self.canvas.drawImage(
                    buffer,
                    x, y,
                    width=width,
                    height=height,
                    preserveAspectRatio=True
                )

            else:
                # Generate barcode
                barcode_class = barcode.get_barcode_class(barcode_type.lower())
                barcode_instance = barcode_class(str(data), writer=ImageWriter())

                buffer = BytesIO()
                barcode_instance.write(buffer)
                buffer.seek(0)

                # Draw barcode
                self.canvas.drawImage(
                    buffer,
                    x, y,
                    width=width,
                    height=height,
                    preserveAspectRatio=True
                )

        except Exception as e:
            logger.error(f"Error generating barcode: {e}")
            # Draw placeholder
            self.canvas.setStrokeColorRGB(0.5, 0.5, 0.5)
            self.canvas.rect(x, y, width, height)

    def _render_chart(self, element: Dict[str, Any]):
        """Render Chart"""
        # TODO: Implement chart rendering with matplotlib
        logger.info(f"Chart rendering not yet implemented for element {element.get('id')}")

    def _convert_units(self, value: float) -> float:
        """
        Convert units from normalized (0-1) to points
        Assumes template uses normalized units where 1.0 = page width/height
        """
        # The XML uses meters, so we convert to points (1 meter = 2834.645 points)
        return value * 2834.645

    def _get_font_name(self, font_id: str, sub_font: str) -> str:
        """Get font name from font ID"""
        fonts = self.styles.get('fonts', {})
        font = fonts.get(font_id, {})

        # For now, return standard fonts
        if sub_font == 'Bold':
            return 'Helvetica-Bold'
        elif sub_font == 'Italic':
            return 'Helvetica-Oblique'
        else:
            return 'Helvetica'

    def _get_color(self, color_id: str) -> Color:
        """Get color from color ID"""
        colors = self.styles.get('colors', {})
        color_data = colors.get(color_id, {'r': 0, 'g': 0, 'b': 0})

        return Color(
            color_data.get('r', 0) / 255.0,
            color_data.get('g', 0) / 255.0,
            color_data.get('b', 0) / 255.0
        )

    def _register_fonts(self, fonts: Dict[str, Any]):
        """Register custom fonts"""
        for font_id, font_data in fonts.items():
            try:
                # Register each sub-font
                for sub_name, sub_data in font_data.get('sub_fonts', {}).items():
                    location = sub_data.get('location', '')

                    if location.startswith('vcs://'):
                        location = location.replace('vcs://', './')

                    # Register font with ReportLab
                    font_name = f"{font_data.get('name', 'Custom')}_{sub_name}"
                    # pdfmetrics.registerFont(TTFont(font_name, location))
                    logger.info(f"Font {font_name} registered")

            except Exception as e:
                logger.error(f"Error registering font {font_id}: {e}")

    def _resolve_variable(self, variable_id: str) -> Optional[str]:
        """Resolve variable value from data"""
        if not variable_id:
            return None

        # Simple variable resolution
        # In a real implementation, this would handle nested variables
        return self.variables_data.get(variable_id, '')
