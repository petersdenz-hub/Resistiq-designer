import { getDesignObjectsInZone, getElementsInView, resolveActiveZone } from '@/design/selectors'
import { PLACEMENT_ZONE_LABELS } from '@/design/designObjects'
import { useDesign } from '@/design/useDesign'
import { StageViewport } from '@/canvas/StageViewport'
import { CanvasRulers, RULER_SIZE } from '@/canvas/CanvasRulers'
import { useCanvasEditor } from '@/studio/canvasEditorContext'
import { getGarment } from '@/garments/registry'
import { SegmentedControl } from '@/ui'
import { useRef, useState, type PointerEvent as ReactPointerEvent, type WheelEvent } from 'react'

const MIN_ZOOM = 0.4
const MAX_ZOOM = 2.4
const ZOOM_STEP = 0.15

export function CanvasStage() {
  const { document, setActiveView } = useDesign()
  const { pan, setPan, gridSize, gridVisible, snapToGrid } = useCanvasEditor()
  const [zoom, setZoom] = useState(0.9)
  const [showSafeAreas, setShowSafeAreas] = useState(true)
  const panning = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null)
  const elementCount = getElementsInView(document, document.activeView).length
  const zone = resolveActiveZone(document)
  const objectCount = getDesignObjectsInZone(document, zone, true).length
  const viewLabel = document.views.find((view) => view.id === document.activeView)?.label ?? 'Front'
  const garment = getGarment(document.garmentType)

  function clampZoom(value: number) {
    return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number(value.toFixed(2))))
  }

  function onWheel(event: WheelEvent<HTMLDivElement>) {
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault()
      setZoom((current) => clampZoom(current + (event.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP)))
    }
  }

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button === 1 || event.shiftKey) {
      event.preventDefault()
      panning.current = { x: event.clientX, y: event.clientY, panX: pan.x, panY: pan.y }
      event.currentTarget.setPointerCapture(event.pointerId)
    }
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!panning.current) {
      return
    }
    setPan({
      x: panning.current.panX + event.clientX - panning.current.x,
      y: panning.current.panY + event.clientY - panning.current.y,
    })
  }

  function onPointerUp() {
    panning.current = null
  }

  return (
    <section className="relative flex min-w-0 flex-1 flex-col bg-canvas">
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:32px_32px]" />

      <div
        className="relative flex flex-1 items-center justify-center overflow-hidden p-8"
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          className="relative"
          style={{ transform: `translate(${pan.x}px, ${pan.y}px)` }}
        >
          <div className="relative" style={{ paddingLeft: RULER_SIZE, paddingTop: RULER_SIZE }}>
            <CanvasRulers
              width={garment.viewBox.width}
              height={garment.viewBox.height}
              zoom={zoom}
              gridSize={gridSize}
            />
            <StageViewport zoom={zoom} showSafeAreas={showSafeAreas} />
          </div>
          {elementCount === 0 && objectCount === 0 ? (
            <p className="pointer-events-none absolute bottom-6 left-1/2 w-[16rem] -translate-x-1/2 text-center text-[12px] leading-5 text-mute">
              Choose a placement zone, then add text, a shape, or an image. Construction stays separate.
            </p>
          ) : null}
        </div>
      </div>

      <div className="relative flex h-14 items-center justify-between border-t border-line bg-panel/90 px-4">
        <div className="flex items-center gap-3">
          <div
            className="rounded-md border border-accent/40 bg-accent/10 px-2 py-1 text-[11px] uppercase tracking-[0.14em] text-ink"
            data-active-zone={zone}
          >
            {PLACEMENT_ZONE_LABELS[zone]}
          </div>
          <div className="text-[11px] uppercase tracking-[0.14em] text-mute">{viewLabel}</div>
          <button
            type="button"
            aria-pressed={showSafeAreas}
            onClick={() => setShowSafeAreas((value) => !value)}
            className={`h-7 rounded-md border px-2 text-[11px] ${
              showSafeAreas
                ? 'border-accent/40 bg-accent/10 text-ink'
                : 'border-line text-mute hover:text-ink'
            }`}
          >
            Safe area
          </button>
          <span className="text-[10px] text-mute" data-grid-visible={gridVisible ? 'true' : 'false'} data-snap-enabled={snapToGrid ? 'true' : 'false'}>
            {gridVisible ? 'Grid' : 'No grid'}
            {snapToGrid ? ' · snap' : ''}
          </span>
        </div>
        <SegmentedControl
          className="w-auto shrink-0"
          value={document.activeView}
          options={document.views.map((view) => ({ value: view.id, label: view.label }))}
          onChange={setActiveView}
        />
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-md border border-line text-ink hover:bg-panel-hover"
            onClick={() => setZoom((value) => clampZoom(value - ZOOM_STEP))}
            aria-label="Zoom out"
          >
            −
          </button>
          <span className="w-12 text-center text-[12px] text-mute">{Math.round(zoom * 100)}%</span>
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-md border border-line text-ink hover:bg-panel-hover"
            onClick={() => setZoom((value) => clampZoom(value + ZOOM_STEP))}
            aria-label="Zoom in"
          >
            +
          </button>
        </div>
      </div>
    </section>
  )
}
