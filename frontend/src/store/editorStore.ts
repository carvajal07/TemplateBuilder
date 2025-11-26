/**
 * Editor Store - Zustand State Management
 *
 * Gestiona el estado del editor de plantillas
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import {
  CanvasElement,
  ElementProperties,
  Position,
  Guide,
  HistoryAction,
  ElementType,
} from '../types';

// ============================================================================
// STATE INTERFACE
// ============================================================================

interface EditorState {
  // Canvas state
  elements: CanvasElement[];
  selectedIds: string[];
  hoveredId: string | null;
  zoom: number;
  offset: Position;
  gridEnabled: boolean;
  snapToGrid: boolean;
  gridSize: number;
  guides: Guide[];
  mode: 'select' | 'pan' | 'draw';

  // Template info
  templateId: string | null;
  templateName: string;
  templateType: 'pdf' | 'email';

  // History
  history: {
    past: HistoryAction[];
    future: HistoryAction[];
  };

  // UI state
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  bottomPanelOpen: boolean;

  // Actions
  // Canvas
  addElement: (element: CanvasElement) => void;
  updateElement: (id: string, properties: Partial<ElementProperties>) => void;
  deleteElement: (id: string) => void;
  deleteElements: (ids: string[]) => void;
  duplicateElement: (id: string) => void;
  duplicateElements: (ids: string[]) => void;

  // Selection
  selectElement: (id: string, multi?: boolean) => void;
  selectElements: (ids: string[]) => void;
  clearSelection: () => void;
  selectAll: () => void;

  // Hover
  setHoveredId: (id: string | null) => void;

  // Transform
  moveElement: (id: string, position: Position) => void;
  moveElements: (ids: string[], delta: Position) => void;
  resizeElement: (id: string, size: { width: number; height: number }) => void;
  rotateElement: (id: string, rotation: number) => void;

  // Layers
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  bringForward: (id: string) => void;
  sendBackward: (id: string) => void;

  // Lock/Visibility
  toggleLock: (id: string) => void;
  toggleVisibility: (id: string) => void;

  // Grouping
  groupElements: (ids: string[]) => void;
  ungroupElements: (id: string) => void;

  // Alignment
  alignLeft: (ids: string[]) => void;
  alignCenter: (ids: string[]) => void;
  alignRight: (ids: string[]) => void;
  alignTop: (ids: string[]) => void;
  alignMiddle: (ids: string[]) => void;
  alignBottom: (ids: string[]) => void;
  distributeHorizontal: (ids: string[]) => void;
  distributeVertical: (ids: string[]) => void;

  // Canvas view
  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomToFit: () => void;
  resetZoom: () => void;
  setOffset: (offset: Position) => void;
  setMode: (mode: 'select' | 'pan' | 'draw') => void;

  // Grid & Guides
  toggleGrid: () => void;
  toggleSnap: () => void;
  setGridSize: (size: number) => void;
  addGuide: (guide: Guide) => void;
  removeGuide: (id: string) => void;
  clearGuides: () => void;

  // History
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;

  // Template
  loadTemplate: (templateId: string, elements: CanvasElement[]) => void;
  clearTemplate: () => void;
  setTemplateName: (name: string) => void;
  setTemplateType: (type: 'pdf' | 'email') => void;

  // UI
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  toggleBottomPanel: () => void;

  // Utility
  getElementById: (id: string) => CanvasElement | undefined;
  getSelectedElements: () => CanvasElement[];
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const createHistoryAction = (
  type: HistoryAction['type'],
  elementIds: string[],
  before: any,
  after: any
): HistoryAction => ({
  id: uuidv4(),
  type,
  timestamp: new Date(),
  elementIds,
  before,
  after,
});

const addToHistory = (
  state: EditorState,
  action: HistoryAction
): { past: HistoryAction[]; future: HistoryAction[] } => {
  const past = [...state.history.past, action];
  // Limitar historial a 100 acciones
  const trimmedPast = past.slice(-100);

  return {
    past: trimmedPast,
    future: [], // Clear future when new action is performed
  };
};

// ============================================================================
// STORE
// ============================================================================

export const useEditorStore = create<EditorState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        elements: [],
        selectedIds: [],
        hoveredId: null,
        zoom: 1,
        offset: { x: 0, y: 0 },
        gridEnabled: true,
        snapToGrid: true,
        gridSize: 10,
        guides: [],
        mode: 'select',

        templateId: null,
        templateName: 'Untitled Template',
        templateType: 'pdf',

        history: {
          past: [],
          future: [],
        },

        leftPanelOpen: true,
        rightPanelOpen: true,
        bottomPanelOpen: false,

        // ====================================================================
        // CANVAS ACTIONS
        // ====================================================================

        addElement: (element) => {
          set((state) => {
            const newElement = {
              ...element,
              id: element.id || uuidv4(),
            };

            const historyAction = createHistoryAction(
              'add',
              [newElement.id],
              null,
              newElement
            );

            return {
              elements: [...state.elements, newElement],
              selectedIds: [newElement.id],
              history: addToHistory(state, historyAction),
            };
          });
        },

        updateElement: (id, properties) => {
          set((state) => {
            const element = state.elements.find((el) => el.id === id);
            if (!element) return state;

            const before = { ...element.properties };
            const after = { ...element.properties, ...properties };

            const historyAction = createHistoryAction('update', [id], before, after);

            return {
              elements: state.elements.map((el) =>
                el.id === id
                  ? { ...el, properties: { ...el.properties, ...properties } }
                  : el
              ),
              history: addToHistory(state, historyAction),
            };
          });
        },

        deleteElement: (id) => {
          set((state) => {
            const element = state.elements.find((el) => el.id === id);
            if (!element) return state;

            const historyAction = createHistoryAction('delete', [id], element, null);

            return {
              elements: state.elements.filter((el) => el.id !== id),
              selectedIds: state.selectedIds.filter((selectedId) => selectedId !== id),
              history: addToHistory(state, historyAction),
            };
          });
        },

        deleteElements: (ids) => {
          set((state) => {
            const elementsToDelete = state.elements.filter((el) => ids.includes(el.id));

            const historyAction = createHistoryAction(
              'delete',
              ids,
              elementsToDelete,
              null
            );

            return {
              elements: state.elements.filter((el) => !ids.includes(el.id)),
              selectedIds: state.selectedIds.filter((id) => !ids.includes(id)),
              history: addToHistory(state, historyAction),
            };
          });
        },

        duplicateElement: (id) => {
          set((state) => {
            const element = state.elements.find((el) => el.id === id);
            if (!element) return state;

            const newElement: CanvasElement = {
              ...element,
              id: uuidv4(),
              properties: {
                ...element.properties,
                id: uuidv4(),
                position: {
                  x: element.properties.position.x + 20,
                  y: element.properties.position.y + 20,
                },
              },
            };

            const historyAction = createHistoryAction(
              'add',
              [newElement.id],
              null,
              newElement
            );

            return {
              elements: [...state.elements, newElement],
              selectedIds: [newElement.id],
              history: addToHistory(state, historyAction),
            };
          });
        },

        duplicateElements: (ids) => {
          set((state) => {
            const elementsToDuplicate = state.elements.filter((el) =>
              ids.includes(el.id)
            );

            const newElements = elementsToDuplicate.map((el) => ({
              ...el,
              id: uuidv4(),
              properties: {
                ...el.properties,
                id: uuidv4(),
                position: {
                  x: el.properties.position.x + 20,
                  y: el.properties.position.y + 20,
                },
              },
            }));

            const historyAction = createHistoryAction(
              'add',
              newElements.map((el) => el.id),
              null,
              newElements
            );

            return {
              elements: [...state.elements, ...newElements],
              selectedIds: newElements.map((el) => el.id),
              history: addToHistory(state, historyAction),
            };
          });
        },

        // ====================================================================
        // SELECTION ACTIONS
        // ====================================================================

        selectElement: (id, multi = false) => {
          set((state) => {
            if (multi) {
              const isSelected = state.selectedIds.includes(id);
              return {
                selectedIds: isSelected
                  ? state.selectedIds.filter((selectedId) => selectedId !== id)
                  : [...state.selectedIds, id],
              };
            }
            return { selectedIds: [id] };
          });
        },

        selectElements: (ids) => {
          set({ selectedIds: ids });
        },

        clearSelection: () => {
          set({ selectedIds: [] });
        },

        selectAll: () => {
          set((state) => ({
            selectedIds: state.elements.map((el) => el.id),
          }));
        },

        // ====================================================================
        // HOVER ACTIONS
        // ====================================================================

        setHoveredId: (id) => {
          set({ hoveredId: id });
        },

        // ====================================================================
        // TRANSFORM ACTIONS
        // ====================================================================

        moveElement: (id, position) => {
          get().updateElement(id, { position });
        },

        moveElements: (ids, delta) => {
          set((state) => {
            const before = ids.map((id) => {
              const el = state.elements.find((e) => e.id === id);
              return el ? { id, position: el.properties.position } : null;
            }).filter(Boolean);

            const newElements = state.elements.map((el) => {
              if (ids.includes(el.id)) {
                return {
                  ...el,
                  properties: {
                    ...el.properties,
                    position: {
                      x: el.properties.position.x + delta.x,
                      y: el.properties.position.y + delta.y,
                    },
                  },
                };
              }
              return el;
            });

            const after = ids.map((id) => {
              const el = newElements.find((e) => e.id === id);
              return el ? { id, position: el.properties.position } : null;
            }).filter(Boolean);

            const historyAction = createHistoryAction('move', ids, before, after);

            return {
              elements: newElements,
              history: addToHistory(state, historyAction),
            };
          });
        },

        resizeElement: (id, size) => {
          get().updateElement(id, { size });
        },

        rotateElement: (id, rotation) => {
          get().updateElement(id, {
            transform: {
              rotation,
              scaleX: 1,
              scaleY: 1,
            },
          });
        },

        // ====================================================================
        // LAYER ACTIONS
        // ====================================================================

        bringToFront: (id) => {
          set((state) => {
            const maxZIndex = Math.max(...state.elements.map((el) => el.properties.zIndex), 0);
            return {
              elements: state.elements.map((el) =>
                el.id === id
                  ? { ...el, properties: { ...el.properties, zIndex: maxZIndex + 1 } }
                  : el
              ),
            };
          });
        },

        sendToBack: (id) => {
          set((state) => {
            const minZIndex = Math.min(...state.elements.map((el) => el.properties.zIndex), 0);
            return {
              elements: state.elements.map((el) =>
                el.id === id
                  ? { ...el, properties: { ...el.properties, zIndex: minZIndex - 1 } }
                  : el
              ),
            };
          });
        },

        bringForward: (id) => {
          set((state) => {
            const element = state.elements.find((el) => el.id === id);
            if (!element) return state;

            return {
              elements: state.elements.map((el) =>
                el.id === id
                  ? { ...el, properties: { ...el.properties, zIndex: el.properties.zIndex + 1 } }
                  : el
              ),
            };
          });
        },

        sendBackward: (id) => {
          set((state) => {
            const element = state.elements.find((el) => el.id === id);
            if (!element) return state;

            return {
              elements: state.elements.map((el) =>
                el.id === id
                  ? { ...el, properties: { ...el.properties, zIndex: el.properties.zIndex - 1 } }
                  : el
              ),
            };
          });
        },

        // ====================================================================
        // LOCK/VISIBILITY ACTIONS
        // ====================================================================

        toggleLock: (id) => {
          set((state) => ({
            elements: state.elements.map((el) =>
              el.id === id
                ? { ...el, properties: { ...el.properties, locked: !el.properties.locked } }
                : el
            ),
          }));
        },

        toggleVisibility: (id) => {
          set((state) => ({
            elements: state.elements.map((el) =>
              el.id === id
                ? { ...el, properties: { ...el.properties, visible: !el.properties.visible } }
                : el
            ),
          }));
        },

        // ====================================================================
        // GROUPING ACTIONS
        // ====================================================================

        groupElements: (ids) => {
          // TODO: Implement grouping logic
          console.log('Group elements:', ids);
        },

        ungroupElements: (id) => {
          // TODO: Implement ungrouping logic
          console.log('Ungroup element:', id);
        },

        // ====================================================================
        // ALIGNMENT ACTIONS
        // ====================================================================

        alignLeft: (ids) => {
          set((state) => {
            const elements = state.elements.filter((el) => ids.includes(el.id));
            const minX = Math.min(...elements.map((el) => el.properties.position.x));

            return {
              elements: state.elements.map((el) =>
                ids.includes(el.id)
                  ? { ...el, properties: { ...el.properties, position: { ...el.properties.position, x: minX } } }
                  : el
              ),
            };
          });
        },

        alignCenter: (ids) => {
          set((state) => {
            const elements = state.elements.filter((el) => ids.includes(el.id));
            const avgX = elements.reduce((sum, el) => sum + el.properties.position.x + el.properties.size.width / 2, 0) / elements.length;

            return {
              elements: state.elements.map((el) =>
                ids.includes(el.id)
                  ? { ...el, properties: { ...el.properties, position: { ...el.properties.position, x: avgX - el.properties.size.width / 2 } } }
                  : el
              ),
            };
          });
        },

        alignRight: (ids) => {
          set((state) => {
            const elements = state.elements.filter((el) => ids.includes(el.id));
            const maxX = Math.max(...elements.map((el) => el.properties.position.x + el.properties.size.width));

            return {
              elements: state.elements.map((el) =>
                ids.includes(el.id)
                  ? { ...el, properties: { ...el.properties, position: { ...el.properties.position, x: maxX - el.properties.size.width } } }
                  : el
              ),
            };
          });
        },

        alignTop: (ids) => {
          set((state) => {
            const elements = state.elements.filter((el) => ids.includes(el.id));
            const minY = Math.min(...elements.map((el) => el.properties.position.y));

            return {
              elements: state.elements.map((el) =>
                ids.includes(el.id)
                  ? { ...el, properties: { ...el.properties, position: { ...el.properties.position, y: minY } } }
                  : el
              ),
            };
          });
        },

        alignMiddle: (ids) => {
          set((state) => {
            const elements = state.elements.filter((el) => ids.includes(el.id));
            const avgY = elements.reduce((sum, el) => sum + el.properties.position.y + el.properties.size.height / 2, 0) / elements.length;

            return {
              elements: state.elements.map((el) =>
                ids.includes(el.id)
                  ? { ...el, properties: { ...el.properties, position: { ...el.properties.position, y: avgY - el.properties.size.height / 2 } } }
                  : el
              ),
            };
          });
        },

        alignBottom: (ids) => {
          set((state) => {
            const elements = state.elements.filter((el) => ids.includes(el.id));
            const maxY = Math.max(...elements.map((el) => el.properties.position.y + el.properties.size.height));

            return {
              elements: state.elements.map((el) =>
                ids.includes(el.id)
                  ? { ...el, properties: { ...el.properties, position: { ...el.properties.position, y: maxY - el.properties.size.height } } }
                  : el
              ),
            };
          });
        },

        distributeHorizontal: (ids) => {
          // TODO: Implement horizontal distribution
          console.log('Distribute horizontal:', ids);
        },

        distributeVertical: (ids) => {
          // TODO: Implement vertical distribution
          console.log('Distribute vertical:', ids);
        },

        // ====================================================================
        // CANVAS VIEW ACTIONS
        // ====================================================================

        setZoom: (zoom) => {
          set({ zoom: Math.max(0.1, Math.min(5, zoom)) });
        },

        zoomIn: () => {
          set((state) => ({ zoom: Math.min(5, state.zoom * 1.2) }));
        },

        zoomOut: () => {
          set((state) => ({ zoom: Math.max(0.1, state.zoom / 1.2) }));
        },

        zoomToFit: () => {
          // TODO: Calculate zoom to fit all elements
          set({ zoom: 1, offset: { x: 0, y: 0 } });
        },

        resetZoom: () => {
          set({ zoom: 1, offset: { x: 0, y: 0 } });
        },

        setOffset: (offset) => {
          set({ offset });
        },

        setMode: (mode) => {
          set({ mode });
        },

        // ====================================================================
        // GRID & GUIDES ACTIONS
        // ====================================================================

        toggleGrid: () => {
          set((state) => ({ gridEnabled: !state.gridEnabled }));
        },

        toggleSnap: () => {
          set((state) => ({ snapToGrid: !state.snapToGrid }));
        },

        setGridSize: (size) => {
          set({ gridSize: size });
        },

        addGuide: (guide) => {
          set((state) => ({
            guides: [...state.guides, { ...guide, id: guide.id || uuidv4() }],
          }));
        },

        removeGuide: (id) => {
          set((state) => ({
            guides: state.guides.filter((guide) => guide.id !== id),
          }));
        },

        clearGuides: () => {
          set({ guides: [] });
        },

        // ====================================================================
        // HISTORY ACTIONS
        // ====================================================================

        undo: () => {
          set((state) => {
            if (state.history.past.length === 0) return state;

            const action = state.history.past[state.history.past.length - 1];
            const newPast = state.history.past.slice(0, -1);

            // Apply undo based on action type
            let newElements = [...state.elements];

            switch (action.type) {
              case 'add':
                newElements = newElements.filter((el) => !action.elementIds.includes(el.id));
                break;
              case 'delete':
                newElements = [...newElements, ...(Array.isArray(action.before) ? action.before : [action.before])];
                break;
              case 'update':
              case 'move':
              case 'resize':
              case 'rotate':
                newElements = newElements.map((el) => {
                  if (action.elementIds.includes(el.id)) {
                    const beforeData = Array.isArray(action.before)
                      ? action.before.find((b: any) => b.id === el.id)
                      : action.before;
                    return { ...el, properties: { ...el.properties, ...beforeData } };
                  }
                  return el;
                });
                break;
            }

            return {
              elements: newElements,
              history: {
                past: newPast,
                future: [action, ...state.history.future],
              },
            };
          });
        },

        redo: () => {
          set((state) => {
            if (state.history.future.length === 0) return state;

            const action = state.history.future[0];
            const newFuture = state.history.future.slice(1);

            // Apply redo based on action type
            let newElements = [...state.elements];

            switch (action.type) {
              case 'add':
                newElements = [...newElements, ...(Array.isArray(action.after) ? action.after : [action.after])];
                break;
              case 'delete':
                newElements = newElements.filter((el) => !action.elementIds.includes(el.id));
                break;
              case 'update':
              case 'move':
              case 'resize':
              case 'rotate':
                newElements = newElements.map((el) => {
                  if (action.elementIds.includes(el.id)) {
                    const afterData = Array.isArray(action.after)
                      ? action.after.find((a: any) => a.id === el.id)
                      : action.after;
                    return { ...el, properties: { ...el.properties, ...afterData } };
                  }
                  return el;
                });
                break;
            }

            return {
              elements: newElements,
              history: {
                past: [...state.history.past, action],
                future: newFuture,
              },
            };
          });
        },

        clearHistory: () => {
          set({ history: { past: [], future: [] } });
        },

        // ====================================================================
        // TEMPLATE ACTIONS
        // ====================================================================

        loadTemplate: (templateId, elements) => {
          set({
            templateId,
            elements,
            selectedIds: [],
            history: { past: [], future: [] },
          });
        },

        clearTemplate: () => {
          set({
            templateId: null,
            templateName: 'Untitled Template',
            elements: [],
            selectedIds: [],
            history: { past: [], future: [] },
          });
        },

        setTemplateName: (name) => {
          set({ templateName: name });
        },

        setTemplateType: (type) => {
          set({ templateType: type });
        },

        // ====================================================================
        // UI ACTIONS
        // ====================================================================

        toggleLeftPanel: () => {
          set((state) => ({ leftPanelOpen: !state.leftPanelOpen }));
        },

        toggleRightPanel: () => {
          set((state) => ({ rightPanelOpen: !state.rightPanelOpen }));
        },

        toggleBottomPanel: () => {
          set((state) => ({ bottomPanelOpen: !state.bottomPanelOpen }));
        },

        // ====================================================================
        // UTILITY ACTIONS
        // ====================================================================

        getElementById: (id) => {
          return get().elements.find((el) => el.id === id);
        },

        getSelectedElements: () => {
          const state = get();
          return state.elements.filter((el) => state.selectedIds.includes(el.id));
        },
      }),
      {
        name: 'editor-storage',
        partialize: (state) => ({
          gridEnabled: state.gridEnabled,
          snapToGrid: state.snapToGrid,
          gridSize: state.gridSize,
          leftPanelOpen: state.leftPanelOpen,
          rightPanelOpen: state.rightPanelOpen,
          bottomPanelOpen: state.bottomPanelOpen,
        }),
      }
    ),
    { name: 'EditorStore' }
  )
);
