import type { GarmentDefinition, GarmentPanelDefinition } from '../types'

export const TSHIRT_VIEWBOX = { width: 560, height: 640 }

const CHEST_PRINT = {
  id: 'chest_print',
  label: 'Chest print',
  x: 22,
  y: 28,
  width: 156,
  height: 132,
}

const BACK_PRINT = {
  id: 'back_print',
  label: 'Back print',
  x: 18,
  y: 32,
  width: 164,
  height: 186,
}

const SLEEVE_PRINT = {
  id: 'sleeve_print',
  label: 'Sleeve print',
  x: 10,
  y: 12,
  width: 70,
  height: 64,
}

function sleevePrint(id: string): GarmentPanelDefinition['safeArea'] {
  return { ...SLEEVE_PRINT, id }
}

export const TSHIRT_PANELS: GarmentPanelDefinition[] = [
  {
    id: 'front_body',
    label: 'Front body',
    viewId: 'front',
    local: { width: 200, height: 280 },
    frame: { x: 194, y: 192, width: 172, height: 300 },
    safeArea: CHEST_PRINT,
  },
  {
    id: 'back_body',
    label: 'Back body',
    viewId: 'back',
    local: { width: 200, height: 300 },
    frame: { x: 194, y: 186, width: 172, height: 310 },
    safeArea: BACK_PRINT,
  },
  {
    id: 'right_sleeve',
    label: 'Right sleeve',
    viewId: 'front',
    local: { width: 90, height: 90 },
    frame: { x: 68, y: 148, width: 104, height: 84 },
    safeArea: sleevePrint('right_sleeve_print'),
  },
  {
    id: 'left_sleeve',
    label: 'Left sleeve',
    viewId: 'front',
    local: { width: 90, height: 90 },
    frame: { x: 388, y: 148, width: 104, height: 84 },
    safeArea: sleevePrint('left_sleeve_print'),
  },
  {
    id: 'collar',
    label: 'Collar',
    viewId: 'front',
    local: { width: 120, height: 48 },
    frame: { x: 224, y: 140, width: 112, height: 46 },
  },
  {
    id: 'right_sleeve_back',
    label: 'Right sleeve',
    viewId: 'back',
    local: { width: 90, height: 90 },
    frame: { x: 388, y: 148, width: 104, height: 84 },
    safeArea: sleevePrint('right_sleeve_back_print'),
  },
  {
    id: 'left_sleeve_back',
    label: 'Left sleeve',
    viewId: 'back',
    local: { width: 90, height: 90 },
    frame: { x: 68, y: 148, width: 104, height: 84 },
    safeArea: sleevePrint('left_sleeve_back_print'),
  },
  {
    id: 'collar_back',
    label: 'Collar',
    viewId: 'back',
    local: { width: 120, height: 40 },
    frame: { x: 226, y: 140, width: 108, height: 36 },
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
