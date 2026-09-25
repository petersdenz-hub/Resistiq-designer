import { garmentSwitchRequiresConfirm } from '@/design/garmentSwitch'
import { useDesign } from '@/design/useDesign'
import { ConfirmDialog } from '@/ui'
import { useState } from 'react'
import { GarmentCard } from './GarmentCard'
import { studioGarmentGroups } from './registry'

export function GarmentSelector() {
  const { document, switchGarment } = useDesign()
  const [pendingType, setPendingType] = useState<string | null>(null)
  const groups = studioGarmentGroups()
  const pending = groups.flatMap((group) => group.garments).find((garment) => garment.id === pendingType)

  function requestSwitch(nextType: string) {
    if (nextType === document.garmentType) {
      return
    }
    if (garmentSwitchRequiresConfirm(document, nextType)) {
      setPendingType(nextType)
      return
    }
    switchGarment(nextType)
  }

  return (
    <div data-garment-selector="true">
      <div className="space-y-3">
        {groups.map((group) => (
          <div key={group.id} data-garment-group={group.id}>
            <div className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-mute">
              {group.label}
            </div>
            <ul className="grid grid-cols-2 gap-1.5">
              {group.garments.map((garment) => (
                <li key={garment.id}>
                  <GarmentCard
                    garment={garment}
                    selected={garment.id === document.garmentType}
                    onSelect={() => requestSwitch(garment.id)}
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {pending ? (
        <ConfirmDialog
          title="Switch garment?"
          message="Your artwork stays where you placed it. It will not move to a new part of the garment."
          confirmLabel="Continue"
          onCancel={() => setPendingType(null)}
          onConfirm={() => {
            switchGarment(pending.id)
            setPendingType(null)
          }}
        />
      ) : null}
    </div>
  )
}
