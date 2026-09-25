import { DEFAULT_GRID_SIZE } from '@/design/designObjects'
import { useMemo, useState, type ReactNode } from 'react'
import { CanvasEditorContext, DEFAULT_CANVAS_GUIDES } from './canvasEditorContext'

export function CanvasEditorProvider({ children }: { children: ReactNode }) {
  const [gridVisible, setGridVisible] = useState(true)
  const [snapToGrid, setSnapToGrid] = useState(true)
  const [gridSize, setGridSize] = useState(DEFAULT_GRID_SIZE)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [showPrintArea, setShowPrintArea] = useState(DEFAULT_CANVAS_GUIDES.showPrintArea)
  const [showSafeAreas, setShowSafeAreas] = useState(DEFAULT_CANVAS_GUIDES.showSafeAreas)
  const [showGuides, setShowGuides] = useState(DEFAULT_CANVAS_GUIDES.showGuides)

  const value = useMemo(
    () => ({
      gridVisible,
      snapToGrid,
      gridSize,
      pan,
      showPrintArea,
      showSafeAreas,
      showGuides,
      setGridVisible,
      setSnapToGrid,
      setGridSize,
      setShowPrintArea,
      setShowSafeAreas,
      setShowGuides,
      setPan,
    }),
    [gridSize, gridVisible, pan, showGuides, showPrintArea, showSafeAreas, snapToGrid],
  )

  return <CanvasEditorContext.Provider value={value}>{children}</CanvasEditorContext.Provider>
}
