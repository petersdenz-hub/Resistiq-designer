export function CanvasGrid({
  width,
  height,
  size,
  zoom,
  visible,
}: {
  width: number
  height: number
  size: number
  zoom: number
  visible: boolean
}) {
  if (!visible || size <= 0) {
    return null
  }

  const stroke = 1 / zoom
  const major = size * 4

  return (
    <g data-canvas-grid="true" pointerEvents="none">
      <defs>
        <pattern
          id="design-grid-minor"
          width={size}
          height={size}
          patternUnits="userSpaceOnUse"
        >
          <path
            d={`M ${size} 0 L 0 0 0 ${size}`}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={stroke}
          />
        </pattern>
        <pattern
          id="design-grid-major"
          width={major}
          height={major}
          patternUnits="userSpaceOnUse"
        >
          <rect width={major} height={major} fill="url(#design-grid-minor)" />
          <path
            d={`M ${major} 0 L 0 0 0 ${major}`}
            fill="none"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth={stroke}
          />
        </pattern>
      </defs>
      <rect width={width} height={height} fill="url(#design-grid-major)" />
    </g>
  )
}
