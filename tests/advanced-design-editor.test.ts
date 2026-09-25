import { createNewDesign } from '@/design/createDesign'
import {
  addDesignObject,
  collectSnapTargets,
  createImageObject,
  createShapeObject,
  createTextObject,
  defaultZoneForView,
  duplicateDesignObject,
  getBodyColor,
  getDesignObjectById,
  getDesignObjects,
  getDesignObjectsInZone,
  getResolvedConstruction,
  moveDesignObjectLayer,
  nudgeDesignObjects,
  objectDisplayName,
  removeDesignObject,
  sanitizeDesignObjects,
  setActiveView,
  setActiveZone,
  setColorValue,
  SHAPE_KINDS,
  snapMovingBox,
  switchGarment,
  updateDesignObject,
  zonesForGarment,
} from '@/design'
import { isDesignDocument, normalizeDocument } from '@/persistence/validateDocument'
import { AVAILABLE_GARMENTS, getGarment } from '@/garments'
import { describe, expect, it } from 'vitest'

function historyStack(initial: ReturnType<typeof createNewDesign>) {
  const past: typeof initial[] = []
  let current = initial
  const future: typeof initial[] = []
  return {
    get document() {
      return current
    },
    apply(next: typeof initial) {
      past.push(current)
      current = next
      future.length = 0
      return current
    },
    undo() {
      const previous = past.pop()
      if (!previous) {
        return current
      }
      future.push(current)
      current = previous
      return current
    },
    redo() {
      const next = future.pop()
      if (!next) {
        return current
      }
      past.push(current)
      current = next
      return current
    },
  }
}

describe('Phase 7E advanced 2D design editor', () => {
  it('creates, edits, moves, resizes, and rotates text as a designObject', () => {
    let document = createNewDesign('tshirt')
    const text = createTextObject(document, 'front')
    expect(text.type).toBe('text')
    expect(text.italic).toBe(false)
    expect(text.letterSpacing).toBe(0)
    document = addDesignObject(document, text)

    document = updateDesignObject(document, text.id, {
      content: 'Chest mark',
      fontFamily: 'Georgia, serif',
      fontSize: 28,
      fontWeight: 700,
      italic: true,
      textAlign: 'left',
      color: '#1e2a4a',
      opacity: 0.8,
      letterSpacing: 1.5,
    })
    const edited = getDesignObjectById(document, text.id)
    expect(edited).toMatchObject({
      type: 'text',
      content: 'Chest mark',
      fontFamily: 'Georgia, serif',
      fontSize: 28,
      fontWeight: 700,
      italic: true,
      textAlign: 'left',
      color: '#1e2a4a',
      opacity: 0.8,
      letterSpacing: 1.5,
    })

    document = updateDesignObject(document, text.id, { x: 120, y: 160 })
    expect(getDesignObjectById(document, text.id)).toMatchObject({ x: 120, y: 160 })

    document = updateDesignObject(document, text.id, { width: 240, height: 56 })
    expect(getDesignObjectById(document, text.id)).toMatchObject({ width: 240, height: 56 })

    document = updateDesignObject(document, text.id, { rotation: 12 })
    expect(getDesignObjectById(document, text.id)?.rotation).toBe(12)
    expect(document.elements).toEqual([])
  })

  it('creates, moves, and resizes images with proportional scaling', () => {
    let document = createNewDesign('hoodie')
    const image = createImageObject(
      document,
      {
        source: 'asset-mark',
        fileName: 'logo.png',
        mimeType: 'image/png',
        naturalWidth: 200,
        naturalHeight: 100,
        aspectLocked: true,
      },
      'front',
    )
    document = addDesignObject(document, image)
    expect(image.type).toBe('image')
    expect(image.aspectLocked).toBe(true)
    expect(image.height).toBeCloseTo(image.width / 2)

    document = updateDesignObject(document, image.id, { x: 88, y: 140 })
    expect(getDesignObjectById(document, image.id)).toMatchObject({ x: 88, y: 140 })

    document = updateDesignObject(document, image.id, { width: 160 })
    const resized = getDesignObjectById(document, image.id)
    expect(resized?.width).toBe(160)
    expect(resized?.height).toBe(80)
    expect(resized?.type).toBe('image')
  })

  it('creates apparel shapes and moves them in the same object model', () => {
    let document = createNewDesign('jacket')
    expect([...SHAPE_KINDS]).toEqual(['rectangle', 'circle', 'line', 'rounded-rectangle'])

    const rectangle = createShapeObject(document, 'front', 'rectangle')
    document = addDesignObject(document, rectangle)
    const circle = createShapeObject(document, 'front', 'circle')
    document = addDesignObject(document, circle)
    const line = createShapeObject(document, 'front', 'line')
    document = addDesignObject(document, line)
    const rounded = createShapeObject(document, 'front', 'rounded-rectangle')
    document = addDesignObject(document, rounded)

    expect(rectangle.shape).toBe('rectangle')
    expect(circle.shape).toBe('circle')
    expect(circle.width).toBe(circle.height)
    expect(line.shape).toBe('line')
    expect(line.strokeWidth).toBeGreaterThan(0)
    expect(rounded.shape).toBe('rounded-rectangle')
    expect(objectDisplayName(rounded)).toBe('Shape — Rounded rectangle')

    document = updateDesignObject(document, circle.id, { x: 200, y: 220, fill: '#1a1a1a', stroke: '#c9a36a', strokeWidth: 2 })
    expect(getDesignObjectById(document, circle.id)).toMatchObject({
      x: 200,
      y: 220,
      fill: '#1a1a1a',
      stroke: '#c9a36a',
      strokeWidth: 2,
    })
    expect(getDesignObjects(document)).toHaveLength(4)
  })

  it('deletes, duplicates, and reorders layers on the document', () => {
    let document = createNewDesign('tshirt')
    const text = createTextObject(document, 'front')
    document = addDesignObject(document, text)
    const shape = createShapeObject(document, 'front', 'circle')
    document = addDesignObject(document, shape)

    const duplicated = duplicateDesignObject(document, text.id)
    expect(duplicated).not.toBeNull()
    document = duplicated!.document
    expect(getDesignObjects(document)).toHaveLength(3)
    expect(duplicated!.object.id).not.toBe(text.id)
    expect(duplicated!.object.content).toBe(text.content)

    document = moveDesignObjectLayer(document, text.id, 'front')
    expect(getDesignObjectById(document, text.id)!.zIndex).toBeGreaterThan(
      getDesignObjectById(document, shape.id)!.zIndex,
    )

    document = removeDesignObject(document, shape.id)
    expect(getDesignObjectById(document, shape.id)).toBeNull()
    expect(getDesignObjects(document)).toHaveLength(2)
  })

  it('uses the existing undo/redo snapshot model for editor actions', () => {
    const history = historyStack(createNewDesign('tshirt'))
    const text = createTextObject(history.document, 'front')
    history.apply(addDesignObject(history.document, text))
    history.apply(updateDesignObject(history.document, text.id, { content: 'Edited', italic: true }))
    history.apply(updateDesignObject(history.document, text.id, { x: 90, rotation: 8 }))
    const image = createImageObject(history.document, { source: 'a', fileName: 'mark.png' }, 'front')
    history.apply(addDesignObject(history.document, image))
    const shape = createShapeObject(history.document, 'front', 'rounded-rectangle')
    history.apply(addDesignObject(history.document, shape))
    history.apply(nudgeDesignObjects(history.document, [shape.id], 12, 0))
    history.apply(updateDesignObject(history.document, shape.id, { width: 180 }))
    history.apply(updateDesignObject(history.document, shape.id, { rotation: 20 }))
    history.apply(moveDesignObjectLayer(history.document, text.id, 'front'))
    history.apply(updateDesignObject(history.document, text.id, { color: '#7c2d12' }))
    const beforeDelete = history.document
    history.apply(removeDesignObject(history.document, image.id))
    expect(getDesignObjects(history.document)).toHaveLength(2)

    history.undo()
    expect(getDesignObjects(history.document).map((object) => object.id)).toEqual(
      getDesignObjects(beforeDelete).map((object) => object.id),
    )
    history.redo()
    expect(getDesignObjectById(history.document, image.id)).toBeNull()

    history.undo()
    history.undo()
    expect(getDesignObjectById(history.document, text.id)?.color).not.toBe('#7c2d12')
    history.redo()
    expect(getDesignObjectById(history.document, text.id)?.color).toBe('#7c2d12')
  })

  it('keeps artwork when switching garments through the 7E cycle', () => {
    let document = createNewDesign('tshirt')
    const text = createTextObject(document, 'front')
    const image = createImageObject(document, { source: 'logo', fileName: 'mark.png' }, 'front')
    const shape = createShapeObject(document, 'back', 'circle')
    document = addDesignObject(addDesignObject(addDesignObject(document, text), image), shape)
    const snapshot = structuredClone(document.designObjects)

    for (const type of ['hoodie', 'jacket', 'pants', 'shorts', 'tshirt'] as const) {
      document = switchGarment(document, type)
      expect(document.garmentType).toBe(type)
      expect(document.designObjects).toEqual(snapshot)
      expect(getDesignObjectsInZone(document, 'front').map((object) => object.id)).toEqual([
        text.id,
        image.id,
      ])
      expect(getDesignObjectsInZone(document, 'back').map((object) => object.id)).toEqual([shape.id])
    }
  })

  it('switches panels without moving or remapping artwork', () => {
    let document = createNewDesign('hoodie')
    const text = createTextObject(document, 'front')
    document = addDesignObject(document, text)
    const before = structuredClone(document.designObjects)

    document = setActiveZone(document, 'left-sleeve')
    document = setActiveView(document, 'back')
    document = setActiveZone(document, 'back')
    document = setActiveZone(document, 'front')
    document = setActiveView(document, 'front')

    expect(document.designObjects).toEqual(before)
    expect(getDesignObjectById(document, text.id)).toMatchObject({
      id: text.id,
      x: text.x,
      y: text.y,
      zone: 'front',
    })
    expect(getDesignObjectsInZone(document, 'left-sleeve')).toEqual([])
  })

  it('persists text styles and shape kinds through serialize/reopen', () => {
    let document = createNewDesign('pants')
    const text = {
      ...createTextObject(document, 'front'),
      italic: true,
      letterSpacing: 2,
      content: 'Side mark',
    }
    const shape = createShapeObject(document, 'left-leg', 'line')
    document = addDesignObject(addDesignObject(document, text), shape)

    const reopened = normalizeDocument(structuredClone(document))
    expect(isDesignDocument(reopened)).toBe(true)
    expect(reopened.designObjects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: text.id,
          italic: true,
          letterSpacing: 2,
          content: 'Side mark',
        }),
        expect.objectContaining({ id: shape.id, shape: 'line', zone: 'left-leg' }),
      ]),
    )
    expect(reopened.garmentType).toBe('pants')
  })

  it('sanitizes unknown shape kinds and missing text styles without dropping objects', () => {
    const cleaned = sanitizeDesignObjects([
      {
        id: 'text-1',
        type: 'text',
        x: 10,
        y: 20,
        width: 80,
        height: 24,
        content: 'Hi',
        zone: 'front',
        italic: true,
        letterSpacing: 3,
      },
      {
        id: 'shape-1',
        type: 'shape',
        x: 12,
        y: 14,
        width: 40,
        height: 40,
        zone: 'front',
        shape: 'hexagon',
      },
      {
        id: 'shape-2',
        type: 'shape',
        x: 20,
        y: 24,
        width: 40,
        height: 20,
        zone: 'front',
        shape: 'rounded-rectangle',
      },
    ])
    expect(cleaned).toHaveLength(3)
    expect(cleaned?.[0]).toMatchObject({ italic: true, letterSpacing: 3 })
    expect(cleaned?.[1]).toMatchObject({ shape: 'rectangle' })
    expect(cleaned?.[2]).toMatchObject({ shape: 'rounded-rectangle' })
  })

  it('snaps to garment, panel, safe-area, and design-zone guides without rewriting storage space', () => {
    const document = createNewDesign('tshirt')
    const garment = getGarment(document.garmentType)
    const targets = collectSnapTargets(document, 'front', [])
    expect(targets.xs).toEqual(expect.arrayContaining([0, garment.viewBox.width / 2, garment.viewBox.width]))
    expect(targets.ys).toEqual(expect.arrayContaining([0, garment.viewBox.height / 2, garment.viewBox.height]))

    const front = garment.panels.find((panel) => panel.id === 'front_body')!
    expect(targets.xs).toEqual(
      expect.arrayContaining([front.frame.x, front.frame.x + front.frame.width / 2, front.frame.x + front.frame.width]),
    )
    expect(targets.ys).toEqual(
      expect.arrayContaining([front.frame.y, front.frame.y + front.frame.height / 2]),
    )

    const snapped = snapMovingBox(
      { x: garment.viewBox.width / 2 - 20, y: 200, width: 40, height: 20 },
      targets,
      8,
    )
    expect(snapped.box.x + snapped.box.width / 2).toBeCloseTo(garment.viewBox.width / 2)
    expect(snapped.guides.vertical).toContain(garment.viewBox.width / 2)
    expect(document.designObjects ?? []).toEqual([])
  })

  it('exposes only the garment definition panels as design areas', () => {
    expect(zonesForGarment('tshirt')).toEqual(['front', 'back', 'left-sleeve', 'right-sleeve'])
    expect(zonesForGarment('hoodie')).toEqual(['front', 'back', 'left-sleeve', 'right-sleeve'])
    expect(zonesForGarment('jacket')).toEqual(['front', 'back', 'left-sleeve', 'right-sleeve'])
    expect(zonesForGarment('pants')).toEqual(['front', 'back', 'left-leg', 'right-leg'])
    expect(zonesForGarment('shorts')).toEqual(['front', 'back', 'left-leg', 'right-leg'])
    expect(zonesForGarment('tshirt')).not.toContain('left-leg')
    expect(zonesForGarment('pants')).not.toContain('left-sleeve')
  })

  it('changes garment color without mutating artwork', () => {
    let document = createNewDesign('tshirt')
    const text = createTextObject(document, 'front')
    document = addDesignObject(document, text)
    const snapshot = structuredClone(document.designObjects)
    const previous = getBodyColor(document)

    document = setColorValue(document, 'body', '#1e2a4a')
    expect(getBodyColor(document)).toBe('#1e2a4a')
    expect(getBodyColor(document)).not.toBe(previous)
    expect(document.designObjects).toEqual(snapshot)
    expect(getDesignObjectById(document, text.id)?.color).toBe(text.color)
  })

  it('previews garment, color, seams, and layered artwork without editor handles', () => {
    let document = createNewDesign('tshirt')
    document = setColorValue(document, 'body', '#3f4f2a')
    const back = createShapeObject(document, 'front', 'rectangle')
    document = addDesignObject(document, { ...back, zIndex: 1 })
    const front = createTextObject(document, 'front')
    document = addDesignObject(document, { ...front, zIndex: 2 })

    const objects = getDesignObjectsInZone(document, defaultZoneForView('front'))
    expect(objects.map((object) => object.id)).toEqual([back.id, front.id])
    expect(getBodyColor(document)).toBe('#3f4f2a')
    expect(getGarment(document.garmentType).id).toBe('tshirt')
    expect(getResolvedConstruction(document)).toBeTruthy()
    expect(AVAILABLE_GARMENTS.map((garment) => garment.id)).toContain('hoodie')
  })
})
