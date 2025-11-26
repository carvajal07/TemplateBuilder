"""
XML Generator - Generate XML from Python template structure
"""

from typing import Dict, Any, List
from lxml import etree
import logging

logger = logging.getLogger(__name__)


class XMLGenerator:
    """
    Generator para convertir estructura Python a XML de plantillas
    """

    def generate(self, template_data: Dict[str, Any]) -> str:
        """
        Generate XML from template structure

        Args:
            template_data: Template data dictionary

        Returns:
            XML string
        """
        # Create root element
        root = etree.Element("WorkFlow")

        # Create Layout
        layout_root = etree.SubElement(root, "Layout")
        layout_id = etree.SubElement(layout_root, "Id")
        layout_id.text = template_data.get('layout_id', 'Layout1')

        layout_name = etree.SubElement(layout_root, "Name")
        layout_name.text = template_data.get('layout_name', 'Template')

        layout = etree.SubElement(layout_root, "Layout")

        # Generate variables
        self._generate_variables(layout, template_data.get('variables', []))

        # Generate pages
        self._generate_pages(layout, template_data.get('pages', []))

        # Generate styles
        self._generate_styles(layout, template_data.get('styles', {}))

        # Pretty print XML
        xml_string = etree.tostring(
            root,
            pretty_print=True,
            xml_declaration=True,
            encoding='UTF-8'
        ).decode('utf-8')

        return xml_string

    def _generate_variables(self, parent: etree.Element, variables: List[Dict[str, Any]]):
        """Generate Variable elements"""
        for var in variables:
            var_elem = etree.SubElement(parent, "Variable")

            id_elem = etree.SubElement(var_elem, "Id")
            id_elem.text = str(var.get('id', ''))

            name_elem = etree.SubElement(var_elem, "Name")
            name_elem.text = var.get('name', '')

            parent_id = var.get('parent_id')
            if parent_id:
                parent_elem = etree.SubElement(var_elem, "ParentId")
                parent_elem.text = str(parent_id)

                index_elem = etree.SubElement(var_elem, "IndexInParent")
                index_elem.text = str(var.get('index', 0))

    def _generate_pages(self, parent: etree.Element, pages: List[Dict[str, Any]]):
        """Generate Page elements"""
        for page in pages:
            # Page declaration
            page_decl = etree.SubElement(parent, "Page")

            id_elem = etree.SubElement(page_decl, "Id")
            id_elem.text = str(page.get('id', ''))

            name_elem = etree.SubElement(page_decl, "Name")
            name_elem.text = page.get('name', 'Page')

            parent_id_elem = etree.SubElement(page_decl, "ParentId")
            parent_id_elem.text = "Def.Pages"

            index_elem = etree.SubElement(page_decl, "IndexInParent")
            index_elem.text = str(page.get('index', 0))

            # Page configuration
            page_config = etree.SubElement(parent, "Page")

            id_elem = etree.SubElement(page_config, "Id")
            id_elem.text = str(page.get('id', ''))

            cond_elem = etree.SubElement(page_config, "ConditionType")
            cond_elem.text = page.get('condition_type', 'Simple')

            width_elem = etree.SubElement(page_config, "Width")
            width_elem.text = str(page.get('width', 0.2159))

            height_elem = etree.SubElement(page_config, "Height")
            height_elem.text = str(page.get('height', 0.2794))

            next_page_elem = etree.SubElement(page_config, "NextPageId")
            next_page_elem.text = page.get('next_page_id', '')

            # Generate page elements
            for element in page.get('elements', []):
                self._generate_element(parent, element)

    def _generate_element(self, parent: etree.Element, element: Dict[str, Any]):
        """Generate element based on type"""
        element_type = element.get('type')

        if element_type == 'FlowArea':
            self._generate_flow_area(parent, element)
        elif element_type == 'ImageObject':
            self._generate_image_object(parent, element)
        elif element_type == 'PathObject':
            self._generate_path_object(parent, element)
        elif element_type == 'Barcode':
            self._generate_barcode(parent, element)
        elif element_type == 'Chart':
            self._generate_chart(parent, element)

    def _generate_flow_area(self, parent: etree.Element, element: Dict[str, Any]):
        """Generate FlowArea element"""
        # Declaration
        decl = etree.SubElement(parent, "FlowArea")

        id_elem = etree.SubElement(decl, "Id")
        id_elem.text = str(element.get('id', ''))

        name_elem = etree.SubElement(decl, "Name")
        name_elem.text = element.get('name', 'FlowArea')

        parent_id_elem = etree.SubElement(decl, "ParentId")
        parent_id_elem.text = str(element.get('parent_id', ''))

        index_elem = etree.SubElement(decl, "IndexInParent")
        index_elem.text = str(element.get('index', 0))

        # Configuration
        config = etree.SubElement(parent, "FlowArea")

        id_elem = etree.SubElement(config, "Id")
        id_elem.text = str(element.get('id', ''))

        pos = element.get('position', {})
        pos_elem = etree.SubElement(config, "Pos")
        pos_elem.set('X', str(pos.get('x', 0)))
        pos_elem.set('Y', str(pos.get('y', 0)))

        size = element.get('size', {})
        size_elem = etree.SubElement(config, "Size")
        size_elem.set('X', str(size.get('width', 0)))
        size_elem.set('Y', str(size.get('height', 0)))

        flow_id_elem = etree.SubElement(config, "FlowId")
        flow_id_elem.text = str(element.get('flow_id', ''))

        border_elem = etree.SubElement(config, "BorderStyleId")
        border_elem.text = element.get('border_style_id', '')

    def _generate_image_object(self, parent: etree.Element, element: Dict[str, Any]):
        """Generate ImageObject element"""
        # Declaration
        decl = etree.SubElement(parent, "ImageObject")

        id_elem = etree.SubElement(decl, "Id")
        id_elem.text = str(element.get('id', ''))

        name_elem = etree.SubElement(decl, "Name")
        name_elem.text = element.get('name', 'Image')

        parent_id_elem = etree.SubElement(decl, "ParentId")
        parent_id_elem.text = str(element.get('parent_id', ''))

        index_elem = etree.SubElement(decl, "IndexInParent")
        index_elem.text = str(element.get('index', 0))

        # Configuration
        config = etree.SubElement(parent, "ImageObject")

        id_elem = etree.SubElement(config, "Id")
        id_elem.text = str(element.get('id', ''))

        pos = element.get('position', {})
        pos_elem = etree.SubElement(config, "Pos")
        pos_elem.set('X', str(pos.get('x', 0)))
        pos_elem.set('Y', str(pos.get('y', 0)))

        size = element.get('size', {})
        size_elem = etree.SubElement(config, "Size")
        size_elem.set('X', str(size.get('width', 0)))
        size_elem.set('Y', str(size.get('height', 0)))

        image_id_elem = etree.SubElement(config, "ImageId")
        image_id_elem.text = str(element.get('image_id', ''))

    def _generate_path_object(self, parent: etree.Element, element: Dict[str, Any]):
        """Generate PathObject element"""
        # Similar to FlowArea and ImageObject
        pass

    def _generate_barcode(self, parent: etree.Element, element: Dict[str, Any]):
        """Generate Barcode element"""
        # Similar structure
        pass

    def _generate_chart(self, parent: etree.Element, element: Dict[str, Any]):
        """Generate Chart element"""
        # Similar structure
        pass

    def _generate_styles(self, parent: etree.Element, styles: Dict[str, Any]):
        """Generate style definitions"""
        # Generate fonts
        for font_id, font_data in styles.get('fonts', {}).items():
            font_elem = etree.SubElement(parent, "Font")

            id_elem = etree.SubElement(font_elem, "Id")
            id_elem.set('Name', font_id)
            id_elem.text = "Def.Font"

            name_elem = etree.SubElement(font_elem, "Name")
            name_elem.text = font_data.get('name', 'Arial')

            font_name_elem = etree.SubElement(font_elem, "FontName")
            font_name_elem.text = font_data.get('font_name', 'Arial')

        # Generate colors
        for color_id, color_data in styles.get('colors', {}).items():
            color_elem = etree.SubElement(parent, "Color")

            id_elem = etree.SubElement(color_elem, "Id")
            id_elem.set('Name', color_id)
            id_elem.text = "Def.Color"

            rgb_elem = etree.SubElement(color_elem, "RGB")
            rgb_elem.text = f"{color_data.get('r', 0)},{color_data.get('g', 0)},{color_data.get('b', 0)}"
