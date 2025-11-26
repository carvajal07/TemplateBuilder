/**
 * EditorLayout - Layout principal del editor con canvas, toolbox, propiedades y capas
 */

import React, { useState } from 'react';
import { Box, IconButton, Drawer } from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Layers as LayersIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

import EditorCanvas from './EditorCanvas';
import Toolbox from '../Toolbox/Toolbox';
import PropertiesPanel from '../Properties/PropertiesPanel';
import LayersPanel from '../Layers/LayersPanel';
import Toolbar from '../Toolbar/Toolbar';

const TOOLBOX_WIDTH = 280;
const PROPERTIES_WIDTH = 320;
const LAYERS_WIDTH = 280;

const EditorLayout: React.FC = () => {
  const [toolboxOpen, setToolboxOpen] = useState(true);
  const [propertiesOpen, setPropertiesOpen] = useState(true);
  const [layersOpen, setLayersOpen] = useState(true);

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Toolbar Superior */}
      <Toolbar />

      {/* Layout Principal */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Toolbox Izquierdo */}
        <Drawer
          variant="persistent"
          anchor="left"
          open={toolboxOpen}
          sx={{
            width: toolboxOpen ? TOOLBOX_WIDTH : 0,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: TOOLBOX_WIDTH,
              boxSizing: 'border-box',
              position: 'relative',
              height: 'auto',
              borderRight: '1px solid',
              borderColor: 'divider',
            },
          }}
        >
          <Toolbox />
        </Drawer>

        {/* Toggle Toolbox */}
        {!toolboxOpen && (
          <IconButton
            onClick={() => setToolboxOpen(true)}
            sx={{
              position: 'absolute',
              left: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 1300,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <ChevronRight />
          </IconButton>
        )}

        {/* Canvas Central */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <EditorCanvas />

          {/* Toggle Toolbox desde canvas */}
          {toolboxOpen && (
            <IconButton
              onClick={() => setToolboxOpen(false)}
              sx={{
                position: 'absolute',
                left: 8,
                top: 8,
                zIndex: 1,
                bgcolor: 'background.paper',
                boxShadow: 1,
                '&:hover': { bgcolor: 'action.hover' },
              }}
              size="small"
            >
              <ChevronLeft />
            </IconButton>
          )}
        </Box>

        {/* Panel Derecho con Tabs */}
        <Box
          sx={{
            width: propertiesOpen || layersOpen ? PROPERTIES_WIDTH : 0,
            transition: 'width 0.3s',
            borderLeft: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Tabs */}
          <Box
            sx={{
              display: 'flex',
              borderBottom: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <IconButton
              onClick={() => {
                setPropertiesOpen(true);
                setLayersOpen(false);
              }}
              sx={{
                flex: 1,
                borderRadius: 0,
                bgcolor: propertiesOpen ? 'action.selected' : 'transparent',
              }}
            >
              <SettingsIcon />
            </IconButton>
            <IconButton
              onClick={() => {
                setLayersOpen(true);
                setPropertiesOpen(false);
              }}
              sx={{
                flex: 1,
                borderRadius: 0,
                bgcolor: layersOpen ? 'action.selected' : 'transparent',
              }}
            >
              <LayersIcon />
            </IconButton>
            <IconButton
              onClick={() => {
                setPropertiesOpen(false);
                setLayersOpen(false);
              }}
              size="small"
              sx={{ borderRadius: 0 }}
            >
              <ChevronRight />
            </IconButton>
          </Box>

          {/* Panel Content */}
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            {propertiesOpen && <PropertiesPanel />}
            {layersOpen && <LayersPanel />}
          </Box>
        </Box>

        {/* Toggle Panel Derecho */}
        {!propertiesOpen && !layersOpen && (
          <IconButton
            onClick={() => setPropertiesOpen(true)}
            sx={{
              position: 'absolute',
              right: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 1300,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <ChevronLeft />
          </IconButton>
        )}
      </Box>
    </Box>
  );
};

export default EditorLayout;
