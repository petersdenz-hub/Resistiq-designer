import { garmentCapabilities } from '../capabilities'
import { FRONT_BACK_VIEWS, STANDARD_VIEWBOX } from '../types'
import type { GarmentDefinition, GarmentPanelDefinition } from '../types'

const CHEST_PRINT = {
  id: 'hoodie_chest_print',
  label: 'Chest print',
  x: 24,
  y: 36,
  width: 152,
  height: 120,
}

const BACK_PRINT = {
  id: 'hoodie_back_print',
  label: 'Back print',
  x: 20,
  y: 28,
  width: 160,
  height: 180,
}

const HOOD_PRINT = {
  id: 'hoodie_hood_print',
  label: 'Hood print',
  x: 28,
  y: 18,
  width: 144,
  height: 70,
}

const SLEEVE_PRINT = {
  id: 'hoodie_sleeve_print',
  label: 'Sleeve print',
  x: 16,
  y: 18,
  width: 78,
  height: 90,
}

function sleevePrint(id: string): GarmentPanelDefinition['safeArea'] {
  return { ...SLEEVE_PRINT, id }
}

function hoodPrint(id: string): GarmentPanelDefinition['safeArea'] {
  return { ...HOOD_PRINT, id }
}

export const HOODIE_PANELS: GarmentPanelDefinition[] = [
  {
    id: 'front_body',
    label: 'Front body',
    viewId: 'front',
    type: 'body',
    local: { width: 200, height: 300 },
    frame: { x: 186, y: 198, width: 188, height: 328 },
    safeArea: CHEST_PRINT,
  },
  {
    id: 'back_body',
    label: 'Back body',
    viewId: 'back',
    type: 'body',
    local: { width: 200, height: 320 },
    frame: { x: 186, y: 188, width: 188, height: 338 },
    safeArea: BACK_PRINT,
  },
  {
    id: 'hood',
    label: 'Hood',
    viewId: 'front',
    type: 'hood',
    local: { width: 200, height: 120 },
    frame: { x: 176, y: 64, width: 208, height: 132 },
    safeArea: hoodPrint('hoodie_hood_front_print'),
  },
  {
    id: 'hood_back',
    label: 'Hood',
    viewId: 'back',
    type: 'hood',
    local: { width: 200, height: 120 },
    frame: { x: 176, y: 64, width: 208, height: 132 },
    safeArea: hoodPrint('hoodie_hood_back_print'),
  },
  {
    id: 'right_sleeve',
    label: 'Right sleeve',
    viewId: 'front',
    type: 'sleeve',
    local: { width: 110, height: 160 },
    frame: { x: 42, y: 176, width: 138, height: 168 },
    safeArea: sleevePrint('hoodie_right_sleeve_print'),
  },
  {
    id: 'left_sleeve',
    label: 'Left sleeve',
    viewId: 'front',
    type: 'sleeve',
    local: { width: 110, height: 160 },
    frame: { x: 380, y: 176, width: 138, height: 168 },
    safeArea: sleevePrint('hoodie_left_sleeve_print'),
  },
  {
    id: 'right_sleeve_back',
    label: 'Right sleeve',
    viewId: 'back',
    type: 'sleeve',
    local: { width: 110, height: 160 },
    frame: { x: 380, y: 176, width: 138, height: 168 },
    safeArea: sleevePrint('hoodie_right_sleeve_back_print'),
  },
  {
    id: 'left_sleeve_back',
    label: 'Left sleeve',
    viewId: 'back',
    type: 'sleeve',
    local: { width: 110, height: 160 },
    frame: { x: 42, y: 176, width: 138, height: 168 },
    safeArea: sleevePrint('hoodie_left_sleeve_back_print'),
  },
  {
    id: 'cuff_right',
    label: 'Right cuff',
    viewId: 'front',
    type: 'cuff',
    local: { width: 60, height: 40 },
    frame: { x: 36, y: 336, width: 56, height: 42 },
  },
  {
    id: 'cuff_left',
    label: 'Left cuff',
    viewId: 'front',
    type: 'cuff',
    local: { width: 60, height: 40 },
    frame: { x: 468, y: 336, width: 56, height: 42 },
  },
  {
    id: 'cuff_right_back',
    label: 'Right cuff',
    viewId: 'back',
    type: 'cuff',
    local: { width: 60, height: 40 },
    frame: { x: 468, y: 336, width: 56, height: 42 },
  },
  {
    id: 'cuff_left_back',
    label: 'Left cuff',
    viewId: 'back',
    type: 'cuff',
    local: { width: 60, height: 40 },
    frame: { x: 36, y: 336, width: 56, height: 42 },
  },
]

export function hoodieDefaultPanelId(viewId: string): string {
  return viewId === 'back' ? 'back_body' : 'front_body'
}

export const hoodieMeta = {
  id: 'hoodie',
  name: 'Hoodie',
  label: 'Hoodie',
  category: 'tops',
  views: FRONT_BACK_VIEWS,
  viewBox: STANDARD_VIEWBOX,
  panels: HOODIE_PANELS,
  defaults: { bodyColor: '#3a4150' },
  capabilities: garmentCapabilities({
    hood: true,
    sleeves: true,
    cuffs: true,
    pockets: true,
    printAreas: true,
    frontBack: true,
  }),
  defaultPanelId: hoodieDefaultPanelId,
} satisfies Omit<GarmentDefinition, 'render'>
