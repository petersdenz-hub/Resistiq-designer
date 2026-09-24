import { createContext } from 'react'
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
  canUndo: boolean
  canRedo: boolean
  selectElement: (elementId: string | null) => void
  setActiveView: (viewId: string) => void
  setActivePanel: (panelId: string) => void
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
  removeSelected: () => void
  removeElementById: (elementId: string) => void
  updateSelected: (patch: DesignElementPatch, history?: HistoryMode) => void
  updateElementById: (
    elementId: string,
    patch: DesignElementPatch,
    history?: HistoryMode,
  ) => void
  moveSelectedLayer: (direction: LayerDirection) => void
  commitGesture: (previous: DesignDocument) => void
  hydrateDocument: (document: DesignDocument) => void
  undo: () => void
  redo: () => void
}

export const DesignContext = createContext<DesignContextValue | null>(null)
