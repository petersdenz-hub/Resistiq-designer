import { createContext } from 'react'
import type { DesignDocument, DesignElement, DesignElementPatch, LayerDirection } from './types'

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
  undo: () => void
  redo: () => void
}

export const DesignContext = createContext<DesignContextValue | null>(null)
