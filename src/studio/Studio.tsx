import { useDesign } from '@/design/useDesign'
import { PreviewOverlay } from '@/preview/PreviewOverlay'
import { useEffect, useState } from 'react'
import { CanvasStage } from './canvas-stage/CanvasStage'
import { PropertiesPanel } from './properties/PropertiesPanel'
import { Sidebar } from './sidebar/Sidebar'
import { Topbar } from './topbar/Topbar'

interface StudioProps {
  onClose: () => void
  onNew: () => void
}

export function Studio({ onClose, onNew }: StudioProps) {
  const { document, undo, redo, removeSelected, selectedElementId } = useDesign()
  const [previewing, setPreviewing] = useState(false)

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

      if (!typing && selectedElementId && (event.key === 'Delete' || event.key === 'Backspace')) {
        event.preventDefault()
        removeSelected()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [redo, removeSelected, selectedElementId, undo])

  return (
    <div className="relative flex h-full min-h-0 flex-col bg-studio text-ink">
      <Topbar onClose={onClose} onNew={onNew} onPreview={() => setPreviewing(true)} />
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <CanvasStage />
        <PropertiesPanel />
      </div>
      {previewing ? (
        <PreviewOverlay document={document} onClose={() => setPreviewing(false)} />
      ) : null}
    </div>
  )
}
