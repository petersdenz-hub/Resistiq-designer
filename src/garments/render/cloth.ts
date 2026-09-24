import { shadeHex } from '@/ui/color'

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

export function clothShades(bodyColor: string) {
  const dark = isDarkHex(bodyColor)
  return {
    cloth: bodyColor,
    clothDeep: shadeHex(bodyColor, -0.1),
    clothDark: shadeHex(bodyColor, -0.18),
    stitch: dark ? shadeHex(bodyColor, 0.28) : shadeHex(bodyColor, -0.28),
    highlight: shadeHex(bodyColor, dark ? 0.2 : 0.12),
    rib: shadeHex(bodyColor, dark ? 0.1 : -0.07),
    tape: dark ? shadeHex(bodyColor, 0.16) : shadeHex(bodyColor, -0.22),
    metal: dark ? '#d8d2c6' : shadeHex(bodyColor, -0.45),
    detail: dark ? shadeHex(bodyColor, 0.22) : shadeHex(bodyColor, -0.2),
  }
}

export function clothFor(
  bodyColor: string,
  panelColors: Record<string, string> | undefined,
  panelId: string,
) {
  return clothShades(panelColors?.[panelId] ?? bodyColor)
}

export function resolvedPanelColor(
  bodyColor: string,
  panelColors: Record<string, string> | undefined,
  panelId: string,
) {
  return panelColors?.[panelId] ?? bodyColor
}
