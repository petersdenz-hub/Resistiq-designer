import type { GarmentDefinition, GarmentPanelDefinition } from '../types'

export const TSHIRT_VIEWBOX = { width: 560, height: 640 }

export const TSHIRT_PANELS: GarmentPanelDefinition[] = [
  {
    id: 'front_body',
    label: 'Front body',
    viewId: 'front',
    local: { width: 200, height: 280 },
    frame: { x: 200, y: 200, width: 160, height: 220 },
  },
  {
    id: 'back_body',
    label: 'Back body',
    viewId: 'back',
    local: { width: 200, height: 300 },
    frame: { x: 200, y: 186, width: 160, height: 236 },
  },
  {
    id: 'right_sleeve',
    label: 'Right sleeve',
    viewId: 'front',
    local: { width: 90, height: 90 },
    frame: { x: 76, y: 154, width: 84, height: 70 },
  },
  {
    id: 'left_sleeve',
    label: 'Left sleeve',
    viewId: 'front',
    local: { width: 90, height: 90 },
    frame: { x: 400, y: 154, width: 84, height: 70 },
  },
  {
    id: 'collar',
    label: 'Collar',
    viewId: 'front',
    local: { width: 120, height: 48 },
    frame: { x: 230, y: 142, width: 100, height: 42 },
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
