import type { DesignDocument } from '@/design/types'
import type { DesignStore } from './types'

export class MemoryDesignStore implements DesignStore {
  private readonly documents = new Map<string, DesignDocument>()

  async load(id: string): Promise<DesignDocument | null> {
    return this.documents.get(id) ?? null
  }

  async save(document: DesignDocument): Promise<void> {
    this.documents.set(document.id, document)
  }
}
