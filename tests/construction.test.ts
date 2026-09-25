import { createNewDesign } from '@/design/createDesign'
import {
  clearConstructionPart,
  constructionKindsOf,
  emptyConstruction,
  patchConstruction,
  resolveConstruction,
  sanitizeConstruction,
  setConstructionPart,
  upsertMaterial,
} from '@/design'
import { getPanelColor, getResolvedConstruction } from '@/design/selectors'
import { setPanelColor } from '@/design/operations'
import { DESIGN_ELEMENT_TYPES, type DesignDocument } from '@/design/types'
import { defaultConstructionFor } from '@/garments/constructionDefaults'
import { getGarment } from '@/garments/registry'
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

describe('Phase 7B.1 construction foundation', () => {
  it('does not add construction to new designs', () => {
    for (const type of ['tshirt', 'hoodie', 'sweatshirt', 'jacket', 'pants', 'shorts']) {
      const document = createNewDesign(type)
      expect(document.construction).toBeUndefined()
      expect(document.materials).toEqual([])
    }
  })

  it('keeps existing documents valid without construction', () => {
    const document = legacyTshirt()
    expect(isDesignDocument(document)).toBe(true)
    const normalized = normalizeDocument(document)
    expect(normalized.construction).toBeUndefined()
    expect(resolveConstruction(normalized).collar?.style).toBe('crew')
  })

  it('does not treat construction as a design element', () => {
    expect(DESIGN_ELEMENT_TYPES).toEqual(['graphic', 'text', 'image', 'logo'])
  })

  it('resolves garment defaults at read time for all five garments', () => {
    const expected = {
      tshirt: ['collar', 'cuff', 'hem'],
      hoodie: ['hood', 'pocket', 'cuff', 'hem', 'drawstring'],
      jacket: ['collar', 'zipper', 'cuff', 'hem'],
      pants: ['pocket', 'waistband', 'hem'],
      shorts: ['pocket', 'waistband', 'hem'],
    }

    for (const [type, kinds] of Object.entries(expected)) {
      const document = createNewDesign(type)
      expect(constructionKindsOf(resolveConstruction(document))).toEqual(kinds)
    }
  })

  it('keeps default zipper when the document omits construction', () => {
    const document = createNewDesign('jacket')
    expect(resolveConstruction(document).zipper?.style).toBe('center_front')
  })

  it('lets an explicit null zipper override the jacket default', () => {
    const document = patchConstruction(createNewDesign('jacket'), { zipper: null })
    expect(document.construction?.zipper).toBeNull()
    expect(resolveConstruction(document).zipper).toBeNull()
  })

  it('writes only the override onto the document', () => {
    const document = setConstructionPart(createNewDesign('hoodie'), {
      id: 'kangaroo_pocket',
      kind: 'pocket',
      style: 'patch',
      present: true,
      panelId: 'front_body',
    })
    expect(document.construction?.pockets?.[0]?.style).toBe('patch')
    expect(document.construction?.hood).toBeUndefined()
    expect(resolveConstruction(document).hood?.style).toBe('pullover')
  })

  it('preserves Phase 7A panel colors beside construction data', () => {
    let document = setPanelColor(createNewDesign('hoodie'), 'front_body', '#3f4f2a')
    document = setConstructionPart(document, {
      id: 'hood',
      kind: 'hood',
      style: 'zip',
      present: true,
      panelId: 'hood',
    })
    expect(getPanelColor(document, 'front_body')).toBe('#3f4f2a')
    expect(getPanelColor(document, 'right_sleeve')).toBe(document.colors[0].value)
    expect(document.colors.some((color) => color.role === 'panel' && color.id === 'front_body')).toBe(
      true,
    )
    expect(resolveConstruction(document).hood?.style).toBe('zip')
  })

  it('sanitizes invalid construction without inventing defaults', () => {
    expect(sanitizeConstruction('nope')).toBeUndefined()
    expect(sanitizeConstruction(null)).toBeUndefined()
    const cleaned = sanitizeConstruction({
      zipper: { id: 'zipper', kind: 'zipper', style: 'center_front' },
      pockets: [{ id: 'bad' }, { id: 'kangaroo_pocket', kind: 'pocket', style: 'kangaroo' }],
      extra: true,
    })
    expect(cleaned?.zipper?.id).toBe('zipper')
    expect(cleaned?.pockets).toHaveLength(1)
    expect(cleaned).not.toHaveProperty('extra')
  })

  it('keeps older materials without a family', () => {
    const document = upsertMaterial(legacyTshirt(), { id: 'cotton-1', name: 'Cotton' })
    expect(document.materials[0]).toEqual({ id: 'cotton-1', name: 'Cotton' })
  })

  it('only references existing panel ids in garment defaults', () => {
    for (const type of ['tshirt', 'hoodie', 'sweatshirt', 'jacket', 'pants', 'shorts']) {
      const garment = getGarment(type)
      const panelIds = new Set(garment.panels.map((panel) => panel.id))
      const defaults = defaultConstructionFor(type)
      const parts = [
        defaults.zipper,
        defaults.collar,
        defaults.waistband,
        defaults.hem,
        defaults.hood,
        defaults.drawstring,
        defaults.beltLoops,
        ...(defaults.pockets ?? []),
        ...(defaults.buttons ?? []),
        ...(defaults.cuffs ?? []),
      ]
      for (const part of parts) {
        if (part?.panelId) {
          expect(panelIds.has(part.panelId)).toBe(true)
        }
      }
    }
  })

  it('duplicates construction with structuredClone', () => {
    const document = patchConstruction(createNewDesign('hoodie'), {
      hood: { id: 'hood', kind: 'hood', style: 'zip', present: true, panelId: 'hood' },
    })
    const copy = structuredClone(document)
    expect(copy.construction?.hood?.style).toBe('zip')
    expect(getResolvedConstruction(copy).pockets[0]?.style).toBe('kangaroo')
  })

  it('can clear a stored list part without dropping other overrides', () => {
    let document = setConstructionPart(createNewDesign('hoodie'), {
      id: 'kangaroo_pocket',
      kind: 'pocket',
      style: 'slash',
      present: true,
    })
    document = setConstructionPart(document, {
      id: 'hood',
      kind: 'hood',
      style: 'zip',
      present: true,
    })
    document = clearConstructionPart(document, 'pocket', 'kangaroo_pocket')
    expect(document.construction?.pockets).toEqual([])
    expect(document.construction?.hood?.style).toBe('zip')
    expect(resolveConstruction(document).pockets).toEqual([])
  })

  it('emptyConstruction is explicit zeros, not garment defaults', () => {
    const empty = emptyConstruction()
    expect(empty.zipper).toBeNull()
    expect(empty.pockets).toEqual([])
    expect(defaultConstructionFor('jacket').zipper).not.toBeNull()
  })
})
