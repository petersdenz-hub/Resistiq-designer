import { DesignProvider } from '@/design/DesignProvider'
import type { DesignDocument } from '@/design/types'
import { DesignsPage } from '@/designs/DesignsPage'
import { GarmentPicker } from '@/garments/GarmentPicker'
import { createDesign } from '@/persistence/designRepository'
import { hydrateAssets } from '@/persistence/assetCache'
import { Studio } from '@/studio/Studio'
import { useEffect, useState } from 'react'

export default function App() {
  const [screen, setScreen] = useState<'dashboard' | 'editor'>('dashboard')
  const [working, setWorking] = useState<DesignDocument | null>(null)
  const [pickingGarment, setPickingGarment] = useState(false)

  useEffect(() => {
    void hydrateAssets()
  }, [])

  function openNew(garmentType: string) {
    setWorking(createDesign(garmentType))
    setScreen('editor')
    setPickingGarment(false)
  }

  return (
    <>
      {screen === 'dashboard' || !working ? (
        <DesignsPage
          onOpen={(document) => {
            setWorking(document)
            setScreen('editor')
          }}
          onRequestNew={() => setPickingGarment(true)}
        />
      ) : (
        <DesignProvider key={working.id} initialDocument={working}>
          <Studio
            onClose={() => {
              setWorking(null)
              setScreen('dashboard')
            }}
            onNew={() => setPickingGarment(true)}
          />
        </DesignProvider>
      )}
      {pickingGarment ? (
        <GarmentPicker onPick={openNew} onClose={() => setPickingGarment(false)} />
      ) : null}
    </>
  )
}
