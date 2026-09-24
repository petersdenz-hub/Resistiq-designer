import type { DesignDocument } from '@/design/types'

/**
 * Storage is intentionally replaceable.
 * The first implementation is in-memory only.
 * A later adapter can talk to this project's own Supabase backend —
 * never the Resistiq webshop.
 */
export interface DesignStore {
  load(id: string): Promise<DesignDocument | null>
  save(document: DesignDocument): Promise<void>
}
