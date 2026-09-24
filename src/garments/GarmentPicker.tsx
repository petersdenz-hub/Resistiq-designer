import { Dialog, DialogActions } from '@/ui'
import { Button } from '@/ui/Button'
import { AVAILABLE_GARMENTS } from './registry'
import { GARMENT_CATEGORY_LABELS } from './types'

interface GarmentPickerProps {
  onPick: (garmentType: string) => void
  onClose: () => void
}

export function GarmentPicker({ onPick, onClose }: GarmentPickerProps) {
  return (
    <Dialog title="Choose a garment" onClose={onClose} size="lg">
      <p className="mb-3 text-[12px] leading-5 text-mute">
        New designs start on the garment you pick. Saved designs stay on their original type.
      </p>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {AVAILABLE_GARMENTS.map((garment) => (
          <li key={garment.id}>
            <button
              type="button"
              onClick={() => onPick(garment.id)}
              className="flex w-full flex-col overflow-hidden rounded-lg border border-line bg-canvas text-left transition-colors hover:border-accent/50"
            >
              <div className="flex h-28 items-center justify-center px-3 pt-3">
                <svg
                  viewBox={`0 0 ${garment.viewBox.width} ${garment.viewBox.height}`}
                  className="h-full w-full"
                  aria-hidden
                >
                  {garment.render({
                    viewId: 'front',
                    bodyColor: garment.defaults.bodyColor,
                  })}
                </svg>
              </div>
              <div className="border-t border-line bg-panel px-3 py-2">
                <div className="text-[12px] font-medium text-ink">{garment.name}</div>
                <div className="text-[10px] uppercase tracking-[0.12em] text-mute">
                  {GARMENT_CATEGORY_LABELS[garment.category]}
                </div>
              </div>
            </button>
          </li>
        ))}
      </ul>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  )
}
