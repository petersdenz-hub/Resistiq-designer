import { DesignProvider } from '@/design/DesignProvider'
import { hydrateAssets } from '@/persistence/assetCache'
import { Studio } from '@/studio/Studio'
import { useEffect } from 'react'

export default function App() {
  useEffect(() => {
    void hydrateAssets()
  }, [])

  return (
    <DesignProvider>
      <Studio />
    </DesignProvider>
  )
}
