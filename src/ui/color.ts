function clampChannel(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)))
}

export function shadeHex(hex: string, amount: number): string {
  const normalized = hex.replace('#', '')
  if (normalized.length !== 6) {
    return hex
  }

  const red = Number.parseInt(normalized.slice(0, 2), 16)
  const green = Number.parseInt(normalized.slice(2, 4), 16)
  const blue = Number.parseInt(normalized.slice(4, 6), 16)

  const next = [red, green, blue]
    .map((channel) => clampChannel(channel + amount * 255))
    .map((channel) => channel.toString(16).padStart(2, '0'))
    .join('')

  return `#${next}`
}

export function normalizeHex(value: string): string | null {
  const trimmed = value.trim()
  const withHash = trimmed.startsWith('#') ? trimmed : `#${trimmed}`

  if (/^#[0-9a-fA-F]{6}$/.test(withHash)) {
    return `#${withHash.slice(1).toLowerCase()}`
  }

  if (/^#[0-9a-fA-F]{3}$/.test(withHash)) {
    const [, red, green, blue] = withHash
    return `#${red}${red}${green}${green}${blue}${blue}`.toLowerCase()
  }

  return null
}

export const GARMENT_COLOR_PRESETS = [
  { value: '#ffffff', label: 'White' },
  { value: '#e8e4dc', label: 'Natural' },
  { value: '#d4d4d8', label: 'Light grey' },
  { value: '#1a1a1a', label: 'Black' },
  { value: '#1e2a4a', label: 'Navy' },
  { value: '#6b7280', label: 'Heather' },
  { value: '#7c2d12', label: 'Burgundy' },
  { value: '#3f4f2a', label: 'Olive' },
] as const
