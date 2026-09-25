import { isLockedElement } from '@/design/types'
import { defaultPanelIdForZone } from '@/design/designObjects'
import {
  getBodyColor,
  getDesignObjectsInZone,
  getElementsInView,
  getPanelColorMap,
  getPanelMaterialMap,
  getResolvedConstruction,
  getSafeAreasInView,
  resolveActiveZone,
} from '@/design/selectors'
import { objectClipPaths } from '@/design/objectClip'
import { getArtworkPanelBounds, paintDesignObject, zoneForPanel } from '@/design/objectPlacement'
import { collectSnapGuideBoxes, objectIdsInMarquee, unionBoxes } from '@/design/objectEditing'
import { useDesign } from '@/design/useDesign'
import { getGarment } from '@/garments/registry'
import { getPanelsForView } from '@/garments/coordinates'
import { GarmentRenderer } from '@/garments/render/GarmentRenderer'
import { PanelGuides } from '@/garments/render/PanelGuides'
import { useCanvasEditor } from '@/studio/canvasEditorContext'
import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { AlignmentGuides } from './AlignmentGuides'
import { CanvasGrid } from './CanvasGrid'
import { DesignElements } from './DesignElements'
import { DesignObjectLayer } from './DesignObjectLayer'
import { toCanvasElement } from './project'
import { TransformControls } from './TransformControls'
import { applyPreview, useElementGesture } from './useElementGesture'
import { applyObjectPreview, useDesignObjectGesture } from './useDesignObjectGesture'
import { ZoneSurfaceOverlay } from './ZoneSurfaceOverlay'
import { clientToSvgPoint } from './geometry'

interface StageViewportProps {
  zoom: number
}

interface MarqueeState {
  startX: number
  startY: number
  x: number
  y: number
  width: number
  height: number
  panelId?: string
}

export function StageViewport({ zoom }: StageViewportProps) {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const marqueeRef = useRef<MarqueeState | null>(null)
  const [marquee, setMarquee] = useState<MarqueeState | null>(null)
  const {
    document,
    selectedElement,
    selectedElementId,
    selectedObjectId,
    selectedObjectIds,
    selectElement,
    selectObject,
    selectObjects,
    setActivePanel,
    setActiveZone,
    updateElementById,
    applyDocument,
    commitGesture,
  } = useDesign()
  const { gridVisible, gridSize, snapToGrid, showPrintArea, showSafeAreas, showGuides } = useCanvasEditor()

  const garment = getGarment(document.garmentType)
  const viewPanels = getPanelsForView(garment, document.activeView)
  const zone = resolveActiveZone(document)
  const objects = getDesignObjectsInZone(document, zone)
  const elements = getElementsInView(document, document.activeView).map((element) =>
    toCanvasElement(document, element),
  )
  const selectedDisplay = selectedElement
    ? toCanvasElement(document, selectedElement)
    : null
  const gesture = useElementGesture(svgRef, {
    document,
    updateElementById,
    commitGesture,
  })
  const objectGesture = useDesignObjectGesture(svgRef, {
    document,
    snapToGrid,
    gridSize,
    applyDocument,
    commitGesture,
  })

  const paintedObjects = objects.map((object) =>
    applyObjectPreview(paintDesignObject(document, object), objectGesture.preview),
  )
  const clipPaths = Object.fromEntries(
    objects
      .map((object) => {
        const paths = objectClipPaths(document, object)
        return paths.length > 0 ? [object.id, paths] : null
      })
      .filter((entry): entry is [string, string[]] => Boolean(entry)),
  )
  const selectedPainted = paintedObjects.filter((object) => selectedObjectIds.includes(object.id))
  const union = unionBoxes(selectedPainted.map((object) => ({
    x: object.x,
    y: object.y,
    width: object.width,
    height: object.height,
  })))
  const unlockedSelected = selectedPainted.filter((object) => !object.locked)
  const panelBounds = getArtworkPanelBounds(document, defaultPanelIdForZone(document, zone))
  const snapBoxes = collectSnapGuideBoxes(document, zone)

  const width = garment.viewBox.width * zoom
  const height = garment.viewBox.height * zoom

  function beginEmptyGesture(event: ReactPointerEvent<SVGElement>, panelId?: string) {
    const svg = svgRef.current
    if (!svg || event.shiftKey) {
      return
    }
    const pointer = clientToSvgPoint(svg, event.clientX, event.clientY)
    const next = {
      startX: pointer.x,
      startY: pointer.y,
      x: pointer.x,
      y: pointer.y,
      width: 0,
      height: 0,
      panelId,
    }
    marqueeRef.current = next
    setMarquee(next)

    const onMove = (moveEvent: PointerEvent) => {
      const current = marqueeRef.current
      if (!current) {
        return
      }
      const point = clientToSvgPoint(svg, moveEvent.clientX, moveEvent.clientY)
      const box = {
        ...current,
        x: Math.min(current.startX, point.x),
        y: Math.min(current.startY, point.y),
        width: Math.abs(point.x - current.startX),
        height: Math.abs(point.y - current.startY),
      }
      marqueeRef.current = box
      setMarquee(box)
    }

    const onUp = () => {
      const current = marqueeRef.current
      marqueeRef.current = null
      setMarquee(null)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      if (!current) {
        return
      }
      if (current.width > 4 || current.height > 4) {
        selectObjects(objectIdsInMarquee(document, zone, current))
        return
      }
      selectElement(null)
      selectObjects([])
      if (current.panelId) {
        setActivePanel(current.panelId)
      }
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
  }

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      viewBox={`0 0 ${garment.viewBox.width} ${garment.viewBox.height}`}
      id="design-stage"
      data-design-canvas="true"
      data-placement-zone={zone}
      data-grid-visible={gridVisible ? 'true' : 'false'}
      data-snap-enabled={snapToGrid ? 'true' : 'false'}
      data-selected-count={selectedObjectIds.length}
      className="overflow-visible"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) {
          beginEmptyGesture(event)
        }
      }}
    >
      <rect
        width={garment.viewBox.width}
        height={garment.viewBox.height}
        fill="transparent"
        onPointerDown={(event) => {
          beginEmptyGesture(event)
        }}
      />

      <GarmentRenderer
        garmentType={document.garmentType}
        viewId={document.activeView}
        panelId={document.activePanelId}
        bodyColor={getBodyColor(document)}
        panelColors={getPanelColorMap(document)}
        panelMaterials={getPanelMaterialMap(document)}
        construction={getResolvedConstruction(document)}
      />

      <CanvasGrid
        width={garment.viewBox.width}
        height={garment.viewBox.height}
        size={gridSize}
        zoom={zoom}
        visible={gridVisible}
      />

      <PanelGuides
        garmentType={document.garmentType}
        panels={viewPanels}
        safeAreas={getSafeAreasInView(document, document.activeView)}
        activePanelId={document.activePanelId}
        showPrintArea={showPrintArea}
        showSafeAreas={showSafeAreas}
        showGuides={showGuides}
        selectionKind={selectedElementId || selectedObjectId ? 'element' : 'panel'}
        onSelectPanel={(panelId) => {
          selectObjects([])
          setActivePanel(panelId)
          setActiveZone(zoneForPanel(panelId, zone, document.activeView))
        }}
        onSelectZone={(panelId) => {
          selectObjects([])
          setActivePanel(panelId)
          setActiveZone(zoneForPanel(panelId, zone, document.activeView))
        }}
        onPanelPointerDown={(panelId, event) => {
          beginEmptyGesture(event, panelId)
        }}
      />

      <DesignElements
        elements={elements.map((element) => applyPreview(element, gesture.preview))}
        selectedElementId={selectedElementId}
        onSelect={selectElement}
        onMoveStart={gesture.startMove}
      />

      {showGuides ? <ZoneSurfaceOverlay document={document} zone={zone} /> : null}

      <DesignObjectLayer
        objects={paintedObjects}
        selectedObjectIds={selectedObjectIds}
        clipEnabled
        clipPaths={clipPaths}
        onSelect={(objectId, event) => {
          selectObject(objectId, { toggle: event.shiftKey, expandGroup: true })
        }}
        onMoveStart={(objectId, event) => {
          if (event.shiftKey) {
            return
          }
          const ids = selectedObjectIds.includes(objectId) ? selectedObjectIds : [objectId]
          objectGesture.startMove(objectId, ids, event)
        }}
      />

      {selectedPainted.length > 1
        ? selectedPainted.map((object) => (
            <rect
              key={`bound-${object.id}`}
              data-object-bounds={object.id}
              x={object.x}
              y={object.y}
              width={object.width}
              height={object.height}
              fill="none"
              stroke="#c9a36a"
              strokeWidth={0.9 / zoom}
              strokeDasharray={`${3 / zoom} ${2 / zoom}`}
              opacity="0.7"
              pointerEvents="none"
            />
          ))
        : null}

      <AlignmentGuides
        moving={
          objectGesture.preview && union
            ? { ...union, x: union.x, y: union.y, width: union.width, height: union.height }
            : null
        }
        others={paintedObjects.filter((object) => !selectedObjectIds.includes(object.id))}
        panels={snapBoxes.length > 0 ? snapBoxes : panelBounds ? [panelBounds] : []}
        canvas={garment.viewBox}
        zoom={zoom}
        guides={objectGesture.guides}
      />

      {marquee && (marquee.width > 2 || marquee.height > 2) ? (
        <rect
          data-selection-marquee="true"
          x={marquee.x}
          y={marquee.y}
          width={marquee.width}
          height={marquee.height}
          fill="rgba(201,163,106,0.12)"
          stroke="#c9a36a"
          strokeWidth={1 / zoom}
          strokeDasharray={`${4 / zoom} ${3 / zoom}`}
          pointerEvents="none"
        />
      ) : null}

      {unlockedSelected.length > 0 && union ? (
        <TransformControls
          element={{
            id: unlockedSelected.length === 1 ? unlockedSelected[0].id : 'selection',
            x: union.x,
            y: union.y,
            width: union.width,
            height: union.height,
            rotation: unlockedSelected.length === 1 ? unlockedSelected[0].rotation : 0,
          }}
          zoom={zoom}
          onResizeStart={(handle, event) =>
            objectGesture.startResize(unlockedSelected.map((object) => object.id), handle, event)
          }
          onRotateStart={(event) =>
            objectGesture.startRotate(unlockedSelected.map((object) => object.id), event)
          }
        />
      ) : selectedPainted.length > 0 && selectedPainted.every((object) => object.locked) && union ? (
        <g data-editor-chrome="true" pointerEvents="none">
          <rect
            data-multi-selection="true"
            x={union.x}
            y={union.y}
            width={union.width}
            height={union.height}
            fill="none"
            stroke="#c9a36a"
            strokeWidth={1.25 / zoom}
            strokeDasharray={`${4 / zoom} ${3 / zoom}`}
          />
        </g>
      ) : selectedDisplay &&
        viewPanels.some((panel) => panel.id === selectedDisplay.panelId) &&
        !isLockedElement(selectedDisplay) ? (
        <TransformControls
          element={applyPreview(selectedDisplay, gesture.preview)}
          zoom={zoom}
          onResizeStart={(handle, event) =>
            gesture.startResize(selectedDisplay.id, handle, event)
          }
          onRotateStart={(event) => gesture.startRotate(selectedDisplay.id, event)}
        />
      ) : selectedDisplay &&
        viewPanels.some((panel) => panel.id === selectedDisplay.panelId) &&
        isLockedElement(selectedDisplay) ? (
        <g
          data-editor-chrome="true"
          transform={`rotate(${selectedDisplay.rotation} ${selectedDisplay.x + selectedDisplay.width / 2} ${selectedDisplay.y + selectedDisplay.height / 2})`}
          pointerEvents="none"
        >
          <rect
            x={selectedDisplay.x}
            y={selectedDisplay.y}
            width={selectedDisplay.width}
            height={selectedDisplay.height}
            fill="none"
            stroke="#c9a36a"
            strokeWidth={1.25 / zoom}
            strokeDasharray={`${4 / zoom} ${3 / zoom}`}
          />
        </g>
      ) : null}

      {unlockedSelected.length > 1 && union ? (
        <rect
          data-multi-selection="true"
          x={union.x}
          y={union.y}
          width={union.width}
          height={union.height}
          fill="none"
          pointerEvents="none"
        />
      ) : null}
    </svg>
  )
}
