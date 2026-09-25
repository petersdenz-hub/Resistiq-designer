import { DesignElements } from '@/canvas/DesignElements'
import { DesignObjectLayer } from '@/canvas/DesignObjectLayer'
import { toCanvasElement } from '@/canvas/project'
import { defaultZoneForView, getDesignObjectsInZone } from '@/design/designObjects'
import { paintDesignObject } from '@/design/objectPlacement'
import {
  getBodyColor,
  getElementsInView,
  getPanelColorMap,
  getResolvedConstruction,
} from '@/design/selectors'
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
  const objects = getDesignObjectsInZone(document, defaultZoneForView(viewId)).map((object) =>
    paintDesignObject(document, object),
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
        panelId={document.activePanelId}
        bodyColor={getBodyColor(document)}
        panelColors={getPanelColorMap(document)}
        construction={getResolvedConstruction(document)}
      />
      <DesignElements
        elements={elements}
        selectedElementId={null}
        interactive={false}
        onSelect={() => undefined}
        onMoveStart={() => undefined}
      />
      <DesignObjectLayer
        objects={objects}
        selectedObjectId={null}
        onSelect={() => undefined}
        onMoveStart={() => undefined}
      />
    </svg>
  )
}
