import { BOTTOMS_CONSTRUCTION, PANTS_CONTROLS, SHORTS_CONTROLS } from '../constructionCatalog'
import { garmentCapabilities } from '../capabilities'
import { attachSilhouettes } from '../topology'
import { FRONT_BACK_VIEWS, STANDARD_VIEWBOX } from '../types'
import type { GarmentDefinition, GarmentPanelDefinition } from '../types'
import { bottomsPaths } from './geometry'

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
        { id: `${kind}-left-full`, name: 'Left leg', bounds: { x: 0, y: 0, width: 100, height: 100 } },
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
        { id: `${kind}-right-full`, name: 'Right leg', bounds: { x: 0, y: 0, width: 100, height: 100 } },
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
    {
      id: 'pocket_left',
      label: 'Left pocket',
      viewId: 'front',
      type: 'pocket',
      printable: false,
      local: { width: 50, height: 74 },
      frame: { x: 196, y: 128, width: 50, height: 80 },
      ...(long ? {} : { regionId: 'pockets', regionLabel: 'Pockets' }),
    },
    {
      id: 'pocket_right',
      label: 'Right pocket',
      viewId: 'front',
      type: 'pocket',
      printable: false,
      local: { width: 50, height: 74 },
      frame: { x: 314, y: 128, width: 50, height: 80 },
      ...(long ? {} : { regionId: 'pockets', regionLabel: 'Pockets' }),
    },
    {
      id: 'pocket_left_back',
      label: 'Left pocket',
      viewId: 'back',
      type: 'pocket',
      printable: false,
      local: { width: 72, height: 78 },
      frame: { x: 196, y: 150, width: 72, height: 78 },
      ...(long ? {} : { regionId: 'pockets', regionLabel: 'Pockets' }),
    },
    {
      id: 'pocket_right_back',
      label: 'Right pocket',
      viewId: 'back',
      type: 'pocket',
      printable: false,
      local: { width: 72, height: 78 },
      frame: { x: 294, y: 150, width: 72, height: 78 },
      ...(long ? {} : { regionId: 'pockets', regionLabel: 'Pockets' }),
    },
    {
      id: 'inseam',
      label: 'Inseam',
      viewId: 'front',
      type: 'seam',
      printable: false,
      local: { width: 40, height: long ? 436 : 192 },
      frame: { x: 254, y: 110, width: 52, height: long ? 436 : 192 },
    },
    {
      id: 'inseam_back',
      label: 'Inseam',
      viewId: 'back',
      type: 'seam',
      printable: false,
      local: { width: 40, height: long ? 436 : 192 },
      frame: { x: 254, y: 110, width: 52, height: long ? 436 : 192 },
    },
    {
      id: 'outseam',
      label: 'Outseam',
      viewId: 'front',
      type: 'seam',
      printable: false,
      local: { width: 40, height: long ? 436 : 192 },
      frame: { x: 164, y: 110, width: 232, height: long ? 436 : 192 },
    },
    {
      id: 'outseam_back',
      label: 'Outseam',
      viewId: 'back',
      type: 'seam',
      printable: false,
      local: { width: 40, height: long ? 436 : 192 },
      frame: { x: 164, y: 110, width: 232, height: long ? 436 : 192 },
    },
  ]

  return {
    id: kind,
    name,
    label: name,
    category: 'bottoms',
    views: FRONT_BACK_VIEWS,
    viewBox: STANDARD_VIEWBOX,
    panels: attachSilhouettes(panels, bottomsPaths(kind)),
    preview: { viewId: 'front' },
    supportedDesignZones: ['front', 'back', 'left-leg', 'right-leg'],
    constructionDefaults: BOTTOMS_CONSTRUCTION,
    constructionControls: long ? PANTS_CONTROLS : SHORTS_CONTROLS,
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
