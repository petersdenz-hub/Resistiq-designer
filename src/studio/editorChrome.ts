export type ToolbarMode = 'empty' | 'single' | 'multi'
export type StudioViewport = 'desktop' | 'tablet' | 'mobile'
export type StudioSectionId = 'garment' | 'design' | 'layers' | 'canvas'

export const STUDIO_SECTIONS: { id: StudioSectionId; label: string }[] = [
  { id: 'garment', label: 'Garment' },
  { id: 'design', label: 'Design' },
  { id: 'layers', label: 'Layers' },
  { id: 'canvas', label: 'Canvas' },
]

export function studioViewport(width: number): StudioViewport {
  if (width < 960) {
    return 'mobile'
  }
  if (width < 1180) {
    return 'tablet'
  }
  return 'desktop'
}

export function studioLeftOverlay(viewport: StudioViewport): boolean {
  return viewport === 'mobile'
}

export function studioRightOverlay(viewport: StudioViewport): boolean {
  return viewport !== 'desktop'
}

export function toolbarMode(selectedCount: number): ToolbarMode {
  if (selectedCount <= 0) {
    return 'empty'
  }
  return selectedCount === 1 ? 'single' : 'multi'
}

export function isLogoFileName(fileName: string): boolean {
  return /logo/i.test(fileName)
}

export const DEFAULT_OPEN_SECTIONS: StudioSectionId[] = ['design', 'layers']

export function toggleStudioSections(
  open: readonly StudioSectionId[],
  id: StudioSectionId,
  maxOpen = 2,
): StudioSectionId[] {
  if (open.includes(id)) {
    return open.filter((item) => item !== id)
  }
  return [...open, id].slice(-maxOpen)
}

export function saveStatusLabel(dirty: boolean, saving = false): 'saved' | 'unsaved' | 'saving' {
  if (saving) {
    return 'saving'
  }
  return dirty ? 'unsaved' : 'saved'
}

export const MATERIAL_BLURBS: Record<string, string> = {
  cotton: 'Soft everyday fabric',
  heavy_cotton: 'Thick everyday fabric',
  fleece: 'Soft brushed knit',
  nylon: 'Lightweight performance fabric',
  softshell: 'Weather-resistant outer fabric',
  polyester: 'Smooth everyday fabric',
  denim: 'Durable twill',
}

export function fitCanvasZoom(
  viewBox: { width: number; height: number },
  area: { width: number; height: number },
  padding = 32,
  min = 0.4,
  max = 2.4,
): number {
  const availW = Math.max(96, area.width - padding)
  const availH = Math.max(96, area.height - padding)
  const zoom = Math.min(availW / Math.max(viewBox.width, 1), availH / Math.max(viewBox.height, 1))
  return Math.min(max, Math.max(min, Number(zoom.toFixed(2))))
}

export function objectPropertySections(type: 'text' | 'image' | 'shape' | 'multi' | 'none'): string[] {
  if (type === 'none') {
    return []
  }
  if (type === 'multi') {
    return ['object', 'transform', 'align', 'layer']
  }
  const extra = type === 'text' ? 'text' : type === 'image' ? 'image' : 'shape'
  return ['object', extra, 'transform', 'placement', 'layer']
}
