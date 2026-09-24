import type { DesignDocument } from '@/design/types'
import { Button, SegmentedControl } from '@/ui'
import { useEffect, useState } from 'react'
import { PreviewStage } from './PreviewStage'

interface PreviewOverlayProps {
  document: DesignDocument
  onClose: () => void
}

export function PreviewOverlay({ document, onClose }: PreviewOverlayProps) {
  const [viewId, setViewId] = useState(document.activeView)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-studio/96">
      <div className="flex h-14 items-center justify-between border-b border-line px-4">
        <div>
          <div className="text-[13px] font-medium text-ink">{document.name}</div>
          <div className="text-[10px] uppercase tracking-[0.14em] text-mute">Preview</div>
        </div>
        <SegmentedControl
          className="w-auto shrink-0"
          value={viewId}
          options={document.views.map((view) => ({ value: view.id, label: view.label }))}
          onChange={setViewId}
        />
        <Button onClick={onClose}>Close</Button>
      </div>
      <div className="flex flex-1 items-center justify-center overflow-auto p-8">
        <PreviewStage document={document} viewId={viewId} />
      </div>
    </div>
  )
}
