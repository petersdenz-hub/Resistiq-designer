import { AVAILABLE_GARMENTS, studioGarmentGroupId, studioGarmentGroups } from '@/garments'
import {
  DEFAULT_OPEN_SECTIONS,
  STUDIO_SECTIONS,
  saveStatusLabel,
  studioLeftOverlay,
  studioRightOverlay,
  studioViewport,
  toggleStudioSections,
} from '@/studio/editorChrome'
import { describe, expect, it } from 'vitest'

describe('Phase 14 studio UX', () => {
  it('groups the existing catalog as Tops, Bottoms, and Headwear', () => {
    const groups = studioGarmentGroups()
    expect(groups.map((group) => group.id)).toEqual(['tops', 'bottoms', 'headwear'])
    expect(groups.find((group) => group.id === 'tops')?.garments.map((garment) => garment.id)).toEqual([
      'tshirt',
      'hoodie',
      'sweatshirt',
      'jacket',
    ])
    expect(groups.find((group) => group.id === 'bottoms')?.garments.map((garment) => garment.id)).toEqual([
      'pants',
      'shorts',
    ])
    expect(groups.find((group) => group.id === 'headwear')?.garments.map((garment) => garment.id)).toEqual([
      'cap',
      'beanie',
    ])
    expect(groups.flatMap((group) => group.garments).map((garment) => garment.id)).toEqual(
      AVAILABLE_GARMENTS.map((garment) => garment.id),
    )
  })

  it('places outerwear with tops in the studio chooser only', () => {
    expect(studioGarmentGroupId('outerwear')).toBe('tops')
    expect(studioGarmentGroupId('tops')).toBe('tops')
    expect(studioGarmentGroupId('accessories')).toBeNull()
  })

  it('keeps the left tool jump list in garment / design / layers / canvas order', () => {
    expect(STUDIO_SECTIONS.map((section) => section.label)).toEqual([
      'Garment',
      'Design',
      'Layers',
      'Canvas',
    ])
  })

  it('opens garment and design first and keeps at most two sections expanded', () => {
    expect(DEFAULT_OPEN_SECTIONS).toEqual(['design', 'layers'])
    expect(toggleStudioSections(['design', 'layers'], 'garment')).toEqual(['layers', 'garment'])
    expect(toggleStudioSections(['design', 'layers'], 'layers')).toEqual(['design'])
  })

  it('labels save state for Saved, Unsaved changes, and Saving', () => {
    expect(saveStatusLabel(false)).toBe('saved')
    expect(saveStatusLabel(true)).toBe('unsaved')
    expect(saveStatusLabel(true, true)).toBe('saving')
  })

  it('treats tablet as a docked left column and a properties drawer', () => {
    expect(studioViewport(1440)).toBe('desktop')
    expect(studioViewport(1024)).toBe('tablet')
    expect(studioViewport(720)).toBe('mobile')
    expect(studioLeftOverlay('tablet')).toBe(false)
    expect(studioRightOverlay('tablet')).toBe(true)
    expect(studioLeftOverlay('mobile')).toBe(true)
    expect(studioRightOverlay('desktop')).toBe(false)
  })
})
