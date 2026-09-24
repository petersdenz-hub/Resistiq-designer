import type { DesignDocument, DesignElement } from './types'

export function getBodyColor(document: DesignDocument): string {
  return document.colors.find((color) => color.role === 'body')?.value ?? '#e8e4dc'
}

export function getElementsInView(
  document: DesignDocument,
  viewId: string,
): DesignElement[] {
  return document.elements
    .filter((element) => element.viewId === viewId)
    .sort((a, b) => a.zIndex - b.zIndex)
}

export function getElementById(
  document: DesignDocument,
  elementId: string | null,
): DesignElement | null {
  if (!elementId) {
    return null
  }
  return document.elements.find((element) => element.id === elementId) ?? null
}
