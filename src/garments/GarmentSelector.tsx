import { garmentSwitchRequiresConfirm } from '@/design/garmentSwitch'
import { useDesign } from '@/design/useDesign'
import { ConfirmDialog } from '@/ui'
import { useState } from 'react'
import { AVAILABLE_GARMENTS } from './registry'
import { garmentPreviewView } from './model'
import { categoryLabel } from './types'

export function GarmentSelector() {
  const { document, switchGarment } = useDesign()
  const [pendingType, setPendingType] = useState<string | null>(null)

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

  const pending = pendingType ? AVAILABLE_GARMENTS.find((garment) => garment.id === pendingType) : null

  return (
    <div data-garment-selector="true">
      <div className="mb-2 text-[10px] font-medium uppercase tracking-[0.14em] text-mute">
        Garment
      </div>
      <ul className="grid grid-cols-2 gap-1.5">
        {AVAILABLE_GARMENTS.map((garment) => {
          const active = garment.id === document.garmentType
          const previewView = garmentPreviewView(garment)
          return (
            <li key={garment.id}>
              <button
                type="button"
                data-garment-option={garment.id}
                aria-pressed={active}
                onClick={() => requestSwitch(garment.id)}
                className={`flex w-full flex-col overflow-hidden rounded-md border text-left ${
                  active
                    ? 'border-accent/50 bg-accent/10'
                    : 'border-line hover:border-accent/40'
                }`}
              >
                <div className="flex h-16 items-center justify-center bg-canvas px-2 pt-2">
                  <svg
                    viewBox={`0 0 ${garment.viewBox.width} ${garment.viewBox.height}`}
                    className="h-full w-full"
                    aria-hidden
                  >
                    {garment.render({
                      viewId: previewView,
                      bodyColor: garment.defaults.bodyColor,
                    })}
                  </svg>
                </div>
                <div className="border-t border-line px-2 py-1.5">
                  <div className="text-[11px] font-medium text-ink">{garment.name}</div>
                  <div className="text-[9px] uppercase tracking-[0.12em] text-mute">
                    {categoryLabel(garment.category)}
                  </div>
                </div>
              </button>
            </li>
          )
        })}
      </ul>
      {pending ? (
        <ConfirmDialog
          title="Switch garment?"
          message="The current garment layout may not fit the new garment. Artwork stays on its original panels and is not remapped."
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
