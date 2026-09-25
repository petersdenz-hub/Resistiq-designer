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
import { FRONT_PANEL } from '@/garments/cap/geometry'
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

function renderCap(viewId: string, document = createNewDesign('cap')) {
  return renderToStaticMarkup(
    createElement(
      'svg',
      null,
      createElement(GarmentRenderer, {
        garmentType: 'cap',
        viewId,
        panelId: getGarment('cap').defaultPanelId(viewId),
        bodyColor: getBodyColor(document),
        construction: getResolvedConstruction(document),
      }),
    ),
  )
}

describe('Phase 11 cap garment', () => {
  it('registers Cap in the live catalog under Headwear', () => {
    expect(hasGarment('cap')).toBe(true)
    expect(getGarment('cap').id).toBe('cap')
    expect(getGarment('cap').category).toBe('headwear')
    expect(AVAILABLE_GARMENTS.some((garment) => garment.id === 'cap')).toBe(true)
    const headwear = garmentCatalogGroups().find((group) => group.category === 'headwear')
    expect(headwear?.garments.map((garment) => garment.id)).toEqual(['cap'])
  })

  it('can be selected and opens on the front artwork panel', () => {
    const document = createNewDesign('cap')
    expect(document.garmentType).toBe('cap')
    expect(document.activePanelId).toBe('front_panel')
    expect(document.activeView).toBe('front')
    expect(document.activeZone).toBe('front')
    expect(document.panels.map((panel) => panel.id)).toEqual(
      expect.arrayContaining([
        'front_panel',
        'crown',
        'left_side',
        'right_side',
        'brim',
        'band',
        'back_panel',
        'closure',
      ]),
    )
  })

  it('exposes stable independently colorable regions', () => {
    expect(colorRegionsFor('cap').map((region) => region.id)).toEqual([
      'crown',
      'front-panel',
      'left-side',
      'right-side',
      'back-panel',
      'brim',
      'band',
      'closure',
    ])
    expect(colorRegionsFor('cap').find((region) => region.id === 'front-panel')?.panelIds).toEqual(['front_panel'])
    expect(colorRegionsFor('cap').find((region) => region.id === 'crown')?.panelIds).toEqual(['crown', 'crown_back'])
  })

  it('keeps a dedicated front artwork zone that clips to the cap silhouette', () => {
    expect(zonesForGarment('cap')).toEqual(['front', 'back'])
    const document = createNewDesign('cap')
    expect(defaultPanelIdForZone(document, 'front')).toBe('front_panel')
    const front = getGarment('cap').panels.find((panel) => panel.id === 'front_panel')!
    expect(panelDesignZones(front).map((zone) => zone.id)).toEqual(
      expect.arrayContaining(['cap-front-full', 'cap-front-print']),
    )

    const artwork = createTextObject(document, 'front')
    const withArt = addDesignObject(document, artwork)
    const clip = objectClipPaths(withArt, artwork)
    expect(clip).toEqual(panelSilhouetteFor('cap', 'front_panel'))
    expect(clip[0]?.startsWith('M')).toBe(true)
    expect(clip[0]).not.toMatch(/^M[\d.]+ [\d.]+ H[\d.]+ V[\d.]+ H[\d.]+ Z$/)
  })

  it('selects regions through the existing panel/region contract', () => {
    let document = createNewDesign('cap')
    expect(regionForPanel('cap', document.activePanelId)?.id).toBe('front-panel')
    document = setActivePanel(document, 'brim')
    expect(regionForPanel('cap', document.activePanelId)?.id).toBe('brim')
    document = setActivePanel(document, 'crown')
    expect(regionForPanel('cap', document.activePanelId)?.id).toBe('crown')
    document = setActivePanel(document, 'left_side')
    expect(regionForPanel('cap', document.activePanelId)?.id).toBe('left-side')
  })

  it('clips image/logo artwork to the same front-panel silhouette', () => {
    const document = createNewDesign('cap')
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
    expect(objectClipPaths(withLogo, logo)).toEqual(panelSilhouetteFor('cap', 'front_panel'))
    expect(getDesignObjectById(withLogo, logo.id)?.anchor.panelId).toBe('front_panel')
  })

  it('persists region colors, materials, and artwork through save/load', () => {
    let document = createNewDesign('cap')
    const mark = createTextObject(document, 'front')
    document = addDesignObject(document, mark)
    const front = colorRegionsFor('cap').find((region) => region.id === 'front-panel')!
    const brim = colorRegionsFor('cap').find((region) => region.id === 'brim')!
    document = setRegionColor(document, front.panelIds, '#8b3a3a')
    document = setRegionColor(document, brim.panelIds, '#1e2a4a')
    document = setGarmentMaterial(document, 'cotton')

    const reopened = normalizeDocument(structuredClone(document))
    expect(reopened.garmentType).toBe('cap')
    expect(getPanelColor(reopened, 'front_panel')).toBe('#8b3a3a')
    expect(getPanelColor(reopened, 'brim')).toBe('#1e2a4a')
    expect(reopened.construction?.materialId).toBe('cotton')
    expect(getDesignObjectById(reopened, mark.id)?.zone).toBe('front')
    expect(getDesignObjectById(reopened, mark.id)?.anchor.panelId).toBe('front_panel')
  })

  it('applies catalog materials through the shared construction path', () => {
    let document = createNewDesign('cap')
    document = setGarmentMaterial(document, 'nylon')
    const html = renderCap('front', document)
    expect(html).toContain('data-fabric="nylon"')
    expect(html).toContain('url(#cap-front-fabric)')
    expect(getResolvedConstruction(document).materialId).toBe('nylon')
  })

  it('renders construction details through existing primitives', () => {
    expect(constructionControlsFor('cap').map((control) => control.id)).toEqual(['hem', 'waistband', 'button'])
    expect(constructionKindsOf(getResolvedConstruction(createNewDesign('cap')))).toEqual([
      'button',
      'waistband',
      'hem',
    ])
    const front = renderCap('front')
    expect(front).toContain('data-garment-template="cap"')
    expect(front).toContain('data-construction-kind="hem"')
    expect(front).toContain('data-construction-kind="waistband"')
    expect(front).toContain('data-flat-seam="true"')
    expect(front).toContain('data-flat-stitch="true"')
    expect(front).toContain('data-construction-detail="eyelet"')
    expect(front).toContain('data-region-id="front-panel"')
    expect(front).toContain('data-region-id="brim"')
    expect(front).toContain('data-region-id="crown"')
    expect(front).toContain('data-region-id="band"')
    const back = renderCap('back')
    expect(back).toContain('data-construction-kind="button"')
    expect(back).toContain('data-region-id="closure"')
    expect(back).not.toContain('data-region-id="brim"')
  })

  it('uses the shared preview renderer for the cap definition', () => {
    let document = createNewDesign('cap')
    const artwork = createTextObject(document, 'front')
    document = addDesignObject(document, artwork)
    const html = renderToStaticMarkup(createElement(PreviewStage, { document, viewId: 'front' }))
    expect(html).toContain('data-preview-stage="true"')
    expect(html).toContain('data-garment-type="cap"')
    expect(html).toContain('data-garment-template="cap"')
    expect(html).toContain('data-preview-artwork="1"')
  })

  it('switches T-shirt → Cap → T-shirt without rewriting artwork', () => {
    let document = createNewDesign('tshirt')
    const mark = createTextObject(document, 'front')
    document = addDesignObject(document, mark)
    const snapshot = structuredClone(document.designObjects)

    document = switchGarment(document, 'cap')
    expect(document.garmentType).toBe('cap')
    expect(document.designObjects).toEqual(snapshot)
    expect(document.panels.some((panel) => panel.id === 'front_panel')).toBe(true)

    document = switchGarment(document, 'tshirt')
    expect(document.garmentType).toBe('tshirt')
    expect(document.designObjects).toEqual(snapshot)
    expect(getDesignObjectById(document, mark.id)?.content).toBe(mark.content)
  })

  it('switches Cap → Hoodie → Cap without rewriting artwork', () => {
    let document = createNewDesign('cap')
    const mark = createTextObject(document, 'front')
    document = addDesignObject(document, mark)
    const snapshot = structuredClone(document.designObjects)

    document = switchGarment(document, 'hoodie')
    expect(document.garmentType).toBe('hoodie')
    expect(document.designObjects).toEqual(snapshot)

    document = switchGarment(document, 'cap')
    expect(document.garmentType).toBe('cap')
    expect(document.designObjects).toEqual(snapshot)
    expect(getDesignObjectById(document, mark.id)?.anchor.panelId).toBe('front_panel')
  })

  it('draws print and zone guides from the front-panel silhouette, not a rectangle', () => {
    const document = createNewDesign('cap')
    const zoneHtml = renderToStaticMarkup(createElement(ZoneSurfaceOverlay, { document, zone: 'front' }))
    expect(zoneHtml).toContain('data-zone-surface-kind="silhouette"')
    expect(zoneHtml).toContain(FRONT_PANEL)
    expect(zoneHtml).not.toMatch(/<rect[\s>]/)

    const garment = getGarment('cap')
    const guidesHtml = renderToStaticMarkup(
      createElement(PanelGuides, {
        garmentType: 'cap',
        panels: garment.panels.filter((panel) => panel.viewId === 'front'),
        safeAreas: document.safeAreas,
        activePanelId: 'front_panel',
        showPrintArea: true,
        showSafeAreas: true,
        showGuides: true,
        onSelectPanel: () => undefined,
      }),
    )
    expect(guidesHtml).toContain('data-printable-area-kind="silhouette"')
    expect(guidesHtml).toContain(FRONT_PANEL)
    expect(guidesHtml).not.toContain('data-safe-area="front_panel"')
    expect(guidesHtml).not.toContain('SAFE AREA')
    expect(guidesHtml).not.toContain('data-design-zone="cap-front-print"')
  })

  it('reads as a fashion-flat cap: tapered crown, crescent visor, center seam', () => {
    const front = silhouetteBounds(panelSilhouetteFor('cap', 'front_panel'))
    const brim = silhouetteBounds(panelSilhouetteFor('cap', 'brim'))
    const crown = silhouetteBounds(panelSilhouetteFor('cap', 'crown'))
    expect(front).toBeTruthy()
    expect(brim).toBeTruthy()
    expect(crown).toBeTruthy()
    expect(brim!.height).toBeLessThan(130)
    expect(brim!.width).toBeGreaterThan(front!.width)
    expect(brim!.y).toBeGreaterThan(front!.y + front!.height / 2)
    expect(front!.width).toBeGreaterThan(120)
    expect(crown!.height).toBeLessThan(front!.height)
    const html = renderCap('front')
    expect(html).toContain('M280 210 L280 372')
    expect(html).toContain('data-flat-seam="true"')
  })

  it('applies cotton, nylon, and softshell through the shared material path', () => {
    for (const materialId of ['cotton', 'nylon', 'softshell'] as const) {
      const document = setGarmentMaterial(createNewDesign('cap'), materialId)
      const html = renderCap('front', document)
      expect(html).toContain(`data-fabric="${materialId}"`)
      expect(getResolvedConstruction(document).materialId).toBe(materialId)
    }
  })

  it('leaves the original six garments unchanged', () => {
    for (const id of ORIGINAL_SIX) {
      expect(AVAILABLE_GARMENTS.some((garment) => garment.id === id)).toBe(true)
      expect(colorRegionsFor(id).map((region) => region.id)).toEqual(expect.arrayContaining(ORIGINAL_REGIONS[id]))
    }
    expect(getGarment('tshirt').category).toBe('tops')
    expect(getGarment('jacket').category).toBe('outerwear')
    expect(getGarment('pants').category).toBe('bottoms')
  })
})
