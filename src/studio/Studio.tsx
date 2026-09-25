import { useDesign } from '@/design/useDesign'
import { PreviewOverlay } from '@/preview/PreviewOverlay'
import { useEffect, useState } from 'react'
import { CanvasEditorProvider } from './canvas-editor'
import { CanvasStage } from './canvas-stage/CanvasStage'
import { PropertiesPanel } from './properties/PropertiesPanel'
import { Sidebar } from './sidebar/Sidebar'
import { Topbar } from './topbar/Topbar'

interface StudioProps {
  onClose: () => void
  onNew: () => void
}

export function Studio({ onClose, onNew }: StudioProps) {
  const {
    document,
    undo,
    redo,
    removeSelected,
    selectedElementId,
    selectedObjectId,
    selectedObjectIds,
    duplicateSelectedObject,
    selectAllObjects,
    selectElement,
    selectObjects,
    groupSelectedObjects,
    ungroupSelectedObjects,
    nudgeSelectedObjects,
  } = useDesign()
  const [previewing, setPreviewing] = useState(false)
  const [leftOpen, setLeftOpen] = useState(true)
  const [rightOpen, setRightOpen] = useState(true)

  useEffect(() => {
    function syncLayout() {
      const width = window.innerWidth
      setLeftOpen(width >= 960)
      setRightOpen(width >= 1180)
    }
    syncLayout()
    window.addEventListener('resize', syncLayout)
    return () => window.removeEventListener('resize', syncLayout)
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target
      const typing =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        (target instanceof HTMLElement && target.isContentEditable)

      const key = event.key.toLowerCase()
      const modifier = event.metaKey || event.ctrlKey

      if (modifier && key === 'z') {
        event.preventDefault()
        if (event.shiftKey) {
          redo()
        } else {
          undo()
        }
        return
      }

      if (modifier && key === 'y') {
        event.preventDefault()
        redo()
        return
      }

      if (modifier && key === 'a' && !typing) {
        event.preventDefault()
        selectAllObjects()
        return
      }

      if (modifier && key === 'g' && selectedObjectIds.length > 0) {
        event.preventDefault()
        if (event.shiftKey) {
          ungroupSelectedObjects()
        } else {
          groupSelectedObjects()
        }
        return
      }

      if (modifier && key === 'd' && selectedObjectIds.length > 0) {
        event.preventDefault()
        duplicateSelectedObject()
        return
      }

      if (!typing && event.key === 'Escape') {
        selectObjects([])
        selectElement(null)
        return
      }

      if (!typing && selectedObjectIds.length > 0 && ['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        event.preventDefault()
        const step = event.shiftKey ? 16 : 1
        const dx = key === 'arrowleft' ? -step : key === 'arrowright' ? step : 0
        const dy = key === 'arrowup' ? -step : key === 'arrowdown' ? step : 0
        nudgeSelectedObjects(dx, dy)
        return
      }

      if (!typing && (selectedElementId || selectedObjectId) && (event.key === 'Delete' || event.key === 'Backspace')) {
        event.preventDefault()
        removeSelected()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [
    duplicateSelectedObject,
    groupSelectedObjects,
    nudgeSelectedObjects,
    redo,
    removeSelected,
    selectAllObjects,
    selectElement,
    selectObjects,
    selectedElementId,
    selectedObjectId,
    selectedObjectIds.length,
    undo,
    ungroupSelectedObjects,
  ])

  return (
    <CanvasEditorProvider>
    <div className="relative flex h-full min-h-0 flex-col bg-studio text-ink">
      <Topbar onClose={onClose} onNew={onNew} onPreview={() => setPreviewing(true)} />
      <div className="flex min-h-0 flex-1">
        <Sidebar
          collapsed={!leftOpen}
          onExpand={() => setLeftOpen(true)}
          onCollapse={() => setLeftOpen(false)}
        />
        <CanvasStage
          leftOpen={leftOpen}
          rightOpen={rightOpen}
          onToggleLeft={() => setLeftOpen((value) => !value)}
          onToggleRight={() => setRightOpen((value) => !value)}
        />
        {rightOpen ? (
          <PropertiesPanel onCollapse={() => setRightOpen(false)} />
        ) : (
          <aside className="flex w-10 shrink-0 flex-col items-center border-l border-line bg-panel py-3">
            <button
              type="button"
              title="Show properties"
              aria-label="Show properties"
              data-show-properties="true"
              onClick={() => setRightOpen(true)}
              className="flex h-8 w-8 items-center justify-center rounded-md text-[10px] uppercase tracking-[0.12em] text-mute hover:bg-panel-hover hover:text-ink"
            >
              P
            </button>
          </aside>
        )}
      </div>
      {previewing ? (
        <PreviewOverlay document={document} onClose={() => setPreviewing(false)} />
      ) : null}
    </div>
    </CanvasEditorProvider>
  )
}
