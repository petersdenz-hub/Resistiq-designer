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

export interface GarmentRenderProps {
  viewId: string
  bodyColor: string
}

export interface GarmentDefinition {
  id: string
  label: string
  views: GarmentViewDefinition[]
  viewBox: { width: number; height: number }
  printArea: Record<string, GarmentRect>
  render: (props: GarmentRenderProps) => ReactNode
}
