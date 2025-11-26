/**
 * EditorCanvas - Canvas principal con Fabric.js
 */

import React, { useEffect, useRef, useState } from 'react';
import { Box, IconButton, ButtonGroup, Slider, Typography } from '@mui/material';
import {
  ZoomIn,
  ZoomOut,
  ZoomOutMap,
  GridOn,
  GridOff,
} from '@mui/icons-material';
import { fabric } from 'fabric';
import { useEditorStore } from '../../store/editorStore';

const EditorCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    elements,
    selectedIds,
    zoom,
    gridEnabled,
    snapToGrid,
    gridSize,
    setZoom,
    selectElement,
    clearSelection,
    updateElement,
    toggleGrid,
    zoomIn,
    zoomOut,
    zoomToFit,
    addElement,
  } = useEditorStore();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();

    try {
      const data = e.dataTransfer.getData('application/json');
      if (!data) return;

      const item = JSON.parse(data);
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;

      // Calcular posición relativa al canvas
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = (e.clientX - rect.left) / zoom;
      const y = (e.clientY - rect.top) / zoom;

      // Crear nuevo elemento en la posición del drop
      const newElement = {
        id: `element-${Date.now()}`,
        type: item.type,
        properties: {
          id: `element-${Date.now()}`,
          type: item.type,
          name: item.label,
          position: { x, y },
          size: { width: 200, height: 100 },
          opacity: 1,
          visible: true,
          locked: false,
          zIndex: 1,
          ...item.defaultProps,
        },
      };

      addElement(newElement);
    } catch (error) {
      console.error('Error al soltar elemento:', error);
    }
  };

  // Inicializar Fabric.js
  useEffect(() => {
    if (!canvasRef.current || fabricCanvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: '#ffffff',
      selection: true,
      preserveObjectStacking: true,
    });

    fabricCanvasRef.current = canvas;

    // Eventos de selección
    canvas.on('selection:created', (e) => {
      const selected = e.selected;
      if (selected && selected.length > 0) {
        const ids = selected.map((obj: any) => obj.id).filter(Boolean);
        if (ids.length > 0) {
          selectElement(ids[0], false);
        }
      }
    });

    canvas.on('selection:updated', (e) => {
      const selected = e.selected;
      if (selected && selected.length > 0) {
        const ids = selected.map((obj: any) => obj.id).filter(Boolean);
        if (ids.length > 0) {
          selectElement(ids[0], false);
        }
      }
    });

    canvas.on('selection:cleared', () => {
      clearSelection();
    });

    // Eventos de modificación
    canvas.on('object:modified', (e) => {
      const obj = e.target;
      if (obj && (obj as any).id) {
        updateElement((obj as any).id, {
          position: { x: obj.left || 0, y: obj.top || 0 },
          size: { width: obj.width || 0, height: obj.height || 0 },
          transform: {
            rotation: obj.angle || 0,
            scaleX: obj.scaleX || 1,
            scaleY: obj.scaleY || 1,
          },
        });
      }
    });

    // Resize canvas cuando cambia el contenedor
    const resizeCanvas = () => {
      if (containerRef.current && canvas) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        canvas.setDimensions({ width, height });
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.dispose();
      fabricCanvasRef.current = null;
    };
  }, []);

  // Actualizar zoom
  useEffect(() => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.setZoom(zoom);
      fabricCanvasRef.current.renderAll();
    }
  }, [zoom]);

  // Sincronizar elementos del store con el canvas
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    // Obtener objetos actuales en el canvas (excluyendo grid)
    const currentObjects = canvas.getObjects().filter((obj: any) => obj.id);
    const currentIds = new Set(currentObjects.map((obj: any) => obj.id));
    const storeIds = new Set(elements.map(el => el.id));

    // Remover objetos que ya no están en el store
    currentObjects.forEach((obj: any) => {
      if (!storeIds.has(obj.id)) {
        canvas.remove(obj);
      }
    });

    // Agregar o actualizar objetos
    elements.forEach((element) => {
      const existingObj = currentObjects.find((obj: any) => obj.id === element.id);

      if (!existingObj) {
        // Agregar nuevo objeto
        const fabricObj = createFabricObject(element);
        if (fabricObj) {
          (fabricObj as any).id = element.id;
          canvas.add(fabricObj);
        }
      } else {
        // Actualizar objeto existente solo si no está siendo modificado
        if (!canvas.getActiveObject() || (canvas.getActiveObject() as any)?.id !== element.id) {
          updateFabricObject(existingObj, element);
        }
      }
    });

    canvas.renderAll();
  }, [elements]);

  // Manejar cambios en el grid
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    // Remover líneas de grid existentes
    const objects = canvas.getObjects();
    objects.forEach((obj: any) => {
      if (!obj.id && !obj.selectable) {
        canvas.remove(obj);
      }
    });

    // Agregar grid si está habilitado
    if (gridEnabled) {
      drawGrid(canvas);
    }

    canvas.renderAll();
  }, [gridEnabled]);

  // Actualizar objeto existente de Fabric.js
  const updateFabricObject = (fabricObj: fabric.Object, element: any) => {
    const props = element.properties;

    fabricObj.set({
      left: props.position.x,
      top: props.position.y,
      opacity: props.opacity,
      visible: props.visible,
      selectable: !props.locked,
      evented: !props.locked,
    });

    // Actualizar propiedades específicas por tipo
    switch (element.type) {
      case 'text':
      case 'title':
      case 'subtitle':
      case 'paragraph':
        if (fabricObj instanceof fabric.IText) {
          fabricObj.set({
            text: props.content || 'Texto',
            fontSize: props.fontSize || 16,
            fontFamily: props.fontFamily || 'Arial',
            fill: props.color || '#000000',
            fontWeight: props.fontWeight || 'normal',
            fontStyle: props.fontStyle || 'normal',
            textAlign: props.textAlign || 'left',
          });
        }
        break;

      case 'rectangle':
        if (fabricObj instanceof fabric.Rect) {
          fabricObj.set({
            width: props.size.width,
            height: props.size.height,
            fill: props.fillColor || '#cccccc',
            stroke: props.strokeColor,
            strokeWidth: props.strokeWidth || 0,
          });
        }
        break;

      case 'circle':
        if (fabricObj instanceof fabric.Circle) {
          fabricObj.set({
            radius: Math.min(props.size.width, props.size.height) / 2,
            fill: props.fillColor || '#cccccc',
            stroke: props.strokeColor,
            strokeWidth: props.strokeWidth || 0,
          });
        }
        break;

      case 'line':
        if (fabricObj instanceof fabric.Line) {
          fabricObj.set({
            x2: props.position.x + props.size.width,
            y2: props.position.y + props.size.height,
            stroke: props.strokeColor || '#000000',
            strokeWidth: props.strokeWidth || 2,
          });
        }
        break;
    }
  };

  // Crear objeto de Fabric.js desde elemento del store
  const createFabricObject = (element: any): fabric.Object | null => {
    const props = element.properties;

    switch (element.type) {
      case 'text':
      case 'title':
      case 'subtitle':
      case 'paragraph':
        return new fabric.IText(props.content || 'Texto', {
          left: props.position.x,
          top: props.position.y,
          fontSize: props.fontSize || 16,
          fontFamily: props.fontFamily || 'Arial',
          fill: props.color || '#000000',
          fontWeight: props.fontWeight || 'normal',
          fontStyle: props.fontStyle || 'normal',
          textAlign: props.textAlign || 'left',
        });

      case 'rectangle':
        return new fabric.Rect({
          left: props.position.x,
          top: props.position.y,
          width: props.size.width,
          height: props.size.height,
          fill: props.fillColor || '#cccccc',
          stroke: props.strokeColor,
          strokeWidth: props.strokeWidth || 0,
        });

      case 'circle':
        return new fabric.Circle({
          left: props.position.x,
          top: props.position.y,
          radius: Math.min(props.size.width, props.size.height) / 2,
          fill: props.fillColor || '#cccccc',
          stroke: props.strokeColor,
          strokeWidth: props.strokeWidth || 0,
        });

      case 'line':
        return new fabric.Line(
          [
            props.position.x,
            props.position.y,
            props.position.x + props.size.width,
            props.position.y + props.size.height,
          ],
          {
            stroke: props.strokeColor || '#000000',
            strokeWidth: props.strokeWidth || 2,
          }
        );

      case 'image':
        // Para imágenes, necesitaríamos cargar la URL
        // Por ahora, creamos un placeholder
        return new fabric.Rect({
          left: props.position.x,
          top: props.position.y,
          width: props.size.width,
          height: props.size.height,
          fill: '#e3f2fd',
          stroke: '#1976d2',
          strokeWidth: 2,
        });

      default:
        return null;
    }
  };

  // Dibujar grid
  const drawGrid = (canvas: fabric.Canvas) => {
    const gridSize = 20;
    const width = canvas.getWidth();
    const height = canvas.getHeight();

    // Líneas verticales
    for (let i = 0; i < width / gridSize; i++) {
      canvas.add(
        new fabric.Line([i * gridSize, 0, i * gridSize, height], {
          stroke: '#e0e0e0',
          strokeWidth: 1,
          selectable: false,
          evented: false,
        })
      );
    }

    // Líneas horizontales
    for (let i = 0; i < height / gridSize; i++) {
      canvas.add(
        new fabric.Line([0, i * gridSize, width, i * gridSize], {
          stroke: '#e0e0e0',
          strokeWidth: 1,
          selectable: false,
          evented: false,
        })
      );
    }
  };

  return (
    <Box
      ref={containerRef}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      sx={{
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        bgcolor: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Canvas */}
      <canvas ref={canvasRef} />

      {/* Controles de Zoom */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          bgcolor: 'background.paper',
          borderRadius: 1,
          boxShadow: 2,
          p: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <IconButton size="small" onClick={zoomOut}>
          <ZoomOut />
        </IconButton>

        <Slider
          value={zoom * 100}
          onChange={(_, value) => setZoom((value as number) / 100)}
          min={10}
          max={500}
          sx={{ width: 100 }}
        />

        <Typography variant="caption" sx={{ minWidth: 45, textAlign: 'center' }}>
          {Math.round(zoom * 100)}%
        </Typography>

        <IconButton size="small" onClick={zoomIn}>
          <ZoomIn />
        </IconButton>

        <IconButton size="small" onClick={zoomToFit}>
          <ZoomOutMap />
        </IconButton>
      </Box>

      {/* Control de Grid */}
      <IconButton
        onClick={toggleGrid}
        sx={{
          position: 'absolute',
          bottom: 16,
          right: 200,
          bgcolor: 'background.paper',
          boxShadow: 2,
          '&:hover': { bgcolor: 'action.hover' },
        }}
        size="small"
      >
        {gridEnabled ? <GridOn color="primary" /> : <GridOff />}
      </IconButton>

      {/* Indicador de posición del mouse (para debugging) */}
      <Box
        sx={{
          position: 'absolute',
          top: 8,
          left: '50%',
          transform: 'translateX(-50%)',
          bgcolor: 'background.paper',
          px: 2,
          py: 0.5,
          borderRadius: 1,
          boxShadow: 1,
        }}
      >
        <Typography variant="caption">
          Canvas: {Math.round(fabricCanvasRef.current?.getWidth() || 0)} x{' '}
          {Math.round(fabricCanvasRef.current?.getHeight() || 0)} px
        </Typography>
      </Box>
    </Box>
  );
};

export default EditorCanvas;
