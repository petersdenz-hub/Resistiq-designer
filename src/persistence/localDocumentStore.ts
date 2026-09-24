import type { DesignDocument } from '@/design/types'

const STORAGE_KEY = 'resistq-designer:v1:document'

export function loadLocalDocument(): DesignDocument | null {
  if (typeof localStorage === 'undefined') {
    return null
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return null
    }
    const parsed: unknown = JSON.parse(raw)
    return isDesignDocument(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function saveLocalDocument(document: DesignDocument): void {
  if (typeof localStorage === 'undefined') {
    return
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(document))
  } catch {
    // Quota or private-mode failures must not break editing.
  }
}

function isDesignDocument(value: unknown): value is DesignDocument {
  if (!value || typeof value !== 'object') {
    return false
  }

  const document = value as DesignDocument
  return (
    typeof document.id === 'string' &&
    typeof document.garmentType === 'string' &&
    Array.isArray(document.views) &&
    Array.isArray(document.panels) &&
    Array.isArray(document.safeAreas) &&
    Array.isArray(document.colors) &&
    Array.isArray(document.elements)
  )
}
