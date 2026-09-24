import type { ReactNode } from 'react'

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

export interface GarmentRenderProps {
  viewId: string
  bodyColor: string
}

export interface GarmentDefinition {
  id: string
  label: string
  views: GarmentViewDefinition[]
  viewBox: { width: number; height: number }
  panels: GarmentPanelDefinition[]
  defaultPanelId: (viewId: string) => string
  render: (props: GarmentRenderProps) => ReactNode
}
