import { categoryLabel } from './types'
import { garmentPreviewView } from './model'
import type { GarmentDefinition } from './types'

export function GarmentCard({
  garment,
  selected = false,
  size = 'sm',
  onSelect,
}: {
  garment: GarmentDefinition
  selected?: boolean
  size?: 'sm' | 'lg'
  onSelect: () => void
}) {
  const previewView = garmentPreviewView(garment)

  return (
    <button
      type="button"
      data-garment-option={garment.id}
      data-garment-selected={selected ? 'true' : 'false'}
      aria-pressed={selected}
      aria-label={`${garment.name}, ${categoryLabel(garment.category)}`}
      onClick={onSelect}
      className={`flex w-full flex-col overflow-hidden rounded-md border text-left transition-colors ${
        selected
          ? 'border-accent bg-accent/12 ring-1 ring-accent/40'
          : 'border-line hover:border-accent/40'
      }`}
    >
      <div
        className={`flex items-center justify-center bg-canvas ${
          size === 'lg' ? 'h-28 px-3 pt-3' : 'h-14 px-2 pt-1.5'
        }`}
      >
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
      <div className={`border-t border-line ${size === 'lg' ? 'bg-panel px-3 py-2' : 'px-2 py-1.5'}`}>
        <div className={`${size === 'lg' ? 'text-[12px]' : 'text-[11px]'} font-medium text-ink`}>
          {garment.name}
        </div>
        <div className="text-[9px] uppercase tracking-[0.12em] text-mute">
          {categoryLabel(garment.category)}
        </div>
      </div>
    </button>
  )
}
