import { useSyncExternalStore } from 'react'
import { getAssetCacheVersion, getCachedAsset, subscribeAssets } from './assetCache'
import type { DesignAsset } from './types'

export function useAsset(id: string): DesignAsset | null {
  useSyncExternalStore(subscribeAssets, getAssetCacheVersion, getAssetCacheVersion)
  return getCachedAsset(id)
}
