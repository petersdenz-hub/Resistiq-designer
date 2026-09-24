import { DesignElements } from '@/canvas/DesignElements'
import { toCanvasElement } from '@/canvas/project'
import { getBodyColor, getElementsInView } from '@/design/selectors'
import type { DesignDocument } from '@/design/types'
import { getGarment } from '@/garments/registry'
import { GarmentRenderer } from '@/garments/render/GarmentRenderer'

interface PreviewStageProps {
  document: DesignDocument
  viewId: string
  zoom?: number
}

export function PreviewStage({ document, viewId, zoom = 0.85 }: PreviewStageProps) {
  const garment = getGarment(document.garmentType)
  const elements = getElementsInView(document, viewId).map((element) =>
    toCanvasElement(document, element),
  )

  return (
    <svg
      width={garment.viewBox.width * zoom}
      height={garment.viewBox.height * zoom}
      viewBox={`0 0 ${garment.viewBox.width} ${garment.viewBox.height}`}
    >
      <GarmentRenderer
        garmentType={document.garmentType}
        viewId={viewId}
        bodyColor={getBodyColor(document)}
      />
      <DesignElements
        elements={elements}
        selectedElementId={null}
        interactive={false}
        onSelect={() => undefined}
        onMoveStart={() => undefined}
      />
    </svg>
  )
}
