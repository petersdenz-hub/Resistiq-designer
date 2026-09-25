import { garmentCapabilities } from '../capabilities'
import { FRONT_BACK_VIEWS, STANDARD_VIEWBOX } from '../types'
import type { GarmentDefinition, GarmentPanelDefinition } from '../types'

export type BottomsKind = 'pants' | 'shorts'

function legPrint(id: string, height: number): GarmentPanelDefinition['safeArea'] {
  return {
    id,
    label: 'Leg print',
    x: 12,
    y: 18,
    width: 66,
    height,
  }
}

export function createBottomsMeta(kind: BottomsKind): Omit<GarmentDefinition, 'render'> {
  const long = kind === 'pants'
  const legFrameHeight = long ? 450 : 214
  const legLocalHeight = long ? 280 : 140
  const printHeight = long ? 170 : 88
  const name = long ? 'Pants' : 'Shorts'

  const panels: GarmentPanelDefinition[] = [
    {
      id: 'waistband',
      label: 'Waistband',
      viewId: 'front',
      type: 'waistband',
      local: { width: 160, height: 40 },
      frame: { x: 198, y: 56, width: 164, height: 54 },
    },
    {
      id: 'waistband_back',
      label: 'Waistband',
      viewId: 'back',
      type: 'waistband',
      local: { width: 160, height: 40 },
      frame: { x: 198, y: 56, width: 164, height: 54 },
    },
    {
      id: 'left_leg',
      label: 'Left leg',
      viewId: 'front',
      type: 'leg',
      printable: true,
      local: { width: 90, height: legLocalHeight },
      frame: { x: 164, y: 108, width: 108, height: legFrameHeight },
      designBounds: { x: 13.33, y: (18 / legLocalHeight) * 100, width: 73.33, height: (printHeight / legLocalHeight) * 100 },
      designZones: [
        { id: `${kind}-left-full`, name: 'Full left leg', bounds: { x: 0, y: 0, width: 100, height: 100 } },
        { id: `${kind}-left-upper`, name: 'Upper leg', bounds: { x: 10, y: 8, width: 80, height: 38 } },
        { id: `${kind}-left-lower`, name: 'Lower leg', bounds: { x: 16, y: long ? 58 : 52, width: 68, height: long ? 32 : 36 } },
      ],
      safeArea: legPrint(`${kind}_left_leg_print`, printHeight),
    },
    {
      id: 'right_leg',
      label: 'Right leg',
      viewId: 'front',
      type: 'leg',
      printable: true,
      local: { width: 90, height: legLocalHeight },
      frame: { x: 288, y: 108, width: 108, height: legFrameHeight },
      designBounds: { x: 13.33, y: (18 / legLocalHeight) * 100, width: 73.33, height: (printHeight / legLocalHeight) * 100 },
      designZones: [
        { id: `${kind}-right-full`, name: 'Full right leg', bounds: { x: 0, y: 0, width: 100, height: 100 } },
        { id: `${kind}-right-upper`, name: 'Upper leg', bounds: { x: 10, y: 8, width: 80, height: 38 } },
        { id: `${kind}-right-lower`, name: 'Lower leg', bounds: { x: 16, y: long ? 58 : 52, width: 68, height: long ? 32 : 36 } },
      ],
      safeArea: legPrint(`${kind}_right_leg_print`, printHeight),
    },
    {
      id: 'left_leg_back',
      label: 'Left leg',
      viewId: 'back',
      type: 'leg',
      local: { width: 90, height: legLocalHeight },
      frame: { x: 164, y: 108, width: 108, height: legFrameHeight },
      safeArea: legPrint(`${kind}_left_leg_back_print`, printHeight),
    },
    {
      id: 'right_leg_back',
      label: 'Right leg',
      viewId: 'back',
      type: 'leg',
      local: { width: 90, height: legLocalHeight },
      frame: { x: 288, y: 108, width: 108, height: legFrameHeight },
      safeArea: legPrint(`${kind}_right_leg_back_print`, printHeight),
    },
  ]

  return {
    id: kind,
    name,
    label: name,
    category: 'bottoms',
    views: FRONT_BACK_VIEWS,
    viewBox: STANDARD_VIEWBOX,
    panels,
    preview: { viewId: 'front' },
    supportedDesignZones: ['front', 'back', 'left-leg', 'right-leg'],
    defaults: { bodyColor: long ? '#2a3140' : '#4a5568' },
    capabilities: garmentCapabilities({
      legs: true,
      waistband: true,
      hem: true,
      pockets: true,
      printAreas: true,
      frontBack: true,
    }),
    defaultPanelId: (viewId) => (viewId === 'back' ? 'left_leg_back' : 'left_leg'),
  }
}

export const pantsMeta = createBottomsMeta('pants')
export const shortsMeta = createBottomsMeta('shorts')
