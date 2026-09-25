import { variantOf, styleOf } from '@/design/constructionEdits'
import type { ResolvedConstruction } from '@/design/construction'
import type { ConstructionKind } from '@/design/types'
import {
  constructionControlsFromDefinition,
  filterControlsByCapabilities,
} from './constructionCatalog'
import { getGarment } from './registry'
import type { GarmentConstructionControl } from './types'

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

function asControl(control: GarmentConstructionControl): ConstructionControlSpec {
  return {
    id: control.id,
    kind: control.kind as ConstructionKind,
    label: control.label,
    options: control.options,
    slot: control.slot,
    field: control.field,
    requiresKind: control.requiresKind as ConstructionKind | undefined,
  }
}

/** Editor controls for this garment. Capabilities hide unsupported kinds. */
export function constructionControlsFor(garmentType: string): ConstructionControlSpec[] {
  const garment = getGarment(garmentType)
  return filterControlsByCapabilities(
    constructionControlsFromDefinition(garment),
    garment.capabilities,
  ).map(asControl)
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
