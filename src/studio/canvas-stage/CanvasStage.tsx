import { getElementsInView } from '@/design/selectors'
import { useDesign } from '@/design/useDesign'
import { StageViewport } from '@/canvas/StageViewport'
import { SegmentedControl } from '@/ui'
import { useState } from 'react'

const MIN_ZOOM = 0.6
const MAX_ZOOM = 2
const ZOOM_STEP = 0.15

export function CanvasStage() {
  const { document, setActiveView } = useDesign()
  const [zoom, setZoom] = useState(1)
  const elementCount = getElementsInView(document, document.activeView).length
  const viewLabel = document.views.find((view) => view.id === document.activeView)?.label ?? 'Front'

  return (
    <section className="relative flex min-w-0 flex-1 flex-col bg-canvas">
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:32px_32px]" />

      <div className="relative flex flex-1 items-center justify-center overflow-auto p-8">
        <div className="relative">
          <StageViewport zoom={zoom} />
          {elementCount === 0 ? (
            <p className="pointer-events-none absolute bottom-6 left-1/2 w-[16rem] -translate-x-1/2 text-center text-[12px] leading-5 text-mute">
              Add a graphic from the left sidebar. It is stored in the Design Document, not as a flattened image.
            </p>
          ) : null}
        </div>
      </div>

      <div className="relative flex h-14 items-center justify-between border-t border-line bg-panel/90 px-4">
        <div className="text-[11px] uppercase tracking-[0.14em] text-mute">{viewLabel}</div>
        <SegmentedControl
          value={document.activeView}
          options={document.views.map((view) => ({ value: view.id, label: view.label }))}
          onChange={setActiveView}
        />
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-md border border-line text-ink hover:bg-panel-hover"
            onClick={() => setZoom((value) => Math.max(MIN_ZOOM, Number((value - ZOOM_STEP).toFixed(2))))}
            aria-label="Zoom out"
          >
            −
          </button>
          <span className="w-12 text-center text-[12px] text-mute">{Math.round(zoom * 100)}%</span>
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-md border border-line text-ink hover:bg-panel-hover"
            onClick={() => setZoom((value) => Math.min(MAX_ZOOM, Number((value + ZOOM_STEP).toFixed(2))))}
            aria-label="Zoom in"
          >
            +
          </button>
        </div>
      </div>
    </section>
  )
}
