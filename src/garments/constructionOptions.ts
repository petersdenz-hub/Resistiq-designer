import { variantOf, styleOf } from '@/design/constructionEdits'
import type { ResolvedConstruction } from '@/design/construction'
import type { ConstructionKind } from '@/design/types'
import { getGarment } from './registry'

export interface ConstructionStyleOption {
  value: string
  label: string
}

export interface ConstructionControlSpec {
  id: string
  kind: ConstructionKind
  label: string
  options: ConstructionStyleOption[]
  slot?: string
  field?: 'style' | 'variant'
  requiresKind?: ConstructionKind
}

const COLLAR_OPTIONS: ConstructionStyleOption[] = [
  { value: 'crew', label: 'Crew' },
  { value: 'rib', label: 'Rib' },
  { value: 'vneck', label: 'V-neck' },
  { value: 'stand', label: 'Stand' },
  { value: 'none', label: 'None' },
]

const HOOD_OPTIONS: ConstructionStyleOption[] = [
  { value: 'pullover', label: 'Pullover' },
  { value: 'zip', label: 'Zip' },
  { value: 'none', label: 'None' },
]

const HOOD_OPENING_OPTIONS: ConstructionStyleOption[] = [
  { value: 'tight', label: 'Tight' },
  { value: 'standard', label: 'Open' },
  { value: 'wide', label: 'Wide' },
]

const DRAWSTRING_OPTIONS: ConstructionStyleOption[] = [
  { value: 'cord', label: 'On' },
  { value: 'none', label: 'Off' },
]

const CUFF_OPTIONS: ConstructionStyleOption[] = [
  { value: 'rib', label: 'Rib' },
  { value: 'hem', label: 'Hem' },
  { value: 'none', label: 'None' },
]

const SLEEVE_HEM_OPTIONS: ConstructionStyleOption[] = [
  { value: 'coverstitch', label: 'Cover' },
  { value: 'rib', label: 'Rib' },
  { value: 'raw', label: 'Raw' },
]

const HEM_OPTIONS: ConstructionStyleOption[] = [
  { value: 'coverstitch', label: 'Cover' },
  { value: 'rib', label: 'Rib' },
  { value: 'raw', label: 'Raw' },
  { value: 'none', label: 'None' },
]

const HOODIE_HEM_OPTIONS: ConstructionStyleOption[] = [
  { value: 'rib', label: 'Rib' },
  { value: 'coverstitch', label: 'Hem' },
  { value: 'none', label: 'None' },
]

const WAISTBAND_OPTIONS: ConstructionStyleOption[] = [
  { value: 'faced', label: 'Faced' },
  { value: 'elastic', label: 'Elastic' },
  { value: 'rib', label: 'Rib' },
  { value: 'none', label: 'None' },
]

const BELT_LOOP_OPTIONS: ConstructionStyleOption[] = [
  { value: 'loops', label: 'On' },
  { value: 'none', label: 'Off' },
]

const ZIPPER_OPTIONS: ConstructionStyleOption[] = [
  { value: 'center_front', label: 'Full' },
  { value: 'quarter', label: 'Quarter' },
  { value: 'none', label: 'None' },
]

const ZIPPER_FINISH_OPTIONS: ConstructionStyleOption[] = [
  { value: 'metal', label: 'Metal' },
  { value: 'coil', label: 'Coil' },
  { value: 'contrast', label: 'Contrast' },
]

const HOODIE_POCKET_OPTIONS: ConstructionStyleOption[] = [
  { value: 'kangaroo', label: 'Kangaroo' },
  { value: 'patch', label: 'Patch' },
  { value: 'none', label: 'None' },
]

const JACKET_POCKET_OPTIONS: ConstructionStyleOption[] = [
  { value: 'slash', label: 'Slash' },
  { value: 'welt', label: 'Welt' },
  { value: 'patch', label: 'Patch' },
  { value: 'none', label: 'None' },
]

const FRONT_POCKET_OPTIONS: ConstructionStyleOption[] = [
  { value: 'slash', label: 'Slash' },
  { value: 'welt', label: 'Welt' },
  { value: 'none', label: 'None' },
]

const BACK_POCKET_OPTIONS: ConstructionStyleOption[] = [
  { value: 'patch', label: 'Patch' },
  { value: 'welt', label: 'Welt' },
  { value: 'slash', label: 'Slash' },
  { value: 'none', label: 'None' },
]

const CARGO_POCKET_OPTIONS: ConstructionStyleOption[] = [
  { value: 'cargo', label: 'On' },
  { value: 'none', label: 'Off' },
]

const CONTROLS: Record<string, ConstructionControlSpec[]> = {
  tshirt: [
    { id: 'collar', kind: 'collar', label: 'Collar', options: COLLAR_OPTIONS },
    { id: 'hem', kind: 'hem', label: 'Hem', options: HEM_OPTIONS },
    { id: 'cuff', kind: 'cuff', label: 'Sleeve style', options: SLEEVE_HEM_OPTIONS },
  ],
  sweatshirt: [
    { id: 'collar', kind: 'collar', label: 'Collar', options: COLLAR_OPTIONS },
    { id: 'hem', kind: 'hem', label: 'Hem', options: HOODIE_HEM_OPTIONS },
    { id: 'cuff', kind: 'cuff', label: 'Cuffs', options: CUFF_OPTIONS },
  ],
  hoodie: [
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
  ],
  jacket: [
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
  ],
  pants: [
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
  ],
  shorts: [
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
  ],
}

const CAPABILITY_KIND: Partial<Record<ConstructionKind, keyof ReturnType<typeof capabilityFlags>>> = {
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

function capabilityFlags(garmentType: string) {
  return getGarment(garmentType).capabilities
}

/** Editor controls for this garment. Capabilities hide unsupported kinds. */
export function constructionControlsFor(garmentType: string): ConstructionControlSpec[] {
  const capabilities = capabilityFlags(garmentType)
  const controls = CONTROLS[garmentType] ?? CONTROLS.tshirt
  return controls.filter((control) => {
    const flag = CAPABILITY_KIND[control.kind]
    return flag ? capabilities[flag] : false
  })
}

export function visibleConstructionControls(
  garmentType: string,
  resolved: ResolvedConstruction,
): ConstructionControlSpec[] {
  return constructionControlsFor(garmentType).filter((control) => {
    if (!control.requiresKind) {
      return true
    }
    return styleOf(resolved, control.requiresKind) !== 'none'
  })
}

export function editableConstructionKinds(garmentType: string): ConstructionKind[] {
  return [...new Set(constructionControlsFor(garmentType).map((control) => control.kind))]
}

export function editableConstructionControlIds(garmentType: string): string[] {
  return constructionControlsFor(garmentType).map((control) => control.id)
}

export function controlValue(
  resolved: ResolvedConstruction,
  control: ConstructionControlSpec,
): string {
  if (control.field === 'variant') {
    if (control.kind === 'zipper' || control.kind === 'hood') {
      return variantOf(resolved, control.kind, control.kind === 'hood' ? 'standard' : 'metal')
    }
  }
  return styleOf(resolved, control.kind, control.slot)
}
