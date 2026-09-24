import { garmentCapabilities } from '../capabilities'
import { FRONT_BACK_VIEWS, STANDARD_VIEWBOX } from '../types'
import type { GarmentDefinition, GarmentPanelDefinition } from '../types'

const LEFT_CHEST = {
  id: 'jacket_left_chest_print',
  label: 'Left chest print',
  x: 18,
  y: 28,
  width: 82,
  height: 110,
}

const RIGHT_CHEST = {
  id: 'jacket_right_chest_print',
  label: 'Right chest print',
  x: 16,
  y: 28,
  width: 82,
  height: 110,
}

const BACK_PRINT = {
  id: 'jacket_back_print',
  label: 'Back print',
  x: 20,
  y: 30,
  width: 160,
  height: 190,
}

const SLEEVE_PRINT = {
  id: 'jacket_sleeve_print',
  label: 'Sleeve print',
  x: 14,
  y: 16,
  width: 76,
  height: 80,
}

function sleevePrint(id: string): GarmentPanelDefinition['safeArea'] {
  return { ...SLEEVE_PRINT, id }
}

export const JACKET_PANELS: GarmentPanelDefinition[] = [
  {
    id: 'front_body_left',
    label: 'Front left',
    viewId: 'front',
    type: 'body',
    local: { width: 120, height: 300 },
    frame: { x: 176, y: 186, width: 102, height: 332 },
    safeArea: LEFT_CHEST,
  },
  {
    id: 'front_body_right',
    label: 'Front right',
    viewId: 'front',
    type: 'body',
    local: { width: 120, height: 300 },
    frame: { x: 282, y: 186, width: 102, height: 332 },
    safeArea: RIGHT_CHEST,
  },
  {
    id: 'back_body',
    label: 'Back body',
    viewId: 'back',
    type: 'body',
    local: { width: 200, height: 320 },
    frame: { x: 180, y: 180, width: 200, height: 340 },
    safeArea: BACK_PRINT,
  },
  {
    id: 'right_sleeve',
    label: 'Right sleeve',
    viewId: 'front',
    type: 'sleeve',
    local: { width: 100, height: 140 },
    frame: { x: 52, y: 154, width: 122, height: 150 },
    safeArea: sleevePrint('jacket_right_sleeve_print'),
  },
  {
    id: 'left_sleeve',
    label: 'Left sleeve',
    viewId: 'front',
    type: 'sleeve',
    local: { width: 100, height: 140 },
    frame: { x: 386, y: 154, width: 122, height: 150 },
    safeArea: sleevePrint('jacket_left_sleeve_print'),
  },
  {
    id: 'right_sleeve_back',
    label: 'Right sleeve',
    viewId: 'back',
    type: 'sleeve',
    local: { width: 100, height: 140 },
    frame: { x: 386, y: 154, width: 122, height: 150 },
    safeArea: sleevePrint('jacket_right_sleeve_back_print'),
  },
  {
    id: 'left_sleeve_back',
    label: 'Left sleeve',
    viewId: 'back',
    type: 'sleeve',
    local: { width: 100, height: 140 },
    frame: { x: 52, y: 154, width: 122, height: 150 },
    safeArea: sleevePrint('jacket_left_sleeve_back_print'),
  },
  {
    id: 'collar',
    label: 'Collar',
    viewId: 'front',
    type: 'collar',
    local: { width: 140, height: 50 },
    frame: { x: 210, y: 132, width: 140, height: 50 },
  },
  {
    id: 'collar_back',
    label: 'Collar',
    viewId: 'back',
    type: 'collar',
    local: { width: 140, height: 44 },
    frame: { x: 214, y: 134, width: 132, height: 42 },
  },
]

export function jacketDefaultPanelId(viewId: string): string {
  return viewId === 'back' ? 'back_body' : 'front_body_left'
}

export const jacketMeta = {
  id: 'jacket',
  name: 'Jacket',
  label: 'Jacket',
  category: 'outerwear',
  views: FRONT_BACK_VIEWS,
  viewBox: STANDARD_VIEWBOX,
  panels: JACKET_PANELS,
  defaults: { bodyColor: '#3d4a3c' },
  capabilities: garmentCapabilities({
    sleeves: true,
    collar: true,
    zipper: true,
    printAreas: true,
    frontBack: true,
  }),
  defaultPanelId: jacketDefaultPanelId,
} satisfies Omit<GarmentDefinition, 'render'>
