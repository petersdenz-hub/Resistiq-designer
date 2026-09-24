export const TEXT_ALIGNS = ['left', 'center', 'right'] as const
export type TextAlign = (typeof TEXT_ALIGNS)[number]

export const FONT_WEIGHTS = [400, 500, 700] as const
export type FontWeight = (typeof FONT_WEIGHTS)[number]

export const TEXT_FONT_FAMILIES = [
  { id: 'IBM Plex Sans, sans-serif', label: 'Plex Sans' },
  { id: 'Arial, Helvetica, sans-serif', label: 'Arial' },
  { id: 'Georgia, serif', label: 'Georgia' },
  { id: 'Impact, Haettenschweiler, sans-serif', label: 'Impact' },
  { id: '"Times New Roman", Times, serif', label: 'Times' },
  { id: '"Courier New", Courier, monospace', label: 'Courier' },
] as const

export const DEFAULT_TEXT_FONT = TEXT_FONT_FAMILIES[0].id
