import { defaultConstructionFor } from '@/garments/constructionDefaults'
import {
  CONSTRUCTION_KINDS,
  type ConstructionKind,
  type DesignButton,
  type DesignCollar,
  type DesignConstruction,
  type DesignConstructionPart,
  type DesignCuff,
  type DesignDocument,
  type DesignHem,
  type DesignHood,
  type DesignMaterial,
  type DesignPocket,
  type DesignWaistband,
  type DesignZipper,
} from './types'

export interface ResolvedConstruction {
  materialId?: string
  zipper: DesignZipper | null
  pockets: DesignPocket[]
  buttons: DesignButton[]
  cuffs: DesignCuff[]
  collar: DesignCollar | null
  waistband: DesignWaistband | null
  hem: DesignHem | null
  hood: DesignHood | null
}

const LIST_KINDS = new Set<ConstructionKind>(['pocket', 'button', 'cuff'])

export function emptyConstruction(): DesignConstruction {
  return {
    zipper: null,
    pockets: [],
    buttons: [],
    cuffs: [],
    collar: null,
    waistband: null,
    hem: null,
    hood: null,
  }
}

export function getStoredConstruction(document: DesignDocument): DesignConstruction | undefined {
  return document.construction
}

/** Read-time merge. Never writes garment defaults onto the document. */
export function resolveConstruction(document: DesignDocument): ResolvedConstruction {
  const defaults = defaultConstructionFor(document.garmentType)
  const stored = document.construction

  return {
    materialId: stored?.materialId ?? defaults.materialId,
    zipper: pickSingular(stored, defaults, 'zipper'),
    pockets: pickList(stored, defaults, 'pockets'),
    buttons: pickList(stored, defaults, 'buttons'),
    cuffs: pickList(stored, defaults, 'cuffs'),
    collar: pickSingular(stored, defaults, 'collar'),
    waistband: pickSingular(stored, defaults, 'waistband'),
    hem: pickSingular(stored, defaults, 'hem'),
    hood: pickSingular(stored, defaults, 'hood'),
  }
}

function pickSingular<K extends 'zipper' | 'collar' | 'waistband' | 'hem' | 'hood'>(
  stored: DesignConstruction | undefined,
  defaults: DesignConstruction,
  key: K,
): NonNullable<DesignConstruction[K]> | null {
  if (!stored || !Object.prototype.hasOwnProperty.call(stored, key)) {
    return defaults[key] ?? null
  }
  return stored[key] ?? null
}

function pickList<K extends 'pockets' | 'buttons' | 'cuffs'>(
  stored: DesignConstruction | undefined,
  defaults: DesignConstruction,
  key: K,
): NonNullable<DesignConstruction[K]> {
  if (!stored || !Object.prototype.hasOwnProperty.call(stored, key)) {
    return defaults[key] ?? []
  }
  return stored[key] ?? []
}

export function sanitizeConstruction(value: unknown): DesignConstruction | undefined {
  if (value === undefined || value === null) {
    return undefined
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return undefined
  }

  const raw = value as Record<string, unknown>
  const next: DesignConstruction = {}

  if (typeof raw.materialId === 'string' && raw.materialId.length > 0) {
    next.materialId = raw.materialId
  }

  assignSingular(next, raw, 'zipper', 'zipper')
  assignList(next, raw, 'pockets', 'pocket')
  assignList(next, raw, 'buttons', 'button')
  assignList(next, raw, 'cuffs', 'cuff')
  assignSingular(next, raw, 'collar', 'collar')
  assignSingular(next, raw, 'waistband', 'waistband')
  assignSingular(next, raw, 'hem', 'hem')
  assignSingular(next, raw, 'hood', 'hood')

  return next
}

function assignSingular(
  target: DesignConstruction,
  raw: Record<string, unknown>,
  key: 'zipper' | 'collar' | 'waistband' | 'hem' | 'hood',
  kind: ConstructionKind,
) {
  if (!Object.prototype.hasOwnProperty.call(raw, key)) {
    return
  }
  if (raw[key] === null) {
    target[key] = null
    return
  }
  const part = sanitizePart(raw[key], kind)
  if (part) {
    target[key] = part as never
  }
}

function assignList(
  target: DesignConstruction,
  raw: Record<string, unknown>,
  key: 'pockets' | 'buttons' | 'cuffs',
  kind: ConstructionKind,
) {
  if (!Object.prototype.hasOwnProperty.call(raw, key)) {
    return
  }
  if (!Array.isArray(raw[key])) {
    target[key] = []
    return
  }
  target[key] = raw[key]
    .map((item) => sanitizePart(item, kind))
    .filter((item): item is DesignConstructionPart => item !== null) as never
}

function sanitizePart(value: unknown, expectedKind: ConstructionKind): DesignConstructionPart | null {
  if (!value || typeof value !== 'object') {
    return null
  }
  const raw = value as Record<string, unknown>
  if (typeof raw.id !== 'string' || raw.id.length === 0) {
    return null
  }
  if (typeof raw.style !== 'string' || raw.style.length === 0) {
    return null
  }
  const kind = CONSTRUCTION_KINDS.includes(raw.kind as ConstructionKind)
    ? (raw.kind as ConstructionKind)
    : expectedKind
  if (kind !== expectedKind) {
    return null
  }

  const part: DesignConstructionPart = { id: raw.id, kind, style: raw.style }
  if (typeof raw.present === 'boolean') {
    part.present = raw.present
  }
  if (typeof raw.panelId === 'string' && raw.panelId.length > 0) {
    part.panelId = raw.panelId
  }
  if (typeof raw.color === 'string' && raw.color.length > 0) {
    part.color = raw.color
  }
  if (typeof raw.materialId === 'string' && raw.materialId.length > 0) {
    part.materialId = raw.materialId
  }
  return part
}

function touch(document: DesignDocument): DesignDocument {
  return {
    ...document,
    updatedAt: new Date().toISOString(),
  }
}

export function patchConstruction(
  document: DesignDocument,
  patch: DesignConstruction,
): DesignDocument {
  return touch({
    ...document,
    construction: {
      ...document.construction,
      ...patch,
    },
  })
}

export function setConstructionPart(
  document: DesignDocument,
  part: DesignConstructionPart,
): DesignDocument {
  const current = document.construction ?? {}
  if (LIST_KINDS.has(part.kind)) {
    const key = part.kind === 'pocket' ? 'pockets' : part.kind === 'button' ? 'buttons' : 'cuffs'
    const list = [...((current[key] as DesignConstructionPart[] | undefined) ?? [])]
    const index = list.findIndex((item) => item.id === part.id)
    if (index >= 0) {
      list[index] = part
    } else {
      list.push(part)
    }
    return touch({
      ...document,
      construction: { ...current, [key]: list },
    })
  }

  return touch({
    ...document,
    construction: { ...current, [part.kind]: part },
  })
}

export function clearConstructionPart(
  document: DesignDocument,
  kind: ConstructionKind,
  partId?: string,
): DesignDocument {
  const current = document.construction ?? {}
  if (LIST_KINDS.has(kind)) {
    const key = kind === 'pocket' ? 'pockets' : kind === 'button' ? 'buttons' : 'cuffs'
    const list = ((current[key] as DesignConstructionPart[] | undefined) ?? []).filter(
      (item) => item.id !== partId,
    )
    return touch({
      ...document,
      construction: { ...current, [key]: list },
    })
  }

  return touch({
    ...document,
    construction: { ...current, [kind]: null },
  })
}

export function upsertMaterial(
  document: DesignDocument,
  material: DesignMaterial,
): DesignDocument {
  const index = document.materials.findIndex((item) => item.id === material.id)
  const materials =
    index >= 0
      ? document.materials.map((item, materialIndex) =>
          materialIndex === index ? material : item,
        )
      : [...document.materials, material]

  return touch({
    ...document,
    materials,
  })
}

export function constructionKindsOf(resolved: ResolvedConstruction): ConstructionKind[] {
  const kinds: ConstructionKind[] = []
  if (resolved.hood) kinds.push('hood')
  if (resolved.collar) kinds.push('collar')
  if (resolved.zipper) kinds.push('zipper')
  if (resolved.pockets.length) kinds.push('pocket')
  if (resolved.buttons.length) kinds.push('button')
  if (resolved.cuffs.length) kinds.push('cuff')
  if (resolved.waistband) kinds.push('waistband')
  if (resolved.hem) kinds.push('hem')
  return kinds
}
