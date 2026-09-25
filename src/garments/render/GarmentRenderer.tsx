import { getGarment } from '../registry'
import { garmentSilhouettePaths } from '../topology'
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
  panelMaterials,
  construction,
  panelId,
}: GarmentRenderProps & { garmentType: string; panelId?: string }) {
  const garment = getGarment(garmentType)
  const silhouette = garmentSilhouettePaths(garmentType, viewId)
  const clipId = `garment-silhouette-${garment.id}-${viewId}`
  return (
    <g
      data-garment-type={garment.id}
      data-garment-view={viewId}
      data-garment-panel={panelId ?? ''}
      data-fabric={construction?.materialId ?? ''}
      data-garment-silhouette={silhouette.length > 0 ? 'true' : 'false'}
    >
      <defs>
        <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
          {silhouette.map((path) => (
            <path key={path} d={path} />
          ))}
        </clipPath>
      </defs>
      <g data-garment-silhouette-defs={clipId} pointerEvents="none">
        {silhouette.map((path) => (
          <path key={path} d={path} fill="none" data-silhouette-path="true" />
        ))}
      </g>
      {garment.render({ viewId, bodyColor, panelColors, panelMaterials, construction })}
    </g>
  )
}
