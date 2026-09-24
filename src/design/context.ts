import { createContext } from 'react'
import type { DesignDocument, DesignElement, DesignElementPatch } from './types'

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
  setBodyColor: (value: string) => void
  addGraphic: () => void
  addText: () => void
  removeSelected: () => void
  removeElementById: (elementId: string) => void
  updateSelected: (patch: DesignElementPatch, history?: HistoryMode) => void
  updateElementById: (
    elementId: string,
    patch: DesignElementPatch,
    history?: HistoryMode,
  ) => void
  moveSelectedLayer: (direction: 'forward' | 'backward') => void
  commitGesture: (previous: DesignDocument) => void
  undo: () => void
  redo: () => void
}

export const DesignContext = createContext<DesignContextValue | null>(null)
