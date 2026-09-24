const RULER = 22

export function CanvasRulers({
  width,
  height,
  zoom,
  gridSize,
}: {
  width: number
  height: number
  zoom: number
  gridSize: number
}) {
  const ticks = []
  const step = Math.max(gridSize, 8)
  const labelEvery = step * 4

  for (let x = 0; x <= width; x += step) {
    const major = x % labelEvery === 0
    ticks.push(
      <line
        key={`x-${x}`}
        x1={RULER + x * zoom}
        y1={major ? 4 : 12}
        x2={RULER + x * zoom}
        y2={RULER}
        stroke="rgba(238,240,244,0.35)"
        strokeWidth="1"
      />,
    )
    if (major) {
      ticks.push(
        <text
          key={`xl-${x}`}
          x={RULER + x * zoom + 3}
          y={11}
          fill="rgba(238,240,244,0.55)"
          fontSize="9"
        >
          {x}
        </text>,
      )
    }
  }

  for (let y = 0; y <= height; y += step) {
    const major = y % labelEvery === 0
    ticks.push(
      <line
        key={`y-${y}`}
        x1={major ? 4 : 12}
        y1={RULER + y * zoom}
        x2={RULER}
        y2={RULER + y * zoom}
        stroke="rgba(238,240,244,0.35)"
        strokeWidth="1"
      />,
    )
    if (major && y > 0) {
      ticks.push(
        <text
          key={`yl-${y}`}
          x={3}
          y={RULER + y * zoom + 10}
          fill="rgba(238,240,244,0.55)"
          fontSize="9"
        >
          {y}
        </text>,
      )
    }
  }

  return (
    <svg
      data-canvas-rulers="true"
      className="pointer-events-none absolute left-0 top-0"
      width={width * zoom + RULER}
      height={height * zoom + RULER}
    >
      <rect width={width * zoom + RULER} height={RULER} fill="#12151c" />
      <rect width={RULER} height={height * zoom + RULER} fill="#12151c" />
      {ticks}
    </svg>
  )
}

export const RULER_SIZE = RULER
