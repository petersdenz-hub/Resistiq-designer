import { DEFAULT_GRID_SIZE } from '@/design/designObjects'
import { useMemo, useState, type ReactNode } from 'react'
import { CanvasEditorContext } from './canvasEditorContext'

export function CanvasEditorProvider({ children }: { children: ReactNode }) {
  const [gridVisible, setGridVisible] = useState(true)
  const [snapToGrid, setSnapToGrid] = useState(true)
  const [gridSize, setGridSize] = useState(DEFAULT_GRID_SIZE)
  const [pan, setPan] = useState({ x: 0, y: 0 })

  const value = useMemo(
    () => ({
      gridVisible,
      snapToGrid,
      gridSize,
      pan,
      setGridVisible,
      setSnapToGrid,
      setGridSize,
      setPan,
    }),
    [gridSize, gridVisible, pan, snapToGrid],
  )

  return <CanvasEditorContext.Provider value={value}>{children}</CanvasEditorContext.Provider>
}
