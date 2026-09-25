import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import {
  addDesignObject,
  attachObjectToPanel,
  createTextObject,
  defaultPanelIdForZone,
  getArtworkPanelBounds,
  objectRelativeBox,
  zonesForGarment,
} from '@/design'
import { createNewDesign } from '@/design/createDesign'
import { switchGarment } from '@/design/garmentSwitch'
import { normalizeDocument } from '@/persistence/validateDocument'
import {
  AVAILABLE_GARMENTS,
  GarmentRenderer,
  getGarment,
  isPrintablePanel,
  panelDesignBounds,
  panelDesignZones,
  tshirtGarment,
} from '@/garments'
import { describe, expect, it } from 'vitest'

const CATALOG_IDS = ['tshirt', 'hoodie', 'sweatshirt', 'jacket', 'pants', 'shorts', 'cap'] as const

describe('Phase 7D real garment templates', () => {
  it('loads every catalog garment with valid panels', () => {
    expect(AVAILABLE_GARMENTS.map((garment) => garment.id)).toEqual([...CATALOG_IDS])
    for (const id of CATALOG_IDS) {
      const garment = getGarment(id)
      expect(garment.id).toBe(id)
      expect(garment.panels.length).toBeGreaterThan(2)
      expect(garment.views.map((view) => view.id)).toEqual(['front', 'back'])
      expect(new Set(garment.panels.map((panel) => panel.id)).size).toBe(garment.panels.length)
      expect(garment.panels.every((panel) => panel.local.width > 0 && panel.frame.width > 0)).toBe(true)
    }
  })

  it('gives every printable panel valid percentage designBounds', () => {
    for (const garment of AVAILABLE_GARMENTS) {
      const printable = garment.panels.filter(isPrintablePanel)
      expect(printable.length).toBeGreaterThan(0)
      for (const panel of printable) {
        const bounds = panelDesignBounds(panel)
        expect(bounds.width).toBeGreaterThan(0)
        expect(bounds.height).toBeGreaterThan(0)
        expect(bounds.x).toBeGreaterThanOrEqual(0)
        expect(bounds.y).toBeGreaterThanOrEqual(0)
        expect(bounds.x + bounds.width).toBeLessThanOrEqual(100.01)
        expect(bounds.y + bounds.height).toBeLessThanOrEqual(100.01)
        expect(panelDesignZones(panel).length).toBeGreaterThan(0)
      }
    }
  })

  it('resolves every supported design zone onto a garment panel', () => {
    for (const id of CATALOG_IDS) {
      const document = createNewDesign(id)
      const zones = zonesForGarment(id)
      expect(zones.length).toBeGreaterThan(1)
      expect(getGarment(id).supportedDesignZones).toEqual(zones)
      for (const zone of zones) {
        expect(defaultPanelIdForZone(document, zone)).toBeTruthy()
      }
    }
  })

  it('keeps designObjects intact across the full six-garment switch cycle', () => {
    let document = createNewDesign('tshirt')
    const object = attachObjectToPanel(document, createTextObject(document, 'front'), 'front_body', 'visual')
    document = addDesignObject(document, object)
    const snapshot = structuredClone(document.designObjects)

    for (const next of ['hoodie', 'sweatshirt', 'jacket', 'pants', 'shorts', 'tshirt'] as const) {
      document = switchGarment(document, next)
      expect(document.garmentType).toBe(next)
      expect(document.designObjects).toEqual(snapshot)
      expect(document.designObjects?.[0]).toMatchObject({
        id: object.id,
        x: object.x,
        y: object.y,
        width: object.width,
        height: object.height,
        zone: object.zone,
        anchor: object.anchor,
      })
    }
  })

  it('keeps existing T-shirt geometry and older documents compatible', () => {
    const front = tshirtGarment.panels.find((panel) => panel.id === 'front_body')!
    expect(front.frame).toEqual({ x: 194, y: 192, width: 172, height: 300 })
    expect(front.local).toEqual({ width: 200, height: 280 })
    expect(front.safeArea).toMatchObject({ id: 'chest_print', x: 22, y: 28, width: 156, height: 132 })

    const current = createNewDesign('tshirt')
    const { garmentType: _ignored, ...legacy } = current
    const normalized = normalizeDocument(legacy as typeof current)
    expect(normalized.garmentType).toBe('tshirt')
    expect(getGarment(normalized.garmentType).panels.map((panel) => panel.id)).toEqual(
      current.panels.map((panel) => panel.id),
    )
  })

  it('keeps artwork coordinates panel-relative after template updates', () => {
    const document = createNewDesign('tshirt')
    const bounds = getArtworkPanelBounds(document, 'front_body')!
    const object = {
      ...attachObjectToPanel(document, createTextObject(document, 'front'), 'front_body', 'visual'),
      x: bounds.localWidth * 0.25,
      y: bounds.localHeight * 0.4,
      width: 30,
      height: 16,
    }
    const relative = objectRelativeBox(document, object)
    expect(relative.x).toBeCloseTo(0.25)
    expect(relative.y).toBeCloseTo(0.4)
    expect(object.x).toBeLessThan(bounds.localWidth)
  })

  it('renders every garment template through GarmentRenderer', () => {
    for (const garment of AVAILABLE_GARMENTS) {
      for (const view of garment.views) {
        const html = renderToStaticMarkup(
          createElement(
            'svg',
            null,
            createElement(GarmentRenderer, {
              garmentType: garment.id,
              viewId: view.id,
              panelId: garment.defaultPanelId(view.id),
              bodyColor: garment.defaults.bodyColor,
            }),
          ),
        )
        expect(html).toContain(`data-garment-type="${garment.id}"`)
        expect(html).toContain(`data-garment-view="${view.id}"`)
        expect(html).toContain(`data-garment-template="${garment.id}"`)
      }
    }
  })
})
