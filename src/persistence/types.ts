import type { DesignDocument } from '@/design/types'

/**
 * Storage is intentionally replaceable.
 * This phase uses the browser only.
 * A later adapter can talk to this project's own Supabase backend —
 * never the Resistiq webshop.
 */
export interface DesignStore {
  load(id: string): Promise<DesignDocument | null>
  save(document: DesignDocument): Promise<void>
}

export type AssetKind = 'raster' | 'svg'

/** Bytes for an uploaded image/logo. Not part of the garment artwork. */
export interface DesignAsset {
  id: string
  name: string
  mimeType: string
  kind: AssetKind
  dataUrl: string
  width: number
  height: number
  createdAt: string
}

export interface AssetStore {
  get(id: string): Promise<DesignAsset | null>
  put(asset: DesignAsset): Promise<void>
  list(): Promise<DesignAsset[]>
  remove(id: string): Promise<void>
}
