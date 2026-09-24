interface GuideBox {
  x: number
  y: number
  width: number
  height: number
}

const THRESHOLD = 6

export function AlignmentGuides({
  moving,
  others,
  canvas,
  zoom,
}: {
  moving: GuideBox | null
  others: GuideBox[]
  canvas: { width: number; height: number }
  zoom: number
}) {
  if (!moving) {
    return null
  }

  const edges = {
    left: moving.x,
    right: moving.x + moving.width,
    top: moving.y,
    bottom: moving.y + moving.height,
    cx: moving.x + moving.width / 2,
    cy: moving.y + moving.height / 2,
  }

  const targets = [
    ...others.flatMap((box) => [
      box.x,
      box.x + box.width,
      box.x + box.width / 2,
    ]),
    canvas.width / 2,
  ]
  const yTargets = [
    ...others.flatMap((box) => [
      box.y,
      box.y + box.height,
      box.y + box.height / 2,
    ]),
    canvas.height / 2,
  ]

  const lines = []
  for (const value of [edges.left, edges.right, edges.cx]) {
    if (targets.some((target) => Math.abs(target - value) <= THRESHOLD)) {
      lines.push(
        <line
          key={`v-${value}`}
          x1={value}
          y1={0}
          x2={value}
          y2={canvas.height}
          stroke="#c9a36a"
          strokeWidth={1 / zoom}
          strokeDasharray={`${4 / zoom} ${3 / zoom}`}
          opacity="0.7"
        />,
      )
    }
  }
  for (const value of [edges.top, edges.bottom, edges.cy]) {
    if (yTargets.some((target) => Math.abs(target - value) <= THRESHOLD)) {
      lines.push(
        <line
          key={`h-${value}`}
          x1={0}
          y1={value}
          x2={canvas.width}
          y2={value}
          stroke="#c9a36a"
          strokeWidth={1 / zoom}
          strokeDasharray={`${4 / zoom} ${3 / zoom}`}
          opacity="0.7"
        />,
      )
    }
  }

  if (lines.length === 0) {
    return null
  }
  return (
    <g data-alignment-guides="true" pointerEvents="none">
      {lines}
    </g>
  )
}
