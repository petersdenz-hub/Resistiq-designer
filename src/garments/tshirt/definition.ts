import type { GarmentDefinition, GarmentPanelDefinition } from '../types'

export const TSHIRT_VIEWBOX = { width: 560, height: 640 }

export const TSHIRT_PANELS: GarmentPanelDefinition[] = [
  {
    id: 'front_body',
    label: 'Front body',
    viewId: 'front',
    local: { width: 200, height: 280 },
    frame: { x: 198, y: 228, width: 164, height: 228 },
  },
  {
    id: 'back_body',
    label: 'Back body',
    viewId: 'back',
    local: { width: 200, height: 300 },
    frame: { x: 198, y: 208, width: 164, height: 248 },
  },
  {
    id: 'right_sleeve',
    label: 'Right sleeve',
    viewId: 'front',
    local: { width: 90, height: 90 },
    frame: { x: 74, y: 152, width: 82, height: 82 },
  },
  {
    id: 'left_sleeve',
    label: 'Left sleeve',
    viewId: 'front',
    local: { width: 90, height: 90 },
    frame: { x: 404, y: 152, width: 82, height: 82 },
  },
  {
    id: 'collar',
    label: 'Collar',
    viewId: 'front',
    local: { width: 120, height: 48 },
    frame: { x: 228, y: 98, width: 104, height: 44 },
  },
]

export function tshirtDefaultPanelId(viewId: string): string {
  return viewId === 'back' ? 'back_body' : 'front_body'
}

export const tshirtMeta = {
  id: 'tshirt',
  label: 'T-shirt',
  views: [
    { id: 'front', label: 'Front' },
    { id: 'back', label: 'Back' },
  ],
  viewBox: TSHIRT_VIEWBOX,
  panels: TSHIRT_PANELS,
  defaultPanelId: tshirtDefaultPanelId,
} satisfies Omit<GarmentDefinition, 'render'>
