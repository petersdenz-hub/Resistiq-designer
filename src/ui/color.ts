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
