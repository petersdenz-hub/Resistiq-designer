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
  label: string
  /** Editor view where this panel can be designed. */
  viewId: string
  /** Structural role of this panel. Not a design element. */
  type: GarmentPanelType
  /**
   * Canonical design-space size. Elements store x/y/width/height in these units
   * so a later size or tech-pack mapping does not depend on browser pixels.
   */
  local: { width: number; height: number }
  /** Where this panel sits on the garment viewBox. */
  frame: GarmentRect
  /** Optional design/safe area for this panel. */
  safeArea?: GarmentSafeAreaDefinition
}

export interface GarmentDefaults {
  bodyColor: string
}

export interface GarmentRenderProps {
  viewId: string
  bodyColor: string
}

export interface GarmentDefinition {
  id: string
  name: string
  label: string
  category: GarmentCategory
  views: GarmentViewDefinition[]
  viewBox: { width: number; height: number }
  panels: GarmentPanelDefinition[]
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
