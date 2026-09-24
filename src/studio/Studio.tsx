import { useDesign } from '@/design/useDesign'
import { useEffect } from 'react'
import { CanvasStage } from './canvas-stage/CanvasStage'
import { PropertiesPanel } from './properties/PropertiesPanel'
import { Sidebar } from './sidebar/Sidebar'
import { Topbar } from './topbar/Topbar'

export function Studio() {
  const { undo, redo, removeSelected, selectedElementId } = useDesign()

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
    <div className="flex h-full min-h-0 flex-col bg-studio text-ink">
      <Topbar />
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <CanvasStage />
        <PropertiesPanel />
      </div>
    </div>
  )
}
