import { createContext, useContext } from 'react'

export interface CanvasEditorValue {
  gridVisible: boolean
  snapToGrid: boolean
  gridSize: number
  pan: { x: number; y: number }
  setGridVisible: (value: boolean) => void
  setSnapToGrid: (value: boolean) => void
  setGridSize: (value: number) => void
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
