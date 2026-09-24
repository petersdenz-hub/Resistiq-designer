import { createNewDesign } from '@/design/createDesign'
import { createId } from '@/design/ids'
import { isPlacedImage } from '@/design/types'
import type { DesignDocument } from '@/design/types'
import { forgetAsset } from './assetCache'
import { localAssetStore } from './localAssetStore'
import { resolveGarmentType } from '@/garments/registry'
import { isDesignDocument, normalizeDocument } from './validateDocument'

const LIBRARY_KEY = 'resistq-designer:v1:library'
const LEGACY_DRAFT_KEY = 'resistq-designer:v1:document'

export interface SavedDesignSummary {
  id: string
  name: string
  garmentType: string
  thumbnail: string | null
  bodyColor: string
  createdAt: string
  updatedAt: string
}

export interface SavedDesign extends SavedDesignSummary {
  document: DesignDocument
}

interface LibraryFile {
  designs: SavedDesign[]
}

export function createDesign(garmentType = 'tshirt'): DesignDocument {
  return createNewDesign(garmentType)
}

export function listDesigns(): SavedDesignSummary[] {
  return readLibrary()
    .designs.slice()
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .map(toSummary)
}

export function getDesign(id: string): SavedDesign | null {
  return readLibrary().designs.find((design) => design.id === id) ?? null
}

export function saveDesign(
  document: DesignDocument,
  thumbnail: string | null = null,
): SavedDesign {
  const now = new Date().toISOString()
  const existing = getDesign(document.id)
  const nextDocument: DesignDocument = {
    ...structuredClone(document),
    garmentType: resolveGarmentType(document.garmentType),
    updatedAt: now,
    createdAt: existing?.document.createdAt ?? document.createdAt,
  }

  const record: SavedDesign = {
    id: nextDocument.id,
    name: nextDocument.name.trim() || 'Untitled design',
    garmentType: nextDocument.garmentType,
    thumbnail: thumbnail && thumbnail.length < 80_000 ? thumbnail : (existing?.thumbnail ?? null),
    bodyColor: bodyColorOf(nextDocument),
    createdAt: nextDocument.createdAt,
    updatedAt: now,
    document: nextDocument,
  }

  const library = readLibrary()
  const index = library.designs.findIndex((design) => design.id === record.id)
  if (index >= 0) {
    library.designs[index] = record
  } else {
    library.designs.push(record)
  }
  writeLibrary(library)
  return record
}

export function duplicateDesign(id: string): SavedDesign | null {
  const source = getDesign(id)
  if (!source) {
    return null
  }

  const now = new Date().toISOString()
  const nextId = createId()
  const document: DesignDocument = {
    ...structuredClone(source.document),
    id: nextId,
    name: copyName(source.name),
    createdAt: now,
    updatedAt: now,
  }

  return saveDesign(document, source.thumbnail)
}

export async function deleteDesign(id: string): Promise<boolean> {
  const library = readLibrary()
  const target = library.designs.find((design) => design.id === id)
  if (!target) {
    return false
  }

  const remaining = library.designs.filter((design) => design.id !== id)
  writeLibrary({ designs: remaining })

  const stillUsed = new Set(remaining.flatMap((design) => assetIdsOf(design.document)))
  const orphans = assetIdsOf(target.document).filter((assetId) => !stillUsed.has(assetId))
  await Promise.all(orphans.map((assetId) => removeUnusedAsset(assetId)))
  return true
}

export function needsDesignName(name: string): boolean {
  const trimmed = name.trim()
  return trimmed.length === 0 || /^untitled\b/i.test(trimmed)
}

function toSummary(design: SavedDesign): SavedDesignSummary {
  return {
    id: design.id,
    name: design.name,
    garmentType: design.garmentType,
    thumbnail: design.thumbnail,
    bodyColor: design.bodyColor,
    createdAt: design.createdAt,
    updatedAt: design.updatedAt,
  }
}

function bodyColorOf(document: DesignDocument): string {
  return document.colors.find((color) => color.role === 'body')?.value ?? '#e8e4dc'
}

function assetIdsOf(document: DesignDocument): string[] {
  return document.elements.filter(isPlacedImage).map((element) => element.source)
}

function copyName(name: string): string {
  return name.endsWith(' copy') ? `${name} 2` : `${name} copy`
}

async function removeUnusedAsset(id: string) {
  forgetAsset(id)
  try {
    await localAssetStore.remove(id)
  } catch {
    // Editing must continue even if cleanup fails.
  }
}

function readLibrary(): LibraryFile {
  migrateLegacyDraft()

  if (typeof localStorage === 'undefined') {
    return { designs: [] }
  }

  try {
    const raw = localStorage.getItem(LIBRARY_KEY)
    if (!raw) {
      return { designs: [] }
    }
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || !Array.isArray((parsed as LibraryFile).designs)) {
      return { designs: [] }
    }
    return {
      designs: (parsed as LibraryFile).designs
        .filter((design) => isSavedDesign(design))
        .map(hydrateSavedDesign),
    }
  } catch {
    return { designs: [] }
  }
}

function writeLibrary(library: LibraryFile) {
  if (typeof localStorage === 'undefined') {
    return
  }
  try {
    localStorage.setItem(LIBRARY_KEY, JSON.stringify(library))
  } catch {
    // Quota or private-mode failures must not break the editor.
  }
}

function hydrateSavedDesign(design: SavedDesign): SavedDesign {
  const document = normalizeDocument(design.document)
  return {
    ...design,
    garmentType: resolveGarmentType(design.garmentType || document.garmentType),
    document,
  }
}

function isSavedDesign(value: unknown): value is SavedDesign {
  if (!value || typeof value !== 'object') {
    return false
  }
  const design = value as SavedDesign
  return (
    typeof design.id === 'string' &&
    typeof design.name === 'string' &&
    isDesignDocument(design.document)
  )
}

function migrateLegacyDraft() {
  if (typeof localStorage === 'undefined') {
    return
  }
  if (localStorage.getItem(LIBRARY_KEY)) {
    return
  }

  try {
    const raw = localStorage.getItem(LEGACY_DRAFT_KEY)
    if (!raw) {
      return
    }
    const parsed: unknown = JSON.parse(raw)
    if (!isDesignDocument(parsed) || parsed.elements.length === 0) {
      localStorage.removeItem(LEGACY_DRAFT_KEY)
      writeLibrary({ designs: [] })
      return
    }
    writeLibrary({ designs: [] })
    saveDesign(parsed, null)
    localStorage.removeItem(LEGACY_DRAFT_KEY)
  } catch {
    writeLibrary({ designs: [] })
  }
}
