import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import {
  addDesignObject,
  createImageObject,
  createTextObject,
  defaultPanelIdForZone,
  getBodyColor,
  getDesignObjectById,
  getPanelColor,
  getResolvedConstruction,
  objectClipPaths,
  setActivePanel,
  setGarmentMaterial,
  setRegionColor,
  switchGarment,
  zonesForGarment,
} from '@/design'
import { createNewDesign } from '@/design/createDesign'
import { constructionKindsOf } from '@/design/construction'
import {
  AVAILABLE_GARMENTS,
  GarmentRenderer,
  colorRegionsFor,
  constructionControlsFor,
  garmentCatalogGroups,
  getGarment,
  hasGarment,
  panelDesignZones,
  panelSilhouetteFor,
  regionForPanel,
  silhouetteBounds,
} from '@/garments'
import { ZoneSurfaceOverlay } from '@/canvas/ZoneSurfaceOverlay'
import { PanelGuides } from '@/garments/render/PanelGuides'
import { PreviewStage } from '@/preview/PreviewStage'
import { normalizeDocument } from '@/persistence/validateDocument'
import { FRONT_CROWN } from '@/garments/beanie/geometry'
import { describe, expect, it } from 'vitest'

const ORIGINAL_SIX = ['tshirt', 'hoodie', 'sweatshirt', 'jacket', 'pants', 'shorts'] as const
const ORIGINAL_REGIONS: Record<(typeof ORIGINAL_SIX)[number], string[]> = {
  tshirt: ['front-body', 'back-body', 'left-sleeve', 'right-sleeve', 'collar', 'hem'],
  hoodie: [
    'front-body',
    'back-body',
    'left-sleeve',
    'right-sleeve',
    'hood',
    'left-cuff',
    'right-cuff',
    'waistband',
    'kangaroo-pocket',
  ],
  sweatshirt: [
    'front-body',
    'back-body',
    'left-sleeve',
    'right-sleeve',
    'collar',
    'left-cuff',
    'right-cuff',
    'waistband',
  ],
  jacket: [
    'front-left',
    'front-right',
    'back',
    'left-sleeve',
    'right-sleeve',
    'collar',
    'left-cuff',
    'right-cuff',
    'zipper',
    'left-pocket',
    'right-pocket',
  ],
  pants: ['left-leg', 'right-leg', 'waistband', 'left-pocket', 'right-pocket', 'inseam', 'outseam'],
  shorts: ['left-leg', 'right-leg', 'waistband', 'pockets', 'inseam', 'outseam'],
}

function renderBeanie(viewId: string, document = createNewDesign('beanie')) {
  return renderToStaticMarkup(
    createElement(
      'svg',
      null,
      createElement(GarmentRenderer, {
        garmentType: 'beanie',
        viewId,
        panelId: getGarment('beanie').defaultPanelId(viewId),
        bodyColor: getBodyColor(document),
        construction: getResolvedConstruction(document),
      }),
    ),
  )
}

describe('Phase 13 beanie garment', () => {
  it('registers Beanie in the live catalog under Headwear', () => {
    expect(hasGarment('beanie')).toBe(true)
    expect(getGarment('beanie').id).toBe('beanie')
    expect(getGarment('beanie').category).toBe('headwear')
    expect(AVAILABLE_GARMENTS.some((garment) => garment.id === 'beanie')).toBe(true)
    const headwear = garmentCatalogGroups().find((group) => group.category === 'headwear')
    expect(headwear?.garments.map((garment) => garment.id)).toEqual(['cap', 'beanie'])
  })

  it('can be selected and opens on the front artwork panel', () => {
    const document = createNewDesign('beanie')
    expect(document.garmentType).toBe('beanie')
    expect(document.activePanelId).toBe('front_crown')
    expect(document.activeView).toBe('front')
    expect(document.activeZone).toBe('front')
    expect(document.panels.map((panel) => panel.id)).toEqual(
      expect.arrayContaining(['front_crown', 'crown', 'left_side', 'right_side', 'cuff', 'back_crown']),
    )
  })

  it('exposes stable independently colorable regions', () => {
    expect(colorRegionsFor('beanie').map((region) => region.id)).toEqual([
      'crown',
      'cuff',
      'left-side',
      'right-side',
      'back',
    ])
    expect(colorRegionsFor('beanie').find((region) => region.id === 'crown')?.panelIds).toEqual([
      'front_crown',
      'crown',
    ])
    expect(colorRegionsFor('beanie').find((region) => region.id === 'cuff')?.panelIds).toEqual(['cuff', 'cuff_back'])
  })

  it('keeps crown and cuff colors independent', () => {
    let document = createNewDesign('beanie')
    const crown = colorRegionsFor('beanie').find((region) => region.id === 'crown')!
    const cuff = colorRegionsFor('beanie').find((region) => region.id === 'cuff')!
    document = setRegionColor(document, crown.panelIds, '#8b3a3a')
    document = setRegionColor(document, cuff.panelIds, '#1e2a4a')
    expect(getPanelColor(document, 'front_crown')).toBe('#8b3a3a')
    expect(getPanelColor(document, 'crown')).toBe('#8b3a3a')
    expect(getPanelColor(document, 'cuff')).toBe('#1e2a4a')
    expect(getPanelColor(document, 'cuff_back')).toBe('#1e2a4a')
    expect(getPanelColor(document, 'front_crown')).not.toBe(getPanelColor(document, 'cuff'))
  })

  it('keeps a dedicated front artwork zone that clips to the beanie silhouette', () => {
    expect(zonesForGarment('beanie')).toEqual(['front', 'back'])
    const document = createNewDesign('beanie')
    expect(defaultPanelIdForZone(document, 'front')).toBe('front_crown')
    const front = getGarment('beanie').panels.find((panel) => panel.id === 'front_crown')!
    expect(panelDesignZones(front).map((zone) => zone.id)).toEqual(
      expect.arrayContaining(['beanie-front-full', 'beanie-front-print']),
    )

    const artwork = createTextObject(document, 'front')
    const withArt = addDesignObject(document, artwork)
    const clip = objectClipPaths(withArt, artwork)
    expect(clip).toEqual(panelSilhouetteFor('beanie', 'front_crown'))
    expect(clip[0]?.startsWith('M')).toBe(true)
    expect(clip[0]).not.toMatch(/^M[\d.]+ [\d.]+ H[\d.]+ V[\d.]+ H[\d.]+ Z$/)
  })

  it('selects regions through the existing panel/region contract', () => {
    let document = createNewDesign('beanie')
    expect(regionForPanel('beanie', document.activePanelId)?.id).toBe('crown')
    document = setActivePanel(document, 'cuff')
    expect(regionForPanel('beanie', document.activePanelId)?.id).toBe('cuff')
    document = setActivePanel(document, 'left_side')
    expect(regionForPanel('beanie', document.activePanelId)?.id).toBe('left-side')
    document = setActivePanel(document, 'back_crown')
    expect(regionForPanel('beanie', document.activePanelId)?.id).toBe('back')
  })

  it('clips image/logo artwork to the same front-crown silhouette', () => {
    const document = createNewDesign('beanie')
    const logo = createImageObject(
      document,
      {
        source: 'data:image/png;base64,aaaa',
        fileName: 'logo.png',
        mimeType: 'image/png',
      },
      'front',
    )
    const withLogo = addDesignObject(document, logo)
    expect(objectClipPaths(withLogo, logo)).toEqual(panelSilhouetteFor('beanie', 'front_crown'))
    expect(getDesignObjectById(withLogo, logo.id)?.anchor.panelId).toBe('front_crown')
  })

  it('draws print and zone guides from the front-crown silhouette, not a rectangle', () => {
    const document = createNewDesign('beanie')
    const zoneHtml = renderToStaticMarkup(createElement(ZoneSurfaceOverlay, { document, zone: 'front' }))
    expect(zoneHtml).toContain('data-zone-surface-kind="silhouette"')
    expect(zoneHtml).toContain(FRONT_CROWN)
    expect(zoneHtml).not.toMatch(/<rect[\s>]/)

    const garment = getGarment('beanie')
    const guidesHtml = renderToStaticMarkup(
      createElement(PanelGuides, {
        garmentType: 'beanie',
        panels: garment.panels.filter((panel) => panel.viewId === 'front'),
        safeAreas: document.safeAreas,
        activePanelId: 'front_crown',
        showPrintArea: true,
        showSafeAreas: true,
        showGuides: true,
        onSelectPanel: () => undefined,
      }),
    )
    expect(guidesHtml).toContain('data-printable-area-kind="silhouette"')
    expect(guidesHtml).toContain(FRONT_CROWN)
    expect(guidesHtml).not.toContain('data-safe-area="front_crown"')
    expect(guidesHtml).not.toContain('SAFE AREA')
  })

  it('persists region colors, materials, and artwork through save/load', () => {
    let document = createNewDesign('beanie')
    const mark = createTextObject(document, 'front')
    document = addDesignObject(document, mark)
    const crown = colorRegionsFor('beanie').find((region) => region.id === 'crown')!
    const cuff = colorRegionsFor('beanie').find((region) => region.id === 'cuff')!
    document = setRegionColor(document, crown.panelIds, '#8b3a3a')
    document = setRegionColor(document, cuff.panelIds, '#1e2a4a')
    document = setGarmentMaterial(document, 'cotton')

    const reopened = normalizeDocument(structuredClone(document))
    expect(reopened.garmentType).toBe('beanie')
    expect(getPanelColor(reopened, 'front_crown')).toBe('#8b3a3a')
    expect(getPanelColor(reopened, 'cuff')).toBe('#1e2a4a')
    expect(reopened.construction?.materialId).toBe('cotton')
    expect(getDesignObjectById(reopened, mark.id)?.zone).toBe('front')
    expect(getDesignObjectById(reopened, mark.id)?.anchor.panelId).toBe('front_crown')
  })

  it('applies cotton, nylon, and softshell through the shared material path', () => {
    for (const materialId of ['cotton', 'nylon', 'softshell'] as const) {
      const document = setGarmentMaterial(createNewDesign('beanie'), materialId)
      const html = renderBeanie('front', document)
      expect(html).toContain(`data-fabric="${materialId}"`)
      expect(getResolvedConstruction(document).materialId).toBe(materialId)
    }
  })

  it('renders construction details through existing primitives', () => {
    expect(constructionControlsFor('beanie').map((control) => control.id)).toEqual(['waistband', 'hem'])
    expect(constructionKindsOf(getResolvedConstruction(createNewDesign('beanie')))).toEqual(['waistband', 'hem'])
    const front = renderBeanie('front')
    expect(front).toContain('data-garment-template="beanie"')
    expect(front).toContain('data-construction-kind="waistband"')
    expect(front).toContain('data-construction-kind="hem"')
    expect(front).toContain('data-flat-seam="true"')
    expect(front).toContain('data-flat-rib="true"')
    expect(front).toContain('data-construction-detail="knit"')
    expect(front).toContain('data-region-id="crown"')
    expect(front).toContain('data-region-id="cuff"')
    expect(front).not.toContain('data-region-id="brim"')
    expect(front).not.toContain('data-garment-part="top_button"')
    const back = renderBeanie('back')
    expect(back).toContain('data-region-id="back"')
    expect(back).toContain('data-region-id="cuff"')
    expect(back).not.toContain('data-region-id="brim"')
  })

  it('uses the shared preview renderer for the beanie definition', () => {
    let document = createNewDesign('beanie')
    const artwork = createTextObject(document, 'front')
    document = addDesignObject(document, artwork)
    const html = renderToStaticMarkup(createElement(PreviewStage, { document, viewId: 'front' }))
    expect(html).toContain('data-preview-stage="true"')
    expect(html).toContain('data-garment-type="beanie"')
    expect(html).toContain('data-garment-template="beanie"')
    expect(html).toContain('data-preview-artwork="1"')
  })

  it('reads as a fashion-flat beanie: tall crown, rib cuff, no visor', () => {
    const front = silhouetteBounds(panelSilhouetteFor('beanie', 'front_crown'))
    const cuff = silhouetteBounds(panelSilhouetteFor('beanie', 'cuff'))
    const peak = silhouetteBounds(panelSilhouetteFor('beanie', 'crown'))
    expect(front).toBeTruthy()
    expect(cuff).toBeTruthy()
    expect(peak).toBeTruthy()
    expect(front!.height).toBeGreaterThan(front!.width)
    expect(cuff!.y).toBeGreaterThan(front!.y + front!.height / 2)
    expect(cuff!.height).toBeGreaterThan(60)
    expect(peak!.height).toBeLessThan(front!.height)
    const html = renderBeanie('front')
    expect(html).toContain('M280 168 L280 404')
    expect(html).toContain('data-flat-rib="true"')
    expect(html).not.toContain('data-region-id="brim"')
  })

  it('switches Beanie → Cap → Beanie without rewriting artwork', () => {
    let document = createNewDesign('beanie')
    const mark = createTextObject(document, 'front')
    document = addDesignObject(document, mark)
    const snapshot = structuredClone(document.designObjects)

    document = switchGarment(document, 'cap')
    expect(document.garmentType).toBe('cap')
    expect(document.designObjects).toEqual(snapshot)

    document = switchGarment(document, 'beanie')
    expect(document.garmentType).toBe('beanie')
    expect(document.designObjects).toEqual(snapshot)
    expect(getDesignObjectById(document, mark.id)?.anchor.panelId).toBe('front_crown')
  })

  it('switches Beanie → T-shirt → Beanie without rewriting artwork', () => {
    let document = createNewDesign('beanie')
    const mark = createTextObject(document, 'front')
    document = addDesignObject(document, mark)
    const snapshot = structuredClone(document.designObjects)

    document = switchGarment(document, 'tshirt')
    expect(document.garmentType).toBe('tshirt')
    expect(document.designObjects).toEqual(snapshot)

    document = switchGarment(document, 'beanie')
    expect(document.garmentType).toBe('beanie')
    expect(document.designObjects).toEqual(snapshot)
    expect(getDesignObjectById(document, mark.id)?.anchor.panelId).toBe('front_crown')
  })

  it('leaves the original six garments and the Cap unchanged', () => {
    for (const id of ORIGINAL_SIX) {
      expect(AVAILABLE_GARMENTS.some((garment) => garment.id === id)).toBe(true)
      expect(colorRegionsFor(id).map((region) => region.id)).toEqual(expect.arrayContaining(ORIGINAL_REGIONS[id]))
    }
    expect(getGarment('cap').id).toBe('cap')
    expect(colorRegionsFor('cap').map((region) => region.id)).toEqual(
      expect.arrayContaining(['front-panel', 'brim', 'crown', 'closure']),
    )
    expect(getGarment('tshirt').category).toBe('tops')
    expect(getGarment('beanie').category).toBe('headwear')
  })
})
