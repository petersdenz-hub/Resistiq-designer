import { getGarment } from '../registry'
import type { GarmentRenderProps } from '../types'

/**
 * Single entry for drawing a garment. The editor asks the registry what
 * garment this is, then that definition supplies its renderer.
 */
export function GarmentRenderer({
  garmentType,
  viewId,
  bodyColor,
  panelColors,
}: GarmentRenderProps & { garmentType: string }) {
  const garment = getGarment(garmentType)
  return (
    <g data-garment-type={garment.id} data-garment-view={viewId}>
      {garment.render({ viewId, bodyColor, panelColors })}
    </g>
  )
}
