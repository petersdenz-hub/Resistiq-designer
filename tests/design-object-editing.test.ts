import { createNewDesign } from '@/design/createDesign'
import {
  addDesignObject,
  alignDesignObjects,
  attachObjectToPanel,
  boxesIntersect,
  createImageObject,
  createShapeObject,
  createTextObject,
  distributeDesignObjects,
  duplicateDesignObjects,
  getDesignObjectById,
  getDesignObjects,
  groupDesignObjects,
  moveDesignObjectsLayer,
  nudgeDesignObjects,
  objectDisplayName,
  objectIdsInMarquee,
  objectsSharePlacement,
  removeDesignObject,
  removeDesignObjects,
  scaleObjectsInViewBox,
  selectableObjectIds,
  selectionForEdit,
  selectionViewBox,
  setActiveZone,
  setConstructionStyle,
  toggleSelectedIds,
  ungroupDesignObjects,
  updateDesignObject,
  updateDesignObjects,
} from '@/design'
import { isDesignDocument, normalizeDocument } from '@/persistence/validateDocument'
import { describe, expect, it } from 'vitest'

describe('Phase 7B.7 professional design editing', () => {
  it('gives useful default names without a second document model', () => {
    const document = createNewDesign('tshirt')
    const text = createTextObject(document)
    const image = createImageObject(document, { source: 'a', fileName: 'Resistiq.png' })
    const shape = createShapeObject(document)
    expect(objectDisplayName(text)).toBe('Text — New Text')
    expect(objectDisplayName(image)).toBe('Image — Resistiq')
    expect(objectDisplayName(shape)).toBe('Shape — Rectangle')
  })

  it('shift-toggles selection ids without replacing the current set', () => {
    const current = ['a']
    expect(toggleSelectedIds(current, ['b'])).toEqual(['a', 'b'])
    expect(toggleSelectedIds(['a', 'b'], ['b'])).toEqual(['a'])
    expect(toggleSelectedIds(['a', 'b'], ['a', 'b'])).toEqual([])
  })

  it('selects intersecting unlocked visible objects in a drag marquee', () => {
    let document = createNewDesign('tshirt')
    const a = { ...createShapeObject(document, 'front'), x: 10, y: 10, width: 40, height: 40 }
    document = addDesignObject(document, a)
    const b = { ...createTextObject(document, 'front'), x: 200, y: 200, width: 40, height: 40 }
    document = addDesignObject(document, b)
    const hidden = { ...createShapeObject(document, 'front'), x: 12, y: 12, width: 20, height: 20, visible: false }
    document = addDesignObject(document, hidden)
    const locked = { ...createTextObject(document, 'front'), x: 14, y: 14, width: 20, height: 20, locked: true }
    document = addDesignObject(document, locked)
    const back = { ...createShapeObject(document, 'back'), x: 10, y: 10, width: 40, height: 40 }
    document = addDesignObject(document, back)

    const ids = objectIdsInMarquee(document, 'front', { x: 0, y: 0, width: 80, height: 80 })
    expect(ids).toEqual([a.id])
    expect(boxesIntersect({ x: 0, y: 0, width: 80, height: 80 }, { x: 10, y: 10, width: 40, height: 40 })).toBe(true)
  })

  it('keeps single-selection compatible while select-all stays zone and lock aware', () => {
    let document = createNewDesign('hoodie')
    const front = createTextObject(document, 'front')
    document = addDesignObject(document, front)
    const hidden = { ...createShapeObject(document, 'front'), visible: false }
    document = addDesignObject(document, hidden)
    const locked = { ...createShapeObject(document, 'front'), locked: true }
    document = addDesignObject(document, locked)
    const sleeve = createTextObject(document, 'left-sleeve')
    document = addDesignObject(document, sleeve)

    expect(selectableObjectIds(document, 'front')).toEqual([front.id])
    expect(selectableObjectIds(document, 'front', true)).toEqual([front.id, locked.id])
    expect(selectableObjectIds(document, 'left-sleeve')).toEqual([sleeve.id])
  })

  it('groups and ungroups with a lightweight groupId and refuses cross-panel groups', () => {
    let document = createNewDesign('tshirt')
    const a = attachObjectToPanel(document, createTextObject(document, 'front'), 'front_body')
    document = addDesignObject(document, a)
    const b = attachObjectToPanel(document, createShapeObject(document, 'front'), 'front_body')
    document = addDesignObject(document, b)
    const sleeve = attachObjectToPanel(document, createTextObject(document, 'left-sleeve'), 'left_sleeve')
    document = addDesignObject(document, sleeve)

    expect(objectsSharePlacement([a, b])).toBe(true)
    expect(objectsSharePlacement([a, sleeve])).toBe(false)

    document = groupDesignObjects(document, [a.id, b.id])
    expect(getDesignObjectById(document, a.id)?.groupId).toBe(getDesignObjectById(document, b.id)?.groupId)
    expect(getDesignObjectById(document, a.id)?.groupId).toBeTruthy()

    const refused = groupDesignObjects(document, [a.id, sleeve.id])
    expect(getDesignObjectById(refused, sleeve.id)?.groupId).toBeUndefined()

    document = ungroupDesignObjects(document, [a.id])
    expect(getDesignObjectById(document, a.id)?.groupId).toBeUndefined()
    expect(getDesignObjectById(document, b.id)?.groupId).toBeUndefined()
  })

  it('moves and resizes grouped or multi-selected objects together in one document write', () => {
    let document = createNewDesign('tshirt')
    const a = { ...createShapeObject(document, 'front'), x: 40, y: 40, width: 40, height: 20 }
    document = addDesignObject(document, a)
    const b = { ...createTextObject(document, 'front'), x: 100, y: 80, width: 60, height: 20 }
    document = addDesignObject(document, b)
    document = groupDesignObjects(document, [a.id, b.id])

    const moved = nudgeDesignObjects(document, [a.id, b.id], 12, -8)
    expect(getDesignObjectById(moved, a.id)?.x).toBe(52)
    expect(getDesignObjectById(moved, b.id)?.x).toBe(112)
    expect(getDesignObjectById(moved, a.id)?.y).toBe(32)
    expect(document).not.toBe(moved)

    const start = selectionViewBox(document, [a.id, b.id])!
    const updates = scaleObjectsInViewBox(document, [a.id, b.id], start, {
      ...start,
      width: start.width * 2,
      height: start.height * 2,
    })
    const resized = updateDesignObjects(document, updates)
    expect(getDesignObjectById(resized, a.id)?.width).toBe(80)
    expect(getDesignObjectById(resized, b.id)?.width).toBe(120)
    expect(selectionForEdit(document, [a.id])).toEqual(expect.arrayContaining([a.id, b.id]))
  })

  it('duplicates one or many objects with new ids, offset, and preserved relative positions', () => {
    let document = createNewDesign('hoodie')
    const a = { ...createTextObject(document, 'front'), x: 20, y: 30 }
    document = addDesignObject(document, a)
    const b = { ...createShapeObject(document, 'front'), x: 60, y: 90 }
    document = addDesignObject(document, b)
    document = groupDesignObjects(document, [a.id, b.id])

    const single = duplicateDesignObjects(document, [a.id])
    expect(single.objects).toHaveLength(1)
    expect(single.objects[0].id).not.toBe(a.id)
    expect(single.objects[0].x).toBe(36)
    expect(single.objects[0].type).toBe('text')
    expect(single.objects[0]).toMatchObject({ content: a.content })

    const multi = duplicateDesignObjects(document, [a.id, b.id])
    expect(multi.objects).toHaveLength(2)
    expect(multi.objects[1].x - multi.objects[0].x).toBe(b.x - a.x)
    expect(multi.objects[1].y - multi.objects[0].y).toBe(b.y - a.y)
    expect(multi.objects[0].groupId).toBe(multi.objects[1].groupId)
    expect(multi.objects[0].groupId).not.toBe(getDesignObjectById(document, a.id)?.groupId)
    expect(getDesignObjects(multi.document)).toHaveLength(4)
  })

  it('aligns and distributes in garment/panel space rather than screen pixels', () => {
    let document = createNewDesign('tshirt')
    const a = attachObjectToPanel(
      document,
      { ...createShapeObject(document, 'front'), x: 10, y: 10, width: 20, height: 20 },
      'front_body',
    )
    document = addDesignObject(document, a)
    const b = attachObjectToPanel(
      document,
      { ...createShapeObject(document, 'front'), x: 80, y: 40, width: 20, height: 20 },
      'front_body',
    )
    document = addDesignObject(document, b)
    const c = attachObjectToPanel(
      document,
      { ...createShapeObject(document, 'front'), x: 140, y: 70, width: 20, height: 20 },
      'front_body',
    )
    document = addDesignObject(document, c)

    const aligned = alignDesignObjects(document, [a.id, b.id, c.id], 'left')
    const alignedA = getDesignObjectById(aligned, a.id)!
    const alignedB = getDesignObjectById(aligned, b.id)!
    expect(alignedA.anchor.panelId).toBe('front_body')
    expect(alignedB.anchor.space).toBe('panel')
    expect(alignedA.x).toBeCloseTo(alignedB.x)

    const distributed = distributeDesignObjects(document, [a.id, b.id, c.id], 'horizontal')
    const xs = [a.id, b.id, c.id].map((id) => getDesignObjectById(distributed, id)!.x).sort((left, right) => left - right)
    expect(xs[1] - xs[0]).toBeCloseTo(xs[2] - xs[1])
  })

  it('reorders multiple layers with the existing zIndex system', () => {
    let document = createNewDesign('jacket')
    const first = createTextObject(document, 'front')
    document = addDesignObject(document, first)
    const second = createShapeObject(document, 'front')
    document = addDesignObject(document, second)
    const third = createTextObject(document, 'front')
    document = addDesignObject(document, third)

    document = moveDesignObjectsLayer(document, [first.id, second.id], 'front')
    expect(getDesignObjectById(document, first.id)!.zIndex).toBeGreaterThan(
      getDesignObjectById(document, third.id)!.zIndex,
    )
    expect(getDesignObjectById(document, second.id)!.zIndex).toBeGreaterThan(
      getDesignObjectById(document, first.id)!.zIndex,
    )
  })

  it('blocks locked objects from move, delete, and style while still allowing unlock', () => {
    let document = createNewDesign('tshirt')
    const locked = { ...createShapeObject(document, 'front'), locked: true, x: 40, y: 40 }
    document = addDesignObject(document, locked)

    document = nudgeDesignObjects(document, [locked.id], 20, 20)
    expect(getDesignObjectById(document, locked.id)?.x).toBe(40)

    const afterDelete = removeDesignObject(document, locked.id)
    expect(getDesignObjectById(afterDelete, locked.id)).not.toBeNull()
    expect(removeDesignObjects(document, [locked.id])).toBe(document)

    document = updateDesignObject(document, locked.id, { x: 99, fill: '#ffffff' })
    expect(getDesignObjectById(document, locked.id)?.x).toBe(40)

    document = updateDesignObject(document, locked.id, { locked: false })
    document = updateDesignObject(document, locked.id, { x: 64 })
    expect(getDesignObjectById(document, locked.id)?.x).toBe(64)
  })

  it('ignores hidden objects for canvas-style selection', () => {
    let document = createNewDesign('tshirt')
    const hidden = { ...createTextObject(document, 'front'), visible: false, x: 10, y: 10, width: 30, height: 30 }
    document = addDesignObject(document, hidden)
    expect(selectableObjectIds(document, 'front')).toEqual([])
    expect(objectIdsInMarquee(document, 'front', { x: 0, y: 0, width: 80, height: 80 })).toEqual([])
  })

  it('keeps panel assignment when multi-selecting and moving objects', () => {
    let document = createNewDesign('tshirt')
    const front = attachObjectToPanel(document, createTextObject(document, 'front'), 'front_body')
    document = addDesignObject(document, front)
    const sleeve = attachObjectToPanel(document, createShapeObject(document, 'left-sleeve'), 'left_sleeve')
    document = addDesignObject(document, sleeve)

    expect(objectIdsInMarquee(document, 'front', { x: 0, y: 0, width: 800, height: 800 })).toEqual([front.id])

    const moved = nudgeDesignObjects(document, [front.id], 15, 10)
    const next = getDesignObjectById(moved, front.id)!
    expect(next.anchor.panelId).toBe('front_body')
    expect(next.anchor.space).toBe('panel')
    expect(next.zone).toBe('front')
    expect(getDesignObjectById(moved, sleeve.id)?.zone).toBe('left-sleeve')
  })

  it('persists names, groups, lock, and layer order through save/reopen', () => {
    let document = setConstructionStyle(createNewDesign('hoodie'), 'hood', 'zip')
    const a = { ...createTextObject(document, 'front'), name: 'Text — RESISTIQ', x: 24 }
    document = addDesignObject(document, a)
    const b = createShapeObject(document, 'front')
    document = addDesignObject(document, b)
    document = groupDesignObjects(document, [a.id, b.id])
    document = updateDesignObject(document, b.id, { locked: true, visible: false })
    document = setActiveZone(document, 'front')

    const reopened = normalizeDocument(structuredClone(document))
    expect(isDesignDocument(reopened)).toBe(true)
    expect(reopened.construction?.hood?.style).toBe('zip')
    expect(getDesignObjectById(reopened, a.id)).toMatchObject({
      name: 'Text — RESISTIQ',
      groupId: getDesignObjectById(document, a.id)?.groupId,
      x: 24,
    })
    expect(getDesignObjectById(reopened, b.id)).toMatchObject({
      locked: true,
      visible: false,
      groupId: getDesignObjectById(document, a.id)?.groupId,
    })
  })

  it('treats one multi-object mutation as a single snapshot for undo', () => {
    const original = createNewDesign('shorts')
    const a = createShapeObject(original, 'front')
    let document = addDesignObject(original, a)
    const b = createTextObject(document, 'front')
    document = addDesignObject(document, b)
    const next = nudgeDesignObjects(document, [a.id, b.id], 8, 4)
    expect(getDesignObjectById(document, a.id)?.x).toBe(a.x)
    expect(getDesignObjectById(next, a.id)?.x).toBe(a.x + 8)
    expect(getDesignObjectById(next, b.id)?.y).toBe(b.y + 4)
    expect(original.designObjects).toEqual([])
  })

  it('keeps older documents valid without names or groups', () => {
    const document = createNewDesign('tshirt')
    const legacy = {
      id: 'legacy',
      type: 'text',
      x: 12,
      y: 20,
      width: 40,
      height: 16,
      content: 'Hi',
      zone: 'front',
    }
    const cleaned = normalizeDocument({
      ...document,
      designObjects: [legacy as never],
    })
    expect(cleaned.designObjects?.[0]).toMatchObject({
      id: 'legacy',
      type: 'text',
      zone: 'front',
    })
    expect(cleaned.designObjects?.[0]?.groupId).toBeUndefined()
  })
})
