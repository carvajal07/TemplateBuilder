"""
XML Parser - Parse XML templates to Python objects
"""

from typing import Dict, Any, List, Optional
from lxml import etree
import logging

logger = logging.getLogger(__name__)


class XMLParser:
    """
    Parser para convertir XML de plantillas a estructura Python
    """

    def __init__(self):
        self.elements = {}
        self.variables = {}
        self.pages = {}
        self.flows = {}
        self.tables = {}
        self.images = {}
        self.fonts = {}
        self.colors = {}
        self.styles = {}

    def parse(self, xml_string: str) -> Dict[str, Any]:
        """
        Parse XML string to dictionary structure
        """
        try:
            root = etree.fromstring(xml_string.encode('utf-8'))
            return self._parse_workflow(root)
        except Exception as e:
            logger.error(f"Error parsing XML: {e}")
            raise ValueError(f"Invalid XML: {e}")

    def _parse_workflow(self, root: etree.Element) -> Dict[str, Any]:
        """Parse WorkFlow root element"""
        layout = root.find('.//Layout')
        if layout is None:
            raise ValueError("No Layout found in XML")

        result = {
            'layout_id': self._get_text(layout, 'Id'),
            'layout_name': self._get_text(layout, 'Name'),
            'variables': [],
            'pages': [],
            'elements': [],
            'styles': {},
        }

        # Parse all child elements
        layout_node = layout.find('Layout')
        if layout_node is not None:
            result['variables'] = self._parse_variables(layout_node)
            result['pages'] = self._parse_pages(layout_node)
            result['styles'] = self._parse_styles(layout_node)

        return result

    def _parse_variables(self, layout: etree.Element) -> List[Dict[str, Any]]:
        """Parse all Variable elements"""
        variables = []

        for var in layout.findall('.//Variable'):
            var_id = self._get_text(var, 'Id')

            # Check if this is a declaration or definition
            parent_id = self._get_text(var, 'ParentId')

            variable = {
                'id': var_id,
                'name': self._get_text(var, 'Name'),
                'parent_id': parent_id,
                'index': self._get_text(var, 'IndexInParent'),
            }

            variables.append(variable)
            self.variables[var_id] = variable

        return variables

    def _parse_pages(self, layout: etree.Element) -> List[Dict[str, Any]]:
        """Parse all Page elements"""
        pages = []
        page_configs = {}

        # First pass: collect page declarations
        for page in layout.findall('.//Page'):
            page_id = self._get_text(page, 'Id')
            parent_id = self._get_text(page, 'ParentId')

            # If has ParentId, it's a declaration
            if parent_id:
                page_data = {
                    'id': page_id,
                    'name': self._get_text(page, 'Name'),
                    'parent_id': parent_id,
                    'index': self._get_text(page, 'IndexInParent'),
                    'elements': []
                }
                pages.append(page_data)
                self.pages[page_id] = page_data
            else:
                # It's a configuration
                page_configs[page_id] = {
                    'id': page_id,
                    'width': float(self._get_text(page, 'Width', '0.21590')),
                    'height': float(self._get_text(page, 'Height', '0.27940')),
                    'condition_type': self._get_text(page, 'ConditionType', 'Simple'),
                    'next_page_id': self._get_text(page, 'NextPageId'),
                }

        # Second pass: merge configurations with declarations
        for page in pages:
            if page['id'] in page_configs:
                page.update(page_configs[page['id']])

            # Parse elements on this page
            page['elements'] = self._parse_page_elements(layout, page['id'])

        return pages

    def _parse_page_elements(self, layout: etree.Element, page_id: str) -> List[Dict[str, Any]]:
        """Parse all elements belonging to a page"""
        elements = []

        # Parse FlowAreas
        for elem in layout.findall('.//FlowArea'):
            if self._get_text(elem, 'ParentId') == page_id:
                elements.append(self._parse_flow_area(elem, layout))

        # Parse ImageObjects
        for elem in layout.findall('.//ImageObject'):
            if self._get_text(elem, 'ParentId') == page_id:
                elements.append(self._parse_image_object(elem, layout))

        # Parse PathObjects
        for elem in layout.findall('.//PathObject'):
            if self._get_text(elem, 'ParentId') == page_id:
                elements.append(self._parse_path_object(elem, layout))

        # Parse Barcodes
        for elem in layout.findall('.//Barcode'):
            if self._get_text(elem, 'ParentId') == page_id:
                elements.append(self._parse_barcode(elem, layout))

        # Parse Charts
        for elem in layout.findall('.//Chart'):
            if self._get_text(elem, 'ParentId') == page_id:
                elements.append(self._parse_chart(elem, layout))

        return elements

    def _parse_flow_area(self, elem: etree.Element, layout: etree.Element) -> Dict[str, Any]:
        """Parse FlowArea element"""
        elem_id = self._get_text(elem, 'Id')

        # Get configuration
        config = layout.find(f'.//FlowArea[Id="{elem_id}"][Pos]')

        pos = self._parse_position(config.find('Pos') if config is not None else None)
        size = self._parse_size(config.find('Size') if config is not None else None)

        flow_id = self._get_text(config, 'FlowId') if config is not None else None
        flow_content = self._parse_flow(layout, flow_id) if flow_id else {}

        return {
            'type': 'FlowArea',
            'id': elem_id,
            'name': self._get_text(elem, 'Name'),
            'position': pos,
            'size': size,
            'flow_id': flow_id,
            'flow_content': flow_content,
            'border_style_id': self._get_text(config, 'BorderStyleId') if config is not None else None,
        }

    def _parse_flow(self, layout: etree.Element, flow_id: str) -> Dict[str, Any]:
        """Parse Flow element"""
        if not flow_id:
            return {}

        config = layout.find(f'.//Flow[Id="{flow_id}"][Type]')
        if config is None:
            return {}

        flow_type = self._get_text(config, 'Type', 'Simple')

        flow = {
            'id': flow_id,
            'type': flow_type,
            'content': []
        }

        # Parse FlowContent
        flow_content = config.find('FlowContent')
        if flow_content is not None:
            flow['content'] = self._parse_flow_content(flow_content)

        # Parse conditions for InlCond type
        if flow_type == 'InlCond':
            conditions = []
            for cond in config.findall('Condition'):
                cond_data = {
                    'value': cond.get('Value', ''),
                    'content': []
                }
                cond_flow = cond.find('FlowContent')
                if cond_flow is not None:
                    cond_data['content'] = self._parse_flow_content(cond_flow)
                conditions.append(cond_data)

            flow['conditions'] = conditions

            # Default content
            default = config.find('Default/FlowContent')
            if default is not None:
                flow['default'] = self._parse_flow_content(default)

        return flow

    def _parse_flow_content(self, flow_content: etree.Element) -> List[Dict[str, Any]]:
        """Parse FlowContent paragraphs and text"""
        content = []

        for paragraph in flow_content.findall('P'):
            para_style_id = paragraph.get('Id', '')

            para = {
                'type': 'paragraph',
                'style_id': para_style_id,
                'text_runs': []
            }

            for text_elem in paragraph.findall('T'):
                text_style_id = text_elem.get('Id', '')

                # Check for object reference
                obj_ref = text_elem.find('O')
                if obj_ref is not None:
                    para['text_runs'].append({
                        'type': 'variable',
                        'variable_id': obj_ref.get('Id', ''),
                        'style_id': text_style_id,
                    })
                else:
                    # Regular text
                    text = text_elem.text or ''
                    para['text_runs'].append({
                        'type': 'text',
                        'text': text,
                        'style_id': text_style_id,
                    })

            content.append(para)

        return content

    def _parse_image_object(self, elem: etree.Element, layout: etree.Element) -> Dict[str, Any]:
        """Parse ImageObject element"""
        elem_id = self._get_text(elem, 'Id')
        config = layout.find(f'.//ImageObject[Id="{elem_id}"][Pos]')

        pos = self._parse_position(config.find('Pos') if config is not None else None)
        size = self._parse_size(config.find('Size') if config is not None else None)

        image_id = self._get_text(config, 'ImageId') if config is not None else None
        image = self._parse_image(layout, image_id) if image_id else {}

        return {
            'type': 'ImageObject',
            'id': elem_id,
            'name': self._get_text(elem, 'Name'),
            'position': pos,
            'size': size,
            'image_id': image_id,
            'image': image,
            'transformation': self._parse_transformation(config) if config is not None else None,
        }

    def _parse_image(self, layout: etree.Element, image_id: str) -> Dict[str, Any]:
        """Parse Image element"""
        if not image_id:
            return {}

        config = layout.find(f'.//Image[Id="{image_id}"][ImageType]')
        if config is None:
            return {}

        return {
            'id': image_id,
            'type': self._get_text(config, 'ImageType', 'Simple'),
            'location': self._get_text(config, 'ImageLocation', ''),
            'variable_id': self._get_text(config, 'VariableId'),
        }

    def _parse_path_object(self, elem: etree.Element, layout: etree.Element) -> Dict[str, Any]:
        """Parse PathObject element"""
        elem_id = self._get_text(elem, 'Id')
        config = layout.find(f'.//PathObject[Id="{elem_id}"][Pos]')

        pos = self._parse_position(config.find('Pos') if config is not None else None)
        size = self._parse_size(config.find('Size') if config is not None else None)

        path_data = []
        if config is not None:
            path_elem = config.find('Path')
            if path_elem is not None:
                path_data = self._parse_path(path_elem)

        return {
            'type': 'PathObject',
            'id': elem_id,
            'name': self._get_text(elem, 'Name'),
            'position': pos,
            'size': size,
            'path': path_data,
            'fill_style_id': self._get_text(config, 'FillStyleId') if config is not None else None,
        }

    def _parse_path(self, path_elem: etree.Element) -> List[Dict[str, Any]]:
        """Parse Path commands"""
        commands = []

        for child in path_elem:
            tag = child.tag

            if tag == 'MoveTo':
                commands.append({
                    'type': 'MoveTo',
                    'x': float(child.get('X', 0)),
                    'y': float(child.get('Y', 0)),
                })
            elif tag == 'LineTo':
                commands.append({
                    'type': 'LineTo',
                    'x': float(child.get('X', 0)),
                    'y': float(child.get('Y', 0)),
                })
            elif tag == 'ClosePath':
                commands.append({'type': 'ClosePath'})

        return commands

    def _parse_barcode(self, elem: etree.Element, layout: etree.Element) -> Dict[str, Any]:
        """Parse Barcode element"""
        elem_id = self._get_text(elem, 'Id')
        config = layout.find(f'.//Barcode[Id="{elem_id}"][Pos]')

        pos = self._parse_position(config.find('Pos') if config is not None else None)
        size = self._parse_size(config.find('Size') if config is not None else None)

        barcode_gen = {}
        if config is not None:
            gen_elem = config.find('BarcodeGenerator')
            if gen_elem is not None:
                barcode_gen = {
                    'type': self._get_text(gen_elem, 'Type', 'QR'),
                    'error_level': self._get_text(gen_elem, 'ErrorLevel', 'M'),
                    'module_width': float(self._get_text(gen_elem, 'ModuleWidth', '0.001')),
                    'module_size': float(self._get_text(gen_elem, 'ModuleSize', '0.001')),
                    'height': float(self._get_text(gen_elem, 'Height', '0.03')),
                }

        return {
            'type': 'Barcode',
            'id': elem_id,
            'name': self._get_text(elem, 'Name'),
            'position': pos,
            'size': size,
            'variable_id': self._get_text(config, 'VariableId') if config is not None else None,
            'fill_style_id': self._get_text(config, 'FillStyleId') if config is not None else None,
            'generator': barcode_gen,
        }

    def _parse_chart(self, elem: etree.Element, layout: etree.Element) -> Dict[str, Any]:
        """Parse Chart element"""
        elem_id = self._get_text(elem, 'Id')
        config = layout.find(f'.//Chart[Id="{elem_id}"][Pos]')

        pos = self._parse_position(config.find('Pos') if config is not None else None)
        size = self._parse_size(config.find('Size') if config is not None else None)

        series = []
        if config is not None:
            serie_elem = config.find('Serie')
            if serie_elem is not None:
                for item in serie_elem.findall('SerieItem'):
                    series.append({
                        'value': float(self._get_text(item, 'Value', '0')),
                        'label': self._get_text(item, 'Label', ''),
                    })

        return {
            'type': 'Chart',
            'id': elem_id,
            'name': self._get_text(elem, 'Name'),
            'position': pos,
            'size': size,
            'chart_type': self._get_text(config, 'Chart_Type', 'Bar') if config is not None else 'Bar',
            'title': self._get_text(config, 'Chart_Title', '') if config is not None else '',
            'series': series,
        }

    def _parse_styles(self, layout: etree.Element) -> Dict[str, Any]:
        """Parse all style definitions"""
        styles = {
            'fonts': {},
            'colors': {},
            'text_styles': {},
            'para_styles': {},
            'border_styles': {},
        }

        # Parse Fonts
        for font in layout.findall('.//Font'):
            font_id = font.find('Id').get('Name')
            styles['fonts'][font_id] = {
                'id': font_id,
                'name': self._get_text(font, 'Name'),
                'font_name': self._get_text(font, 'FontName'),
                'sub_fonts': {}
            }

            for sub in font.findall('SubFont'):
                sub_name = sub.get('Name')
                styles['fonts'][font_id]['sub_fonts'][sub_name] = {
                    'location': self._get_text(sub, 'FontLocation')
                }

        # Parse Colors
        for color in layout.findall('.//Color'):
            color_id_elem = color.find('Id')
            if color_id_elem is not None and color_id_elem.get('Name'):
                color_id = color_id_elem.get('Name')
                rgb = self._get_text(color, 'RGB', '0,0,0')
                r, g, b = map(int, rgb.split(','))
                styles['colors'][color_id] = {'r': r, 'g': g, 'b': b}

        # Parse TextStyles
        for style in layout.findall('.//TextStyle'):
            style_id_elem = style.find('Id')
            if style_id_elem is not None and style_id_elem.get('Name'):
                style_id = style_id_elem.get('Name')
                styles['text_styles'][style_id] = {
                    'id': style_id,
                    'font_size': float(self._get_text(style, 'FontSize', '0.004')),
                    'fill_style_id': self._get_text(style, 'FillStyleId'),
                    'font_id': self._get_text(style, 'FontId'),
                    'sub_font': self._get_text(style, 'SubFont', 'Regular'),
                }

        # Parse ParaStyles
        for style in layout.findall('.//ParaStyle'):
            style_id_elem = style.find('Id')
            if style_id_elem is not None and style_id_elem.get('Name'):
                style_id = style_id_elem.get('Name')
                styles['para_styles'][style_id] = {
                    'id': style_id,
                    'left_indent': float(self._get_text(style, 'LeftIndent', '0')),
                    'right_indent': float(self._get_text(style, 'RightIndent', '0')),
                    'space_before': float(self._get_text(style, 'SpaceBefore', '0')),
                    'space_after': float(self._get_text(style, 'SpaceAfter', '0')),
                    'line_spacing': float(self._get_text(style, 'LineSpacing', '0')),
                    'h_align': self._get_text(style, 'HAlign', 'Left'),
                }

        return styles

    def _parse_position(self, pos_elem: Optional[etree.Element]) -> Dict[str, float]:
        """Parse Position element"""
        if pos_elem is None:
            return {'x': 0, 'y': 0}

        return {
            'x': float(pos_elem.get('X', 0)),
            'y': float(pos_elem.get('Y', 0)),
        }

    def _parse_size(self, size_elem: Optional[etree.Element]) -> Dict[str, float]:
        """Parse Size element"""
        if size_elem is None:
            return {'width': 0, 'height': 0}

        return {
            'width': float(size_elem.get('X', 0)),
            'height': float(size_elem.get('Y', 0)),
        }

    def _parse_transformation(self, config: etree.Element) -> Optional[Dict[str, float]]:
        """Parse transformation matrix"""
        m0 = self._get_text(config, 'Transformation_M0')
        if not m0:
            return None

        return {
            'm0': float(m0),
            'm1': float(self._get_text(config, 'Transformation_M1', '0')),
            'm2': float(self._get_text(config, 'Transformation_M2', '0')),
            'm3': float(self._get_text(config, 'Transformation_M3', '1')),
            'm4': float(self._get_text(config, 'Transformation_M4', '0')),
            'm5': float(self._get_text(config, 'Transformation_M5', '0')),
        }

    def _get_text(self, elem: etree.Element, tag: str, default: str = '') -> str:
        """Get text content of a child element"""
        if elem is None:
            return default

        child = elem.find(tag)
        if child is None:
            return default

        return child.text or default
