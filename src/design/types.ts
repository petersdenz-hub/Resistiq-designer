/**
 * Design Document — the single source of truth for a garment design.
 *
 * The canvas is only a visual representation of this document.
 * Designs are never stored as a flattened image.
 */

import type { FontWeight, TextAlign } from './typography'

export const DESIGN_ELEMENT_TYPES = ['graphic', 'text', 'image', 'logo'] as const
export type DesignElementType = (typeof DESIGN_ELEMENT_TYPES)[number]

export const DESIGN_STATUSES = ['draft'] as const
export type DesignStatus = (typeof DESIGN_STATUSES)[number]

export const LAYER_DIRECTIONS = ['forward', 'backward', 'front', 'back'] as const
export type LayerDirection = (typeof LAYER_DIRECTIONS)[number]

export interface DesignView {
  id: string
  label: string
}

/** A designable area on the garment (body, sleeve, collar, …). */
export interface DesignPanel {
  id: string
  label: string
  viewId: string
}

/**
 * Print / placement guide for a panel. Editor-only — never part of the
 * finished garment artwork.
 */
export interface DesignSafeArea {
  id: string
  label: string
  panelId: string
  /** Position and size in the panel's local design units. */
  x: number
  y: number
  width: number
  height: number
}

export interface DesignColor {
  id: string
  role: string
  value: string
}

export interface DesignMaterial {
  id: string
  name: string
  finish?: string
}

export interface DesignElementBase {
  id: string
  type: DesignElementType
  /** Panel this element is placed on (front_body, left_sleeve, …). */
  panelId: string
  /** View that shows this panel. Denormalized from the panel for fast filtering. */
  viewId: string
  /**
   * Position and size in the panel's local design units, not browser pixels.
   * The garment renderer maps these onto the current artwork.
   */
  x: number
  y: number
  width: number
  height: number
  rotation: number
  opacity: number
  zIndex: number
}

export interface GraphicElement extends DesignElementBase {
  type: 'graphic'
  color: string
  shape: 'rect' | 'ellipse'
  cornerRadius: number
}

export interface TextElement extends DesignElementBase {
  type: 'text'
  content: string
  color: string
  fontFamily: string
  fontSize: number
  fontWeight: FontWeight
  italic: boolean
  textAlign: TextAlign
  letterSpacing: number
}

export interface ImageElement extends DesignElementBase {
  type: 'image'
  source: string
}

export interface LogoElement extends DesignElementBase {
  type: 'logo'
  source: string
}

export type DesignElement = GraphicElement | TextElement | ImageElement | LogoElement

export type DesignElementPatch = Partial<
  Omit<GraphicElement, 'type' | 'id'> &
    Omit<TextElement, 'type' | 'id'> &
    Omit<ImageElement, 'type' | 'id'> &
    Omit<LogoElement, 'type' | 'id'>
>

export interface DesignDocument {
  id: string
  name: string
  version: number
  status: DesignStatus
  garmentType: string
  activeView: string
  activePanelId: string
  views: DesignView[]
  panels: DesignPanel[]
  safeAreas: DesignSafeArea[]
  colors: DesignColor[]
  materials: DesignMaterial[]
  elements: DesignElement[]
  createdAt: string
  updatedAt: string
}

export function isGraphicElement(element: DesignElement): element is GraphicElement {
  return element.type === 'graphic'
}

export function isTextElement(element: DesignElement): element is TextElement {
  return element.type === 'text'
}
