import { createNewDesign } from '@/design/createDesign'
import {
  addDesignObject,
  createImageObject,
  createShapeObject,
  createTextObject,
  duplicateDesignObject,
  getDesignObjectById,
  getDesignObjects,
  getDesignObjectsInZone,
  moveDesignObjectLayer,
  removeDesignObject,
  resolveActiveZone,
  sanitizeDesignObjects,
  setActiveZone,
  setConstructionStyle,
  snapValue,
  updateDesignObject,
  zonesForGarment,
} from '@/design'
import { setActiveView } from '@/design/operations'
import { isDesignDocument, normalizeDocument } from '@/persistence/validateDocument'
import { describe, expect, it } from 'vitest'

describe('Phase 7B.4 design objects', () => {
  it('creates typed defaults that are not construction', () => {
    const document = createNewDesign('tshirt')
    const text = createTextObject(document)
    const shape = createShapeObject(document)
    expect(text.type).toBe('text')
    expect(text.content).toBe('New Text')
    expect(text.visible).toBe(true)
    expect(text.locked).toBe(false)
    expect(text.zone).toBe('front')
    expect(shape.type).toBe('shape')
    expect(shape.shape).toBe('rectangle')
    expect(document.construction).toBeUndefined()
    expect(document.elements).toEqual([])
  })

  it('adds, moves, resizes, rotates, and deletes objects on the document', () => {
    let document = createNewDesign('hoodie')
    const text = createTextObject(document, 'front')
    document = addDesignObject(document, text)
    expect(getDesignObjects(document)).toHaveLength(1)

    document = updateDesignObject(document, text.id, { x: 96, y: 128 })
    expect(getDesignObjectById(document, text.id)?.x).toBe(96)

    document = updateDesignObject(document, text.id, { width: 220, height: 64 })
    expect(getDesignObjectById(document, text.id)?.width).toBe(220)

    document = updateDesignObject(document, text.id, { rotation: 15 })
    expect(getDesignObjectById(document, text.id)?.rotation).toBe(15)

    document = removeDesignObject(document, text.id)
    expect(getDesignObjects(document)).toEqual([])
    expect(document.elements).toEqual([])
  })

  it('duplicates an object without removing the original', () => {
    let document = createNewDesign('tshirt')
    const shape = createShapeObject(document)
    document = addDesignObject(document, shape)
    const result = duplicateDesignObject(document, shape.id)
    expect(result).not.toBeNull()
    document = result!.document
    expect(getDesignObjects(document)).toHaveLength(2)
    expect(getDesignObjectById(document, shape.id)?.id).toBe(shape.id)
    expect(result!.object.id).not.toBe(shape.id)
    expect(result!.object.x).toBe(shape.x + 16)
  })

  it('changes layer order within a placement zone only', () => {
    let document = createNewDesign('jacket')
    const first = createTextObject(document, 'front')
    document = addDesignObject(document, first)
    const second = createShapeObject(document, 'front')
    document = addDesignObject(document, second)
    const back = createTextObject(document, 'back')
    document = addDesignObject(document, back)

    document = moveDesignObjectLayer(document, first.id, 'front')
    expect(getDesignObjectById(document, first.id)?.zIndex).toBeGreaterThan(
      getDesignObjectById(document, second.id)?.zIndex ?? 0,
    )
    expect(getDesignObjectById(document, back.id)?.zIndex).toBe(back.zIndex)
  })

  it('keeps placement zones garment-specific and view-filtered', () => {
    expect(zonesForGarment('tshirt')).toEqual(['front', 'back', 'left-sleeve', 'right-sleeve'])
    expect(zonesForGarment('pants')).toEqual(['front', 'back', 'left-leg', 'right-leg'])

    let document = createNewDesign('tshirt')
    const front = createTextObject(document, 'front')
    const sleeve = createShapeObject(document, 'left-sleeve')
    document = addDesignObject(addDesignObject(document, front), sleeve)
    expect(getDesignObjectsInZone(document, 'front').map((object) => object.id)).toEqual([front.id])
    expect(getDesignObjectsInZone(document, 'left-sleeve').map((object) => object.id)).toEqual([
      sleeve.id,
    ])
  })

  it('serializes and reopens design objects without touching construction', () => {
    let document = createNewDesign('hoodie')
    document = setConstructionStyle(document, 'hood', 'zip')
    const image = createImageObject(document, { source: 'asset-1', fileName: 'mark.png' }, 'front')
    document = addDesignObject(document, image)
    document = setActiveZone(document, 'front')

    const reopened = normalizeDocument(structuredClone(document))
    expect(isDesignDocument(reopened)).toBe(true)
    expect(reopened.construction?.hood?.style).toBe('zip')
    expect(reopened.designObjects?.[0]).toMatchObject({
      type: 'image',
      source: 'asset-1',
      zone: 'front',
    })
  })

  it('keeps older documents valid without designObjects', () => {
    const document = createNewDesign('tshirt')
    const { designObjects: _unused, activeZone: _zone, ...legacy } = document
    expect(isDesignDocument(legacy as typeof document)).toBe(true)
    expect(normalizeDocument(legacy as typeof document).designObjects).toBeUndefined()
    expect(getDesignObjects(legacy as typeof document)).toEqual([])
  })

  it('sanitizes invalid objects and keeps construction independent', () => {
    expect(sanitizeDesignObjects(undefined)).toBeUndefined()
    expect(sanitizeDesignObjects([{ id: 'bad' }])).toEqual([])
    const cleaned = sanitizeDesignObjects([
      {
        id: 'ok',
        type: 'text',
        x: 10,
        y: 20,
        width: 40,
        height: 20,
        content: 'Hi',
        zone: 'front',
      },
    ])
    expect(cleaned?.[0]?.type).toBe('text')
  })

  it('object edits are immutable so existing apply()/undo can snapshot them', () => {
    const original = createNewDesign('shorts')
    const object = createTextObject(original)
    const next = addDesignObject(original, object)
    expect(original.designObjects).toEqual([])
    expect(next.designObjects).toHaveLength(1)
    expect(next).not.toBe(original)
  })

  it('switching front/back updates the active placement zone', () => {
    let document = createNewDesign('tshirt')
    expect(resolveActiveZone(document)).toBe('front')
    document = setActiveView(document, 'back')
    expect(document.activeView).toBe('back')
    expect(document.activeZone).toBe('back')
  })

  it('snaps editor coordinates without changing garment construction', () => {
    expect(snapValue(23, 16, true)).toBe(16)
    expect(snapValue(23, 16, false)).toBe(23)
    let document = setConstructionStyle(createNewDesign('pants'), 'waistband', 'elastic')
    const object = createShapeObject(document, 'left-leg')
    document = addDesignObject(document, object)
    expect(document.construction?.waistband?.style).toBe('elastic')
    expect(getDesignObjectById(document, object.id)?.zone).toBe('left-leg')
  })
})
