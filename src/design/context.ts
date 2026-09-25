import { createContext } from 'react'
import type {
  DesignObject,
  DesignObjectPatch,
  PlacementZone,
} from './designObjects'
import type {
  ConstructionKind,
  DesignConstruction,
  DesignConstructionPart,
  DesignDocument,
  DesignElement,
  DesignElementPatch,
  DesignMaterial,
  LayerDirection,
} from './types'

export type HistoryMode = 'record' | 'replace'

export interface DesignContextValue {
  document: DesignDocument
  selectedElementId: string | null
  selectedElement: DesignElement | null
  selectedObjectId: string | null
  selectedObject: DesignObject | null
  canUndo: boolean
  canRedo: boolean
  selectElement: (elementId: string | null) => void
  selectObject: (objectId: string | null) => void
  setActiveView: (viewId: string) => void
  setActivePanel: (panelId: string) => void
  setActiveZone: (zone: PlacementZone) => void
  setSelectedObjectZone: (zone: PlacementZone) => void
  renameDesign: (name: string) => void
  setBodyColor: (value: string, history?: HistoryMode) => void
  setPanelColor: (panelId: string, value: string, history?: HistoryMode) => void
  patchConstruction: (patch: DesignConstruction, history?: HistoryMode) => void
  setConstructionPart: (part: DesignConstructionPart, history?: HistoryMode) => void
  clearConstructionPart: (kind: ConstructionKind, partId?: string, history?: HistoryMode) => void
  upsertMaterial: (material: DesignMaterial, history?: HistoryMode) => void
  setConstructionStyle: (
    kind: ConstructionKind,
    style: string,
    history?: HistoryMode,
    slot?: string,
  ) => void
  setConstructionVariant: (kind: 'zipper' | 'hood', variant: string, history?: HistoryMode) => void
  setGarmentMaterial: (materialId: string, history?: HistoryMode) => void
  addGraphic: () => void
  addText: () => void
  addImageFromFile: (file: File, role?: 'image' | 'logo') => Promise<string | null>
  addDesignText: () => void
  addDesignShape: () => void
  addDesignImageFromFile: (file: File) => Promise<string | null>
  removeSelected: () => void
  removeElementById: (elementId: string) => void
  removeObjectById: (objectId: string) => void
  duplicateSelectedObject: () => void
  updateSelected: (patch: DesignElementPatch, history?: HistoryMode) => void
  updateElementById: (
    elementId: string,
    patch: DesignElementPatch,
    history?: HistoryMode,
  ) => void
  updateSelectedObject: (patch: DesignObjectPatch, history?: HistoryMode) => void
  updateObjectById: (objectId: string, patch: DesignObjectPatch, history?: HistoryMode) => void
  moveSelectedLayer: (direction: LayerDirection) => void
  moveSelectedObjectLayer: (direction: LayerDirection) => void
  commitGesture: (previous: DesignDocument) => void
  hydrateDocument: (document: DesignDocument) => void
  undo: () => void
  redo: () => void
}

export const DesignContext = createContext<DesignContextValue | null>(null)
