import { getBodyColor, getElementsInView } from '@/design/selectors'
import { useDesign } from '@/design/useDesign'
import { getGarment } from '@/garments/registry'
import { useRef } from 'react'
import { DesignElements } from './DesignElements'
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
    updateElementById,
    commitGesture,
  } = useDesign()

  const garment = getGarment(document.garmentType)
  const printArea = garment.printArea[document.activeView]
  const elements = getElementsInView(document, document.activeView)
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

      {garment.render({
        viewId: document.activeView,
        bodyColor: getBodyColor(document),
      })}

      {printArea ? (
        <rect
          x={printArea.x}
          y={printArea.y}
          width={printArea.width}
          height={printArea.height}
          fill="none"
          stroke="rgba(238,240,244,0.22)"
          strokeDasharray="5 4"
          strokeWidth="1"
          pointerEvents="none"
        />
      ) : null}

      <DesignElements
        elements={elements.map((element) => applyPreview(element, gesture.preview))}
        selectedElementId={selectedElementId}
        onSelect={selectElement}
        onMoveStart={gesture.startMove}
      />

      {selectedElement && selectedElement.viewId === document.activeView ? (
        <TransformControls
          element={applyPreview(selectedElement, gesture.preview)}
          zoom={zoom}
          onResizeStart={(handle, event) =>
            gesture.startResize(selectedElement.id, handle, event)
          }
          onRotateStart={(event) => gesture.startRotate(selectedElement.id, event)}
        />
      ) : null}
    </svg>
  )
}
