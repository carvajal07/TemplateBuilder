"""
Email Renderer - Render templates to HTML for email marketing
"""

from typing import Dict, Any, List, Optional
from jinja2 import Template
from premailer import transform
import logging

logger = logging.getLogger(__name__)


class EmailRenderer:
    """
    Renderer para generar HTML de emails desde plantillas
    """

    def __init__(self):
        self.variables_data = {}

    def render(self, template_data: Dict[str, Any], data: Dict[str, Any] = None) -> Dict[str, str]:
        """
        Render template to email HTML

        Args:
            template_data: Template structure from parser
            data: Variable data for placeholders

        Returns:
            Dict with 'html' and 'text' versions
        """
        self.variables_data = data or {}

        # Generate HTML structure
        html_body = self._generate_html_body(template_data)

        # Create full HTML email
        html = self._create_email_html(html_body, template_data)

        # Inline CSS for email compatibility
        html_with_inline_css = transform(html)

        # Apply email compatibility fixes
        compatible_html = self._apply_email_fixes(html_with_inline_css)

        # Generate plain text version
        plain_text = self._generate_plain_text(template_data)

        return {
            'html': compatible_html,
            'text': plain_text
        }

    def _create_email_html(self, body: str, template_data: Dict[str, Any]) -> str:
        """Create full HTML email structure"""
        template_html = f'''
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="x-apple-disable-message-reformatting">
    <title>{template_data.get('name', 'Email')}</title>
    <style type="text/css">
        /* Reset styles */
        body {{
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            -webkit-text-size-adjust: 100% !important;
            -ms-text-size-adjust: 100% !important;
            -webkit-font-smoothing: antialiased !important;
        }}

        img {{
            border: 0 !important;
            outline: none !important;
            text-decoration: none !important;
            -ms-interpolation-mode: bicubic !important;
            display: block !important;
        }}

        table {{
            border-collapse: collapse !important;
            mso-table-lspace: 0pt !important;
            mso-table-rspace: 0pt !important;
        }}

        td {{
            border-collapse: collapse !important;
        }}

        /* Email client fixes */
        .ReadMsgBody {{ width: 100%; background-color: #ffffff; }}
        .ExternalClass {{ width: 100%; background-color: #ffffff; }}
        .ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div {{ line-height: 100%; }}

        /* Responsive */
        @media only screen and (max-width: 600px) {{
            .wrapper {{ width: 100% !important; padding: 0 !important; }}
            .container {{ width: 100% !important; padding: 0 10px !important; }}
            .mobile-hide {{ display: none !important; }}
            .mobile-center {{ text-align: center !important; }}
        }}
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4;">
    <!-- Preview text -->
    <div style="display: none; max-height: 0px; overflow: hidden;">
        {template_data.get('preheader', '')}
    </div>

    <!-- Main wrapper -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f4f4;">
        <tr>
            <td align="center" style="padding: 20px 0;">
                <!-- Email container (max 600px) -->
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" class="wrapper" style="width: 600px; background-color: #ffffff;">
                    <tr>
                        <td>
                            {body}
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        '''

        return template_html

    def _generate_html_body(self, template_data: Dict[str, Any]) -> str:
        """Generate HTML body from template elements"""
        elements = template_data.get('elements', [])

        html_parts = []

        # Sort elements by position (top to bottom)
        sorted_elements = sorted(elements, key=lambda e: e.get('position', {}).get('y', 0))

        for element in sorted_elements:
            element_html = self._render_element(element)
            if element_html:
                html_parts.append(element_html)

        return '\n'.join(html_parts)

    def _render_element(self, element: Dict[str, Any]) -> str:
        """Render a single element to HTML"""
        element_type = element.get('type')

        if element_type == 'text':
            return self._render_text(element)
        elif element_type == 'image':
            return self._render_image(element)
        elif element_type == 'button':
            return self._render_button(element)
        elif element_type == 'container':
            return self._render_container(element)
        elif element_type == 'columns':
            return self._render_columns(element)
        elif element_type == 'hr':
            return self._render_hr(element)
        else:
            return ''

    def _render_text(self, element: Dict[str, Any]) -> str:
        """Render text element"""
        properties = element.get('properties', {})
        content = properties.get('content', '')

        # Replace variables
        content = self._replace_variables(content)

        # Get styles
        font_size = properties.get('fontSize', 16)
        color = properties.get('color', '#000000')
        text_align = properties.get('textAlign', 'left')
        font_family = properties.get('fontFamily', 'Arial, Helvetica, sans-serif')
        line_height = properties.get('lineHeight', 1.5)
        padding = properties.get('padding', {})

        padding_str = f"{padding.get('top', 10)}px {padding.get('right', 20)}px {padding.get('bottom', 10)}px {padding.get('left', 20)}px"

        return f'''
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
            <tr>
                <td style="padding: {padding_str}; font-family: {font_family}; font-size: {font_size}px; color: {color}; line-height: {line_height}; text-align: {text_align};">
                    {content}
                </td>
            </tr>
        </table>
        '''

    def _render_image(self, element: Dict[str, Any]) -> str:
        """Render image element"""
        properties = element.get('properties', {})
        src = properties.get('src', '')
        alt = properties.get('alt', '')
        width = properties.get('size', {}).get('width', 600)
        align = properties.get('textAlign', 'center')

        return f'''
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
            <tr>
                <td align="{align}" style="padding: 10px 20px;">
                    <img src="{src}" alt="{alt}" width="{width}" style="max-width: {width}px; width: 100%; height: auto; display: block;">
                </td>
            </tr>
        </table>
        '''

    def _render_button(self, element: Dict[str, Any]) -> str:
        """Render button element"""
        properties = element.get('properties', {})
        text = properties.get('text', 'Click here')
        href = properties.get('href', '#')
        bg_color = properties.get('backgroundColor', '#007bff')
        text_color = properties.get('textColor', '#ffffff')
        font_size = properties.get('fontSize', 16)
        padding = properties.get('padding', {})
        border_radius = properties.get('borderRadius', 4)

        button_padding = f"{padding.get('top', 12)}px {padding.get('right', 24)}px {padding.get('bottom', 12)}px {padding.get('left', 24)}px"

        return f'''
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
            <tr>
                <td align="center" style="padding: 20px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                            <td style="border-radius: {border_radius}px; background-color: {bg_color};">
                                <a href="{href}" target="_blank" style="display: inline-block; padding: {button_padding}; font-family: Arial, Helvetica, sans-serif; font-size: {font_size}px; color: {text_color}; text-decoration: none; border-radius: {border_radius}px;">
                                    {text}
                                </a>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
        '''

    def _render_container(self, element: Dict[str, Any]) -> str:
        """Render container element"""
        properties = element.get('properties', {})
        bg_color = properties.get('backgroundColor', 'transparent')
        padding = properties.get('padding', {})

        padding_str = f"{padding.get('top', 0)}px {padding.get('right', 0)}px {padding.get('bottom', 0)}px {padding.get('left', 0)}px"

        # Render children
        children_html = []
        for child_id in properties.get('children', []):
            # Find child element and render
            # (In a real implementation, you'd look up the child in the elements list)
            pass

        return f'''
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
            <tr>
                <td style="background-color: {bg_color}; padding: {padding_str};">
                    {''.join(children_html)}
                </td>
            </tr>
        </table>
        '''

    def _render_columns(self, element: Dict[str, Any]) -> str:
        """Render columns layout"""
        properties = element.get('properties', {})
        column_count = properties.get('columnCount', 2)
        gap = properties.get('gap', 10)

        # Calculate column width
        column_width = int((100 - (gap * (column_count - 1))) / column_count)

        # Create columns
        columns_html = []
        for i in range(column_count):
            columns_html.append(f'''
            <td width="{column_width}%" style="padding: 10px;">
                <!-- Column {i + 1} content -->
            </td>
            ''')

        return f'''
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
            <tr>
                {''.join(columns_html)}
            </tr>
        </table>
        '''

    def _render_hr(self, element: Dict[str, Any]) -> str:
        """Render horizontal rule"""
        properties = element.get('properties', {})
        color = properties.get('strokeColor', '#cccccc')
        height = properties.get('strokeWidth', 1)

        return f'''
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
            <tr>
                <td style="padding: 10px 20px;">
                    <div style="border-top: {height}px solid {color};"></div>
                </td>
            </tr>
        </table>
        '''

    def _replace_variables(self, text: str) -> str:
        """Replace variable placeholders in text"""
        # Replace {{variable}} patterns
        import re

        def replace_match(match):
            var_name = match.group(1)
            return str(self.variables_data.get(var_name, match.group(0)))

        return re.sub(r'\{\{([^}]+)\}\}', replace_match, text)

    def _apply_email_fixes(self, html: str) -> str:
        """Apply email client compatibility fixes"""
        # Add Outlook-specific fixes
        html = html.replace('<table', '<table border="0" cellpadding="0" cellspacing="0"')

        # Add mso conditionals for Outlook
        # (In a real implementation, add more comprehensive Outlook fixes)

        return html

    def _generate_plain_text(self, template_data: Dict[str, Any]) -> str:
        """Generate plain text version"""
        text_parts = []

        elements = template_data.get('elements', [])
        sorted_elements = sorted(elements, key=lambda e: e.get('position', {}).get('y', 0))

        for element in sorted_elements:
            element_type = element.get('type')
            properties = element.get('properties', {})

            if element_type == 'text':
                content = properties.get('content', '')
                content = self._replace_variables(content)
                text_parts.append(content)
            elif element_type == 'button':
                text = properties.get('text', '')
                href = properties.get('href', '')
                text_parts.append(f"{text}: {href}")
            elif element_type == 'hr':
                text_parts.append('-' * 50)

        return '\n\n'.join(text_parts)
