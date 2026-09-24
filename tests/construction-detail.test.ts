import { createNewDesign } from '@/design/createDesign'
import {
  resolveConstruction,
  setConstructionStyle,
  setConstructionVariant,
  setGarmentMaterial,
  setPanelColor,
  styleOf,
  variantOf,
  type DesignDocument,
} from '@/design'
import { DESIGN_ELEMENT_TYPES } from '@/design/types'
import { getPanelColor } from '@/design/selectors'
import {
  constructionControlsFor,
  controlValue,
  editableConstructionControlIds,
  visibleConstructionControls,
} from '@/garments/constructionOptions'
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

describe('Phase 7B.3 garment detail editor', () => {
  it('lists only the construction controls each garment supports', () => {
    expect(editableConstructionControlIds('tshirt')).toEqual(['collar', 'hem', 'cuff'])
    expect(editableConstructionControlIds('hoodie')).toEqual([
      'hood',
      'hood_opening',
      'drawstring',
      'pocket',
      'cuff',
      'hem',
    ])
    expect(editableConstructionControlIds('jacket')).toEqual([
      'collar',
      'hood',
      'zipper',
      'zipper_finish',
      'pocket',
      'cuff',
      'hem',
    ])
    expect(editableConstructionControlIds('pants')).toEqual([
      'waistband',
      'belt_loop',
      'front_pocket',
      'back_pocket',
      'cargo_pocket',
      'hem',
    ])
    expect(editableConstructionControlIds('shorts')).toEqual([
      'waistband',
      'belt_loop',
      'front_pocket',
      'back_pocket',
      'hem',
    ])
  })

  it('resolves every listed construction option onto the document', () => {
    for (const garmentType of ['tshirt', 'hoodie', 'jacket', 'pants', 'shorts']) {
      for (const control of constructionControlsFor(garmentType)) {
        for (const option of control.options) {
          let document = createNewDesign(garmentType)
          if (control.field === 'variant' && (control.kind === 'zipper' || control.kind === 'hood')) {
            if (styleOf(resolveConstruction(document), control.kind) === 'none') {
              document = setConstructionStyle(document, control.kind, control.kind === 'hood' ? 'pullover' : 'center_front')
            }
            document = setConstructionVariant(document, control.kind, option.value)
            expect(variantOf(resolveConstruction(document), control.kind, option.value)).toBe(option.value)
          } else {
            document = setConstructionStyle(document, control.kind, option.value, control.slot)
            expect(styleOf(resolveConstruction(document), control.kind, control.slot)).toBe(option.value)
          }
          expect(document.elements).toEqual([])
        }
      }
    }
  })

  it('hides a detail when the option is none without dropping other garment structure', () => {
    let document = setConstructionStyle(createNewDesign('hoodie'), 'hood', 'none')
    const resolved = resolveConstruction(document)
    expect(styleOf(resolved, 'hood')).toBe('none')
    expect(styleOf(resolved, 'pocket')).toBe('kangaroo')
    expect(styleOf(resolved, 'cuff')).toBe('rib')
    expect(document.panels.some((panel) => panel.id === 'hood')).toBe(true)

    document = setConstructionStyle(createNewDesign('tshirt'), 'collar', 'none')
    expect(styleOf(resolveConstruction(document), 'collar')).toBe('none')
    expect(styleOf(resolveConstruction(document), 'hem')).toBe('coverstitch')
    expect(styleOf(resolveConstruction(document), 'cuff')).toBe('coverstitch')
    expect(document.panels.some((panel) => panel.id === 'front_body')).toBe(true)
  })

  it('changing one slotted pocket does not rewrite the other pocket groups', () => {
    let document = setConstructionStyle(createNewDesign('pants'), 'pocket', 'welt', 'front')
    expect(styleOf(resolveConstruction(document), 'pocket', 'front')).toBe('welt')
    expect(styleOf(resolveConstruction(document), 'pocket', 'back')).toBe('patch')
    expect(styleOf(resolveConstruction(document), 'waistband')).toBe('faced')

    document = setConstructionStyle(document, 'pocket', 'none', 'back')
    expect(styleOf(resolveConstruction(document), 'pocket', 'front')).toBe('welt')
    expect(styleOf(resolveConstruction(document), 'pocket', 'back')).toBe('none')
    expect(styleOf(resolveConstruction(document), 'pocket', 'cargo')).toBe('none')
  })

  it('hides hood-only controls when the hood is off', () => {
    const document = setConstructionStyle(createNewDesign('hoodie'), 'hood', 'none')
    const ids = visibleConstructionControls('hoodie', resolveConstruction(document)).map(
      (control) => control.id,
    )
    expect(ids).not.toContain('hood_opening')
    expect(ids).not.toContain('drawstring')
    expect(ids).toContain('hood')
    expect(ids).toContain('pocket')
  })

  it('writes zipper finish and hood opening as variants, not new elements', () => {
    let document = setConstructionVariant(createNewDesign('jacket'), 'zipper', 'coil')
    expect(document.construction?.zipper?.style).toBe('center_front')
    expect(document.construction?.zipper?.variant).toBe('coil')
    expect((DESIGN_ELEMENT_TYPES as readonly string[]).includes('zipper')).toBe(false)

    document = setConstructionStyle(createNewDesign('hoodie'), 'hood', 'zip')
    document = setConstructionVariant(document, 'hood', 'wide')
    expect(document.construction?.hood?.style).toBe('zip')
    expect(document.construction?.hood?.variant).toBe('wide')
    expect(controlValue(resolveConstruction(document), constructionControlsFor('hoodie')[1])).toBe(
      'wide',
    )
  })

  it('preserves construction through clone / normalize (save/reopen)', () => {
    let document = setGarmentMaterial(createNewDesign('pants'), 'heavy_cotton')
    document = setConstructionStyle(document, 'waistband', 'elastic')
    document = setConstructionStyle(document, 'belt_loop', 'loops')
    document = setConstructionStyle(document, 'pocket', 'welt', 'front')
    document = setConstructionStyle(document, 'pocket', 'slash', 'back')
    document = setConstructionStyle(document, 'pocket', 'cargo', 'cargo')
    document = setConstructionStyle(document, 'hem', 'raw')

    const reopened = normalizeDocument(structuredClone(document))
    expect(isDesignDocument(reopened)).toBe(true)
    expect(reopened.construction?.materialId).toBe('heavy_cotton')
    expect(styleOf(resolveConstruction(reopened), 'waistband')).toBe('elastic')
    expect(styleOf(resolveConstruction(reopened), 'belt_loop')).toBe('loops')
    expect(styleOf(resolveConstruction(reopened), 'pocket', 'front')).toBe('welt')
    expect(styleOf(resolveConstruction(reopened), 'pocket', 'back')).toBe('slash')
    expect(styleOf(resolveConstruction(reopened), 'pocket', 'cargo')).toBe('cargo')
    expect(styleOf(resolveConstruction(reopened), 'hem')).toBe('raw')
  })

  it('keeps panel colors independent from construction details', () => {
    let document = setPanelColor(createNewDesign('jacket'), 'front_body_left', '#5a2a22')
    document = setConstructionStyle(document, 'collar', 'vneck')
    document = setConstructionStyle(document, 'hood', 'pullover')
    document = setConstructionStyle(document, 'pocket', 'slash')
    document = setGarmentMaterial(document, 'nylon')
    expect(getPanelColor(document, 'front_body_left')).toBe('#5a2a22')
    expect(getPanelColor(document, 'front_body_right')).toBe(document.colors[0].value)
    expect(styleOf(resolveConstruction(document), 'collar')).toBe('vneck')
    expect(styleOf(resolveConstruction(document), 'hood')).toBe('pullover')
  })

  it('keeps construction edits immutable so the existing history stack can snapshot them', () => {
    const original = createNewDesign('tshirt')
    const next = setConstructionStyle(original, 'collar', 'vneck')
    const undone = original
    expect(original.construction).toBeUndefined()
    expect(next.construction?.collar?.style).toBe('vneck')
    expect(next).not.toBe(original)
    expect(styleOf(resolveConstruction(undone), 'collar')).toBe('crew')
    expect(styleOf(resolveConstruction(next), 'collar')).toBe('vneck')
  })

  it('keeps older documents without construction or pocket slots working', () => {
    const document = legacyTshirt()
    expect(isDesignDocument(document)).toBe(true)
    expect(normalizeDocument(document).construction).toBeUndefined()
    expect(styleOf(resolveConstruction(document), 'collar')).toBe('crew')
    expect(styleOf(resolveConstruction(document), 'cuff')).toBe('coverstitch')

    const oldPants: DesignDocument = {
      ...createNewDesign('pants'),
      construction: {
        pockets: [{ id: 'back_pocket_left', kind: 'pocket', style: 'welt', present: true }],
      },
    }
    expect(styleOf(resolveConstruction(oldPants), 'pocket', 'back')).toBe('welt')
    expect(styleOf(resolveConstruction(oldPants), 'pocket', 'front')).toBe('slash')
  })
})
