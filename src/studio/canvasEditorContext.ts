import { createContext, useContext } from 'react'

export const DEFAULT_CANVAS_GUIDES = {
  showPrintArea: true,
  showSafeAreas: true,
  showGuides: false,
} as const

export interface CanvasEditorValue {
  gridVisible: boolean
  snapToGrid: boolean
  gridSize: number
  pan: { x: number; y: number }
  showPrintArea: boolean
  showSafeAreas: boolean
  showGuides: boolean
  setGridVisible: (value: boolean) => void
  setSnapToGrid: (value: boolean) => void
  setGridSize: (value: number) => void
  setShowPrintArea: (value: boolean) => void
  setShowSafeAreas: (value: boolean) => void
  setShowGuides: (value: boolean) => void
  setPan: (
    value: { x: number; y: number } | ((current: { x: number; y: number }) => { x: number; y: number }),
  ) => void
}

export const CanvasEditorContext = createContext<CanvasEditorValue | null>(null)

export function useCanvasEditor() {
  const value = useContext(CanvasEditorContext)
  if (!value) {
    throw new Error('useCanvasEditor must be used inside CanvasEditorProvider')
  }
  return value
}
