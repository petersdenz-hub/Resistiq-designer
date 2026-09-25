import { DesignElements } from '@/canvas/DesignElements'
import { DesignObjectLayer } from '@/canvas/DesignObjectLayer'
import { toCanvasElement } from '@/canvas/project'
import { defaultZoneForView, getDesignObjectsInZone } from '@/design/designObjects'
import { objectClipBox } from '@/design/objectClip'
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
  const sourceObjects = getDesignObjectsInZone(document, defaultZoneForView(viewId))
  const objects = sourceObjects.map((object) => paintDesignObject(document, object))
  const clipBoxes = Object.fromEntries(
    sourceObjects
      .map((object) => {
        const box = objectClipBox(document, object)
        return box ? [object.id, box] : null
      })
      .filter((entry): entry is [string, NonNullable<ReturnType<typeof objectClipBox>>] => Boolean(entry)),
  )

  const bodyColor = getBodyColor(document)

  return (
    <svg
      width={garment.viewBox.width * zoom}
      height={garment.viewBox.height * zoom}
      viewBox={`0 0 ${garment.viewBox.width} ${garment.viewBox.height}`}
      data-preview-stage="true"
      data-garment-type={document.garmentType}
      data-garment-color={bodyColor}
      data-preview-view={viewId}
      data-preview-seams="true"
      data-preview-folds="true"
      data-preview-construction="true"
      data-preview-artwork={String(objects.length)}
      data-preview-handles="false"
      data-preview-guides="false"
      data-preview-print-area="false"
      data-preview-safe-area="false"
    >
      <GarmentRenderer
        garmentType={document.garmentType}
        viewId={viewId}
        panelId={document.activePanelId}
        bodyColor={bodyColor}
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
        clipEnabled
        clipBoxes={clipBoxes}
        onSelect={() => undefined}
        onMoveStart={() => undefined}
      />
    </svg>
  )
}
