/**
 * Toolbar - Barra de herramientas superior con acciones
 */

import React from 'react';
import {
  AppBar,
  Toolbar as MuiToolbar,
  Typography,
  IconButton,
  Divider,
  ButtonGroup,
  Button,
  Tooltip,
  Box,
  Chip,
} from '@mui/material';
import {
  Undo,
  Redo,
  Save,
  FileDownload,
  FileUpload,
  Visibility,
  ContentCopy,
  Delete,
  Home,
  AlignHorizontalLeft,
  AlignHorizontalCenter,
  AlignHorizontalRight,
  AlignVerticalTop,
  AlignVerticalCenter,
  AlignVerticalBottom,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useEditorStore } from '../../store/editorStore';
import { toast } from 'react-toastify';

const Toolbar: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const {
    elements,
    selectedIds,
    templateName,
    history,
    undo,
    redo,
    duplicateElements,
    deleteElements,
    alignLeft,
    alignCenter,
    alignRight,
    alignTop,
    alignMiddle,
    alignBottom,
    addElement,
  } = useEditorStore();

  const hasSelection = selectedIds.length > 0;
  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  const handleSave = () => {
    toast.success('Plantilla guardada (demo)');
  };

  const handleExport = () => {
    // Convertir elementos a XML
    const xml = convertElementsToXML(elements);
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${templateName || 'template'}.xml`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Plantilla exportada exitosamente');
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xml')) {
      toast.error('Por favor selecciona un archivo XML');
      return;
    }

    try {
      const text = await file.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, 'text/xml');

      const parserError = xmlDoc.getElementsByTagName('parsererror');
      if (parserError.length > 0) {
        throw new Error('Error al parsear el XML');
      }

      const elementsFromXML = parseXMLToElements(xmlDoc);

      elementsFromXML.forEach((element) => {
        addElement(element);
      });

      toast.success(`${elementsFromXML.length} elemento(s) importado(s)`);
    } catch (error) {
      console.error('Error importing XML:', error);
      toast.error('Error al importar el archivo XML');
    }

    // Reset input
    if (event.target) {
      event.target.value = '';
    }
  };

  const convertElementsToXML = (elements: any[]): string => {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<template>\n';
    xml += '  <elements>\n';

    elements.forEach((element) => {
      xml += `    <element type="${element.type}" id="${element.id}">\n`;
      xml += `      <properties>\n`;

      Object.entries(element.properties).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          xml += `        <${key}>${JSON.stringify(value)}</${key}>\n`;
        } else {
          xml += `        <${key}>${value}</${key}>\n`;
        }
      });

      xml += `      </properties>\n`;
      xml += `    </element>\n`;
    });

    xml += '  </elements>\n';
    xml += '</template>';

    return xml;
  };

  const parseXMLToElements = (xmlDoc: Document): any[] => {
    const elements: any[] = [];
    const elementNodes = xmlDoc.getElementsByTagName('element');

    for (let i = 0; i < elementNodes.length; i++) {
      const elementNode = elementNodes[i];
      const type = elementNode.getAttribute('type');
      const id = elementNode.getAttribute('id') || `element-${Date.now()}-${i}`;

      const propertiesNode = elementNode.getElementsByTagName('properties')[0];
      const properties: any = {
        id,
        type,
        name: '',
        position: { x: 100, y: 100 },
        size: { width: 200, height: 100 },
        opacity: 1,
        visible: true,
        locked: false,
        zIndex: 1,
      };

      if (propertiesNode) {
        for (let j = 0; j < propertiesNode.children.length; j++) {
          const prop = propertiesNode.children[j];
          const key = prop.tagName;
          const value = prop.textContent;

          try {
            properties[key] = JSON.parse(value || '');
          } catch {
            properties[key] = value;
          }
        }
      }

      elements.push({
        id,
        type,
        properties,
      });
    }

    return elements;
  };

  const handlePreview = () => {
    toast.info('Vista previa (demo)');
  };

  const handleDuplicate = () => {
    if (hasSelection) {
      duplicateElements(selectedIds);
    }
  };

  const handleDelete = () => {
    if (hasSelection) {
      deleteElements(selectedIds);
    }
  };

  return (
    <AppBar position="static" color="default" elevation={1}>
      <MuiToolbar variant="dense" sx={{ gap: 1, px: 2 }}>
        {/* Logo / Home */}
        <Tooltip title="Volver a inicio">
          <IconButton onClick={() => navigate('/templates')} size="small">
            <Home />
          </IconButton>
        </Tooltip>

        <Typography variant="h6" sx={{ mr: 2 }}>
          {templateName || 'Nueva Plantilla'}
        </Typography>

        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

        {/* Undo/Redo */}
        <ButtonGroup size="small" variant="outlined">
          <Tooltip title="Deshacer (Ctrl+Z)">
            <span>
              <IconButton onClick={undo} disabled={!canUndo} size="small">
                <Undo fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Rehacer (Ctrl+Y)">
            <span>
              <IconButton onClick={redo} disabled={!canRedo} size="small">
                <Redo fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </ButtonGroup>

        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

        {/* Alineación */}
        <ButtonGroup size="small" variant="outlined" disabled={!hasSelection}>
          <Tooltip title="Alinear izquierda">
            <span>
              <IconButton
                onClick={() => alignLeft(selectedIds)}
                disabled={!hasSelection}
                size="small"
              >
                <AlignHorizontalLeft fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Alinear centro">
            <span>
              <IconButton
                onClick={() => alignCenter(selectedIds)}
                disabled={!hasSelection}
                size="small"
              >
                <AlignHorizontalCenter fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Alinear derecha">
            <span>
              <IconButton
                onClick={() => alignRight(selectedIds)}
                disabled={!hasSelection}
                size="small"
              >
                <AlignHorizontalRight fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </ButtonGroup>

        <ButtonGroup size="small" variant="outlined" disabled={!hasSelection}>
          <Tooltip title="Alinear arriba">
            <span>
              <IconButton
                onClick={() => alignTop(selectedIds)}
                disabled={!hasSelection}
                size="small"
              >
                <AlignVerticalTop fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Alinear centro vertical">
            <span>
              <IconButton
                onClick={() => alignMiddle(selectedIds)}
                disabled={!hasSelection}
                size="small"
              >
                <AlignVerticalCenter fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Alinear abajo">
            <span>
              <IconButton
                onClick={() => alignBottom(selectedIds)}
                disabled={!hasSelection}
                size="small"
              >
                <AlignVerticalBottom fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </ButtonGroup>

        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

        {/* Acciones de elementos */}
        <Tooltip title="Duplicar (Ctrl+D)">
          <span>
            <IconButton onClick={handleDuplicate} disabled={!hasSelection} size="small">
              <ContentCopy fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Eliminar (Del)">
          <span>
            <IconButton
              onClick={handleDelete}
              disabled={!hasSelection}
              size="small"
              color="error"
            >
              <Delete fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>

        <Box sx={{ flexGrow: 1 }} />

        {/* Selección actual */}
        {hasSelection && (
          <Chip
            label={`${selectedIds.length} seleccionado(s)`}
            size="small"
            color="primary"
            variant="outlined"
          />
        )}

        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

        {/* Acciones principales */}
        <Button
          startIcon={<Visibility />}
          onClick={handlePreview}
          size="small"
          variant="outlined"
        >
          Vista Previa
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".xml"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        <Button
          startIcon={<FileUpload />}
          onClick={handleImport}
          size="small"
          variant="outlined"
        >
          Importar
        </Button>

        <Button
          startIcon={<FileDownload />}
          onClick={handleExport}
          size="small"
          variant="outlined"
        >
          Exportar
        </Button>

        <Button
          startIcon={<Save />}
          onClick={handleSave}
          size="small"
          variant="contained"
        >
          Guardar
        </Button>
      </MuiToolbar>
    </AppBar>
  );
};

export default Toolbar;
