import { getGarment } from '../registry'
import type { GarmentRenderProps } from '../types'

/**
 * Single entry for drawing a garment. The editor should not import T-shirt
 * internals. Add hoodie/jacket/pants later by registering a definition.
 */
export function GarmentRenderer({
  garmentType,
  viewId,
  bodyColor,
}: GarmentRenderProps & { garmentType: string }) {
  const garment = getGarment(garmentType)
  return <>{garment.render({ viewId, bodyColor })}</>
}
