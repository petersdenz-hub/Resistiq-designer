import type { ConstructionKind, DesignConstruction, DesignConstructionPart } from '@/design/types'
import { inferPanelSide } from './model'
import type { GarmentCapabilities } from './capabilities'
import type { GarmentConstructionControl, GarmentDefinition, GarmentPanelDefinition } from './types'

type ConstructionGarment = Pick<
  GarmentDefinition,
  'id' | 'panels' | 'capabilities' | 'constructionDefaults' | 'constructionControls'
>

export const COLLAR_OPTIONS = [
  { value: 'crew', label: 'Crew' },
  { value: 'rib', label: 'Rib' },
  { value: 'vneck', label: 'V-neck' },
  { value: 'stand', label: 'Stand' },
  { value: 'none', label: 'None' },
]

export const HOOD_OPTIONS = [
  { value: 'pullover', label: 'Pullover' },
  { value: 'zip', label: 'Zip' },
  { value: 'none', label: 'None' },
]

export const HOOD_OPENING_OPTIONS = [
  { value: 'tight', label: 'Tight' },
  { value: 'standard', label: 'Open' },
  { value: 'wide', label: 'Wide' },
]

export const DRAWSTRING_OPTIONS = [
  { value: 'cord', label: 'On' },
  { value: 'none', label: 'Off' },
]

export const CUFF_OPTIONS = [
  { value: 'rib', label: 'Rib' },
  { value: 'hem', label: 'Hem' },
  { value: 'none', label: 'None' },
]

export const SLEEVE_HEM_OPTIONS = [
  { value: 'coverstitch', label: 'Cover' },
  { value: 'rib', label: 'Rib' },
  { value: 'raw', label: 'Raw' },
]

export const HEM_OPTIONS = [
  { value: 'coverstitch', label: 'Cover' },
  { value: 'rib', label: 'Rib' },
  { value: 'raw', label: 'Raw' },
  { value: 'none', label: 'None' },
]

export const HOODIE_HEM_OPTIONS = [
  { value: 'rib', label: 'Rib' },
  { value: 'coverstitch', label: 'Hem' },
  { value: 'none', label: 'None' },
]

export const WAISTBAND_OPTIONS = [
  { value: 'faced', label: 'Faced' },
  { value: 'elastic', label: 'Elastic' },
  { value: 'rib', label: 'Rib' },
  { value: 'none', label: 'None' },
]

export const BELT_LOOP_OPTIONS = [
  { value: 'loops', label: 'On' },
  { value: 'none', label: 'Off' },
]

export const ZIPPER_OPTIONS = [
  { value: 'center_front', label: 'Full' },
  { value: 'quarter', label: 'Quarter' },
  { value: 'none', label: 'None' },
]

export const ZIPPER_FINISH_OPTIONS = [
  { value: 'metal', label: 'Metal' },
  { value: 'coil', label: 'Coil' },
  { value: 'contrast', label: 'Contrast' },
]

export const HOODIE_POCKET_OPTIONS = [
  { value: 'kangaroo', label: 'Kangaroo' },
  { value: 'patch', label: 'Patch' },
  { value: 'none', label: 'None' },
]

export const JACKET_POCKET_OPTIONS = [
  { value: 'slash', label: 'Slash' },
  { value: 'welt', label: 'Welt' },
  { value: 'patch', label: 'Patch' },
  { value: 'none', label: 'None' },
]

export const FRONT_POCKET_OPTIONS = [
  { value: 'slash', label: 'Slash' },
  { value: 'welt', label: 'Welt' },
  { value: 'none', label: 'None' },
]

export const BACK_POCKET_OPTIONS = [
  { value: 'patch', label: 'Patch' },
  { value: 'welt', label: 'Welt' },
  { value: 'slash', label: 'Slash' },
  { value: 'none', label: 'None' },
]

export const CARGO_POCKET_OPTIONS = [
  { value: 'cargo', label: 'On' },
  { value: 'none', label: 'Off' },
]

export const TSHIRT_CONSTRUCTION: DesignConstruction = {
  collar: { id: 'collar', kind: 'collar', style: 'crew', present: true, panelId: 'collar' },
  hem: { id: 'hem', kind: 'hem', style: 'coverstitch', present: true, panelId: 'front_body' },
  cuffs: [
    { id: 'sleeve_hem_right', kind: 'cuff', style: 'coverstitch', present: true },
    { id: 'sleeve_hem_left', kind: 'cuff', style: 'coverstitch', present: true },
  ],
}

export const SWEATSHIRT_CONSTRUCTION: DesignConstruction = {
  collar: { id: 'collar', kind: 'collar', style: 'crew', present: true, panelId: 'collar' },
  hem: { id: 'hem', kind: 'hem', style: 'rib', present: true, panelId: 'front_body' },
  cuffs: [
    { id: 'cuff_right', kind: 'cuff', style: 'rib', present: true, panelId: 'cuff_right' },
    { id: 'cuff_left', kind: 'cuff', style: 'rib', present: true, panelId: 'cuff_left' },
  ],
}

export const HOODIE_CONSTRUCTION: DesignConstruction = {
  hood: {
    id: 'hood',
    kind: 'hood',
    style: 'pullover',
    present: true,
    panelId: 'hood',
    variant: 'standard',
  },
  drawstring: { id: 'drawstring', kind: 'drawstring', style: 'cord', present: true },
  pockets: [
    {
      id: 'kangaroo_pocket',
      kind: 'pocket',
      style: 'kangaroo',
      present: true,
      panelId: 'front_body',
      slot: 'body',
    },
  ],
  cuffs: [
    { id: 'cuff_right', kind: 'cuff', style: 'rib', present: true, panelId: 'cuff_right' },
    { id: 'cuff_left', kind: 'cuff', style: 'rib', present: true, panelId: 'cuff_left' },
  ],
  hem: { id: 'hem', kind: 'hem', style: 'rib', present: true, panelId: 'front_body' },
}

export const JACKET_CONSTRUCTION: DesignConstruction = {
  zipper: {
    id: 'zipper',
    kind: 'zipper',
    style: 'center_front',
    present: true,
    variant: 'metal',
  },
  collar: { id: 'collar', kind: 'collar', style: 'stand', present: true, panelId: 'collar' },
  cuffs: [
    { id: 'cuff_right', kind: 'cuff', style: 'hem', present: true },
    { id: 'cuff_left', kind: 'cuff', style: 'hem', present: true },
  ],
  hem: { id: 'hem', kind: 'hem', style: 'coverstitch', present: true },
}

export const BOTTOMS_CONSTRUCTION: DesignConstruction = {
  waistband: {
    id: 'waistband',
    kind: 'waistband',
    style: 'faced',
    present: true,
    panelId: 'waistband',
  },
  pockets: [
    {
      id: 'front_pocket_left',
      kind: 'pocket',
      style: 'slash',
      present: true,
      panelId: 'left_leg',
      slot: 'front',
    },
    {
      id: 'front_pocket_right',
      kind: 'pocket',
      style: 'slash',
      present: true,
      panelId: 'right_leg',
      slot: 'front',
    },
    {
      id: 'back_pocket_left',
      kind: 'pocket',
      style: 'patch',
      present: true,
      panelId: 'left_leg_back',
      slot: 'back',
    },
    {
      id: 'back_pocket_right',
      kind: 'pocket',
      style: 'patch',
      present: true,
      panelId: 'right_leg_back',
      slot: 'back',
    },
  ],
  hem: { id: 'hem', kind: 'hem', style: 'coverstitch', present: true },
}

export const TSHIRT_CONTROLS: GarmentConstructionControl[] = [
  { id: 'collar', kind: 'collar', label: 'Collar', options: COLLAR_OPTIONS },
  { id: 'hem', kind: 'hem', label: 'Hem', options: HEM_OPTIONS },
  { id: 'cuff', kind: 'cuff', label: 'Sleeve style', options: SLEEVE_HEM_OPTIONS },
]

export const SWEATSHIRT_CONTROLS: GarmentConstructionControl[] = [
  { id: 'collar', kind: 'collar', label: 'Collar', options: COLLAR_OPTIONS },
  { id: 'hem', kind: 'hem', label: 'Hem', options: HOODIE_HEM_OPTIONS },
  { id: 'cuff', kind: 'cuff', label: 'Cuffs', options: CUFF_OPTIONS },
]

export const HOODIE_CONTROLS: GarmentConstructionControl[] = [
  { id: 'hood', kind: 'hood', label: 'Hood', options: HOOD_OPTIONS },
  {
    id: 'hood_opening',
    kind: 'hood',
    label: 'Hood opening',
    options: HOOD_OPENING_OPTIONS,
    field: 'variant',
    requiresKind: 'hood',
  },
  {
    id: 'drawstring',
    kind: 'drawstring',
    label: 'Drawstring',
    options: DRAWSTRING_OPTIONS,
    requiresKind: 'hood',
  },
  { id: 'pocket', kind: 'pocket', label: 'Pocket', options: HOODIE_POCKET_OPTIONS },
  { id: 'cuff', kind: 'cuff', label: 'Cuffs', options: CUFF_OPTIONS },
  { id: 'hem', kind: 'hem', label: 'Waistband / hem', options: HOODIE_HEM_OPTIONS },
]

export const JACKET_CONTROLS: GarmentConstructionControl[] = [
  { id: 'collar', kind: 'collar', label: 'Collar', options: COLLAR_OPTIONS },
  { id: 'hood', kind: 'hood', label: 'Hood', options: HOOD_OPTIONS },
  { id: 'zipper', kind: 'zipper', label: 'Zipper', options: ZIPPER_OPTIONS },
  {
    id: 'zipper_finish',
    kind: 'zipper',
    label: 'Zipper style',
    options: ZIPPER_FINISH_OPTIONS,
    field: 'variant',
    requiresKind: 'zipper',
  },
  { id: 'pocket', kind: 'pocket', label: 'Pockets', options: JACKET_POCKET_OPTIONS },
  { id: 'cuff', kind: 'cuff', label: 'Cuffs', options: CUFF_OPTIONS },
  { id: 'hem', kind: 'hem', label: 'Hem', options: HEM_OPTIONS },
]

export const PANTS_CONTROLS: GarmentConstructionControl[] = [
  { id: 'waistband', kind: 'waistband', label: 'Waistband', options: WAISTBAND_OPTIONS },
  { id: 'belt_loop', kind: 'belt_loop', label: 'Belt loops', options: BELT_LOOP_OPTIONS },
  {
    id: 'front_pocket',
    kind: 'pocket',
    label: 'Front pockets',
    options: FRONT_POCKET_OPTIONS,
    slot: 'front',
  },
  {
    id: 'back_pocket',
    kind: 'pocket',
    label: 'Back pockets',
    options: BACK_POCKET_OPTIONS,
    slot: 'back',
  },
  {
    id: 'cargo_pocket',
    kind: 'pocket',
    label: 'Cargo pockets',
    options: CARGO_POCKET_OPTIONS,
    slot: 'cargo',
  },
  { id: 'hem', kind: 'hem', label: 'Hem', options: HEM_OPTIONS },
]

export const SHORTS_CONTROLS: GarmentConstructionControl[] = [
  { id: 'waistband', kind: 'waistband', label: 'Waistband', options: WAISTBAND_OPTIONS },
  { id: 'belt_loop', kind: 'belt_loop', label: 'Belt loops', options: BELT_LOOP_OPTIONS },
  {
    id: 'front_pocket',
    kind: 'pocket',
    label: 'Front pockets',
    options: FRONT_POCKET_OPTIONS,
    slot: 'front',
  },
  {
    id: 'back_pocket',
    kind: 'pocket',
    label: 'Back pockets',
    options: BACK_POCKET_OPTIONS,
    slot: 'back',
  },
  { id: 'hem', kind: 'hem', label: 'Hem', options: HEM_OPTIONS },
]

function panelsOf(garment: ConstructionGarment, type: string): GarmentPanelDefinition[] {
  return garment.panels.filter((panel) => panel.type === type)
}

function panelIdOf(
  garment: ConstructionGarment,
  type: string,
  side?: 'left' | 'right' | 'front' | 'back',
): string | undefined {
  const matching = panelsOf(garment, type)
  if (side) {
    return matching.find((panel) => inferPanelSide(panel) === side)?.id
  }
  return matching[0]?.id
}

function bodyPanelId(garment: ConstructionGarment, side?: 'left' | 'right' | 'front' | 'back'): string | undefined {
  return panelIdOf(garment, 'body', side) ?? panelIdOf(garment, 'shell', side)
}

function part(
  kind: ConstructionKind,
  id: string,
  style: string,
  extra: Partial<DesignConstructionPart> = {},
): DesignConstructionPart {
  return { id, kind, style, present: true, ...extra }
}

function hasSplitBody(garment: ConstructionGarment): boolean {
  const bodies = panelsOf(garment, 'body')
  return bodies.some((panel) => inferPanelSide(panel) === 'left') && bodies.some((panel) => inferPanelSide(panel) === 'right')
}

/** Read-time construction when the definition does not declare its own defaults. */
export function deriveConstructionDefaults(garment: ConstructionGarment): DesignConstruction {
  const next: DesignConstruction = {}
  const caps = garment.capabilities

  if (caps.hood && panelsOf(garment, 'hood').length > 0) {
    next.hood = part('hood', 'hood', 'pullover', {
      panelId: panelIdOf(garment, 'hood'),
      variant: 'standard',
    })
    next.drawstring = part('drawstring', 'drawstring', 'cord')
  }
  if (caps.collar && panelsOf(garment, 'collar').length > 0) {
    next.collar = part('collar', 'collar', 'crew', { panelId: panelIdOf(garment, 'collar') })
  }
  if (caps.zipper && panelsOf(garment, 'zipper').length > 0) {
    next.zipper = part('zipper', 'zipper', 'center_front', { variant: 'metal' })
  }
  if (caps.waistband && panelsOf(garment, 'waistband').length > 0) {
    next.waistband = part('waistband', 'waistband', 'faced', { panelId: panelIdOf(garment, 'waistband') })
  }
  if (caps.hem) {
    next.hem = part('hem', 'hem', 'coverstitch', {
      panelId: caps.legs ? undefined : bodyPanelId(garment, 'front') ?? panelIdOf(garment, 'hem'),
    })
  }
  if (caps.cuffs) {
    const cuffs = panelsOf(garment, 'cuff')
    const right = cuffs.find((panel) => inferPanelSide(panel) === 'right')
    const left = cuffs.find((panel) => inferPanelSide(panel) === 'left')
    if (right || left) {
      next.cuffs = [
        part('cuff', right?.id ?? 'cuff_right', 'hem', { panelId: right?.id }),
        part('cuff', left?.id ?? 'cuff_left', 'hem', { panelId: left?.id }),
      ]
    } else if (caps.sleeves) {
      next.cuffs = [part('cuff', 'sleeve_hem_right', 'coverstitch'), part('cuff', 'sleeve_hem_left', 'coverstitch')]
    }
  }
  if (caps.pockets) {
    next.pockets = pocketsForStyle(garment, caps.legs ? 'slash' : 'patch', caps.legs ? 'back' : undefined)
  }
  return next
}

export function constructionFromDefinition(garment: ConstructionGarment): DesignConstruction {
  return garment.constructionDefaults ?? deriveConstructionDefaults(garment)
}

/** Editor controls when the definition does not declare its own list. */
export function deriveConstructionControls(garment: ConstructionGarment): GarmentConstructionControl[] {
  const caps = garment.capabilities
  const controls: GarmentConstructionControl[] = []

  if (caps.hood) {
    controls.push({ id: 'hood', kind: 'hood', label: 'Hood', options: HOOD_OPTIONS })
    controls.push({
      id: 'hood_opening',
      kind: 'hood',
      label: 'Hood opening',
      options: HOOD_OPENING_OPTIONS,
      field: 'variant',
      requiresKind: 'hood',
    })
    controls.push({
      id: 'drawstring',
      kind: 'drawstring',
      label: 'Drawstring',
      options: DRAWSTRING_OPTIONS,
      requiresKind: 'hood',
    })
  }
  if (caps.collar) {
    controls.push({ id: 'collar', kind: 'collar', label: 'Collar', options: COLLAR_OPTIONS })
  }
  if (caps.zipper) {
    controls.push({ id: 'zipper', kind: 'zipper', label: 'Zipper', options: ZIPPER_OPTIONS })
    controls.push({
      id: 'zipper_finish',
      kind: 'zipper',
      label: 'Zipper style',
      options: ZIPPER_FINISH_OPTIONS,
      field: 'variant',
      requiresKind: 'zipper',
    })
  }
  if (caps.pockets && caps.legs) {
    controls.push({
      id: 'front_pocket',
      kind: 'pocket',
      label: 'Front pockets',
      options: FRONT_POCKET_OPTIONS,
      slot: 'front',
    })
    controls.push({
      id: 'back_pocket',
      kind: 'pocket',
      label: 'Back pockets',
      options: BACK_POCKET_OPTIONS,
      slot: 'back',
    })
  } else if (caps.pockets) {
    controls.push({
      id: 'pocket',
      kind: 'pocket',
      label: 'Pocket',
      options: hasSplitBody(garment) ? JACKET_POCKET_OPTIONS : HOODIE_POCKET_OPTIONS,
    })
  }
  if (caps.cuffs) {
    controls.push({
      id: 'cuff',
      kind: 'cuff',
      label: caps.sleeves && panelsOf(garment, 'cuff').length === 0 ? 'Sleeve style' : 'Cuffs',
      options: panelsOf(garment, 'cuff').length === 0 ? SLEEVE_HEM_OPTIONS : CUFF_OPTIONS,
    })
  }
  if (caps.waistband) {
    controls.push({ id: 'waistband', kind: 'waistband', label: 'Waistband', options: WAISTBAND_OPTIONS })
    controls.push({ id: 'belt_loop', kind: 'belt_loop', label: 'Belt loops', options: BELT_LOOP_OPTIONS })
  }
  if (caps.hem) {
    controls.push({ id: 'hem', kind: 'hem', label: 'Hem', options: HEM_OPTIONS })
  }

  return controls
}

export function constructionControlsFromDefinition(
  garment: ConstructionGarment,
): GarmentConstructionControl[] {
  return garment.constructionControls ? [...garment.constructionControls] : deriveConstructionControls(garment)
}

const CAPABILITY_KIND: Partial<Record<string, keyof GarmentCapabilities>> = {
  hood: 'hood',
  collar: 'collar',
  zipper: 'zipper',
  pocket: 'pockets',
  cuff: 'cuffs',
  waistband: 'waistband',
  hem: 'hem',
  drawstring: 'hood',
  belt_loop: 'waistband',
}

export function filterControlsByCapabilities(
  controls: readonly GarmentConstructionControl[],
  capabilities: GarmentCapabilities,
): GarmentConstructionControl[] {
  return controls.filter((control) => {
    const flag = CAPABILITY_KIND[control.kind]
    return flag ? capabilities[flag] : true
  })
}

export function partsForStyle(
  garment: ConstructionGarment,
  kind: ConstructionKind,
  style: string,
  slot?: string,
): DesignConstructionPart[] {
  switch (kind) {
    case 'collar':
      return [part('collar', 'collar', style, { panelId: panelIdOf(garment, 'collar') })]
    case 'hood':
      return [
        part('hood', 'hood', style, {
          panelId: panelIdOf(garment, 'hood'),
          variant: 'standard',
        }),
      ]
    case 'zipper':
      return [part('zipper', 'zipper', style, { variant: 'metal' })]
    case 'hem':
      return [
        part('hem', 'hem', style, {
          panelId: garment.capabilities.legs
            ? undefined
            : bodyPanelId(garment, 'front') ?? panelIdOf(garment, 'hem'),
        }),
      ]
    case 'waistband':
      return [part('waistband', 'waistband', style, { panelId: panelIdOf(garment, 'waistband') })]
    case 'drawstring':
      return [part('drawstring', 'drawstring', style)]
    case 'belt_loop':
      return [part('belt_loop', 'belt_loops', style, { panelId: panelIdOf(garment, 'waistband') })]
    case 'cuff':
      return cuffsForStyle(garment, style)
    case 'pocket':
      return pocketsForStyle(garment, style, slot)
    default:
      return [part(kind, kind, style)]
  }
}

function cuffsForStyle(garment: ConstructionGarment, style: string): DesignConstructionPart[] {
  const cuffs = panelsOf(garment, 'cuff')
  const right = cuffs.find((panel) => inferPanelSide(panel) === 'right')
  const left = cuffs.find((panel) => inferPanelSide(panel) === 'left')
  if (right || left) {
    return [
      part('cuff', right?.id ?? 'cuff_right', style, { panelId: right?.id }),
      part('cuff', left?.id ?? 'cuff_left', style, { panelId: left?.id }),
    ]
  }
  if (garment.capabilities.sleeves) {
    return [part('cuff', 'sleeve_hem_right', style), part('cuff', 'sleeve_hem_left', style)]
  }
  return [part('cuff', 'cuff_right', style), part('cuff', 'cuff_left', style)]
}

function pocketsForStyle(
  garment: ConstructionGarment,
  style: string,
  slot?: string,
): DesignConstructionPart[] {
  if (garment.capabilities.legs) {
    const group = slot ?? 'back'
    if (group === 'front') {
      return [
        part('pocket', 'front_pocket_left', style, {
          panelId: panelIdOf(garment, 'leg', 'left') ?? 'left_leg',
          slot: 'front',
        }),
        part('pocket', 'front_pocket_right', style, {
          panelId: panelIdOf(garment, 'leg', 'right') ?? 'right_leg',
          slot: 'front',
        }),
      ]
    }
    if (group === 'cargo') {
      return [
        part('pocket', 'cargo_left', style, {
          panelId: panelIdOf(garment, 'leg', 'left') ?? 'left_leg',
          slot: 'cargo',
        }),
        part('pocket', 'cargo_right', style, {
          panelId: panelIdOf(garment, 'leg', 'right') ?? 'right_leg',
          slot: 'cargo',
        }),
      ]
    }
    const backLeft =
      garment.panels.find(
        (panel) => panel.type === 'leg' && panel.viewId === 'back' && inferPanelSide(panel) === 'left',
      )?.id ?? 'left_leg_back'
    const backRight =
      garment.panels.find(
        (panel) => panel.type === 'leg' && panel.viewId === 'back' && inferPanelSide(panel) === 'right',
      )?.id ?? 'right_leg_back'
    return [
      part('pocket', 'back_pocket_left', style, { panelId: backLeft, slot: 'back' }),
      part('pocket', 'back_pocket_right', style, { panelId: backRight, slot: 'back' }),
    ]
  }

  if (hasSplitBody(garment)) {
    return [
      part('pocket', 'jacket_pocket_left', style, {
        panelId: bodyPanelId(garment, 'left') ?? 'front_body_left',
        slot: 'body',
      }),
      part('pocket', 'jacket_pocket_right', style, {
        panelId: bodyPanelId(garment, 'right') ?? 'front_body_right',
        slot: 'body',
      }),
    ]
  }

  return [
    part('pocket', 'kangaroo_pocket', style, {
      panelId: bodyPanelId(garment, 'front') ?? panelIdOf(garment, 'pocket') ?? 'front_body',
      slot: 'body',
    }),
  ]
}
