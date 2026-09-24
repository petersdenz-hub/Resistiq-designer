import { localAssetStore } from './localAssetStore'
import type { DesignAsset } from './types'

const cache = new Map<string, DesignAsset>()
const listeners = new Set<() => void>()
let version = 0

function emit() {
  version += 1
  listeners.forEach((listener) => listener())
}

export function subscribeAssets(onStoreChange: () => void) {
  listeners.add(onStoreChange)
  return () => {
    listeners.delete(onStoreChange)
  }
}

export function getAssetCacheVersion() {
  return version
}

export function getCachedAsset(id: string): DesignAsset | null {
  return cache.get(id) ?? null
}

export function rememberAsset(asset: DesignAsset) {
  cache.set(asset.id, asset)
  emit()
}

export async function hydrateAssets(): Promise<void> {
  const assets = await localAssetStore.list()
  assets.forEach((asset) => cache.set(asset.id, asset))
  emit()
}

export async function persistAsset(asset: DesignAsset): Promise<void> {
  rememberAsset(asset)
  try {
    await localAssetStore.put(asset)
  } catch {
    // Keep the in-memory copy so this session still works.
  }
}
