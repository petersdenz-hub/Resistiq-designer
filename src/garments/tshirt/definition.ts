import { garmentCapabilities } from '../capabilities'
import { FRONT_BACK_VIEWS, STANDARD_VIEWBOX } from '../types'
import type { GarmentDefinition, GarmentPanelDefinition } from '../types'

export const TSHIRT_VIEWBOX = STANDARD_VIEWBOX

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
    name: 'Front body',
    label: 'Front body',
    viewId: 'front',
    side: 'front',
    type: 'body',
    printable: true,
    local: { width: 200, height: 280 },
    frame: { x: 194, y: 192, width: 172, height: 300 },
    designBounds: { x: 11, y: 10, width: 78, height: 47.14 },
    designZones: [
      { id: 'tshirt-full-front', name: 'Front print', bounds: { x: 0, y: 0, width: 100, height: 100 } },
      { id: 'tshirt-chest', name: 'Front chest', bounds: { x: 11, y: 10, width: 78, height: 47.14 } },
      { id: 'tshirt-center-front', name: 'Center front', bounds: { x: 30, y: 20, width: 40, height: 40 } },
    ],
    safeArea: CHEST_PRINT,
  },
  {
    id: 'back_body',
    name: 'Back body',
    label: 'Back body',
    viewId: 'back',
    side: 'back',
    type: 'body',
    printable: true,
    local: { width: 200, height: 300 },
    frame: { x: 194, y: 186, width: 172, height: 310 },
    designBounds: { x: 9, y: 10.67, width: 82, height: 62 },
    designZones: [
      { id: 'tshirt-full-back', name: 'Back print', bounds: { x: 0, y: 0, width: 100, height: 100 } },
      { id: 'tshirt-upper-back', name: 'Upper back', bounds: { x: 9, y: 10.67, width: 82, height: 40 } },
      { id: 'tshirt-lower-back', name: 'Lower back', bounds: { x: 9, y: 50.67, width: 82, height: 22 } },
    ],
    safeArea: BACK_PRINT,
  },
  {
    id: 'right_sleeve',
    name: 'Right sleeve',
    label: 'Right sleeve',
    viewId: 'front',
    side: 'right',
    type: 'sleeve',
    printable: true,
    local: { width: 90, height: 90 },
    frame: { x: 68, y: 148, width: 104, height: 84 },
    designBounds: { x: 11.11, y: 13.33, width: 77.78, height: 71.11 },
    designZones: [
      { id: 'tshirt-right-outer-sleeve', name: 'Right sleeve', bounds: { x: 0, y: 0, width: 100, height: 100 } },
      { id: 'tshirt-right-sleeve-center', name: 'Sleeve center', bounds: { x: 11.11, y: 13.33, width: 77.78, height: 71.11 } },
    ],
    safeArea: sleevePrint('right_sleeve_print'),
  },
  {
    id: 'left_sleeve',
    name: 'Left sleeve',
    label: 'Left sleeve',
    viewId: 'front',
    side: 'left',
    type: 'sleeve',
    printable: true,
    local: { width: 90, height: 90 },
    frame: { x: 388, y: 148, width: 104, height: 84 },
    designBounds: { x: 11.11, y: 13.33, width: 77.78, height: 71.11 },
    designZones: [
      { id: 'tshirt-left-outer-sleeve', name: 'Left sleeve', bounds: { x: 0, y: 0, width: 100, height: 100 } },
      { id: 'tshirt-left-sleeve-center', name: 'Sleeve center', bounds: { x: 11.11, y: 13.33, width: 77.78, height: 71.11 } },
    ],
    safeArea: sleevePrint('left_sleeve_print'),
  },
  {
    id: 'collar',
    name: 'Collar',
    label: 'Collar',
    viewId: 'front',
    side: 'front',
    type: 'collar',
    printable: false,
    local: { width: 120, height: 48 },
    frame: { x: 224, y: 140, width: 112, height: 46 },
  },
  {
    id: 'right_sleeve_back',
    name: 'Right sleeve',
    label: 'Right sleeve',
    viewId: 'back',
    side: 'right',
    type: 'sleeve',
    printable: true,
    local: { width: 90, height: 90 },
    frame: { x: 388, y: 148, width: 104, height: 84 },
    designBounds: { x: 11.11, y: 13.33, width: 77.78, height: 71.11 },
    safeArea: sleevePrint('right_sleeve_back_print'),
  },
  {
    id: 'left_sleeve_back',
    name: 'Left sleeve',
    label: 'Left sleeve',
    viewId: 'back',
    side: 'left',
    type: 'sleeve',
    printable: true,
    local: { width: 90, height: 90 },
    frame: { x: 68, y: 148, width: 104, height: 84 },
    designBounds: { x: 11.11, y: 13.33, width: 77.78, height: 71.11 },
    safeArea: sleevePrint('left_sleeve_back_print'),
  },
  {
    id: 'collar_back',
    name: 'Collar',
    label: 'Collar',
    viewId: 'back',
    side: 'back',
    type: 'collar',
    printable: false,
    local: { width: 120, height: 40 },
    frame: { x: 226, y: 140, width: 108, height: 36 },
  },
]

export function tshirtDefaultPanelId(viewId: string): string {
  return viewId === 'back' ? 'back_body' : 'front_body'
}

export const tshirtMeta = {
  id: 'tshirt',
  name: 'T-shirt',
  label: 'T-shirt',
  category: 'tops',
  views: FRONT_BACK_VIEWS,
  viewBox: TSHIRT_VIEWBOX,
  panels: TSHIRT_PANELS,
  preview: { viewId: 'front' },
  supportedDesignZones: ['front', 'back', 'left-sleeve', 'right-sleeve'],
  defaults: { bodyColor: '#e8e4dc' },
  capabilities: garmentCapabilities({
    sleeves: true,
    collar: true,
    hem: true,
    cuffs: true,
    printAreas: true,
    frontBack: true,
  }),
  defaultPanelId: tshirtDefaultPanelId,
} satisfies Omit<GarmentDefinition, 'render'>
