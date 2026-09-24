import type { DesignDocument } from '@/design/types'

export function isDesignDocument(value: unknown): value is DesignDocument {
  if (!value || typeof value !== 'object') {
    return false
  }

  const document = value as DesignDocument
  return (
    typeof document.id === 'string' &&
    typeof document.name === 'string' &&
    typeof document.garmentType === 'string' &&
    Array.isArray(document.views) &&
    Array.isArray(document.panels) &&
    Array.isArray(document.safeAreas) &&
    Array.isArray(document.colors) &&
    Array.isArray(document.elements)
  )
}
