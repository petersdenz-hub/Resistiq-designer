export type ToolbarMode = 'empty' | 'single' | 'multi'

export function toolbarMode(selectedCount: number): ToolbarMode {
  if (selectedCount <= 0) {
    return 'empty'
  }
  return selectedCount === 1 ? 'single' : 'multi'
}

export function isLogoFileName(fileName: string): boolean {
  return /logo/i.test(fileName)
}

export function fitCanvasZoom(
  viewBox: { width: number; height: number },
  area: { width: number; height: number },
  padding = 56,
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
