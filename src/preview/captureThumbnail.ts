const WIDTH = 160
const HEIGHT = 184

export async function captureStageThumbnail(
  svg: SVGSVGElement | null,
): Promise<string | null> {
  if (!svg) {
    return null
  }

  try {
    const clone = svg.cloneNode(true) as SVGSVGElement
    clone.querySelectorAll('[data-editor-chrome]').forEach((node) => node.remove())
    clone.setAttribute('width', String(WIDTH))
    clone.setAttribute('height', String(HEIGHT))
    clone.removeAttribute('class')

    const xml = new XMLSerializer().serializeToString(clone)
    const blob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)

    try {
      const image = await loadImage(url)
      const canvas = document.createElement('canvas')
      canvas.width = WIDTH
      canvas.height = HEIGHT
      const context = canvas.getContext('2d')
      if (!context) {
        return null
      }
      context.fillStyle = '#1b1f28'
      context.fillRect(0, 0, WIDTH, HEIGHT)
      context.drawImage(image, 0, 0, WIDTH, HEIGHT)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.48)
      return dataUrl.length < 80_000 ? dataUrl : null
    } finally {
      URL.revokeObjectURL(url)
    }
  } catch {
    return null
  }
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Thumbnail image failed'))
    image.src = url
  })
}
