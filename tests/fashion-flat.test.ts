import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createNewDesign } from '@/design/createDesign'
import {
  addDesignObject,
  createTextObject,
  getBodyColor,
  getDesignObjectById,
  getPanelColor,
  getResolvedConstruction,
  objectClipBox,
  setActivePanel,
  setColorValue,
  setConstructionStyle,
  setGarmentMaterial,
  setRegionColor,
  switchGarment,
  updateDesignObject,
} from '@/design'
import { zoneForPanel } from '@/design/objectPlacement'
import {
  AVAILABLE_GARMENTS,
  GarmentRenderer,
  colorRegionsFor,
  getGarment,
  panelDesignZones,
  panelDisplayLabel,
  VISUAL_FINISHES,
  visualFinishCatalog,
} from '@/garments'
import { clothFor, stitchContrast } from '@/garments/render/cloth'
import { PreviewStage } from '@/preview/PreviewStage'
import { normalizeDocument } from '@/persistence/validateDocument'
import { describe, expect, it } from 'vitest'

function renderGarment(
  type: string,
  viewId: string,
  extras: { bodyColor?: string; panelColors?: Record<string, string>; materialId?: string } = {},
) {
  const garment = getGarment(type)
  return renderToStaticMarkup(
    createElement(
      'svg',
      null,
      createElement(GarmentRenderer, {
        garmentType: type,
        viewId,
        panelId: garment.defaultPanelId(viewId),
        bodyColor: extras.bodyColor ?? garment.defaults.bodyColor,
        panelColors: extras.panelColors,
        construction: extras.materialId
          ? { ...getResolvedConstruction(createNewDesign(type)), materialId: extras.materialId }
          : getResolvedConstruction(createNewDesign(type)),
      }),
    ),
  )
}

describe('Phase 9 professional fashion flats', () => {
  it('keeps every catalog garment in a shared viewBox and symmetrical flats', () => {
    for (const garment of AVAILABLE_GARMENTS) {
      expect(garment.viewBox).toEqual({ width: 560, height: 640 })
      const front = renderGarment(garment.id, 'front')
      const back = renderGarment(garment.id, 'back')
      expect(front).toContain(`data-garment-template="${garment.id}"`)
      expect(back).toContain(`data-garment-template="${garment.id}"`)
      expect(front).toContain('data-flat-seam="true"')
      expect(front).toContain('data-region-shading="true"')
    }
  })

  it('mirrors pants and shorts legs around the center line', () => {
    for (const kind of ['pants', 'shorts'] as const) {
      const garment = getGarment(kind)
      const left = garment.panels.find((panel) => panel.id === 'left_leg')!
      const right = garment.panels.find((panel) => panel.id === 'right_leg')!
      expect(left.frame.height).toBe(right.frame.height)
      expect(left.frame.width).toBe(right.frame.width)
      expect(left.frame.y).toBe(right.frame.y)
      expect(left.frame.x + right.frame.x + left.frame.width).toBe(560)
      const markup = renderGarment(kind, 'front')
      expect(markup).toContain('data-flat-stitch="true"')
      expect(markup).toContain('data-construction-kind="waistband"')
    }
  })

  it('preserves seam and highlight contrast when a region color changes', () => {
    const navy = clothFor('#1e2a4a', { left_sleeve: '#8b3a3a' }, 'left_sleeve')
    const body = clothFor('#1e2a4a', { left_sleeve: '#8b3a3a' }, 'front_body')
    expect(navy.cloth).toBe('#8b3a3a')
    expect(body.cloth).toBe('#1e2a4a')
    expect(navy.stitch).not.toBe(navy.cloth)
    expect(navy.highlight).not.toBe(navy.cloth)
    expect(stitchContrast(navy)).toBeGreaterThan(80)

    const html = renderGarment('tshirt', 'front', {
      bodyColor: '#1e2a4a',
      panelColors: { left_sleeve: '#8b3a3a', right_sleeve: '#3f4f2a' },
    })
    expect(html).toContain('data-panel-color="#8b3a3a"')
    expect(html).toContain('data-panel-color="#3f4f2a"')
    expect(html).toContain('data-flat-seam="true"')
    expect(html).toContain('data-region-shading="true"')
  })

  it('keeps visual finishes distinct and deterministic', () => {
    const catalog = visualFinishCatalog()
    expect(catalog.map((material) => material.id)).toEqual([...VISUAL_FINISHES])
    const byId = Object.fromEntries(catalog.map((material) => [material.id, material]))
    expect(byId.cotton.sheen).toBeLessThan(byId.nylon.sheen)
    expect(byId.fleece.grain).toBeGreaterThan(byId.polyester.grain)
    expect(byId.denim.finish).toBe('twill')
    expect(byId.softshell.finish).toBe('technical')

    const fleece = renderGarment('hoodie', 'front', { materialId: 'fleece' })
    expect(fleece).toContain('data-fabric="fleece"')
    const denim = renderGarment('pants', 'front', { materialId: 'denim' })
    expect(denim).toContain('data-material-finish="twill"')
  })

  it('renders supported construction on each garment and hides nothing that exists', () => {
    const tshirt = renderGarment('tshirt', 'front')
    expect(tshirt).toContain('data-construction-kind="collar"')
    expect(tshirt).toContain('data-construction-kind="hem"')

    const hoodie = renderGarment('hoodie', 'front')
    expect(hoodie).toContain('data-construction-kind="hood"')
    expect(hoodie).toContain('data-construction-kind="pocket"')
    expect(hoodie).toContain('data-flat-cuff="true"')
    expect(hoodie).toContain('data-construction-style="kangaroo"')

    const jacket = renderGarment('jacket', 'front')
    expect(jacket).toContain('data-flat-zipper="true"')
    expect(jacket).toContain('data-construction-kind="collar"')

    const pants = renderGarment('pants', 'front')
    expect(pants).toContain('data-construction-kind="waistband"')
  })

  it('keeps artwork on the garment through clip boxes and garment switches', () => {
    let document = createNewDesign('tshirt')
    const text = createTextObject(document, 'front')
    document = addDesignObject(document, text)
    document = updateDesignObject(document, text.id, { x: 8, y: 12, width: 360, height: 240 })
    const before = getDesignObjectById(document, text.id)!
    const clip = objectClipBox(document, before)
    expect(clip).toBeTruthy()
    expect(getDesignObjectById(document, text.id)).toEqual(before)

    for (const next of ['hoodie', 'sweatshirt', 'jacket', 'pants', 'shorts', 'tshirt'] as const) {
      document = switchGarment(document, next)
      expect(getDesignObjectById(document, text.id)).toMatchObject({
        id: text.id,
        x: 8,
        y: 12,
        width: 360,
        height: 240,
      })
    }
  })

  it('uses definition labels for panels and design zones', () => {
    const tshirt = getGarment('tshirt')
    expect(panelDisplayLabel(tshirt.panels.find((panel) => panel.id === 'front_body')!)).toBe('FRONT BODY')
    expect(panelDisplayLabel(tshirt.panels.find((panel) => panel.id === 'left_sleeve')!)).toBe('LEFT SLEEVE')
    expect(panelDesignZones(tshirt.panels.find((panel) => panel.id === 'front_body')!).map((zone) => zone.name)).toEqual(
      expect.arrayContaining(['Front print', 'Front chest', 'Center front']),
    )
    expect(panelDesignZones(tshirt.panels.find((panel) => panel.id === 'back_body')!).map((zone) => zone.name)).toEqual(
      expect.arrayContaining(['Upper back', 'Lower back']),
    )

    const hoodie = getGarment('hoodie')
    expect(panelDisplayLabel(hoodie.panels.find((panel) => panel.id === 'hood')!)).toBe('HOOD')
    const pants = getGarment('pants')
    expect(panelDisplayLabel(pants.panels.find((panel) => panel.id === 'left_leg')!)).toBe('LEFT LEG')
  })

  it('selects panels from design zones and restores customization through save/load', () => {
    let document = createNewDesign('hoodie')
    const mark = createTextObject(document, 'front')
    document = addDesignObject(document, mark)
    document = setColorValue(document, 'body', '#1f3d2b')
    document = setRegionColor(document, colorRegionsFor('hoodie').find((region) => region.id === 'hood')!.panelIds, '#3f4f2a')
    document = setGarmentMaterial(document, 'fleece')
    document = setConstructionStyle(document, 'pocket', 'kangaroo')
    document = setActivePanel(document, 'left_sleeve')
    expect(zoneForPanel('left_sleeve', 'front', 'front')).toBe('left-sleeve')

    const reopened = normalizeDocument(structuredClone(document))
    expect(getBodyColor(reopened)).toBe('#1f3d2b')
    expect(getPanelColor(reopened, 'hood')).toBe('#3f4f2a')
    expect(reopened.construction?.materialId).toBe('fleece')
    expect(reopened.activePanelId).toBe('left_sleeve')
    expect(getDesignObjectById(reopened, mark.id)?.id).toBe(mark.id)
  })

  it('uses the same garment rendering inputs in preview as the editor', () => {
    let document = createNewDesign('jacket')
    document = addDesignObject(document, createTextObject(document, 'front'))
    document = setGarmentMaterial(document, 'softshell')
    document = setColorValue(document, 'body', '#2c2f36')
    const html = renderToStaticMarkup(createElement(PreviewStage, { document, viewId: 'front' }))
    expect(html).toContain('data-preview-handles="false"')
    expect(html).toContain('data-preview-guides="false"')
    expect(html).toContain('data-preview-seams="true"')
    expect(html).toContain('data-preview-folds="true"')
    expect(html).toContain('data-preview-construction="true"')
    expect(html).toContain('data-garment-template="jacket"')
    expect(html).toContain('data-flat-zipper="true"')
    expect(html).toContain('data-artwork-on-garment="true"')
    expect(html).not.toContain('data-editor-chrome="true"')
  })
})
