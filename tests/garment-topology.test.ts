import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import {
  addDesignObject,
  createTextObject,
  getBodyColor,
  getDesignObjectById,
  getPanelColor,
  getPanelMaterial,
  getResolvedConstruction,
  objectClipBox,
  objectClipPaths,
  setActivePanel,
  setColorValue,
  setGarmentMaterial,
  setRegionColor,
  setRegionMaterial,
  switchGarment,
} from '@/design'
import { createNewDesign } from '@/design/createDesign'
import { zoneForPanel } from '@/design/objectPlacement'
import {
  AVAILABLE_GARMENTS,
  GarmentRenderer,
  colorRegionById,
  colorRegionsFor,
  garmentSilhouettePaths,
  hasGarmentSilhouette,
  panelSilhouetteFor,
  regionForPanel,
} from '@/garments'
import { PreviewStage } from '@/preview/PreviewStage'
import { normalizeDocument } from '@/persistence/validateDocument'
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

function renderGarment(type: string, viewId: string) {
  const garment = AVAILABLE_GARMENTS.find((item) => item.id === type)!
  return renderToStaticMarkup(
    createElement(
      'svg',
      null,
      createElement(GarmentRenderer, {
        garmentType: type,
        viewId,
        panelId: garment.defaultPanelId(viewId),
        bodyColor: garment.defaults.bodyColor,
        construction: getResolvedConstruction(createNewDesign(type)),
      }),
    ),
  )
}

describe('Phase 10 true garment topology', () => {
  it('gives every garment a real silhouette for front and back', () => {
    for (const garment of AVAILABLE_GARMENTS) {
      expect(hasGarmentSilhouette(garment.id, 'front')).toBe(true)
      expect(hasGarmentSilhouette(garment.id, 'back')).toBe(true)
      expect(garmentSilhouettePaths(garment.id, 'front').every((path) => path.startsWith('M'))).toBe(true)
      expect(garment.panels.every((panel) => panelSilhouetteFor(garment.id, panel.id).length > 0)).toBe(true)
      const html = renderGarment(garment.id, 'front')
      expect(html).toContain('data-garment-silhouette="true"')
      expect(html).toContain('data-silhouette-path="true"')
    }
  })

  it('exposes stable region ids for every required garment part', () => {
    expect(colorRegionsFor('tshirt').map((region) => region.id)).toEqual([
      'front-body',
      'back-body',
      'left-sleeve',
      'right-sleeve',
      'collar',
      'hem',
    ])
    expect(colorRegionsFor('hoodie').map((region) => region.id)).toEqual([
      'front-body',
      'back-body',
      'left-sleeve',
      'right-sleeve',
      'hood',
      'left-cuff',
      'right-cuff',
      'waistband',
      'kangaroo-pocket',
    ])
    expect(colorRegionsFor('sweatshirt').map((region) => region.id)).toEqual([
      'front-body',
      'back-body',
      'left-sleeve',
      'right-sleeve',
      'collar',
      'left-cuff',
      'right-cuff',
      'waistband',
    ])
    expect(colorRegionsFor('jacket').map((region) => region.id)).toEqual(
      expect.arrayContaining(['front-left', 'front-right', 'back', 'left-sleeve', 'right-sleeve', 'collar', 'left-cuff', 'right-cuff', 'zipper', 'left-pocket', 'right-pocket']),
    )
    expect(colorRegionsFor('pants').map((region) => region.id)).toEqual(
      expect.arrayContaining(['left-leg', 'right-leg', 'waistband', 'left-pocket', 'right-pocket', 'inseam', 'outseam']),
    )
    expect(colorRegionsFor('shorts').map((region) => region.id)).toEqual(
      expect.arrayContaining(['left-leg', 'right-leg', 'waistband', 'pockets', 'inseam', 'outseam']),
    )
    expect(colorRegionById('tshirt', 'sleeve-left')?.id).toBe('left-sleeve')
    expect(regionForPanel('hoodie', 'hood')?.id).toBe('hood')
  })

  it('selects a region through the existing panel selection', () => {
    let document = createNewDesign('hoodie')
    document = setActivePanel(document, 'left_sleeve')
    expect(document.activePanelId).toBe('left_sleeve')
    expect(regionForPanel('hoodie', document.activePanelId)?.id).toBe('left-sleeve')
    expect(zoneForPanel('left_sleeve', 'front', 'front')).toBe('left-sleeve')
    document = setActivePanel(document, 'waistband')
    expect(regionForPanel('hoodie', document.activePanelId)?.id).toBe('waistband')
  })

  it('colors and materials one region without rewriting the others', () => {
    let document = createNewDesign('tshirt')
    const sleeves = colorRegionsFor('tshirt').find((region) => region.id === 'left-sleeve')!
    const hem = colorRegionsFor('tshirt').find((region) => region.id === 'hem')!
    document = setRegionColor(document, sleeves.panelIds, '#8b3a3a')
    document = setRegionMaterial(document, hem.panelIds, 'cotton')
    document = setGarmentMaterial(document, 'fleece')
    expect(getPanelColor(document, 'left_sleeve')).toBe('#8b3a3a')
    expect(getPanelColor(document, 'right_sleeve')).toBe(getBodyColor(document))
    expect(getPanelMaterial(document, 'hem')).toBe('cotton')
    expect(getPanelMaterial(document, 'front_body')).toBe('fleece')
    expect(document.construction?.materialId).toBe('fleece')
  })

  it('clips artwork to the panel silhouette instead of the print rectangle', () => {
    let document = createNewDesign('tshirt')
    const text = createTextObject(document, 'front')
    document = addDesignObject(document, text)
    document = updateWide(document, text.id)
    const object = getDesignObjectById(document, text.id)!
    const box = objectClipBox(document, object)
    const paths = objectClipPaths(document, object)
    expect(paths.length).toBeGreaterThan(0)
    expect(paths[0]).toBe(panelSilhouetteFor('tshirt', 'front_body')[0])
    expect(box).toBeTruthy()
    expect(paths[0]).not.toEqual(`M${box!.x} ${box!.y} H${box!.x + box!.width} V${box!.y + box!.height} H${box!.x} Z`)
    expect(object.x).toBe(8)
    expect(object.width).toBe(360)

    document = setActivePanel(document, 'left_sleeve')
    const sleeve = createTextObject(document, 'left-sleeve')
    document = addDesignObject(document, { ...sleeve, anchor: { space: 'panel', panelId: 'left_sleeve' } })
    const sleeveObject = getDesignObjectById(document, sleeve.id)!
    expect(objectClipPaths(document, sleeveObject)[0]).toBe(panelSilhouetteFor('tshirt', 'left_sleeve')[0])
  })

  it('keeps region data through save/load, undo/redo, and garment switching', () => {
    const history = historyStack(createNewDesign('hoodie'))
    const mark = createTextObject(history.document, 'front')
    history.apply(addDesignObject(history.document, mark))
    history.apply(setRegionColor(history.document, colorRegionsFor('hoodie').find((region) => region.id === 'hood')!.panelIds, '#3f4f2a'))
    history.apply(setRegionMaterial(history.document, colorRegionsFor('hoodie').find((region) => region.id === 'waistband')!.panelIds, 'fleece'))
    const snapshot = getDesignObjectById(history.document, mark.id)!

    const reopened = normalizeDocument(structuredClone(history.document))
    expect(getPanelColor(reopened, 'hood')).toBe('#3f4f2a')
    expect(getPanelMaterial(reopened, 'waistband')).toBe('fleece')
    expect(reopened.panels.some((panel) => panel.id === 'waistband')).toBe(true)
    expect(getDesignObjectById(reopened, mark.id)).toMatchObject({ x: snapshot.x, y: snapshot.y })

    history.undo()
    expect(getPanelMaterial(history.document, 'waistband')).toBeUndefined()
    history.redo()
    expect(getPanelMaterial(history.document, 'waistband')).toBe('fleece')

    let document = history.document
    for (const type of ['sweatshirt', 'jacket', 'pants', 'shorts', 'tshirt', 'hoodie'] as const) {
      document = switchGarment(document, type)
      expect(getDesignObjectById(document, mark.id)).toMatchObject({
        id: mark.id,
        x: snapshot.x,
        y: snapshot.y,
        width: snapshot.width,
        height: snapshot.height,
      })
      expect(colorRegionsFor(type).length).toBeGreaterThan(3)
    }
  })

  it('fills missing region chrome on older documents without moving artwork', () => {
    const legacy = createNewDesign('hoodie')
    const mark = createTextObject(legacy, 'front')
    let document = addDesignObject(legacy, mark)
    document = {
      ...document,
      panels: document.panels.filter((panel) => panel.id === 'front_body' || panel.id === 'hood'),
    }
    const restored = normalizeDocument(document)
    expect(restored.panels.some((panel) => panel.id === 'waistband')).toBe(true)
    expect(restored.panels.some((panel) => panel.id === 'pocket')).toBe(true)
    expect(getDesignObjectById(restored, mark.id)).toEqual(getDesignObjectById(document, mark.id))
  })

  it('uses the same silhouette clip and renderer in preview as the editor', () => {
    let document = createNewDesign('jacket')
    const text = createTextObject(document, 'front')
    document = addDesignObject(document, text)
    document = setColorValue(document, 'body', '#2c2f36')
    document = setRegionColor(document, colorRegionsFor('jacket').find((region) => region.id === 'front-left')!.panelIds, '#5c4033')
    document = setGarmentMaterial(document, 'softshell')
    const paths = objectClipPaths(document, getDesignObjectById(document, text.id)!)
    const html = renderToStaticMarkup(createElement(PreviewStage, { document, viewId: 'front' }))
    expect(html).toContain('data-garment-template="jacket"')
    expect(html).toContain('data-garment-silhouette="true"')
    expect(html).toContain('data-artwork-clip-kind="silhouette"')
    expect(html).toContain('data-flat-zipper="true"')
    expect(html).toContain('data-flat-cuff="true"')
    expect(html).toContain(paths[0]!.slice(0, 24))
    expect(html).toContain('data-panel-color="#5c4033"')
    expect(html).not.toContain('data-editor-chrome="true"')
  })
})

function updateWide(document: ReturnType<typeof createNewDesign>, id: string) {
  return {
    ...document,
    designObjects: document.designObjects?.map((object) =>
      object.id === id ? { ...object, x: 8, y: 12, width: 360, height: 240 } : object,
    ),
  }
}
