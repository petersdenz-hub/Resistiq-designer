import type { ResolvedConstruction } from '@/design/construction'
import type { ReactNode } from 'react'
import type { GarmentCapabilities } from './capabilities'

export type GarmentCategory = 'tops' | 'outerwear' | 'bottoms'

export type GarmentPanelType =
  | 'body'
  | 'sleeve'
  | 'collar'
  | 'hood'
  | 'cuff'
  | 'leg'
  | 'waistband'
  | 'structure'
  | 'pocket'
  | 'chest'
  | 'lower_sleeve'
  | 'side_panel'

export type GarmentPanelSide = 'front' | 'back' | 'left' | 'right' | 'center'

/** Placement / print zone ids used by the editor. Not physical seams. */
export const GARMENT_DESIGN_ZONES = [
  'front',
  'back',
  'left-sleeve',
  'right-sleeve',
  'left-leg',
  'right-leg',
] as const
export type GarmentDesignZoneId = (typeof GARMENT_DESIGN_ZONES)[number]

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
}

export interface GarmentDefaults {
  bodyColor: string
}

export interface GarmentRenderProps {
  viewId: string
  bodyColor: string
  /** Optional per-panel overrides. Missing ids use bodyColor. */
  panelColors?: Record<string, string>
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
  /** Front-view snapshot used by the catalog and garment selector. */
  preview?: GarmentPreview
  /** Placement zones the editor should offer for this garment. */
  supportedDesignZones?: readonly GarmentDesignZoneId[]
  /**
   * Panel types this garment may grow later (hood, pocket, collar, …).
   * Listed so the model can represent them without implementing them now.
   */
  reservedPanelTypes?: readonly GarmentPanelType[]
  defaults: GarmentDefaults
  capabilities: GarmentCapabilities
  defaultPanelId: (viewId: string) => string
  render: (props: GarmentRenderProps) => ReactNode
}

export const GARMENT_CATEGORY_LABELS: Record<GarmentCategory, string> = {
  tops: 'Tops',
  outerwear: 'Outerwear',
  bottoms: 'Bottoms',
}

export const FRONT_BACK_VIEWS: GarmentViewDefinition[] = [
  { id: 'front', label: 'Front' },
  { id: 'back', label: 'Back' },
]

export const STANDARD_VIEWBOX = { width: 560, height: 640 }
