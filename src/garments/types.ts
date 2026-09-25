import type { ResolvedConstruction } from '@/design/construction'
import type { DesignConstruction } from '@/design/types'
import type { ReactNode } from 'react'
import type { GarmentCapabilities } from './capabilities'

export interface GarmentConstructionControl {
  id: string
  kind: string
  label: string
  options: Array<{ value: string; label: string }>
  slot?: string
  field?: 'style' | 'variant'
  requiresKind?: string
}

export type GarmentCategory =
  | 'tops'
  | 'outerwear'
  | 'bottoms'
  | 'headwear'
  | 'accessories'
  | 'bags'

export type GarmentPanelType =
  | 'body'
  | 'sleeve'
  | 'collar'
  | 'hood'
  | 'cuff'
  | 'leg'
  | 'waistband'
  | 'hem'
  | 'structure'
  | 'pocket'
  | 'chest'
  | 'lower_sleeve'
  | 'side_panel'
  | 'zipper'
  | 'seam'
  | 'crown'
  | 'brim'
  | 'band'
  | 'hand'
  | 'foot'
  | 'shell'
  | 'strap'
  | 'flap'

export type GarmentPanelSide = 'front' | 'back' | 'left' | 'right' | 'center'

/**
 * Well-known placement / print zone ids. A garment may also declare its own
 * zone strings (crown, brim, strap, …). The editor consumes whatever the
 * definition lists in `supportedDesignZones`.
 */
export const GARMENT_DESIGN_ZONES = [
  'front',
  'back',
  'left-sleeve',
  'right-sleeve',
  'left-leg',
  'right-leg',
] as const
export type GarmentDesignZoneId = (typeof GARMENT_DESIGN_ZONES)[number] | (string & {})

/** Colorable / selectable region backed by one or more real panels. */
export interface GarmentRegionDefinition {
  id: string
  label: string
  panelIds: string[]
}

/** Percentage box inside a panel (0–100). Independent of zoom and screen pixels. */
export interface PercentRect {
  x: number
  y: number
  width: number
  height: number
}

/** Printable / artwork zone inside a panel. Not a seam or construction part. */
export interface DesignZoneDefinition {
  id: string
  name: string
  bounds: PercentRect
}

export interface GarmentViewDefinition {
  id: string
  label: string
}

export interface GarmentRect {
  x: number
  y: number
  width: number
  height: number
}

/** Print / placement guide in panel-local units. Editor overlay only. */
export interface GarmentSafeAreaDefinition {
  id: string
  label: string
  x: number
  y: number
  width: number
  height: number
}

export interface GarmentPanelDefinition {
  id: string
  /** Display name. Falls back to `label` when omitted. */
  name?: string
  label: string
  /** Editor view where this panel can be designed. */
  viewId: string
  /** Which side of the garment this panel belongs to. */
  side?: GarmentPanelSide
  /** Structural role of this panel. Not a design element. */
  type: GarmentPanelType
  /** Whether artwork can be placed on this panel. */
  printable?: boolean
  /**
   * Canonical design-space size. Elements store x/y/width/height in these units
   * so a later size or tech-pack mapping does not depend on browser pixels.
   */
  local: { width: number; height: number }
  /** Where this panel sits on the garment viewBox. */
  frame: GarmentRect
  /**
   * Printable design area as percentages of the panel local box.
   * Example: { x: 10, y: 15, width: 80, height: 70 }.
   */
  designBounds?: PercentRect
  /** Optional print zones inside this panel. */
  designZones?: DesignZoneDefinition[]
  /** Optional design/safe area for this panel. */
  safeArea?: GarmentSafeAreaDefinition
  /**
   * True panel silhouette in garment viewBox coordinates.
   * Used for selection outlines and artwork clipping — never a print rectangle.
   */
  silhouette?: string | string[]
  /** Editor placement zone this panel belongs to. Inferred from type/side when omitted. */
  placementZone?: string
  /** Stable region id when this panel should not follow the default type/side grouping. */
  regionId?: string
  /** Display label for `regionId`. */
  regionLabel?: string
}

export interface GarmentDefaults {
  bodyColor: string
}

export interface GarmentRenderProps {
  viewId: string
  bodyColor: string
  /** Optional per-panel overrides. Missing ids use bodyColor. */
  panelColors?: Record<string, string>
  /** Optional per-panel fabric. Missing ids use the garment material. */
  panelMaterials?: Record<string, string>
  /**
   * Resolved construction from the Design Document.
   * 7B.1 stores this; renderers still use the current hardcoded flats.
   */
  construction?: ResolvedConstruction
}

export interface GarmentPreview {
  viewId: string
}

export interface GarmentDefinition {
  id: string
  name: string
  label: string
  category: GarmentCategory
  views: GarmentViewDefinition[]
  viewBox: { width: number; height: number }
  panels: GarmentPanelDefinition[]
  /**
   * Explicit editable regions. When omitted, regions are derived from panels.
   * A new garment should declare these rather than teaching the editor new IDs.
   */
  regions?: GarmentRegionDefinition[]
  /** Front-view snapshot used by the catalog and garment selector. */
  preview?: GarmentPreview
  /** Placement zones the editor should offer for this garment. */
  supportedDesignZones?: readonly GarmentDesignZoneId[]
  /**
   * Panel types this garment may grow later (hood, pocket, brim, strap, …).
   * Listed so the model can represent them without implementing them now.
   */
  reservedPanelTypes?: readonly GarmentPanelType[]
  /** Read-time construction used when the document has none. */
  constructionDefaults?: DesignConstruction
  /** Construction editor controls. Derived from capabilities when omitted. */
  constructionControls?: readonly GarmentConstructionControl[]
  defaults: GarmentDefaults
  capabilities: GarmentCapabilities
  defaultPanelId: (viewId: string) => string
  render: (props: GarmentRenderProps) => ReactNode
}

export const GARMENT_CATEGORY_LABELS: Record<GarmentCategory, string> = {
  tops: 'Tops',
  outerwear: 'Outerwear',
  bottoms: 'Bottoms',
  headwear: 'Headwear',
  accessories: 'Accessories',
  bags: 'Bags',
}

export const GARMENT_CATEGORY_ORDER: GarmentCategory[] = [
  'tops',
  'outerwear',
  'bottoms',
  'headwear',
  'accessories',
  'bags',
]

export function categoryLabel(category: string): string {
  return GARMENT_CATEGORY_LABELS[category as GarmentCategory] ?? category
}

export const FRONT_BACK_VIEWS: GarmentViewDefinition[] = [
  { id: 'front', label: 'Front' },
  { id: 'back', label: 'Back' },
]

export const STANDARD_VIEWBOX = { width: 560, height: 640 }
