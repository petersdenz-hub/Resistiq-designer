import {
  addDesignObject,
  attachObjectToPanel,
  createShapeObject,
  createTextObject,
  getArtworkPanelBounds,
  getDesignObjectsInZone,
  localBoxFromRelative,
  objectRelativeBox,
  setActivePanel,
  setActiveView,
  zonesForGarment,
} from '@/design'
import { createNewDesign } from '@/design/createDesign'
import {
  canSafelyTransferArtwork,
  documentHasArtwork,
  garmentSwitchRequiresConfirm,
  switchGarment,
} from '@/design/garmentSwitch'
import { normalizeDocument } from '@/persistence/validateDocument'
import {
  AVAILABLE_GARMENTS,
  getGarment,
  inferPanelSide,
  isPrintablePanel,
  jacketGarment,
  panelDesignBounds,
  panelDesignZones,
  panelName,
  resolveGarmentType,
  sweatshirtGarment,
  tshirtGarment,
} from '@/garments'
import { describe, expect, it } from 'vitest'

describe('Phase 7C garment system foundation', () => {
  it('registers a definition-driven catalog with T-shirt as the reference', () => {
    expect(AVAILABLE_GARMENTS.map((garment) => garment.id)).toEqual([
      'tshirt',
      'hoodie',
      'sweatshirt',
      'jacket',
      'pants',
      'shorts',
      'cap',
      'beanie',
    ])
    expect(getGarment('tshirt').id).toBe('tshirt')
    expect(getGarment('sweatshirt').id).toBe('sweatshirt')
    expect(getGarment(undefined).id).toBe('tshirt')
    expect(resolveGarmentType('unknown-ski')).toBe('tshirt')
  })

  it('describes garments and panels without embedding artwork', () => {
    const tshirt = getGarment('tshirt')
    expect(tshirt.name).toBe('T-shirt')
    expect(tshirt.category).toBe('tops')
    expect(tshirt.preview?.viewId).toBe('front')
    expect(tshirt.supportedDesignZones).toEqual(['front', 'back', 'left-sleeve', 'right-sleeve'])
    expect(tshirt.panels.map((panel) => panel.id)).toEqual(
      expect.arrayContaining(['front_body', 'back_body', 'left_sleeve', 'right_sleeve']),
    )

    const front = tshirt.panels.find((panel) => panel.id === 'front_body')!
    expect(panelName(front)).toBe('Front body')
    expect(inferPanelSide(front)).toBe('front')
    expect(isPrintablePanel(front)).toBe(true)
    expect(panelDesignBounds(front)).toMatchObject({
      x: expect.any(Number),
      y: expect.any(Number),
      width: expect.any(Number),
      height: expect.any(Number),
    })
    expect(panelDesignZones(front).map((zone) => zone.name)).toEqual(
      expect.arrayContaining(['Front print', 'Front chest', 'Center front']),
    )
    expect(tshirt).not.toHaveProperty('designObjects')
  })

  it('keeps jacket first-class and extensible without extra parts yet', () => {
    const jacket = getGarment('jacket')
    expect(jacket.panels.map((panel) => panel.id)).toEqual(
      expect.arrayContaining([
        'front_body_left',
        'front_body_right',
        'back_body',
        'left_sleeve',
        'right_sleeve',
      ]),
    )
    expect(jacket.panels.some((panel) => panel.type === 'hood')).toBe(false)
    expect(jacket.reservedPanelTypes).toEqual(
      expect.arrayContaining(['hood', 'pocket', 'chest', 'collar', 'lower_sleeve', 'side_panel']),
    )
    expect(jacketGarment.capabilities.hood).toBe(true)
    expect(jacketGarment.capabilities.pockets).toBe(true)
  })

  it('gives sweatshirt shared panel ids so T-shirt artwork can return later', () => {
    expect(sweatshirtGarment.panels.map((panel) => panel.id)).toEqual(
      expect.arrayContaining(['front_body', 'back_body', 'left_sleeve', 'right_sleeve', 'collar']),
    )
    expect(zonesForGarment('sweatshirt')).toEqual(['front', 'back', 'left-sleeve', 'right-sleeve'])
    expect(zonesForGarment('pants')).toEqual(['front', 'back', 'left-leg', 'right-leg'])
    expect(zonesForGarment('unknown')).toEqual(['front', 'back', 'left-sleeve', 'right-sleeve'])
  })

  it('creates and selects garments from the catalog without a second document model', () => {
    const hoodie = createNewDesign('hoodie')
    expect(hoodie.garmentType).toBe('hoodie')
    expect(hoodie.views.map((view) => view.id)).toEqual(['front', 'back'])
    expect(hoodie.panels.some((panel) => panel.id === 'hood')).toBe(true)
    expect(hoodie.designObjects).toEqual([])

    const pants = createNewDesign('pants')
    expect(pants.activePanelId).toBe('left_leg')
    expect(pants.panels.map((panel) => panel.id)).toEqual(
      expect.arrayContaining(['left_leg', 'right_leg', 'waistband']),
    )
  })

  it('drives panel selection from the selected garment definition', () => {
    let document = createNewDesign('tshirt')
    document = setActiveView(document, 'back')
    expect(document.activePanelId).toBe('back_body')
    document = setActivePanel(document, 'left_sleeve_back')
    expect(document.activePanelId).toBe('left_sleeve_back')
    expect(document.activeView).toBe('back')

    document = createNewDesign('pants')
    document = setActivePanel(document, 'right_leg')
    expect(document.activePanelId).toBe('right_leg')
    expect(getGarment(document.garmentType).defaultPanelId('front')).toBe('left_leg')
  })

  it('keeps artwork isolated to its panel and zone', () => {
    let document = createNewDesign('tshirt')
    const front = createTextObject(document, 'front')
    const back = createShapeObject(document, 'back')
    document = addDesignObject(addDesignObject(document, front), back)

    expect(getDesignObjectsInZone(document, 'front').map((object) => object.id)).toEqual([front.id])
    expect(getDesignObjectsInZone(document, 'back').map((object) => object.id)).toEqual([back.id])
    expect(front.anchor.panelId ?? 'front_body').toBeTruthy()
  })

  it('stores panel-relative coordinates independently of zoom and screen pixels', () => {
    const document = createNewDesign('tshirt')
    const bounds = getArtworkPanelBounds(document, 'front_body')!
    const created = attachObjectToPanel(
      document,
      createTextObject(document, 'front'),
      'front_body',
      'visual',
    )
    const object = {
      ...created,
      x: bounds.localWidth * 0.2,
      y: bounds.localHeight * 0.3,
      width: bounds.localWidth * 0.25,
      height: bounds.localHeight * 0.1,
    }
    const relative = objectRelativeBox(document, object)
    expect(relative.x).toBeCloseTo(0.2)
    expect(relative.y).toBeCloseTo(0.3)
    expect(relative.width).toBeCloseTo(0.25)
    expect(relative.height).toBeCloseTo(0.1)

    const restored = localBoxFromRelative(document, 'front_body', relative)
    expect(restored.x).toBeCloseTo(object.x)
    expect(restored.y).toBeCloseTo(object.y)

    const designArea = panelDesignBounds(getGarment('tshirt').panels.find((panel) => panel.id === 'front_body')!)
    expect(designArea.x).toBeGreaterThanOrEqual(0)
    expect(designArea.width).toBeLessThanOrEqual(100)
  })

  it('does not confirm an empty garment switch and does not remap artwork', () => {
    const empty = createNewDesign('tshirt')
    expect(documentHasArtwork(empty)).toBe(false)
    expect(garmentSwitchRequiresConfirm(empty, 'hoodie')).toBe(false)

    const switched = switchGarment(empty, 'hoodie')
    expect(switched.id).toBe(empty.id)
    expect(switched.garmentType).toBe('hoodie')
    expect(switched.designObjects).toEqual([])
  })

  it('requires confirmation when artwork cannot silently follow a new garment', () => {
    let document = createNewDesign('tshirt')
    const logo = attachObjectToPanel(document, createTextObject(document, 'front'), 'front_body', 'visual')
    document = addDesignObject(document, logo)
    const sleeve = createShapeObject(document, 'left-sleeve')
    document = addDesignObject(document, sleeve)

    expect(garmentSwitchRequiresConfirm(document, 'hoodie')).toBe(true)
    expect(canSafelyTransferArtwork(document, 'hoodie')).toBe(true)
    expect(canSafelyTransferArtwork(document, 'sweatshirt')).toBe(true)
    expect(canSafelyTransferArtwork(document, 'pants')).toBe(false)
    expect(canSafelyTransferArtwork(document, 'jacket')).toBe(false)
  })

  it('keeps artwork when switching garments and restores it on T-shirt', () => {
    let document = createNewDesign('tshirt')
    const front = attachObjectToPanel(document, createTextObject(document, 'front'), 'front_body', 'visual')
    const back = createShapeObject(document, 'back')
    document = addDesignObject(addDesignObject(document, front), back)
    const snapshot = structuredClone(document.designObjects)

    document = switchGarment(document, 'hoodie')
    expect(document.garmentType).toBe('hoodie')
    expect(document.designObjects).toEqual(snapshot)
    expect(getDesignObjectsInZone(document, 'front').map((object) => object.id)).toEqual([front.id])

    document = switchGarment(document, 'pants')
    expect(document.garmentType).toBe('pants')
    expect(document.designObjects).toEqual(snapshot)
    expect(document.designObjects?.[0]).toMatchObject({
      id: front.id,
      x: front.x,
      y: front.y,
      width: front.width,
      height: front.height,
      zone: 'front',
      anchor: front.anchor,
    })

    document = switchGarment(document, 'tshirt')
    expect(document.garmentType).toBe('tshirt')
    expect(document.designObjects).toEqual(snapshot)
    expect(getDesignObjectsInZone(document, 'front').map((object) => object.id)).toEqual([front.id])
    expect(getDesignObjectsInZone(document, 'back').map((object) => object.id)).toEqual([back.id])
  })

  it('defaults older documents without a garment type to the T-shirt definition', () => {
    const current = createNewDesign('tshirt')
    const { garmentType: _ignored, ...legacy } = current
    const normalized = normalizeDocument(legacy as typeof current)
    expect(normalized.garmentType).toBe('tshirt')
    expect(getGarment(normalized.garmentType).panels.map((panel) => panel.id)).toEqual(
      current.panels.map((panel) => panel.id),
    )

    const unknown = normalizeDocument({ ...current, garmentType: 'future-anorak' })
    expect(unknown.garmentType).toBe('tshirt')
    expect(unknown.designObjects).toEqual(current.designObjects)
  })

  it('renders each catalog garment from its definition without editor state', () => {
    for (const garment of AVAILABLE_GARMENTS) {
      const node = garment.render({
        viewId: garment.preview?.viewId ?? 'front',
        bodyColor: garment.defaults.bodyColor,
      })
      expect(node).toBeTruthy()
      expect(garment.viewBox).toEqual({ width: 560, height: 640 })
    }

    const tshirtFront = tshirtGarment.panels.find((panel) => panel.id === 'front_body')!
    expect(tshirtFront.frame).toEqual({ x: 194, y: 192, width: 172, height: 300 })
    expect(tshirtFront.local).toEqual({ width: 200, height: 280 })
  })
})
