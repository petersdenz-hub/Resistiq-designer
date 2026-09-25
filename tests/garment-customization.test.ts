import { createNewDesign } from '@/design/createDesign'
import {
  addDesignObject,
  createTextObject,
  getBodyColor,
  getDesignObjectById,
  getDesignObjects,
  getPanelColor,
  getPanelColorMap,
  getResolvedConstruction,
  objectClipBox,
  panelPrintBox,
  resolveConstruction,
  setActivePanel,
  setActiveView,
  setColorValue,
  setConstructionStyle,
  setGarmentMaterial,
  setRegionColor,
  styleOf,
  switchGarment,
  updateDesignObject,
} from '@/design'
import { zoneForPanel } from '@/design/objectPlacement'
import {
  colorRegionsFor,
  constructionControlsFor,
  garmentExportManifest,
  getGarment,
  panelBleedBounds,
  panelDesignZones,
  VISUAL_FINISHES,
  visibleConstructionControls,
  visualFinishCatalog,
} from '@/garments'
import { GARMENT_COLOR_PRESETS } from '@/ui'
import { DEFAULT_CANVAS_GUIDES } from '@/studio/canvasEditorContext'
import { isDesignDocument, normalizeDocument } from '@/persistence/validateDocument'
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

function regionIds(type: string) {
  return colorRegionsFor(type).map((region) => region.id)
}

function regionLabels(type: string) {
  return colorRegionsFor(type).map((region) => region.label)
}

describe('Phase 8 real garment customization', () => {
  it('changes the garment body color on the existing color list', () => {
    let document = createNewDesign('tshirt')
    expect(getBodyColor(document)).toBe('#e8e4dc')
    document = setColorValue(document, 'body', '#1e2a4a')
    expect(getBodyColor(document)).toBe('#1e2a4a')
    expect(document.colors.some((color) => color.role === 'body')).toBe(true)
  })

  it('colors only the panels a garment actually exposes', () => {
    expect(regionLabels('tshirt')).toEqual(['Body', 'Left sleeve', 'Right sleeve', 'Collar'])
    expect(regionLabels('hoodie')).toEqual(['Body', 'Left sleeve', 'Right sleeve', 'Hood', 'Cuffs'])
    expect(regionLabels('sweatshirt')).toEqual(['Body', 'Left sleeve', 'Right sleeve', 'Collar', 'Cuffs'])
    expect(regionLabels('jacket')).toEqual([
      'Left front',
      'Right front',
      'Back',
      'Left sleeve',
      'Right sleeve',
      'Collar',
    ])
    expect(regionLabels('pants')).toEqual(['Left leg', 'Right leg', 'Waistband'])
    expect(regionLabels('shorts')).toEqual(['Left leg', 'Right leg', 'Waistband'])

    expect(regionIds('hoodie')).not.toContain('waistband')
    expect(regionIds('sweatshirt')).not.toContain('waistband')
    expect(regionIds('jacket')).not.toContain('cuffs')
    expect(regionIds('tshirt')).not.toContain('hood')

    let document = createNewDesign('tshirt')
    const sleeves = colorRegionsFor('tshirt').find((region) => region.id === 'sleeve-left')!
    document = setRegionColor(document, sleeves.panelIds, '#8b3a3a')
    expect(sleeves.panelIds).toEqual(expect.arrayContaining(['left_sleeve', 'left_sleeve_back']))
    expect(getPanelColor(document, 'left_sleeve')).toBe('#8b3a3a')
    expect(getPanelColor(document, 'left_sleeve_back')).toBe('#8b3a3a')
    expect(getPanelColor(document, 'right_sleeve')).toBe(getBodyColor(document))
    expect(getBodyColor(document)).toBe('#e8e4dc')
  })

  it('selects a visual material finish without inventing 3D fabric', () => {
    expect([...VISUAL_FINISHES]).toEqual(['cotton', 'fleece', 'nylon', 'softshell', 'polyester', 'denim'])
    expect(visualFinishCatalog().map((material) => material.id)).toEqual([...VISUAL_FINISHES])

    let document = createNewDesign('hoodie')
    expect(document.construction).toBeUndefined()
    document = setGarmentMaterial(document, 'fleece')
    expect(document.construction?.materialId).toBe('fleece')
    expect(document.materials.some((material) => material.id === 'fleece')).toBe(true)
    expect(setGarmentMaterial(document, 'not-a-fabric')).toBe(document)
  })

  it('shows only construction options the garment definition supports', () => {
    expect(constructionControlsFor('tshirt').map((control) => control.id)).toEqual([
      'collar',
      'hem',
      'cuff',
    ])
    expect(constructionControlsFor('hoodie').map((control) => control.id)).toEqual(
      expect.arrayContaining(['hood', 'pocket', 'cuff', 'hem']),
    )
    expect(constructionControlsFor('hoodie').map((control) => control.id)).not.toContain('zipper')
    expect(constructionControlsFor('tshirt').map((control) => control.id)).not.toContain('hood')
    expect(constructionControlsFor('pants').map((control) => control.id)).toEqual(
      expect.arrayContaining(['waistband', 'front_pocket', 'hem']),
    )
    expect(constructionControlsFor('shorts').map((control) => control.id)).not.toContain('cargo_pocket')
    expect(constructionControlsFor('jacket').map((control) => control.id)).toEqual(
      expect.arrayContaining(['collar', 'zipper', 'pocket', 'cuff']),
    )

    const hoodie = resolveConstruction(createNewDesign('hoodie'))
    expect(visibleConstructionControls('hoodie', hoodie).some((control) => control.id === 'drawstring')).toBe(
      true,
    )
    const noHood = { ...hoodie, hood: { ...hoodie.hood!, style: 'none' } }
    expect(visibleConstructionControls('hoodie', noHood).map((control) => control.id)).not.toContain(
      'drawstring',
    )
    expect(visibleConstructionControls('hoodie', noHood).map((control) => control.id)).not.toContain(
      'hood_opening',
    )
  })

  it('selects a design zone by selecting its panel', () => {
    let document = createNewDesign('tshirt')
    const left = getGarment('tshirt').panels.find((panel) => panel.id === 'left_sleeve')!
    const zone = panelDesignZones(left).find((item) => item.name === 'Left sleeve')
    expect(zone).toBeTruthy()

    document = setActivePanel(document, left.id)
    expect(document.activePanelId).toBe('left_sleeve')
    expect(document.activeView).toBe('front')
    expect(zoneForPanel(left.id, 'front', 'front')).toBe('left-sleeve')

    document = setActiveView(document, 'back')
    const back = getGarment('tshirt').panels.find((panel) => panel.id === 'back_body')!
    expect(panelDesignZones(back).map((item) => item.name)).toEqual(
      expect.arrayContaining(['Back print', 'Upper back', 'Lower back']),
    )
    document = setActivePanel(document, back.id)
    expect(document.activePanelId).toBe('back_body')
    expect(zoneForPanel(back.id, 'front', 'back')).toBe('back')
  })

  it('clips artwork at render time without changing designObject coordinates', () => {
    let document = createNewDesign('tshirt')
    const text = createTextObject(document, 'front')
    document = addDesignObject(document, text)
    document = updateDesignObject(document, text.id, { x: 10, y: 10, width: 400, height: 300 })
    const before = getDesignObjectById(document, text.id)!
    const box = objectClipBox(document, before)
    expect(box).toMatchObject({
      x: expect.any(Number),
      y: expect.any(Number),
      width: expect.any(Number),
      height: expect.any(Number),
    })
    expect(getDesignObjectById(document, text.id)).toEqual(before)
    expect(before.x).toBe(10)
    expect(before.y).toBe(10)
    expect(panelPrintBox(document, before.anchor.panelId)).toEqual(box)
  })

  it('keeps print, safe, and guide overlays off by default except the print/safe pair', () => {
    expect(DEFAULT_CANVAS_GUIDES).toEqual({
      showPrintArea: true,
      showSafeAreas: true,
      showGuides: false,
    })
    const front = getGarment('tshirt').panels.find((panel) => panel.id === 'front_body')!
    const bleed = panelBleedBounds(front)
    const print = front.designBounds!
    expect(bleed.x).toBeLessThanOrEqual(print.x)
    expect(bleed.y).toBeLessThanOrEqual(print.y)
    expect(bleed.width).toBeGreaterThanOrEqual(print.width)
    expect(bleed.height).toBeGreaterThanOrEqual(print.height)
  })

  it('persists garment customization through the existing save/load path', () => {
    let document = createNewDesign('hoodie')
    const mark = createTextObject(document, 'front')
    document = addDesignObject(document, mark)
    document = updateDesignObject(document, mark.id, {
      content: 'Peak',
      x: 140,
      y: 180,
      color: '#f4f0e8',
      italic: true,
    })
    document = setColorValue(document, 'body', '#1f3d2b')
    const hood = colorRegionsFor('hoodie').find((region) => region.id === 'hood')!
    document = setRegionColor(document, hood.panelIds, '#3f4f2a')
    document = setGarmentMaterial(document, 'fleece')
    document = setConstructionStyle(document, 'pocket', 'kangaroo')
    document = setActivePanel(document, 'left_sleeve')

    expect(isDesignDocument(document)).toBe(true)
    const reopened = normalizeDocument(structuredClone(document))
    expect(reopened.garmentType).toBe('hoodie')
    expect(getBodyColor(reopened)).toBe('#1f3d2b')
    expect(getPanelColor(reopened, 'hood')).toBe('#3f4f2a')
    expect(reopened.construction?.materialId).toBe('fleece')
    expect(styleOf(getResolvedConstruction(reopened), 'pocket')).toBe('kangaroo')
    expect(reopened.activePanelId).toBe('left_sleeve')
    expect(getDesignObjectById(reopened, mark.id)).toMatchObject({
      content: 'Peak',
      x: 140,
      y: 180,
      color: '#f4f0e8',
      italic: true,
    })
  })

  it('uses the same garment and artwork state for preview as the editor', () => {
    let document = createNewDesign('jacket')
    const text = createTextObject(document, 'front')
    document = addDesignObject(document, text)
    document = setColorValue(document, 'body', '#2c2f36')
    document = setRegionColor(
      document,
      colorRegionsFor('jacket').find((region) => region.id === 'front-left')!.panelIds,
      '#5c4033',
    )
    document = setGarmentMaterial(document, 'softshell')
    document = setConstructionStyle(document, 'zipper', 'center_front')

    const preview = {
      garmentType: document.garmentType,
      bodyColor: getBodyColor(document),
      panelColors: getPanelColorMap(document),
      construction: getResolvedConstruction(document),
      artwork: getDesignObjects(document).map((object) => ({
        id: object.id,
        x: object.x,
        y: object.y,
        width: object.width,
        height: object.height,
        clip: objectClipBox(document, object),
      })),
    }

    expect(preview.garmentType).toBe('jacket')
    expect(preview.bodyColor).toBe('#2c2f36')
    expect(preview.panelColors.front_body_left).toBe('#5c4033')
    expect(preview.construction.materialId).toBe('softshell')
    expect(preview.construction.zipper?.style).toBe('center_front')
    expect(preview.artwork[0]?.clip).toBeTruthy()
    expect(preview.artwork[0]).toMatchObject({
      id: text.id,
      x: text.x,
      y: text.y,
    })
  })

  it('keeps artwork and customization stable across the six-garment cycle', () => {
    let document = createNewDesign('tshirt')
    const text = createTextObject(document, 'front')
    document = addDesignObject(document, text)
    document = setColorValue(document, 'body', '#1a1a1a')
    document = setGarmentMaterial(document, 'cotton')
    document = setConstructionStyle(document, 'collar', 'crew')
    const snapshot = structuredClone(document.designObjects)
    const body = getBodyColor(document)

    for (const type of ['hoodie', 'sweatshirt', 'jacket', 'pants', 'shorts', 'tshirt'] as const) {
      document = switchGarment(document, type)
      expect(document.garmentType).toBe(type)
      expect(document.designObjects).toEqual(snapshot)
      expect(getBodyColor(document)).toBe(body)
      expect(document.construction?.materialId).toBe('cotton')
      expect(getDesignObjectById(document, text.id)).toMatchObject({
        x: text.x,
        y: text.y,
        width: text.width,
        height: text.height,
      })
    }
  })

  it('switches panels without rewriting artwork', () => {
    let document = createNewDesign('shorts')
    const mark = createTextObject(document, 'front')
    document = addDesignObject(document, mark)
    document = setActivePanel(document, 'right_leg')
    expect(document.activePanelId).toBe('right_leg')
    expect(getDesignObjectById(document, mark.id)).toMatchObject({
      x: mark.x,
      y: mark.y,
      zone: 'front',
    })
    document = setActivePanel(document, 'waistband')
    expect(document.activePanelId).toBe('waistband')
    expect(document.designObjects).toHaveLength(1)
  })

  it('undoes and redoes garment color, region, and material writes as snapshots', () => {
    const history = historyStack(createNewDesign('tshirt'))
    const sleeves = colorRegionsFor('tshirt').find((region) => region.id === 'sleeve-right')!

    history.apply(setColorValue(history.document, 'body', '#1e2a4a'))
    history.apply(setRegionColor(history.document, sleeves.panelIds, '#8b3a3a'))
    history.apply(setGarmentMaterial(history.document, 'denim'))

    expect(getBodyColor(history.document)).toBe('#1e2a4a')
    expect(getPanelColor(history.document, 'right_sleeve')).toBe('#8b3a3a')
    expect(history.document.construction?.materialId).toBe('denim')

    history.undo()
    expect(history.document.construction?.materialId).toBeUndefined()
    history.undo()
    expect(getPanelColor(history.document, 'right_sleeve')).toBe('#1e2a4a')
    history.undo()
    expect(getBodyColor(history.document)).toBe('#e8e4dc')

    history.redo()
    expect(getBodyColor(history.document)).toBe('#1e2a4a')
    history.redo()
    expect(getPanelColor(history.document, 'right_sleeve')).toBe('#8b3a3a')
    history.redo()
    expect(history.document.construction?.materialId).toBe('denim')
  })

  it('keeps the Resistiq palette off garment geometry and exposes an export foundation', () => {
    expect(GARMENT_COLOR_PRESETS.map((preset) => preset.label)).toEqual([
      'Black',
      'White',
      'Off-white',
      'Charcoal',
      'Grey',
      'Navy',
      'Forest green',
      'Olive',
      'Sand',
      'Brown',
      'Muted blue',
      'Muted red',
    ])
    const tshirt = getGarment('tshirt')
    expect(JSON.stringify(tshirt.panels)).not.toContain('#1e2a4a')

    let document = createNewDesign('pants')
    const text = createTextObject(document, 'left-leg')
    document = addDesignObject(document, text)
    document = setGarmentMaterial(document, 'denim')
    const manifest = garmentExportManifest(document)
    expect(manifest.version).toBe(1)
    expect(manifest.garmentType).toBe('pants')
    expect(manifest.views.map((view) => view.viewId)).toEqual(['front', 'back'])
    expect(manifest.designZones).toEqual(['front', 'back', 'left-leg', 'right-leg'])
    expect(manifest.views[0]?.panels.some((panel) => panel.id === 'left_leg' && panel.printable)).toBe(true)
    expect(manifest.artwork[0]).toMatchObject({
      id: text.id,
      zone: 'left-leg',
      x: text.x,
      y: text.y,
    })
    expect(manifest.materialId).toBe('denim')
  })
})
