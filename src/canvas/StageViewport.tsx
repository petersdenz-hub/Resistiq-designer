import { isLockedElement } from '@/design/types'
import {
  getBodyColor,
  getDesignObjectsInZone,
  getElementsInView,
  getPanelColorMap,
  getResolvedConstruction,
  getSafeAreasInView,
  resolveActiveZone,
} from '@/design/selectors'
import { useDesign } from '@/design/useDesign'
import { getGarment } from '@/garments/registry'
import { getPanelsForView } from '@/garments/coordinates'
import { GarmentRenderer } from '@/garments/render/GarmentRenderer'
import { PanelGuides } from '@/garments/render/PanelGuides'
import { useCanvasEditor } from '@/studio/canvasEditorContext'
import { useRef } from 'react'
import { AlignmentGuides } from './AlignmentGuides'
import { CanvasGrid } from './CanvasGrid'
import { DesignElements } from './DesignElements'
import { DesignObjectLayer } from './DesignObjectLayer'
import { toCanvasElement } from './project'
import { TransformControls } from './TransformControls'
import { applyPreview, useElementGesture } from './useElementGesture'
import { applyObjectPreview, useDesignObjectGesture } from './useDesignObjectGesture'

interface StageViewportProps {
  zoom: number
  showSafeAreas: boolean
}

export function StageViewport({ zoom, showSafeAreas }: StageViewportProps) {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const {
    document,
    selectedElement,
    selectedElementId,
    selectedObject,
    selectedObjectId,
    selectElement,
    selectObject,
    setActivePanel,
    updateElementById,
    updateObjectById,
    commitGesture,
  } = useDesign()
  const { gridVisible, gridSize, snapToGrid } = useCanvasEditor()

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
    updateObjectById,
    commitGesture,
  })

  const paintedObjects = objects.map((object) => applyObjectPreview(object, objectGesture.preview))
  const selectedPainted =
    selectedObject && selectedObject.zone === zone
      ? applyObjectPreview(selectedObject, objectGesture.preview)
      : null

  const width = garment.viewBox.width * zoom
  const height = garment.viewBox.height * zoom

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
      className="overflow-visible"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) {
          selectElement(null)
          selectObject(null)
        }
      }}
    >
      <rect
        width={garment.viewBox.width}
        height={garment.viewBox.height}
        fill="transparent"
        onPointerDown={() => {
          selectElement(null)
          selectObject(null)
        }}
      />

      <GarmentRenderer
        garmentType={document.garmentType}
        viewId={document.activeView}
        bodyColor={getBodyColor(document)}
        panelColors={getPanelColorMap(document)}
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
        panels={viewPanels}
        safeAreas={getSafeAreasInView(document, document.activeView)}
        activePanelId={document.activePanelId}
        showSafeAreas={showSafeAreas}
        selectionKind={selectedElementId || selectedObjectId ? 'element' : 'panel'}
        onSelectPanel={(panelId) => {
          selectObject(null)
          setActivePanel(panelId)
        }}
      />

      <DesignElements
        elements={elements.map((element) => applyPreview(element, gesture.preview))}
        selectedElementId={selectedElementId}
        onSelect={selectElement}
        onMoveStart={gesture.startMove}
      />

      <DesignObjectLayer
        objects={paintedObjects}
        selectedObjectId={selectedObjectId}
        onSelect={selectObject}
        onMoveStart={objectGesture.startMove}
      />

      <AlignmentGuides
        moving={objectGesture.preview && selectedPainted ? selectedPainted : null}
        others={paintedObjects.filter((object) => object.id !== selectedObjectId)}
        canvas={garment.viewBox}
        zoom={zoom}
      />

      {selectedPainted && !selectedPainted.locked ? (
        <TransformControls
          element={selectedPainted}
          zoom={zoom}
          onResizeStart={(handle, event) =>
            objectGesture.startResize(selectedPainted.id, handle, event)
          }
          onRotateStart={(event) => objectGesture.startRotate(selectedPainted.id, event)}
        />
      ) : selectedPainted && selectedPainted.locked ? (
        <g
          data-editor-chrome="true"
          transform={`rotate(${selectedPainted.rotation} ${selectedPainted.x + selectedPainted.width / 2} ${selectedPainted.y + selectedPainted.height / 2})`}
          pointerEvents="none"
        >
          <rect
            x={selectedPainted.x}
            y={selectedPainted.y}
            width={selectedPainted.width}
            height={selectedPainted.height}
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
    </svg>
  )
}
