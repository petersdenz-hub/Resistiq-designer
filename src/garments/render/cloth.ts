import { shadeHex } from '@/ui/color'

export interface ClothShades {
  cloth: string
  clothDeep: string
  clothDark: string
  stitch: string
  highlight: string
  rib: string
  tape: string
  metal: string
  detail: string
}

function isDarkHex(hex: string) {
  const value = hex.replace('#', '')
  if (value.length !== 6) {
    return false
  }
  const red = Number.parseInt(value.slice(0, 2), 16)
  const green = Number.parseInt(value.slice(2, 4), 16)
  const blue = Number.parseInt(value.slice(4, 6), 16)
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue < 138
}

/**
 * Region color is the base. Highlights, seams, and rib stay derived so a
 * panel never collapses to a single flat fill.
 */
export function clothShades(bodyColor: string): ClothShades {
  const dark = isDarkHex(bodyColor)
  return {
    cloth: bodyColor,
    clothDeep: shadeHex(bodyColor, dark ? -0.14 : -0.16),
    clothDark: shadeHex(bodyColor, dark ? -0.22 : -0.26),
    stitch: dark ? shadeHex(bodyColor, 0.34) : shadeHex(bodyColor, -0.34),
    highlight: shadeHex(bodyColor, dark ? 0.28 : 0.18),
    rib: shadeHex(bodyColor, dark ? 0.12 : -0.1),
    tape: dark ? shadeHex(bodyColor, 0.18) : shadeHex(bodyColor, -0.24),
    metal: dark ? '#d8d2c6' : shadeHex(bodyColor, -0.48),
    detail: dark ? shadeHex(bodyColor, 0.16) : shadeHex(bodyColor, -0.14),
  }
}

export function clothFor(
  bodyColor: string,
  panelColors: Record<string, string> | undefined,
  panelId: string,
): ClothShades {
  return clothShades(panelColors?.[panelId] ?? bodyColor)
}

export function resolvedPanelColor(
  bodyColor: string,
  panelColors: Record<string, string> | undefined,
  panelId: string,
) {
  return panelColors?.[panelId] ?? bodyColor
}

export function stitchContrast(color: ClothShades): number {
  const stitch = color.stitch.replace('#', '')
  const cloth = color.cloth.replace('#', '')
  if (stitch.length !== 6 || cloth.length !== 6) {
    return 0
  }
  const channel = (hex: string, start: number) => Number.parseInt(hex.slice(start, start + 2), 16)
  const delta =
    Math.abs(channel(stitch, 0) - channel(cloth, 0)) +
    Math.abs(channel(stitch, 2) - channel(cloth, 2)) +
    Math.abs(channel(stitch, 4) - channel(cloth, 4))
  return delta
}
