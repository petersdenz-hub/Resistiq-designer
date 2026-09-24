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
  /** Structural role copied from the garment definition. Optional on older documents. */
  type?: string
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

export const COLOR_ROLES = ['body', 'panel', 'trim'] as const
export type ColorRole = (typeof COLOR_ROLES)[number]

export interface DesignColor {
  id: string
  /**
   * Color slot on the garment.
   * `body` — garment-wide fallback
   * `panel` — override for one panel (`id` is the panel id)
   * `trim` — reserved for later structure colors (zipper tape, rib, …)
   */
  role: string
  value: string
}

export const MATERIAL_FAMILIES = [
  'cotton',
  'fleece',
  'french_terry',
  'nylon',
  'denim',
  'rib',
  'other',
] as const
export type MaterialFamily = (typeof MATERIAL_FAMILIES)[number]

export interface DesignMaterial {
  id: string
  name: string
  finish?: string
  /** Optional on older documents. */
  family?: string
}

/**
 * Garment construction / details. Not a design element and not a panel.
 * Optional on older documents — missing data uses garment defaults at read time.
 */
export const CONSTRUCTION_KINDS = [
  'zipper',
  'pocket',
  'button',
  'cuff',
  'collar',
  'waistband',
  'hem',
  'hood',
] as const
export type ConstructionKind = (typeof CONSTRUCTION_KINDS)[number]

export const ZIPPER_STYLES = ['center_front', 'quarter'] as const
export const POCKET_STYLES = ['kangaroo', 'patch', 'welt', 'slash'] as const
export const BUTTON_STYLES = ['snap', 'button'] as const
export const CUFF_STYLES = ['rib', 'hem'] as const
export const COLLAR_STYLES = ['crew', 'rib', 'stand'] as const
export const WAISTBAND_STYLES = ['elastic', 'rib', 'faced'] as const
export const HEM_STYLES = ['coverstitch', 'rib'] as const
export const HOOD_STYLES = ['pullover', 'zip'] as const

export interface DesignConstructionPart {
  id: string
  kind: ConstructionKind
  /** Style variant. Unknown values stay stored and fall back at render time later. */
  style: string
  /** Missing means garment default visibility. */
  present?: boolean
  /** Panel this structure belongs to, if any. Not an element placement. */
  panelId?: string
  /** Optional trim-like color for this part. */
  color?: string
  /** Optional fabric from document.materials. */
  materialId?: string
}

export type DesignZipper = DesignConstructionPart & { kind: 'zipper' }
export type DesignPocket = DesignConstructionPart & { kind: 'pocket' }
export type DesignButton = DesignConstructionPart & { kind: 'button' }
export type DesignCuff = DesignConstructionPart & { kind: 'cuff' }
export type DesignCollar = DesignConstructionPart & { kind: 'collar' }
export type DesignWaistband = DesignConstructionPart & { kind: 'waistband' }
export type DesignHem = DesignConstructionPart & { kind: 'hem' }
export type DesignHood = DesignConstructionPart & { kind: 'hood' }

export interface DesignConstruction {
  /** Garment-wide fabric from document.materials. */
  materialId?: string
  zipper?: DesignZipper | null
  pockets?: DesignPocket[]
  buttons?: DesignButton[]
  cuffs?: DesignCuff[]
  collar?: DesignCollar | null
  waistband?: DesignWaistband | null
  hem?: DesignHem | null
  hood?: DesignHood | null
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
  /** Asset id in the asset store — not a flattened screenshot. */
  source: string
  fileName: string
  mimeType: string
  locked: boolean
}

export interface LogoElement extends DesignElementBase {
  type: 'logo'
  source: string
  fileName: string
  mimeType: string
  locked: boolean
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
  /**
   * Structured garment details. Older documents omit this field.
   * Do not treat missing construction as an error.
   */
  construction?: DesignConstruction
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

export function isImageElement(element: DesignElement): element is ImageElement {
  return element.type === 'image'
}

export function isLogoElement(element: DesignElement): element is LogoElement {
  return element.type === 'logo'
}

export function isPlacedImage(
  element: DesignElement,
): element is ImageElement | LogoElement {
  return element.type === 'image' || element.type === 'logo'
}

export function isLockedElement(element: DesignElement): boolean {
  return isPlacedImage(element) && element.locked
}
