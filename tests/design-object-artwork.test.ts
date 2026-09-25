import { createNewDesign } from '@/design/createDesign'
import {
  addDesignObject,
  createImageObject,
  createShapeObject,
  createTextObject,
  defaultPanelIdForZone,
  duplicateDesignObject,
  getDesignObjectById,
  getDesignObjects,
  getDesignObjectsInZone,
  imageKeepsAlpha,
  isImageAspectLocked,
  objectAspect,
  removeDesignObject,
  resolveActiveZone,
  sanitizeDesignObjects,
  setActiveZone,
  setConstructionStyle,
  setDesignObjectZone,
  updateDesignObject,
} from '@/design'
import { resizeRectKeepAspect } from '@/canvas/geometry'
import { isDesignDocument, normalizeDocument } from '@/persistence/validateDocument'
import { describe, expect, it } from 'vitest'

function transparentPngObject(document = createNewDesign('tshirt')) {
  return createImageObject(
    document,
    {
      source: 'asset-logo',
      fileName: 'mark.png',
      mimeType: 'image/png',
      naturalWidth: 200,
      naturalHeight: 100,
    },
    'front',
  )
}

describe('Phase 7B.5 design-object artwork', () => {
  it('adds an image/logo with asset-id source and locked aspect', () => {
    let document = createNewDesign('tshirt')
    const image = transparentPngObject(document)
    document = addDesignObject(document, image)

    expect(image.type).toBe('image')
    expect(image.source).toBe('asset-logo')
    expect(image.fileName).toBe('mark.png')
    expect(image.mimeType).toBe('image/png')
    expect(image.aspectLocked).toBe(true)
    expect(image.locked).toBe(false)
    expect(getDesignObjects(document)).toHaveLength(1)
    expect(document.construction).toBeUndefined()
  })

  it('records PNG/SVG as alpha-preserving and JPEG as flattened', () => {
    const document = createNewDesign('hoodie')
    const png = createImageObject(document, {
      source: 'a',
      fileName: 'logo.png',
      mimeType: 'image/png',
    })
    const svg = createImageObject(document, {
      source: 'b',
      fileName: 'mark.svg',
      mimeType: 'image/svg+xml',
    })
    const jpg = createImageObject(document, {
      source: 'c',
      fileName: 'photo.jpg',
      mimeType: 'image/jpeg',
    })
    expect(imageKeepsAlpha(png.mimeType)).toBe(true)
    expect(imageKeepsAlpha(svg.mimeType)).toBe(true)
    expect(imageKeepsAlpha(jpg.mimeType)).toBe(false)
  })

  it('resizes an image and keeps aspect when locked', () => {
    let document = createNewDesign('tshirt')
    const image = transparentPngObject(document)
    document = addDesignObject(document, image)
    expect(objectAspect(image)).toBe(2)

    document = updateDesignObject(document, image.id, { width: 240 })
    const resized = getDesignObjectById(document, image.id)
    expect(resized?.width).toBe(240)
    expect(resized?.height).toBe(120)
    expect(isImageAspectLocked(resized!)).toBe(true)

    document = updateDesignObject(document, image.id, { aspectLocked: false, width: 200, height: 80 })
    document = updateDesignObject(document, image.id, { width: 300 })
    expect(getDesignObjectById(document, image.id)).toMatchObject({ width: 300, height: 80 })
  })

  it('moves, rotates, and changes image opacity on the document', () => {
    let document = createNewDesign('jacket')
    const image = transparentPngObject(document)
    document = addDesignObject(document, image)

    document = updateDesignObject(document, image.id, { x: 40, y: 60 })
    document = updateDesignObject(document, image.id, { rotation: 25 })
    document = updateDesignObject(document, image.id, { opacity: 0.4 })

    expect(getDesignObjectById(document, image.id)).toMatchObject({
      x: 40,
      y: 60,
      rotation: 25,
      opacity: 0.4,
    })
  })

  it('deletes, duplicates, and locks an image without touching construction', () => {
    let document = setConstructionStyle(createNewDesign('hoodie'), 'hood', 'zip')
    const image = transparentPngObject(document)
    document = addDesignObject(document, image)

    const duplicated = duplicateDesignObject(document, image.id)
    expect(duplicated).not.toBeNull()
    document = duplicated!.document
    expect(getDesignObjects(document)).toHaveLength(2)
    expect(duplicated!.object.fileName).toBe('mark.png')
    expect(duplicated!.object.source).toBe('asset-logo')

    document = updateDesignObject(document, image.id, { locked: true })
    expect(getDesignObjectById(document, image.id)?.locked).toBe(true)
    document = updateDesignObject(document, image.id, { locked: false })
    expect(getDesignObjectById(document, image.id)?.locked).toBe(false)

    document = removeDesignObject(document, image.id)
    expect(getDesignObjectById(document, image.id)).toBeNull()
    expect(getDesignObjects(document)).toHaveLength(1)
    expect(document.construction?.hood?.style).toBe('zip')
  })

  it('edits text, image, and shape properties through the document', () => {
    let document = createNewDesign('tshirt')
    const text = createTextObject(document, 'front')
    const image = transparentPngObject(document)
    const shape = createShapeObject(document, 'front')
    document = addDesignObject(addDesignObject(addDesignObject(document, text), image), shape)

    document = updateDesignObject(document, text.id, {
      content: 'Hello',
      fontFamily: 'Georgia, serif',
      fontSize: 30,
      fontWeight: 700,
      textAlign: 'left',
      color: '#ff0000',
    })
    document = updateDesignObject(document, image.id, { visible: false, opacity: 0.55 })
    document = updateDesignObject(document, shape.id, { fill: '#112233', stroke: '#445566', strokeWidth: 3 })

    expect(getDesignObjectById(document, text.id)).toMatchObject({
      content: 'Hello',
      fontFamily: 'Georgia, serif',
      fontSize: 30,
      fontWeight: 700,
      textAlign: 'left',
      color: '#ff0000',
    })
    expect(getDesignObjectById(document, image.id)).toMatchObject({ visible: false, opacity: 0.55 })
    expect(getDesignObjectById(document, shape.id)).toMatchObject({
      fill: '#112233',
      stroke: '#445566',
      strokeWidth: 3,
    })
  })

  it('switches placement zone without modifying objects on another zone', () => {
    let document = createNewDesign('tshirt')
    const front = createTextObject(document, 'front')
    const back = createShapeObject(document, 'back')
    document = addDesignObject(addDesignObject(document, front), back)
    const frontBefore = structuredClone(getDesignObjectById(document, front.id))
    const backBefore = structuredClone(getDesignObjectById(document, back.id))

    document = setActiveZone(document, 'back')
    expect(resolveActiveZone(document)).toBe('back')
    expect(getDesignObjectById(document, front.id)).toEqual(frontBefore)
    expect(getDesignObjectById(document, back.id)).toEqual(backBefore)
    expect(getDesignObjectsInZone(document, 'front', true).map((object) => object.id)).toEqual([front.id])
    expect(getDesignObjectsInZone(document, 'back', true).map((object) => object.id)).toEqual([back.id])

    document = setActiveZone(document, 'left-sleeve')
    expect(getDesignObjectById(document, front.id)).toEqual(frontBefore)
    expect(getDesignObjectById(document, back.id)).toEqual(backBefore)
  })

  it('reassigns one object zone and leaves siblings unchanged', () => {
    let document = createNewDesign('tshirt')
    const front = createTextObject(document, 'front')
    const other = createShapeObject(document, 'front')
    document = addDesignObject(addDesignObject(document, front), other)
    const otherBefore = structuredClone(getDesignObjectById(document, other.id))

    document = setDesignObjectZone(document, front.id, 'back')
    expect(getDesignObjectById(document, front.id)?.zone).toBe('back')
    expect(getDesignObjectById(document, front.id)?.anchor.panelId).toBe('back_body')
    expect(getDesignObjectById(document, other.id)).toEqual(otherBefore)
    expect(resolveActiveZone(document)).toBe('back')
  })

  it('saves and reopens artwork fields including image metadata', () => {
    let document = setConstructionStyle(createNewDesign('hoodie'), 'hood', 'zip')
    const image = transparentPngObject(document)
    document = addDesignObject(document, image)
    document = updateDesignObject(document, image.id, {
      x: 88,
      y: 90,
      rotation: 12,
      opacity: 0.7,
      visible: true,
      locked: true,
      zone: 'back',
    })

    const reopened = normalizeDocument(structuredClone(document))
    expect(isDesignDocument(reopened)).toBe(true)
    expect(reopened.construction?.hood?.style).toBe('zip')
    expect(reopened.designObjects?.[0]).toMatchObject({
      type: 'image',
      source: 'asset-logo',
      fileName: 'mark.png',
      mimeType: 'image/png',
      aspectLocked: true,
      x: 88,
      y: 90,
      rotation: 12,
      opacity: 0.7,
      visible: true,
      locked: true,
      zone: 'back',
    })
    expect(reopened.designObjects?.[0]?.anchor.space).toBe('zone')
  })

  it('keeps older documents and older image objects valid', () => {
    const document = createNewDesign('tshirt')
    const { designObjects: _objects, activeZone: _zone, ...legacy } = document
    expect(isDesignDocument(legacy as typeof document)).toBe(true)
    expect(normalizeDocument(legacy as typeof document).designObjects).toBeUndefined()

    const cleaned = sanitizeDesignObjects([
      {
        id: 'legacy-image',
        type: 'image',
        x: 10,
        y: 20,
        width: 40,
        height: 40,
        source: 'old-asset',
        fileName: 'old.png',
        zone: 'front',
      },
    ])
    expect(cleaned?.[0]).toMatchObject({
      type: 'image',
      source: 'old-asset',
      mimeType: 'image/png',
      aspectLocked: true,
      anchor: { space: 'zone' },
    })
  })

  it('undo/redo snapshots restore artwork through immutable document copies', () => {
    const origin = createNewDesign('shorts')
    const image = createImageObject(origin, { source: 'a', fileName: 'a.png', mimeType: 'image/png' }, 'front')
    const added = addDesignObject(origin, image)
    const moved = updateDesignObject(added, image.id, { x: 64, y: 80 })

    expect(origin.designObjects).toEqual([])
    expect(getDesignObjectById(added, image.id)?.x).not.toBe(64)
    expect(getDesignObjectById(moved, image.id)).toMatchObject({ x: 64, y: 80 })

    const undone = added
    expect(getDesignObjectById(undone, image.id)?.x).not.toBe(64)
    const redone = moved
    expect(getDesignObjectById(redone, image.id)).toMatchObject({ x: 64, y: 80 })
    expect(origin.construction).toBeUndefined()
    expect(moved.construction).toBeUndefined()
  })

  it('isolates front and back artwork and leaves construction unchanged', () => {
    let document = setConstructionStyle(createNewDesign('tshirt'), 'collar', 'stand')
    const front = createImageObject(document, { source: 'front-mark', fileName: 'front.png' }, 'front')
    const back = createTextObject(document, 'back')
    document = addDesignObject(addDesignObject(document, front), back)
    const construction = structuredClone(document.construction)

    document = updateDesignObject(document, front.id, { x: 50 })
    document = setActiveZone(document, 'back')
    document = updateDesignObject(document, back.id, { content: 'Back print' })

    expect(getDesignObjectById(document, front.id)).toMatchObject({ x: 50, zone: 'front', source: 'front-mark' })
    expect(getDesignObjectById(document, back.id)).toMatchObject({ content: 'Back print', zone: 'back' })
    expect(document.construction).toEqual(construction)
    expect(document.elements).toEqual([])
  })

  it('anchors new objects to a garment zone/panel instead of screen pixels', () => {
    const document = createNewDesign('tshirt')
    const image = createImageObject(document, { source: 's', fileName: 's.png' }, 'left-sleeve')
    expect(image.anchor.space).toBe('zone')
    expect(image.anchor.panelId).toBe('left_sleeve')
    expect(defaultPanelIdForZone(document, 'front')).toBe('front_body')
    expect(defaultPanelIdForZone(createNewDesign('pants'), 'left-leg')).toBe('left_leg')
    expect(image.x).toBeGreaterThan(300)
  })

  it('keeps aspect when a resize handle is constrained', () => {
    const next = resizeRectKeepAspect(
      { x: 10, y: 20, width: 100, height: 50 },
      0,
      'e',
      { x: 160, y: 45 },
      2,
    )
    expect(next.width / next.height).toBeCloseTo(2)
    expect(next.width).toBeGreaterThan(100)
  })
})
