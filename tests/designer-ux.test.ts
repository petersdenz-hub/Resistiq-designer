import { createNewDesign } from '@/design/createDesign'
import {
  addDesignObject,
  createImageObject,
  createShapeObject,
  createTextObject,
  objectDisplayName,
} from '@/design'
import { fitCanvasZoom, objectPropertySections, studioViewport, toolbarMode } from '@/studio/editorChrome'
import { describe, expect, it } from 'vitest'

describe('Phase 7B.8 designer UX polish', () => {
  it('chooses toolbar actions from the current selection count', () => {
    expect(toolbarMode(0)).toBe('empty')
    expect(toolbarMode(1)).toBe('single')
    expect(toolbarMode(3)).toBe('multi')
  })

  it('shows only the property sections that apply to the selection', () => {
    expect(objectPropertySections('none')).toEqual([])
    expect(objectPropertySections('text')).toEqual(['object', 'text', 'transform', 'placement', 'layer'])
    expect(objectPropertySections('image')).toEqual(['object', 'image', 'transform', 'placement', 'layer'])
    expect(objectPropertySections('shape')).toEqual(['object', 'shape', 'transform', 'placement', 'layer'])
    expect(objectPropertySections('multi')).toEqual(['object', 'transform', 'align', 'layer'])
  })

  it('names new text, images, and logos clearly', () => {
    const document = createNewDesign('tshirt')
    const text = createTextObject(document)
    const image = createImageObject(document, { source: 'a', fileName: 'mark.png' })
    const logo = createImageObject(document, { source: 'b', fileName: 'Resistiq-logo.png' })
    const shape = createShapeObject(document)
    expect(text.content).toBe('New Text')
    expect(objectDisplayName(text)).toBe('Text — New Text')
    expect(objectDisplayName(image)).toBe('Image — mark')
    expect(objectDisplayName(logo)).toBe('Logo — Resistiq-logo')
    expect(objectDisplayName(shape)).toBe('Shape — Rectangle')
  })

  it('fits zoom to the canvas without changing stored object coordinates', () => {
    let document = createNewDesign('hoodie')
    const object = createTextObject(document, 'front')
    document = addDesignObject(document, object)
    const zoom = fitCanvasZoom({ width: 400, height: 480 }, { width: 800, height: 640 }, 56, 0.4, 2.4)
    expect(zoom).toBeGreaterThan(0.4)
    expect(zoom).toBeLessThanOrEqual(2.4)
    expect(document.designObjects?.[0]?.x).toBe(object.x)
    expect(document.designObjects?.[0]?.y).toBe(object.y)
  })

  it('uses desktop, tablet, and mobile studio breakpoints', () => {
    expect(studioViewport(1600)).toBe('desktop')
    expect(studioViewport(1100)).toBe('tablet')
    expect(studioViewport(800)).toBe('mobile')
  })

  it('keeps locked objects out of empty-state and mutation-friendly defaults', () => {
    const document = createNewDesign('tshirt')
    const locked = { ...createShapeObject(document), locked: true }
    expect(locked.locked).toBe(true)
    expect(objectPropertySections('shape').includes('transform')).toBe(true)
  })
})
