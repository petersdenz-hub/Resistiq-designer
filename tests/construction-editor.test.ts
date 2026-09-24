import { createNewDesign } from '@/design/createDesign'
import {
  resolveConstruction,
  setConstructionStyle,
  setGarmentMaterial,
  setPanelColor,
  styleOf,
  type DesignDocument,
} from '@/design'
import { DESIGN_ELEMENT_TYPES } from '@/design/types'
import { getPanelColor } from '@/design/selectors'
import { editableConstructionKinds } from '@/garments/constructionOptions'
import { MATERIAL_CATALOG } from '@/garments/materialCatalog'
import { isDesignDocument, normalizeDocument } from '@/persistence/validateDocument'
import { describe, expect, it } from 'vitest'

function legacyTshirt(): DesignDocument {
  return {
    id: 'legacy-tee',
    name: 'Old tee',
    version: 1,
    status: 'draft',
    garmentType: 'tshirt',
    activeView: 'front',
    activePanelId: 'front_body',
    views: [
      { id: 'front', label: 'Front' },
      { id: 'back', label: 'Back' },
    ],
    panels: [
      { id: 'front_body', label: 'Front body', viewId: 'front', type: 'body' },
      { id: 'back_body', label: 'Back body', viewId: 'back', type: 'body' },
    ],
    safeAreas: [],
    colors: [{ id: 'body', role: 'body', value: '#e8e4dc' }],
    materials: [],
    elements: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  }
}

describe('Phase 7B.2 construction editor', () => {
  it('selects a catalog material onto the Design Document', () => {
    const document = setGarmentMaterial(createNewDesign('tshirt'), 'cotton')
    expect(document.construction?.materialId).toBe('cotton')
    expect(document.materials[0]).toMatchObject({ id: 'cotton', name: 'Cotton' })
    expect(MATERIAL_CATALOG.some((material) => material.id === 'cotton')).toBe(true)
  })

  it('changes construction on the document, not as an element', () => {
    const document = setConstructionStyle(createNewDesign('tshirt'), 'collar', 'stand')
    expect(document.construction?.collar?.style).toBe('stand')
    expect(document.elements).toEqual([])
    expect((DESIGN_ELEMENT_TYPES as readonly string[]).includes('collar')).toBe(false)
  })

  it('keeps garment defaults until the user writes an override', () => {
    const document = createNewDesign('hoodie')
    expect(document.construction).toBeUndefined()
    expect(styleOf(resolveConstruction(document), 'hood')).toBe('pullover')
    expect(styleOf(resolveConstruction(document), 'pocket')).toBe('kangaroo')
  })

  it('treats none as an explicit override', () => {
    const document = setConstructionStyle(createNewDesign('hoodie'), 'hood', 'none')
    expect(document.construction?.hood).toBeNull()
    expect(styleOf(resolveConstruction(document), 'hood')).toBe('none')
    expect(styleOf(resolveConstruction(document), 'pocket')).toBe('kangaroo')
  })

  it('preserves construction through clone (save/reopen/duplicate)', () => {
    let document = setGarmentMaterial(createNewDesign('jacket'), 'nylon')
    document = setConstructionStyle(document, 'zipper', 'quarter')
    const copy = structuredClone(document)
    const normalized = normalizeDocument(copy)
    expect(normalized.construction?.materialId).toBe('nylon')
    expect(normalized.construction?.zipper?.style).toBe('quarter')
    expect(styleOf(resolveConstruction(normalized), 'collar')).toBe('stand')
  })

  it('keeps existing designs without construction working', () => {
    const document = legacyTshirt()
    expect(isDesignDocument(document)).toBe(true)
    expect(normalizeDocument(document).construction).toBeUndefined()
    expect(styleOf(resolveConstruction(document), 'collar')).toBe('crew')
    expect(styleOf(resolveConstruction(document), 'hem')).toBe('coverstitch')
  })

  it('does not replace panel colors when construction changes', () => {
    let document = setPanelColor(createNewDesign('hoodie'), 'front_body', '#3f4f2a')
    document = setConstructionStyle(document, 'pocket', 'patch')
    document = setGarmentMaterial(document, 'fleece')
    expect(getPanelColor(document, 'front_body')).toBe('#3f4f2a')
    expect(document.colors.find((color) => color.role === 'panel')?.value).toBe('#3f4f2a')
    expect(styleOf(resolveConstruction(document), 'pocket')).toBe('patch')
  })

  it('exposes the right construction controls per garment', () => {
    expect(editableConstructionKinds('tshirt')).toEqual(['collar', 'hem'])
    expect(editableConstructionKinds('hoodie')).toEqual(['hood', 'pocket', 'cuff', 'hem'])
    expect(editableConstructionKinds('jacket')).toEqual([
      'collar',
      'zipper',
      'pocket',
      'cuff',
      'hem',
    ])
    expect(editableConstructionKinds('pants')).toEqual(['waistband', 'pocket', 'hem'])
    expect(editableConstructionKinds('shorts')).toEqual(['waistband', 'pocket', 'hem'])
  })
})
