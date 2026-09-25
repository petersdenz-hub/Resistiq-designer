export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

export interface Point {
  x: number
  y: number
}

export type ResizeHandle = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw'

export const RESIZE_HANDLES: ResizeHandle[] = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw']

const OPPOSITE_HANDLE: Record<ResizeHandle, ResizeHandle> = {
  n: 's',
  ne: 'sw',
  e: 'w',
  se: 'nw',
  s: 'n',
  sw: 'ne',
  w: 'e',
  nw: 'se',
}

const MIN_SIZE = 16

export function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}

export function getCenter(rect: Rect): Point {
  return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }
}

export function rotatePoint(point: Point, origin: Point, degrees: number): Point {
  const radians = toRadians(degrees)
  const cos = Math.cos(radians)
  const sin = Math.sin(radians)
  const dx = point.x - origin.x
  const dy = point.y - origin.y
  return {
    x: origin.x + dx * cos - dy * sin,
    y: origin.y + dx * sin + dy * cos,
  }
}

export function unrotatePoint(point: Point, origin: Point, degrees: number): Point {
  return rotatePoint(point, origin, -degrees)
}

export function handleLocalPoint(rect: Rect, handle: ResizeHandle): Point {
  switch (handle) {
    case 'n':
      return { x: rect.x + rect.width / 2, y: rect.y }
    case 'ne':
      return { x: rect.x + rect.width, y: rect.y }
    case 'e':
      return { x: rect.x + rect.width, y: rect.y + rect.height / 2 }
    case 'se':
      return { x: rect.x + rect.width, y: rect.y + rect.height }
    case 's':
      return { x: rect.x + rect.width / 2, y: rect.y + rect.height }
    case 'sw':
      return { x: rect.x, y: rect.y + rect.height }
    case 'w':
      return { x: rect.x, y: rect.y + rect.height / 2 }
    case 'nw':
      return { x: rect.x, y: rect.y }
  }
}

export function handleWorldPoint(
  rect: Rect,
  rotation: number,
  handle: ResizeHandle,
): Point {
  return rotatePoint(handleLocalPoint(rect, handle), getCenter(rect), rotation)
}

function applyUnrotatedResize(rect: Rect, handle: ResizeHandle, localPointer: Point): Rect {
  let { x, y, width, height } = rect
  const right = x + width
  const bottom = y + height

  if (handle.includes('e')) {
    width = Math.max(MIN_SIZE, localPointer.x - x)
  }
  if (handle.includes('s')) {
    height = Math.max(MIN_SIZE, localPointer.y - y)
  }
  if (handle.includes('w')) {
    const nextX = Math.min(localPointer.x, right - MIN_SIZE)
    width = right - nextX
    x = nextX
  }
  if (handle.includes('n')) {
    const nextY = Math.min(localPointer.y, bottom - MIN_SIZE)
    height = bottom - nextY
    y = nextY
  }

  return { x, y, width, height }
}

export function resizeRect(
  rect: Rect,
  rotation: number,
  handle: ResizeHandle,
  worldPointer: Point,
): Rect {
  const center = getCenter(rect)
  const localPointer = unrotatePoint(worldPointer, center, rotation)
  const next = applyUnrotatedResize(rect, handle, localPointer)

  const opposite = OPPOSITE_HANDLE[handle]
  const before = handleWorldPoint(rect, rotation, opposite)
  const after = handleWorldPoint(next, rotation, opposite)

  return {
    ...next,
    x: next.x + (before.x - after.x),
    y: next.y + (before.y - after.y),
  }
}

export function resizeRectKeepAspect(
  rect: Rect,
  rotation: number,
  handle: ResizeHandle,
  worldPointer: Point,
  aspect: number,
): Rect {
  const unconstrained = resizeRect(rect, rotation, handle, worldPointer)
  const safeAspect = Math.max(aspect, 0.05)
  const horizontal = handle.includes('e') || handle.includes('w')
  const vertical = handle.includes('n') || handle.includes('s')

  let width = unconstrained.width
  let height = unconstrained.height

  if (horizontal && !vertical) {
    height = width / safeAspect
  } else if (vertical && !horizontal) {
    width = height * safeAspect
  } else {
    const widthDelta = Math.abs(width - rect.width) / Math.max(rect.width, 1)
    const heightDelta = Math.abs(height - rect.height) / Math.max(rect.height, 1)
    if (widthDelta >= heightDelta) {
      height = width / safeAspect
    } else {
      width = height * safeAspect
    }
  }

  width = Math.max(MIN_SIZE, width)
  height = Math.max(MIN_SIZE, width / safeAspect)
  width = height * safeAspect

  let x = unconstrained.x
  let y = unconstrained.y
  if (handle.includes('e')) {
    x = unconstrained.x
  } else if (handle.includes('w')) {
    x = unconstrained.x + unconstrained.width - width
  } else {
    x = unconstrained.x + (unconstrained.width - width) / 2
  }
  if (handle.includes('s')) {
    y = unconstrained.y
  } else if (handle.includes('n')) {
    y = unconstrained.y + unconstrained.height - height
  } else {
    y = unconstrained.y + (unconstrained.height - height) / 2
  }

  const next = { x, y, width, height }
  const opposite = OPPOSITE_HANDLE[handle]
  const before = handleWorldPoint(rect, rotation, opposite)
  const after = handleWorldPoint(next, rotation, opposite)
  return {
    ...next,
    x: next.x + (before.x - after.x),
    y: next.y + (before.y - after.y),
  }
}

export function rotationFromPointer(center: Point, worldPointer: Point): number {
  const angle = (Math.atan2(worldPointer.y - center.y, worldPointer.x - center.x) * 180) / Math.PI
  return angle + 90
}

export function clientToSvgPoint(
  svg: SVGSVGElement,
  clientX: number,
  clientY: number,
): Point {
  const point = svg.createSVGPoint()
  point.x = clientX
  point.y = clientY
  const matrix = svg.getScreenCTM()
  if (!matrix) {
    return { x: clientX, y: clientY }
  }
  const mapped = point.matrixTransform(matrix.inverse())
  return { x: mapped.x, y: mapped.y }
}

export function snapAngle(degrees: number, increment = 15): number {
  return Math.round(degrees / increment) * increment
}
