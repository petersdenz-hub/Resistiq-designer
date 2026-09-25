import { getBodyColor, getDesignObjectsInZone, getElementsInView, resolveActiveZone } from '@/design/selectors'
import { placementZoneLabel, zonesForGarment } from '@/design/designObjects'
import { useDesign } from '@/design/useDesign'
import { StageViewport } from '@/canvas/StageViewport'
import { CanvasRulers, RULER_SIZE } from '@/canvas/CanvasRulers'
import { EditToolbar } from '@/studio/EditToolbar'
import { fitCanvasZoom } from '@/studio/editorChrome'
import { useCanvasEditor } from '@/studio/canvasEditorContext'
import { getGarment } from '@/garments/registry'
import { GARMENT_COLOR_PRESETS } from '@/ui'
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type WheelEvent } from 'react'

const MIN_ZOOM = 0.4
const MAX_ZOOM = 2.4
const ZOOM_STEP = 0.15

export function CanvasStage({
  leftOpen,
  rightOpen,
  onToggleLeft,
  onToggleRight,
}: {
  leftOpen: boolean
  rightOpen: boolean
  onToggleLeft: () => void
  onToggleRight: () => void
}) {
  const { document, setActiveView, setActiveZone, setBodyColor, commitGesture } = useDesign()
  const {
    pan,
    setPan,
    gridSize,
    gridVisible,
    snapToGrid,
  } = useCanvasEditor()
  const [zoom, setZoom] = useState(0.95)
  const panning = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null)
  const areaRef = useRef<HTMLDivElement | null>(null)
  const elementCount = getElementsInView(document, document.activeView).length
  const zone = resolveActiveZone(document)
  const objectCount = getDesignObjectsInZone(document, zone, true).length
  const visibleCount = getDesignObjectsInZone(document, zone).length
  const garment = getGarment(document.garmentType)
  const garmentZones = zonesForGarment(document.garmentType)
  const viewLabel = document.views.find((view) => view.id === document.activeView)?.label ?? document.activeView
  const bodyColor = getBodyColor(document)
  const colorOrigin = useRef(document)

  function clampZoom(value: number) {
    return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number(value.toFixed(2))))
  }

  function fitGarment() {
    const area = areaRef.current
    if (!area) {
      return
    }
    setZoom(
      fitCanvasZoom(garment.viewBox, {
        width: area.clientWidth,
        height: area.clientHeight,
      }),
    )
    setPan({ x: 0, y: 0 })
  }

  useEffect(() => {
    const area = areaRef.current
    if (!area) {
      return
    }
    setZoom(
      fitCanvasZoom(garment.viewBox, {
        width: area.clientWidth,
        height: area.clientHeight,
      }),
    )
    setPan({ x: 0, y: 0 })
  }, [document.garmentType, garment.viewBox, leftOpen, rightOpen, setPan])

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
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:32px 32px]" />

      <div className="relative z-10 flex items-center gap-2 px-3 pt-2">
        <button
          type="button"
          title={leftOpen ? 'Hide tools' : 'Show tools'}
          aria-label={leftOpen ? 'Hide tools' : 'Show tools'}
          onClick={onToggleLeft}
          className="flex h-7 w-7 items-center justify-center rounded-md border border-line text-[11px] text-mute hover:text-ink"
        >
          {leftOpen ? '‹' : '›'}
        </button>
        <div className="min-w-0 flex-1">
          <EditToolbar />
        </div>
        <button
          type="button"
          title={rightOpen ? 'Hide properties' : 'Show properties'}
          aria-label={rightOpen ? 'Hide properties' : 'Show properties'}
          onClick={onToggleRight}
          className="flex h-7 w-7 items-center justify-center rounded-md border border-line text-[11px] text-mute hover:text-ink"
        >
          {rightOpen ? '›' : '‹'}
        </button>
      </div>

      <div
        ref={areaRef}
        className="relative flex flex-1 items-center justify-center overflow-hidden p-4"
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {elementCount === 0 && objectCount === 0 ? (
          <div
            className="pointer-events-none absolute left-1/2 top-3 z-10 w-[18rem] -translate-x-1/2 rounded-md border border-line/80 bg-panel/80 px-3 py-2 text-center backdrop-blur-sm"
            data-empty-state="true"
          >
            <p className="text-[13px] font-medium text-ink">Start designing</p>
            <p className="mt-1 text-[12px] leading-5 text-mute">
              Choose a garment color, then add text or a logo.
            </p>
          </div>
        ) : null}
        <div className="relative" style={{ transform: `translate(${pan.x}px, ${pan.y}px)` }}>
          <div className="relative" style={{ paddingLeft: RULER_SIZE, paddingTop: RULER_SIZE }}>
            <CanvasRulers
              width={garment.viewBox.width}
              height={garment.viewBox.height}
              zoom={zoom}
              gridSize={gridSize}
            />
            <StageViewport zoom={zoom} />
          </div>
        </div>
      </div>

      <div className="relative flex min-h-12 flex-wrap items-center justify-between gap-2 border-t border-line bg-panel/90 px-3 py-2">
        <div className="flex flex-wrap items-center gap-2">
          <div
            className="flex items-center gap-1.5 text-[11px] text-mute"
            data-design-breadcrumb="true"
          >
            <span className="text-ink" data-breadcrumb-garment="true">{garment.name}</span>
            <span aria-hidden="true" className="text-mute">·</span>
            <span data-breadcrumb-view="true">{viewLabel}</span>
            <span className="sr-only" data-breadcrumb-zone="true">{placementZoneLabel(zone)}</span>
          </div>
          <div className="flex rounded-md border border-line p-0.5">
            {document.views.map((view) => (
              <button
                key={view.id}
                type="button"
                data-garment-view={view.id}
                aria-pressed={document.activeView === view.id}
                onClick={() => setActiveView(view.id)}
                className={`h-7 rounded px-2 text-[11px] ${
                  document.activeView === view.id
                    ? 'bg-accent/15 text-ink'
                    : 'text-mute hover:text-ink'
                }`}
              >
                {view.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1">
            {garmentZones.map((item) => (
              <button
                key={item}
                type="button"
                data-zone-option={item}
                aria-pressed={item === zone}
                onClick={() => setActiveZone(item)}
                className={`h-7 rounded-md border px-2 text-[11px] ${
                  item === zone
                    ? 'border-accent/50 bg-accent/10 text-ink'
                    : 'border-line text-mute hover:text-ink'
                }`}
              >
                {placementZoneLabel(item)}
              </button>
            ))}
          </div>
          <div
            className="flex items-center gap-1"
            data-garment-color-control="true"
            title="Garment color"
          >
            {GARMENT_COLOR_PRESETS.slice(0, 6).map((preset) => (
              <button
                key={preset.value}
                type="button"
                data-garment-color={preset.value}
                aria-label={preset.label}
                title={preset.label}
                aria-pressed={bodyColor.toLowerCase() === preset.value}
                onClick={() => setBodyColor(preset.value)}
                className={`h-5 w-5 rounded-full border ${
                  bodyColor.toLowerCase() === preset.value
                    ? 'border-accent ring-1 ring-accent/50'
                    : 'border-line'
                }`}
                style={{ backgroundColor: preset.value }}
              />
            ))}
            <input
              type="color"
              data-garment-color-custom="true"
              aria-label="Custom garment color"
              value={bodyColor}
              onPointerDown={() => {
                colorOrigin.current = document
              }}
              onChange={(event) => setBodyColor(event.target.value, 'replace')}
              onBlur={() => commitGesture(colorOrigin.current)}
              className="h-5 w-5 cursor-pointer rounded-full border border-line bg-studio p-0"
            />
          </div>
          <span className="text-[10px] text-mute" data-grid-visible={gridVisible ? 'true' : 'false'} data-snap-enabled={snapToGrid ? 'true' : 'false'}>
            {gridVisible ? 'Grid' : 'No grid'}
            {snapToGrid ? ' · snap' : ''}
          </span>
        </div>
        <div className="flex items-center gap-2" data-zoom-controls="true">
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-md border border-line text-ink hover:bg-panel-hover"
            onClick={() => setZoom((value) => clampZoom(value - ZOOM_STEP))}
            aria-label="Zoom out"
            title="Zoom out"
          >
            −
          </button>
          <span className="w-12 text-center text-[12px] text-mute" data-zoom-value="true">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-md border border-line text-ink hover:bg-panel-hover"
            onClick={() => setZoom((value) => clampZoom(value + ZOOM_STEP))}
            aria-label="Zoom in"
            title="Zoom in"
          >
            +
          </button>
          <button
            type="button"
            data-zoom-fit="true"
            title="Fit garment to canvas"
            aria-label="Fit garment to canvas"
            onClick={fitGarment}
            className="h-7 rounded-md border border-line px-2 text-[11px] text-mute hover:text-ink"
          >
            Fit
          </button>
        </div>
      </div>
      <span className="sr-only" data-visible-object-count={visibleCount} />
    </section>
  )
}
