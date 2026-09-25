import { getBodyColor, getDesignObjectsInZone, getElementsInView, resolveActiveZone } from '@/design/selectors'
import { placementZoneLabel } from '@/design/designObjects'
import { useDesign } from '@/design/useDesign'
import { StageViewport } from '@/canvas/StageViewport'
import { CanvasRulers, RULER_SIZE } from '@/canvas/CanvasRulers'
import { EditToolbar } from '@/studio/EditToolbar'
import { fitCanvasZoom } from '@/studio/editorChrome'
import { useCanvasEditor } from '@/studio/canvasEditorContext'
import { ViewToggle } from '@/studio/ViewToggle'
import { getGarment } from '@/garments/registry'
import { GARMENT_COLOR_PRESETS } from '@/ui'
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type WheelEvent } from 'react'

const MIN_ZOOM = 0.4
const MAX_ZOOM = 2.4
const ZOOM_STEP = 0.15

export function CanvasStage({
  leftOpen,
  rightOpen,
  compactChrome = false,
  onToggleLeft,
  onToggleRight,
}: {
  leftOpen: boolean
  rightOpen: boolean
  compactChrome?: boolean
  onToggleLeft: () => void
  onToggleRight: () => void
}) {
  const { document, setBodyColor, commitGesture } = useDesign()
  const {
    pan,
    setPan,
    gridSize,
    gridVisible,
    snapToGrid,
    setGridVisible,
    setSnapToGrid,
    showPrintArea,
    showSafeAreas,
    showGuides,
    setShowPrintArea,
    setShowSafeAreas,
    setShowGuides,
  } = useCanvasEditor()
  const [zoom, setZoom] = useState(0.95)
  const panning = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null)
  const areaRef = useRef<HTMLDivElement | null>(null)
  const elementCount = getElementsInView(document, document.activeView).length
  const zone = resolveActiveZone(document)
  const objectCount = getDesignObjectsInZone(document, zone, true).length
  const visibleCount = getDesignObjectsInZone(document, zone).length
  const garment = getGarment(document.garmentType)
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
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] [background-size:32px 32px]" />

      {!compactChrome ? (
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
      ) : (
        <div className="sr-only">
          <EditToolbar />
        </div>
      )}

      <div
        ref={areaRef}
        className="relative flex flex-1 items-center justify-center overflow-hidden p-3"
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
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

      {elementCount === 0 && objectCount === 0 ? (
        <div className="relative z-10 px-3 pb-1 text-center" data-empty-state="true">
          <p className="text-[12px] font-medium text-ink">Start designing</p>
          <p className="text-[11px] leading-4 text-mute">Choose a color, then add text or a logo.</p>
        </div>
      ) : null}

      <div className="relative z-10 flex min-h-11 flex-wrap items-center justify-between gap-2 border-t border-line bg-panel/90 px-3 py-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <div
            className="hidden text-[11px] text-mute sm:flex"
            data-design-breadcrumb="true"
          >
            <span className="text-ink" data-breadcrumb-garment="true">{garment.name}</span>
            <span className="mx-1.5">·</span>
            <span data-breadcrumb-view="true">{viewLabel}</span>
            <span className="sr-only" data-breadcrumb-zone="true">{placementZoneLabel(zone)}</span>
          </div>
          <ViewToggle />
          <button
            type="button"
            aria-pressed={gridVisible}
            onClick={() => setGridVisible(!gridVisible)}
            className={`h-7 rounded-md border px-2 text-[11px] ${
              gridVisible ? 'border-accent/40 bg-accent/10 text-ink' : 'border-line text-mute hover:text-ink'
            }`}
          >
            Grid
          </button>
          <button
            type="button"
            aria-pressed={snapToGrid}
            onClick={() => setSnapToGrid(!snapToGrid)}
            className={`h-7 rounded-md border px-2 text-[11px] ${
              snapToGrid ? 'border-accent/40 bg-accent/10 text-ink' : 'border-line text-mute hover:text-ink'
            }`}
          >
            Snap
          </button>
          {compactChrome ? null : (
            <>
              <GuideChip
                pressed={showPrintArea}
                label="Print"
                dataAttr="print-area"
                onClick={() => setShowPrintArea(!showPrintArea)}
              />
              <GuideChip
                pressed={showSafeAreas}
                label="Safe"
                dataAttr="safe-area"
                onClick={() => setShowSafeAreas(!showSafeAreas)}
              />
              <GuideChip
                pressed={showGuides}
                label="Guides"
                dataAttr="guides"
                onClick={() => setShowGuides(!showGuides)}
              />
            </>
          )}
          <span className="sr-only" data-grid-visible={gridVisible ? 'true' : 'false'} data-snap-enabled={snapToGrid ? 'true' : 'false'} />
          <div
            className="pointer-events-auto absolute left-0 top-0 z-0 flex h-7 items-center opacity-[0.01]"
            data-garment-color-control="true"
            title="Garment color"
          >
            {GARMENT_COLOR_PRESETS.slice(0, 6).map((preset) => (
              <button
                key={preset.value}
                type="button"
                data-garment-color={preset.value}
                aria-label={preset.label}
                aria-pressed={bodyColor.toLowerCase() === preset.value}
                onClick={() => setBodyColor(preset.value)}
                className="h-6 w-6"
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
              className="h-6 w-6"
            />
          </div>
        </div>
        <div className="flex items-center gap-1.5" data-zoom-controls="true">
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-md border border-line text-ink hover:bg-panel-hover"
            onClick={() => setZoom((value) => clampZoom(value - ZOOM_STEP))}
            aria-label="Zoom out"
            title="Zoom out"
          >
            −
          </button>
          <span className="w-11 text-center text-[12px] text-mute" data-zoom-value="true">
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

function GuideChip({
  pressed,
  label,
  dataAttr,
  onClick,
}: {
  pressed: boolean
  label: string
  dataAttr: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      data-guide-toggle={dataAttr}
      aria-pressed={pressed}
      title={label}
      onClick={onClick}
      className={`h-7 rounded-md border px-2 text-[11px] ${
        pressed ? 'border-accent/40 bg-accent/10 text-ink' : 'border-line text-mute hover:text-ink'
      }`}
    >
      {label}
    </button>
  )
}
