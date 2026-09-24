import { DesignProvider } from '@/design/DesignProvider'
import type { DesignDocument } from '@/design/types'
import { DesignsPage } from '@/designs/DesignsPage'
import { createDesign } from '@/persistence/designRepository'
import { hydrateAssets } from '@/persistence/assetCache'
import { Studio } from '@/studio/Studio'
import { useEffect, useState } from 'react'

export default function App() {
  const [screen, setScreen] = useState<'dashboard' | 'editor'>('dashboard')
  const [working, setWorking] = useState<DesignDocument | null>(null)

  useEffect(() => {
    void hydrateAssets()
  }, [])

  if (screen === 'dashboard' || !working) {
    return (
      <DesignsPage
        onOpen={(document) => {
          setWorking(document)
          setScreen('editor')
        }}
      />
    )
  }

  return (
    <DesignProvider key={working.id} initialDocument={working}>
      <Studio
        onClose={() => {
          setWorking(null)
          setScreen('dashboard')
        }}
        onNew={() => {
          setWorking(createDesign())
        }}
      />
    </DesignProvider>
  )
}
