import { getBodyColor, getElementsInView } from '@/design/selectors'
import { useDesign } from '@/design/useDesign'
import { getGarment } from '@/garments/registry'
import { getPanelsForView } from '@/garments/coordinates'
import { GarmentRenderer } from '@/garments/render/GarmentRenderer'
import { PanelGuides } from '@/garments/render/PanelGuides'
import { useRef } from 'react'
import { DesignElements } from './DesignElements'
import { toCanvasElement } from './project'
import { TransformControls } from './TransformControls'
import { applyPreview, useElementGesture } from './useElementGesture'

interface StageViewportProps {
  zoom: number
}

export function StageViewport({ zoom }: StageViewportProps) {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const {
    document,
    selectedElement,
    selectedElementId,
    selectElement,
    setActivePanel,
    updateElementById,
    commitGesture,
  } = useDesign()

  const garment = getGarment(document.garmentType)
  const viewPanels = getPanelsForView(garment, document.activeView)
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

  const width = garment.viewBox.width * zoom
  const height = garment.viewBox.height * zoom

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      viewBox={`0 0 ${garment.viewBox.width} ${garment.viewBox.height}`}
      className="overflow-visible"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) {
          selectElement(null)
        }
      }}
    >
      <rect
        width={garment.viewBox.width}
        height={garment.viewBox.height}
        fill="transparent"
        onPointerDown={() => selectElement(null)}
      />

      <GarmentRenderer
        garmentType={document.garmentType}
        viewId={document.activeView}
        bodyColor={getBodyColor(document)}
      />

      <PanelGuides
        panels={viewPanels}
        activePanelId={document.activePanelId}
        onSelectPanel={(panelId) => {
          selectElement(null)
          setActivePanel(panelId)
        }}
      />

      <DesignElements
        elements={elements.map((element) => applyPreview(element, gesture.preview))}
        selectedElementId={selectedElementId}
        onSelect={selectElement}
        onMoveStart={gesture.startMove}
      />

      {selectedDisplay && viewPanels.some((panel) => panel.id === selectedDisplay.panelId) ? (
        <TransformControls
          element={applyPreview(selectedDisplay, gesture.preview)}
          zoom={zoom}
          onResizeStart={(handle, event) =>
            gesture.startResize(selectedDisplay.id, handle, event)
          }
          onRotateStart={(event) => gesture.startRotate(selectedDisplay.id, event)}
        />
      ) : null}
    </svg>
  )
}
