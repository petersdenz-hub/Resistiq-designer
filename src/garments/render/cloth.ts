import { shadeHex } from '@/ui/color'

export function clothShades(bodyColor: string) {
  return {
    cloth: bodyColor,
    clothDeep: shadeHex(bodyColor, -0.1),
    clothDark: shadeHex(bodyColor, -0.18),
    stitch: shadeHex(bodyColor, -0.28),
    highlight: shadeHex(bodyColor, 0.12),
    rib: shadeHex(bodyColor, -0.07),
    tape: shadeHex(bodyColor, -0.22),
    metal: shadeHex(bodyColor, -0.45),
  }
}
