import { Dialog, DialogActions } from '@/ui'
import { Button } from '@/ui/Button'
import { GarmentCard } from './GarmentCard'
import { studioGarmentGroups } from './registry'

interface GarmentPickerProps {
  onPick: (garmentType: string) => void
  onClose: () => void
}

export function GarmentPicker({ onPick, onClose }: GarmentPickerProps) {
  const groups = studioGarmentGroups()

  return (
    <Dialog title="Choose a garment" onClose={onClose} size="lg">
      <p className="mb-4 text-[12px] leading-5 text-mute">
        Pick a garment to start a new design. Saved designs keep the garment they were made on.
      </p>
      <div className="space-y-5">
        {groups.map((group) => (
          <section key={group.id} data-garment-group={group.id}>
            <div className="mb-2 text-[10px] font-medium uppercase tracking-[0.14em] text-mute">
              {group.label}
            </div>
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {group.garments.map((garment) => (
                <li key={garment.id}>
                  <GarmentCard garment={garment} size="lg" onSelect={() => onPick(garment.id)} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  )
}
