import {
  addDesignObject,
  assignDesignObjectZone,
  attachObjectToPanel,
  attachObjectToZonePanel,
  createImageObject,
  createShapeObject,
  createTextObject,
  detachObjectToZone,
  getArtworkPanelBounds,
  getDesignObjectById,
  getDesignObjectsInZone,
  isPanelAnchored,
  localBoxFromRelative,
  objectRelativeBox,
  paintDesignObject,
  resolveObjectViewBox,
  setActiveZone,
  setConstructionStyle,
  setDesignObjectAnchor,
  setDesignObjectPanel,
  storeObjectViewBox,
  updateDesignObject,
} from '@/design'
import { createNewDesign } from '@/design/createDesign'
import { isDesignDocument, normalizeDocument } from '@/persistence/validateDocument'
import { describe, expect, it } from 'vitest'

function panelLogo(document = createNewDesign('tshirt')) {
  const created = createImageObject(
    document,
    {
      source: 'asset-logo',
      fileName: 'mark.png',
      mimeType: 'image/png',
      naturalWidth: 200,
      naturalHeight: 100,
      aspectLocked: true,
    },
    'front',
  )
  return attachObjectToPanel(document, created, 'front_body', 'visual')
}

describe('Phase 7B.6 garment-aware artwork placement', () => {
  it('creates a panel-anchored object with panel-local coordinates', () => {
    const document = createNewDesign('tshirt')
    const object = panelLogo(document)
    const bounds = getArtworkPanelBounds(document, 'front_body')
    expect(isPanelAnchored(object)).toBe(true)
    expect(object.anchor.space).toBe('panel')
    expect(object.anchor.panelId).toBe('front_body')
    expect(bounds).toMatchObject({
      id: 'front_body',
      x: expect.any(Number),
      y: expect.any(Number),
      width: expect.any(Number),
      height: expect.any(Number),
      rotation: 0,
    })
    expect(object.x).toBeLessThan(bounds!.localWidth)
    expect(document.construction).toBeUndefined()
  })

  it('keeps panel-relative x/y when resolved against panel geometry', () => {
    const document = createNewDesign('tshirt')
    const bounds = getArtworkPanelBounds(document, 'front_body')!
    const object = {
      ...panelLogo(document),
      x: bounds.localWidth * 0.5,
      y: bounds.localHeight * 0.25,
      width: 40,
      height: 20,
    }
    const relative = objectRelativeBox(document, object)
    expect(relative.x).toBeCloseTo(0.5)
    expect(relative.y).toBeCloseTo(0.25)

    const viewBox = resolveObjectViewBox(document, object)
    expect(viewBox.x).toBeCloseTo(bounds.x + bounds.width * 0.5)
    expect(viewBox.y).toBeCloseTo(bounds.y + bounds.height * 0.25)
    expect(viewBox.width).toBeCloseTo((40 / bounds.localWidth) * bounds.width)
  })

  it('resizes in viewBox space and stores panel-local size', () => {
    const document = createNewDesign('tshirt')
    const object = {
      ...panelLogo(document),
      x: 20,
      y: 20,
      width: 40,
      height: 20,
    }
    const painted = resolveObjectViewBox(document, object)
    const nextView = { ...painted, width: painted.width * 2, height: painted.height * 2 }
    const stored = storeObjectViewBox(document, object, nextView)
    expect(stored.width).toBeCloseTo(80)
    expect(stored.height).toBeCloseTo(40)
    expect(resolveObjectViewBox(document, { ...object, ...stored }).width).toBeCloseTo(nextView.width)
  })

  it('drags in viewBox space without writing screen pixels', () => {
    const document = createNewDesign('tshirt')
    const object = {
      ...panelLogo(document),
      x: 20,
      y: 30,
      width: 40,
      height: 20,
    }
    const painted = resolveObjectViewBox(document, object)
    const stored = storeObjectViewBox(document, object, { ...painted, x: painted.x + 16, y: painted.y + 8 })
    expect(stored.x).not.toBe(painted.x + 16)
    const roundTrip = resolveObjectViewBox(document, { ...object, ...stored })
    expect(roundTrip.x).toBeCloseTo(painted.x + 16)
    expect(roundTrip.y).toBeCloseTo(painted.y + 8)
  })

  it('preserves rotation on panel-anchored objects', () => {
    let document = createNewDesign('hoodie')
    const object = attachObjectToZonePanel(document, createShapeObject(document, 'front'))
    document = addDesignObject(document, object)
    document = updateDesignObject(document, object.id, { rotation: 22 })
    const next = getDesignObjectById(document, object.id)
    expect(next?.rotation).toBe(22)
    expect(paintDesignObject(document, next!).rotation).toBe(22)
  })

  it('keeps image aspect lock in panel space', () => {
    let document = createNewDesign('tshirt')
    const image = panelLogo(document)
    document = addDesignObject(document, image)
    document = updateDesignObject(document, image.id, { width: 80 })
    const next = getDesignObjectById(document, image.id)
    expect(next?.width).toBe(80)
    expect(next?.height).toBe(40)
    expect(next?.type === 'image' && next.aspectLocked).toBe(true)
  })

  it('isolates front and back panel artwork without modifying objects', () => {
    let document = createNewDesign('tshirt')
    const front = attachObjectToPanel(document, createTextObject(document, 'front'), 'front_body')
    const back = attachObjectToPanel(document, createTextObject(document, 'back'), 'back_body')
    document = addDesignObject(addDesignObject(document, front), back)
    const frontBefore = structuredClone(getDesignObjectById(document, front.id))
    document = setActiveZone(document, 'back')
    expect(getDesignObjectsInZone(document, 'front', true).map((item) => item.id)).toEqual([front.id])
    expect(getDesignObjectsInZone(document, 'back', true).map((item) => item.id)).toEqual([back.id])
    expect(getDesignObjectById(document, front.id)).toEqual(frontBefore)
  })

  it('switches zone and remaps a panel-anchored object relatively', () => {
    let document = createNewDesign('tshirt')
    const bounds = getArtworkPanelBounds(document, 'front_body')!
    const object = {
      ...attachObjectToPanel(document, createTextObject(document, 'front'), 'front_body'),
      x: bounds.localWidth * 0.5,
      y: bounds.localHeight * 0.25,
    }
    document = addDesignObject(document, object)
    document = assignDesignObjectZone(document, object.id, 'back')
    const next = getDesignObjectById(document, object.id)
    expect(next?.zone).toBe('back')
    expect(next?.anchor.panelId).toBe('back_body')
    const relative = objectRelativeBox(document, next!)
    expect(relative.x).toBeCloseTo(0.5)
    expect(relative.y).toBeCloseTo(0.25)
  })

  it('switches panel while keeping relative placement', () => {
    let document = createNewDesign('tshirt')
    const object = attachObjectToZonePanel(document, createShapeObject(document, 'front'))
    document = addDesignObject(document, object)
    const start = objectRelativeBox(document, getDesignObjectById(document, object.id)!)
    document = setDesignObjectPanel(document, object.id, 'left_sleeve')
    const next = getDesignObjectById(document, object.id)
    expect(next?.anchor.panelId).toBe('left_sleeve')
    expect(next?.zone).toBe('left-sleeve')
    const relative = objectRelativeBox(document, next!)
    expect(relative.x).toBeCloseTo(start.x)
    expect(relative.y).toBeCloseTo(start.y)
  })

  it('persists panel anchors through save/reopen', () => {
    let document = setConstructionStyle(createNewDesign('hoodie'), 'hood', 'zip')
    const object = attachObjectToPanel(document, createImageObject(document, { source: 'a', fileName: 'a.png' }), 'front_body')
    document = addDesignObject(document, object)
    document = updateDesignObject(document, object.id, { x: 40, y: 28, rotation: 9 })
    const reopened = normalizeDocument(structuredClone(document))
    expect(isDesignDocument(reopened)).toBe(true)
    expect(reopened.construction?.hood?.style).toBe('zip')
    expect(reopened.designObjects?.[0]).toMatchObject({
      type: 'image',
      x: 40,
      y: 28,
      rotation: 9,
      anchor: { space: 'panel', panelId: 'front_body' },
    })
  })

  it('undo/redo snapshots restore panel-local placement', () => {
    const origin = createNewDesign('jacket')
    const object = attachObjectToZonePanel(origin, createTextObject(origin, 'front'))
    const added = addDesignObject(origin, object)
    const moved = updateDesignObject(added, object.id, { x: 12, y: 18 })
    expect(origin.designObjects).toEqual([])
    expect(getDesignObjectById(added, object.id)?.x).not.toBe(12)
    expect(getDesignObjectById(moved, object.id)).toMatchObject({ x: 12, y: 18 })
    expect(moved.construction).toEqual(origin.construction)
  })

  it('does not mutate construction when artwork is panel-anchored', () => {
    let document = setConstructionStyle(createNewDesign('tshirt'), 'collar', 'stand')
    const construction = structuredClone(document.construction)
    const object = attachObjectToZonePanel(document, createShapeObject(document, 'front'))
    document = addDesignObject(document, object)
    document = setDesignObjectAnchor(document, object.id, { space: 'panel', panelId: 'front_body' })
    document = updateDesignObject(document, object.id, { x: 16 })
    expect(document.construction).toEqual(construction)
    expect(document.elements).toEqual([])
  })

  it('keeps older zone-space objects in viewBox coordinates', () => {
    const document = createNewDesign('tshirt')
    const object = createTextObject(document, 'front')
    expect(object.anchor.space).toBe('zone')
    expect(isPanelAnchored(object)).toBe(false)
    const painted = resolveObjectViewBox(document, object)
    expect(painted).toEqual({ x: object.x, y: object.y, width: object.width, height: object.height })
    const detached = detachObjectToZone(document, attachObjectToPanel(document, object, 'front_body'))
    expect(detached.anchor.space).toBe('zone')
    expect(detached.x).toBeCloseTo(object.x)
    expect(localBoxFromRelative(document, 'front_body', { x: 0.5, y: 0.25, width: 0.2, height: 0.1 }).x).toBeCloseTo(
      getArtworkPanelBounds(document, 'front_body')!.localWidth * 0.5,
    )
  })
})
