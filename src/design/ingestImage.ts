export const ACCEPTED_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/svg+xml',
] as const

export const ACCEPTED_IMAGE_ACCEPT =
  'image/png,image/jpeg,image/webp,image/svg+xml,.png,.jpg,.jpeg,.webp,.svg'

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024

export type IngestedImage = {
  name: string
  mimeType: (typeof ACCEPTED_IMAGE_TYPES)[number]
  kind: 'raster' | 'svg'
  dataUrl: string
  width: number
  height: number
}

export function ingestImageError(error: unknown): string {
  return error instanceof Error ? error.message : 'The file could not be read.'
}

export async function ingestImageFile(file: File): Promise<IngestedImage> {
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error('That file is larger than 8 MB.')
  }

  const mimeType = resolveMimeType(file)
  if (!mimeType) {
    throw new Error('Use a PNG, JPG, WEBP, or SVG file.')
  }

  const dataUrl = await readAsDataUrl(file)
  const kind = mimeType === 'image/svg+xml' ? 'svg' : 'raster'
  const measured =
    kind === 'svg' ? parseSvgSize(await file.text()) : null
  const size = measured ?? (await measureDataUrl(dataUrl)) ?? { width: 200, height: 200 }

  return {
    name: file.name || (kind === 'svg' ? 'mark.svg' : 'image'),
    mimeType,
    kind,
    dataUrl,
    width: Math.max(1, size.width),
    height: Math.max(1, size.height),
  }
}

function resolveMimeType(file: File): IngestedImage['mimeType'] | null {
  if ((ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return file.type as IngestedImage['mimeType']
  }

  const name = file.name.toLowerCase()
  if (name.endsWith('.png')) {
    return 'image/png'
  }
  if (name.endsWith('.jpg') || name.endsWith('.jpeg')) {
    return 'image/jpeg'
  }
  if (name.endsWith('.webp')) {
    return 'image/webp'
  }
  if (name.endsWith('.svg')) {
    return 'image/svg+xml'
  }
  return null
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error('The file could not be read.'))
      }
    }
    reader.onerror = () => reject(new Error('The file could not be read.'))
    reader.readAsDataURL(file)
  })
}

function measureDataUrl(dataUrl: string): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const image = new Image()
    image.onload = () => {
      resolve({
        width: image.naturalWidth || 200,
        height: image.naturalHeight || 200,
      })
    }
    image.onerror = () => resolve(null)
    image.src = dataUrl
  })
}

function parseSvgSize(markup: string): { width: number; height: number } | null {
  const viewBox = markup.match(/viewBox=["']?\s*([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)/i)
  if (viewBox) {
    const width = Number(viewBox[3])
    const height = Number(viewBox[4])
    if (width > 0 && height > 0) {
      return { width, height }
    }
  }

  const width = parseSvgLength(markup.match(/\bwidth=["']?([\d.]+)/i)?.[1])
  const height = parseSvgLength(markup.match(/\bheight=["']?([\d.]+)/i)?.[1])
  if (width && height) {
    return { width, height }
  }

  return null
}

function parseSvgLength(value: string | undefined): number | null {
  if (!value) {
    return null
  }
  const next = Number(value)
  return Number.isFinite(next) && next > 0 ? next : null
}
