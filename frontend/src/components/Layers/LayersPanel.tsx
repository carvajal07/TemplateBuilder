/**
 * LayersPanel - Árbol de capas jerárquico
 */

import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Checkbox,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Lock,
  LockOpen,
  TextFields,
  Crop169,
  RadioButtonUnchecked,
  Remove,
  Image as ImageIcon,
  TableChart,
} from '@mui/icons-material';
import { useEditorStore } from '../../store/editorStore';
import { ElementType } from '../../types';

const ELEMENT_ICONS: Record<string, React.ReactNode> = {
  text: <TextFields fontSize="small" />,
  title: <TextFields fontSize="small" />,
  subtitle: <TextFields fontSize="small" />,
  paragraph: <TextFields fontSize="small" />,
  rectangle: <Crop169 fontSize="small" />,
  circle: <RadioButtonUnchecked fontSize="small" />,
  line: <Remove fontSize="small" />,
  image: <ImageIcon fontSize="small" />,
  table: <TableChart fontSize="small" />,
};

const LayersPanel: React.FC = () => {
  const {
    elements,
    selectedIds,
    selectElement,
    toggleVisibility,
    toggleLock,
    bringToFront,
    sendToBack,
  } = useEditorStore();

  // Ordenar elementos por z-index (mayor primero)
  const sortedElements = [...elements].sort((a, b) => b.properties.zIndex - a.properties.zIndex);

  const handleSelect = (id: string) => {
    selectElement(id, false);
  };

  const handleToggleVisibility = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    toggleVisibility(id);
  };

  const handleToggleLock = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    toggleLock(id);
  };

  return (
    <Box sx={{ p: 2, height: '100%', overflow: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        📚 Capas
      </Typography>

      {elements.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body2" color="text.secondary">
            No hay elementos en el canvas
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Agrega elementos desde el Toolbox
          </Typography>
        </Box>
      ) : (
        <List dense>
          {sortedElements.map((element) => {
            const props = element.properties;
            const isSelected = selectedIds.includes(element.id);

            return (
              <ListItem
                key={element.id}
                disablePadding
                secondaryAction={
                  <Box>
                    <IconButton
                      size="small"
                      onClick={(e) => handleToggleVisibility(e, element.id)}
                    >
                      {props.visible ? (
                        <Visibility fontSize="small" />
                      ) : (
                        <VisibilityOff fontSize="small" color="disabled" />
                      )}
                    </IconButton>
                    <IconButton size="small" onClick={(e) => handleToggleLock(e, element.id)}>
                      {props.locked ? (
                        <Lock fontSize="small" color="error" />
                      ) : (
                        <LockOpen fontSize="small" />
                      )}
                    </IconButton>
                  </Box>
                }
                sx={{
                  mb: 0.5,
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: isSelected ? 'primary.main' : 'divider',
                  bgcolor: isSelected ? 'action.selected' : 'transparent',
                }}
              >
                <ListItemButton onClick={() => handleSelect(element.id)} dense>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {ELEMENT_ICONS[element.type] || <TextFields fontSize="small" />}
                  </ListItemIcon>
                  <ListItemText
                    primary={props.name || element.type}
                    secondary={`${Math.round(props.size.width)} × ${Math.round(
                      props.size.height
                    )} px`}
                    primaryTypographyProps={{
                      variant: 'body2',
                      fontWeight: isSelected ? 'bold' : 'normal',
                    }}
                    secondaryTypographyProps={{
                      variant: 'caption',
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      )}

      <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
        <Typography variant="caption" display="block">
          💡 <strong>Tip:</strong> Los elementos están ordenados por z-index.
        </Typography>
        <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
          Los de arriba están al frente.
        </Typography>
      </Box>
    </Box>
  );
};

export default LayersPanel;
