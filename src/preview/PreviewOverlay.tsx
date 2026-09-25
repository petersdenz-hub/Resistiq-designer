import type { DesignDocument } from '@/design/types'
import { getGarment } from '@/garments/registry'
import { Button, SegmentedControl } from '@/ui'
import { useEffect, useState } from 'react'
import { PreviewStage } from './PreviewStage'

interface PreviewOverlayProps {
  document: DesignDocument
  onClose: () => void
}

export function PreviewOverlay({ document, onClose }: PreviewOverlayProps) {
  const [viewId, setViewId] = useState(document.activeView)
  const garment = getGarment(document.garmentType)

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
    <div className="absolute inset-0 z-40 flex flex-col bg-[#0a0c10]">
      <div className="flex h-12 items-center justify-between gap-3 px-4">
        <div className="flex min-w-0 items-center gap-3">
          <Button onClick={onClose} aria-label="Back">
            Back
          </Button>
          <div className="min-w-0">
            <div className="truncate text-[13px] font-medium text-ink">{document.name}</div>
            <div className="text-[10px] uppercase tracking-[0.14em] text-mute">
              {garment.name}
            </div>
          </div>
        </div>
        <SegmentedControl
          className="w-auto shrink-0"
          value={viewId}
          options={document.views.map((view) => ({ value: view.id, label: view.label }))}
          onChange={setViewId}
        />
        <Button onClick={onClose}>Close</Button>
      </div>
      <div
        className="flex flex-1 items-center justify-center overflow-auto p-10"
        data-preview-overlay="true"
      >
        <PreviewStage document={document} viewId={viewId} />
      </div>
    </div>
  )
}
