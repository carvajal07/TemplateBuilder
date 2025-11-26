/**
 * Toolbox - Barra lateral con elementos arrastrables
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Grid,
  Paper,
  Tooltip,
} from '@mui/material';
import {
  ExpandMore,
  TextFields,
  Title,
  Image as ImageIcon,
  Crop169,
  RadioButtonUnchecked,
  Remove,
  TableChart,
  ViewColumn,
  Add,
} from '@mui/icons-material';
import { useEditorStore } from '../../store/editorStore';
import { ElementType } from '../../types';

interface ToolboxItemData {
  type: ElementType;
  icon: React.ReactNode;
  label: string;
  defaultProps: any;
}

const TOOLBOX_CATEGORIES = {
  text: {
    title: 'Texto',
    items: [
      {
        type: 'title' as ElementType,
        icon: <Title />,
        label: 'Título',
        defaultProps: {
          content: 'Título',
          fontSize: 32,
          fontWeight: 'bold',
          color: '#1976d2',
        },
      },
      {
        type: 'subtitle' as ElementType,
        icon: <TextFields />,
        label: 'Subtítulo',
        defaultProps: {
          content: 'Subtítulo',
          fontSize: 24,
          fontWeight: '600',
          color: '#424242',
        },
      },
      {
        type: 'text' as ElementType,
        icon: <TextFields />,
        label: 'Texto',
        defaultProps: {
          content: 'Texto normal',
          fontSize: 16,
          fontWeight: 'normal',
          color: '#000000',
        },
      },
      {
        type: 'paragraph' as ElementType,
        icon: <TextFields />,
        label: 'Párrafo',
        defaultProps: {
          content: 'Lorem ipsum dolor sit amet...',
          fontSize: 14,
          fontWeight: 'normal',
          color: '#000000',
          lineHeight: 1.6,
        },
      },
    ],
  },
  shapes: {
    title: 'Formas',
    items: [
      {
        type: 'rectangle' as ElementType,
        icon: <Crop169 />,
        label: 'Rectángulo',
        defaultProps: {
          fillColor: '#1976d2',
          strokeColor: '#0d47a1',
          strokeWidth: 0,
        },
      },
      {
        type: 'circle' as ElementType,
        icon: <RadioButtonUnchecked />,
        label: 'Círculo',
        defaultProps: {
          fillColor: '#dc004e',
          strokeColor: '#9a0036',
          strokeWidth: 0,
        },
      },
      {
        type: 'line' as ElementType,
        icon: <Remove />,
        label: 'Línea',
        defaultProps: {
          strokeColor: '#000000',
          strokeWidth: 2,
        },
      },
    ],
  },
  layout: {
    title: 'Layout',
    items: [
      {
        type: 'container' as ElementType,
        icon: <Crop169 />,
        label: 'Contenedor',
        defaultProps: {
          backgroundColor: '#f5f5f5',
          padding: { top: 20, right: 20, bottom: 20, left: 20 },
        },
      },
      {
        type: 'columns' as ElementType,
        icon: <ViewColumn />,
        label: 'Columnas',
        defaultProps: {
          columnCount: 2,
          gap: 16,
        },
      },
      {
        type: 'table' as ElementType,
        icon: <TableChart />,
        label: 'Tabla',
        defaultProps: {
          rows: 3,
          columns: 3,
        },
      },
    ],
  },
  images: {
    title: 'Imágenes',
    items: [
      {
        type: 'image' as ElementType,
        icon: <ImageIcon />,
        label: 'Imagen',
        defaultProps: {
          src: 'https://via.placeholder.com/300x200',
          fit: 'contain',
        },
      },
    ],
  },
};

const Toolbox: React.FC = () => {
  const { addElement } = useEditorStore();
  const [expanded, setExpanded] = useState<string>('text');
  const [draggedItem, setDraggedItem] = useState<ToolboxItemData | null>(null);

  const handleAddElement = (item: ToolboxItemData, position?: { x: number; y: number }) => {
    const newElement = {
      id: `element-${Date.now()}`,
      type: item.type,
      properties: {
        id: `element-${Date.now()}`,
        type: item.type,
        name: item.label,
        position: position || { x: 100, y: 100 },
        size: { width: 200, height: 100 },
        opacity: 1,
        visible: true,
        locked: false,
        zIndex: 1,
        ...item.defaultProps,
      },
    };

    addElement(newElement);
  };

  const handleDragStart = (e: React.DragEvent, item: ToolboxItemData) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('application/json', JSON.stringify(item));
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  return (
    <Box
      sx={{
        height: '100%',
        overflow: 'auto',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ px: 1 }}>
        📦 Elementos
      </Typography>

      {Object.entries(TOOLBOX_CATEGORIES).map(([key, category]) => (
        <Accordion
          key={key}
          expanded={expanded === key}
          onChange={() => setExpanded(expanded === key ? '' : key)}
          sx={{ mb: 1 }}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle2" fontWeight="bold">
              {category.title}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={1}>
              {category.items.map((item) => (
                <Grid item xs={6} key={item.type}>
                  <Tooltip title={`Arrastra al canvas o haz click para agregar ${item.label}`} arrow>
                    <Paper
                      elevation={0}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item)}
                      onDragEnd={handleDragEnd}
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        cursor: draggedItem?.type === item.type ? 'grabbing' : 'grab',
                        border: '1px solid',
                        borderColor: 'divider',
                        transition: 'all 0.2s',
                        opacity: draggedItem?.type === item.type ? 0.5 : 1,
                        '&:hover': {
                          borderColor: 'primary.main',
                          bgcolor: 'action.hover',
                          transform: 'translateY(-2px)',
                          boxShadow: 2,
                        },
                      }}
                      onClick={() => handleAddElement(item)}
                    >
                      <Box sx={{ fontSize: 32, color: 'primary.main', mb: 0.5 }}>
                        {item.icon}
                      </Box>
                      <Typography variant="caption" display="block">
                        {item.label}
                      </Typography>
                    </Paper>
                  </Tooltip>
                </Grid>
              ))}
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}

      <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
        <Typography variant="caption" display="block">
          💡 <strong>Tip:</strong> Arrastra cualquier elemento al canvas o haz click para agregarlo en el centro.
        </Typography>
      </Box>
    </Box>
  );
};

export default Toolbox;
