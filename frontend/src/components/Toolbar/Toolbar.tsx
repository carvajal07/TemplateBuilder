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

  const {
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
  } = useEditorStore();

  const hasSelection = selectedIds.length > 0;
  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  const handleSave = () => {
    toast.success('Plantilla guardada (demo)');
  };

  const handleExport = () => {
    toast.info('Exportando plantilla... (demo)');
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
