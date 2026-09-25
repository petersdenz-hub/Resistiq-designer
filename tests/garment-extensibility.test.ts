import {
  addDesignObject,
  createNewDesign,
  createTextObject,
  objectClipPaths,
  switchGarment,
  zonesForGarment,
} from '@/design'
import { defaultConstructionFor } from '@/garments/constructionDefaults'
import { constructionControlsFor } from '@/garments/constructionOptions'
import {
  AVAILABLE_GARMENTS,
  colorRegionsFor,
  garmentCapabilities,
  garmentCatalogGroups,
  getGarment,
  hasGarment,
  inferPlacementZone,
  inferSupportedDesignZones,
  PLANNED_GARMENT_LABELS,
  registerGarment,
  resolveGarmentType,
  unregisterGarment,
} from '@/garments'
import type { GarmentDefinition } from '@/garments'
import { afterEach, describe, expect, it } from 'vitest'

const TEST_CAP_ID = '__test_cap'
const CROWN_PATH = 'M100 40 H300 V160 H100 Z'

function testCapDefinition(): GarmentDefinition {
  return {
    id: TEST_CAP_ID,
    name: 'Test cap',
    label: 'Test cap',
    category: 'headwear',
    views: [
      { id: 'front', label: 'Front' },
      { id: 'back', label: 'Back' },
    ],
    viewBox: { width: 400, height: 280 },
    panels: [
      {
        id: 'crown',
        label: 'Crown',
        viewId: 'front',
        type: 'crown',
        printable: true,
        local: { width: 200, height: 120 },
        frame: { x: 100, y: 40, width: 200, height: 120 },
        silhouette: CROWN_PATH,
      },
      {
        id: 'brim',
        label: 'Brim',
        viewId: 'front',
        type: 'brim',
        printable: false,
        local: { width: 220, height: 40 },
        frame: { x: 90, y: 150, width: 220, height: 40 },
        silhouette: 'M90 150 H310 V190 H90 Z',
      },
      {
        id: 'band',
        label: 'Band',
        viewId: 'front',
        type: 'band',
        printable: false,
        local: { width: 180, height: 24 },
        frame: { x: 110, y: 130, width: 180, height: 24 },
      },
    ],
    regions: [
      { id: 'crown', label: 'Crown', panelIds: ['crown'] },
      { id: 'brim', label: 'Brim', panelIds: ['brim'] },
      { id: 'band', label: 'Band', panelIds: ['band'] },
    ],
    supportedDesignZones: ['crown', 'front'],
    preview: { viewId: 'front' },
    defaults: { bodyColor: '#1a1a1a' },
    capabilities: garmentCapabilities({ printAreas: true, frontBack: true }),
    defaultPanelId: () => 'crown',
    render: () => null,
  }
}

describe('future garment definitions stay registry-driven', () => {
  afterEach(() => {
    unregisterGarment(TEST_CAP_ID)
  })

  it('lists planned categories without shipping those garments', () => {
    expect(PLANNED_GARMENT_LABELS).toEqual(['Gloves', 'Socks', 'Bag', 'Backpack'])
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
    expect(garmentCatalogGroups().map((group) => group.category)).toEqual([
      'tops',
      'outerwear',
      'bottoms',
      'headwear',
    ])
  })

  it('adds a new garment from a definition without editor or renderer changes', () => {
    const definition = testCapDefinition()
    registerGarment(definition)

    expect(hasGarment(TEST_CAP_ID)).toBe(true)
    expect(getGarment(TEST_CAP_ID).id).toBe(TEST_CAP_ID)
    expect(AVAILABLE_GARMENTS.some((garment) => garment.id === TEST_CAP_ID)).toBe(true)
    expect(garmentCatalogGroups().some((group) => group.category === 'headwear')).toBe(true)

    expect(colorRegionsFor(TEST_CAP_ID).map((region) => region.id)).toEqual(['crown', 'brim', 'band'])
    expect(zonesForGarment(TEST_CAP_ID)).toEqual(['crown', 'front'])
    expect(inferPlacementZone(getGarment(TEST_CAP_ID).panels[0])).toBe('crown')
    expect(inferSupportedDesignZones(getGarment(TEST_CAP_ID))).toEqual(['crown', 'front'])

    const document = createNewDesign(TEST_CAP_ID)
    expect(document.garmentType).toBe(TEST_CAP_ID)
    expect(document.activePanelId).toBe('crown')
    expect(document.panels.map((panel) => panel.id)).toEqual(['crown', 'brim', 'band'])
    expect(document.activeZone).toBe('crown')

    const artwork = createTextObject(document, 'crown')
    const withArt = addDesignObject(document, artwork)
    expect(objectClipPaths(withArt, artwork)).toEqual([CROWN_PATH])

    const switched = switchGarment(createNewDesign('tshirt'), TEST_CAP_ID)
    expect(switched.garmentType).toBe(TEST_CAP_ID)
    expect(switched.activePanelId).toBe('crown')
    expect(switched.panels.some((panel) => panel.type === 'crown')).toBe(true)

    expect(defaultConstructionFor(TEST_CAP_ID)).toEqual({})
    expect(constructionControlsFor(TEST_CAP_ID)).toEqual([])

    expect(unregisterGarment(TEST_CAP_ID)).toBe(true)
    expect(hasGarment(TEST_CAP_ID)).toBe(false)
    expect(resolveGarmentType(TEST_CAP_ID)).toBe('tshirt')
    expect(AVAILABLE_GARMENTS.map((garment) => garment.id)).not.toContain(TEST_CAP_ID)
  })

  it('derives zones and regions from panels when a definition omits them', () => {
    const { regions: _regions, supportedDesignZones: _zones, ...bare } = testCapDefinition()
    registerGarment(bare)

    expect(colorRegionsFor(TEST_CAP_ID).map((region) => region.id)).toEqual(['crown', 'brim', 'band'])
    expect(inferSupportedDesignZones(getGarment(TEST_CAP_ID))).toEqual(['crown', 'brim', 'band'])
  })
})
