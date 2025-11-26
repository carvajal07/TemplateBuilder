/**
 * PropertiesPanel - Panel de propiedades dinámico según el elemento seleccionado
 */

import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Paper,
  InputAdornment,
  Grid,
} from '@mui/material';
import { useEditorStore } from '../../store/editorStore';

const PropertiesPanel: React.FC = () => {
  const { getSelectedElements, updateElement } = useEditorStore();
  const selectedElements = getSelectedElements();
  const selectedElement = selectedElements[0];

  if (!selectedElement) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Selecciona un elemento para ver sus propiedades
        </Typography>
      </Box>
    );
  }

  const props = selectedElement.properties;

  const handleChange = (field: string, value: any) => {
    updateElement(selectedElement.id, { [field]: value });
  };

  const handleNestedChange = (parent: string, field: string, value: any) => {
    updateElement(selectedElement.id, {
      [parent]: {
        ...props[parent as keyof typeof props],
        [field]: value,
      },
    });
  };

  return (
    <Box sx={{ p: 2, height: '100%', overflow: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        ⚙️ Propiedades
      </Typography>

      <Typography variant="caption" color="text.secondary" gutterBottom display="block">
        {selectedElement.type} - {props.name}
      </Typography>

      <Divider sx={{ my: 2 }} />

      {/* Propiedades Generales */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom fontWeight="bold">
          General
        </Typography>

        <TextField
          fullWidth
          label="Nombre"
          value={props.name || ''}
          onChange={(e) => handleChange('name', e.target.value)}
          size="small"
          margin="dense"
        />

        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="X"
              type="number"
              value={props.position.x}
              onChange={(e) =>
                handleNestedChange('position', 'x', parseFloat(e.target.value))
              }
              size="small"
              InputProps={{
                endAdornment: <InputAdornment position="end">px</InputAdornment>,
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Y"
              type="number"
              value={props.position.y}
              onChange={(e) =>
                handleNestedChange('position', 'y', parseFloat(e.target.value))
              }
              size="small"
              InputProps={{
                endAdornment: <InputAdornment position="end">px</InputAdornment>,
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Ancho"
              type="number"
              value={props.size.width}
              onChange={(e) =>
                handleNestedChange('size', 'width', parseFloat(e.target.value))
              }
              size="small"
              InputProps={{
                endAdornment: <InputAdornment position="end">px</InputAdornment>,
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Alto"
              type="number"
              value={props.size.height}
              onChange={(e) =>
                handleNestedChange('size', 'height', parseFloat(e.target.value))
              }
              size="small"
              InputProps={{
                endAdornment: <InputAdornment position="end">px</InputAdornment>,
              }}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" gutterBottom>
            Opacidad: {Math.round((props.opacity || 1) * 100)}%
          </Typography>
          <Slider
            value={(props.opacity || 1) * 100}
            onChange={(_, value) => handleChange('opacity', (value as number) / 100)}
            min={0}
            max={100}
            size="small"
          />
        </Box>
      </Paper>

      {/* Propiedades de Texto */}
      {(selectedElement.type === 'text' ||
        selectedElement.type === 'title' ||
        selectedElement.type === 'subtitle' ||
        selectedElement.type === 'paragraph') && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom fontWeight="bold">
            Texto
          </Typography>

          <TextField
            fullWidth
            label="Contenido"
            value={(props as any).content || ''}
            onChange={(e) => handleChange('content', e.target.value)}
            size="small"
            margin="dense"
            multiline
            rows={3}
          />

          <TextField
            fullWidth
            label="Tamaño de fuente"
            type="number"
            value={(props as any).fontSize || 16}
            onChange={(e) => handleChange('fontSize', parseFloat(e.target.value))}
            size="small"
            margin="dense"
            InputProps={{
              endAdornment: <InputAdornment position="end">px</InputAdornment>,
            }}
          />

          <FormControl fullWidth size="small" margin="dense">
            <InputLabel>Peso de fuente</InputLabel>
            <Select
              value={(props as any).fontWeight || 'normal'}
              onChange={(e) => handleChange('fontWeight', e.target.value)}
              label="Peso de fuente"
            >
              <MenuItem value="normal">Normal</MenuItem>
              <MenuItem value="bold">Negrita</MenuItem>
              <MenuItem value="lighter">Más ligero</MenuItem>
              <MenuItem value="bolder">Más grueso</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth size="small" margin="dense">
            <InputLabel>Alineación</InputLabel>
            <Select
              value={(props as any).textAlign || 'left'}
              onChange={(e) => handleChange('textAlign', e.target.value)}
              label="Alineación"
            >
              <MenuItem value="left">Izquierda</MenuItem>
              <MenuItem value="center">Centro</MenuItem>
              <MenuItem value="right">Derecha</MenuItem>
              <MenuItem value="justify">Justificado</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Color"
            type="color"
            value={(props as any).color || '#000000'}
            onChange={(e) => handleChange('color', e.target.value)}
            size="small"
            margin="dense"
          />
        </Paper>
      )}

      {/* Propiedades de Formas */}
      {(selectedElement.type === 'rectangle' ||
        selectedElement.type === 'circle' ||
        selectedElement.type === 'line') && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom fontWeight="bold">
            Estilo
          </Typography>

          {selectedElement.type !== 'line' && (
            <TextField
              fullWidth
              label="Color de relleno"
              type="color"
              value={(props as any).fillColor || '#cccccc'}
              onChange={(e) => handleChange('fillColor', e.target.value)}
              size="small"
              margin="dense"
            />
          )}

          <TextField
            fullWidth
            label="Color de borde"
            type="color"
            value={(props as any).strokeColor || '#000000'}
            onChange={(e) => handleChange('strokeColor', e.target.value)}
            size="small"
            margin="dense"
          />

          <TextField
            fullWidth
            label="Grosor de borde"
            type="number"
            value={(props as any).strokeWidth || 0}
            onChange={(e) => handleChange('strokeWidth', parseFloat(e.target.value))}
            size="small"
            margin="dense"
            InputProps={{
              endAdornment: <InputAdornment position="end">px</InputAdornment>,
            }}
          />
        </Paper>
      )}

      {/* Z-Index */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle2" gutterBottom fontWeight="bold">
          Orden
        </Typography>

        <TextField
          fullWidth
          label="Z-Index"
          type="number"
          value={props.zIndex}
          onChange={(e) => handleChange('zIndex', parseInt(e.target.value))}
          size="small"
          helperText="Orden de apilamiento (mayor = al frente)"
        />
      </Paper>

      <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
        <Typography variant="caption">
          💡 <strong>Tip:</strong> También puedes modificar el elemento directamente en el canvas.
        </Typography>
      </Box>
    </Box>
  );
};

export default PropertiesPanel;
