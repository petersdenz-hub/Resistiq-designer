import type { ConstructionKind } from '@/design/types'
import { getGarment } from './registry'

export interface ConstructionStyleOption {
  value: string
  label: string
}

export interface ConstructionControlSpec {
  kind: ConstructionKind
  label: string
  options: ConstructionStyleOption[]
}

const COLLAR_OPTIONS: ConstructionStyleOption[] = [
  { value: 'crew', label: 'Crew' },
  { value: 'rib', label: 'Rib' },
  { value: 'stand', label: 'Stand' },
  { value: 'none', label: 'None' },
]

const HOOD_OPTIONS: ConstructionStyleOption[] = [
  { value: 'pullover', label: 'Pullover' },
  { value: 'zip', label: 'Zip' },
  { value: 'none', label: 'None' },
]

const CUFF_OPTIONS: ConstructionStyleOption[] = [
  { value: 'rib', label: 'Rib' },
  { value: 'hem', label: 'Hem' },
  { value: 'none', label: 'None' },
]

const HEM_OPTIONS: ConstructionStyleOption[] = [
  { value: 'coverstitch', label: 'Cover' },
  { value: 'rib', label: 'Rib' },
  { value: 'none', label: 'None' },
]

const WAISTBAND_OPTIONS: ConstructionStyleOption[] = [
  { value: 'faced', label: 'Faced' },
  { value: 'elastic', label: 'Elastic' },
  { value: 'rib', label: 'Rib' },
  { value: 'none', label: 'None' },
]

const ZIPPER_OPTIONS: ConstructionStyleOption[] = [
  { value: 'center_front', label: 'Full' },
  { value: 'quarter', label: 'Quarter' },
  { value: 'none', label: 'None' },
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

const BOTTOMS_POCKET_OPTIONS: ConstructionStyleOption[] = [
  { value: 'patch', label: 'Patch' },
  { value: 'welt', label: 'Welt' },
  { value: 'slash', label: 'Slash' },
  { value: 'none', label: 'None' },
]

const CONTROLS: Record<string, ConstructionControlSpec[]> = {
  tshirt: [
    { kind: 'collar', label: 'Collar', options: COLLAR_OPTIONS },
    { kind: 'hem', label: 'Hem', options: HEM_OPTIONS },
  ],
  hoodie: [
    { kind: 'hood', label: 'Hood', options: HOOD_OPTIONS },
    { kind: 'pocket', label: 'Pocket', options: HOODIE_POCKET_OPTIONS },
    { kind: 'cuff', label: 'Cuffs', options: CUFF_OPTIONS },
    { kind: 'hem', label: 'Hem', options: HEM_OPTIONS },
  ],
  jacket: [
    { kind: 'collar', label: 'Collar', options: COLLAR_OPTIONS },
    { kind: 'zipper', label: 'Zipper', options: ZIPPER_OPTIONS },
    { kind: 'pocket', label: 'Pockets', options: JACKET_POCKET_OPTIONS },
    { kind: 'cuff', label: 'Cuffs', options: CUFF_OPTIONS },
    { kind: 'hem', label: 'Hem', options: HEM_OPTIONS },
  ],
  pants: [
    { kind: 'waistband', label: 'Waistband', options: WAISTBAND_OPTIONS },
    { kind: 'pocket', label: 'Pockets', options: BOTTOMS_POCKET_OPTIONS },
    { kind: 'hem', label: 'Hem', options: HEM_OPTIONS },
  ],
  shorts: [
    { kind: 'waistband', label: 'Waistband', options: WAISTBAND_OPTIONS },
    { kind: 'pocket', label: 'Pockets', options: BOTTOMS_POCKET_OPTIONS },
    { kind: 'hem', label: 'Hem', options: HEM_OPTIONS },
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

export function editableConstructionKinds(garmentType: string): ConstructionKind[] {
  return constructionControlsFor(garmentType).map((control) => control.kind)
}
