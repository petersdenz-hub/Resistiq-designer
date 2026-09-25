import { useDesign } from '@/design/useDesign'
import { PreviewOverlay } from '@/preview/PreviewOverlay'
import { studioLeftOverlay, studioRightOverlay, studioViewport, type StudioSectionId, type StudioViewport } from '@/studio/editorChrome'
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
  const [viewport, setViewport] = useState<StudioViewport>('desktop')
  const [leftOpen, setLeftOpen] = useState(true)
  const [rightOpen, setRightOpen] = useState(true)
  const [mobileSheet, setMobileSheet] = useState<StudioSectionId | 'properties' | null>(null)
  const leftOverlay = studioLeftOverlay(viewport)
  const rightOverlay = studioRightOverlay(viewport)
  const mobile = viewport === 'mobile'

  useEffect(() => {
    function syncLayout() {
      const next = studioViewport(window.innerWidth)
      setViewport(next)
      setLeftOpen(next === 'desktop' || next === 'tablet')
      setRightOpen(next === 'desktop')
      if (next !== 'mobile') {
        setMobileSheet(null)
      }
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
        if (previewing) {
          setPreviewing(false)
          return
        }
        if (mobileSheet) {
          setMobileSheet(null)
          return
        }
        if (leftOverlay) {
          setLeftOpen(false)
        }
        if (rightOverlay) {
          setRightOpen(false)
        }
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
    leftOverlay,
    mobileSheet,
    nudgeSelectedObjects,
    previewing,
    redo,
    removeSelected,
    rightOverlay,
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
    <div className="relative flex h-full min-h-0 flex-col bg-studio text-ink" data-studio-viewport={viewport}>
      <Topbar onClose={onClose} onNew={onNew} onPreview={() => setPreviewing(true)} />
      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        {!mobile && leftOverlay && leftOpen ? (
          <button
            type="button"
            aria-label="Close tools"
            className="absolute inset-0 z-20 bg-black/45"
            onClick={() => setLeftOpen(false)}
          />
        ) : null}
        {!mobile && leftOpen ? (
          <div
            className={
              leftOverlay
                ? 'absolute inset-y-0 left-0 z-30 flex h-full'
                : 'flex h-full'
            }
            data-tools-drawer={leftOverlay ? 'true' : 'false'}
          >
            <Sidebar overlay={leftOverlay} onCollapse={() => setLeftOpen(false)} />
          </div>
        ) : !mobile && !leftOpen ? (
          <Sidebar collapsed onExpand={() => setLeftOpen(true)} />
        ) : null}
        <CanvasStage
          leftOpen={mobile ? false : leftOpen}
          rightOpen={mobile ? false : rightOpen}
          compactChrome={mobile}
          onToggleLeft={() => setLeftOpen((value) => !value)}
          onToggleRight={() => setRightOpen((value) => !value)}
        />
        {!mobile && rightOverlay && rightOpen ? (
          <button
            type="button"
            aria-label="Close properties"
            className="absolute inset-0 z-20 bg-black/45"
            onClick={() => setRightOpen(false)}
          />
        ) : null}
        {!mobile && rightOpen ? (
          <div
            className={
              rightOverlay
                ? 'absolute inset-y-0 right-0 z-30 flex h-full w-64'
                : 'flex h-full w-64'
            }
            data-properties-drawer={rightOverlay ? 'true' : 'false'}
          >
            <PropertiesPanel onCollapse={() => setRightOpen(false)} />
          </div>
        ) : !mobile && !rightOpen ? (
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
        ) : null}
        {mobile && mobileSheet ? (
          <>
            <button
              type="button"
              aria-label="Close panel"
              className="absolute inset-0 z-20 bg-black/45"
              onClick={() => setMobileSheet(null)}
            />
            <div
              className="absolute inset-x-0 bottom-12 z-30 flex max-h-[70%] min-h-[14rem] flex-col overflow-hidden rounded-t-lg border-t border-line bg-panel shadow-2xl"
              data-mobile-sheet={mobileSheet}
            >
              {mobileSheet === 'properties' ? (
                <PropertiesPanel onCollapse={() => setMobileSheet(null)} />
              ) : (
                <Sidebar
                  overlay
                  focusSection={mobileSheet}
                  onCollapse={() => setMobileSheet(null)}
                />
              )}
            </div>
          </>
        ) : null}
      </div>
      {mobile ? (
        <nav
          className="grid h-12 shrink-0 grid-cols-4 border-t border-line bg-panel"
          data-mobile-dock="true"
        >
          {([
            ['garment', 'Garment'],
            ['design', 'Design'],
            ['layers', 'Layers'],
            ['properties', 'Properties'],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-label={label}
              aria-pressed={mobileSheet === id}
              onClick={() => setMobileSheet((current) => (current === id ? null : id))}
              className={`text-[11px] ${
                mobileSheet === id ? 'bg-accent/10 text-ink' : 'text-mute hover:text-ink'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      ) : null}
      {previewing ? (
        <PreviewOverlay document={document} onClose={() => setPreviewing(false)} />
      ) : null}
    </div>
    </CanvasEditorProvider>
  )
}
