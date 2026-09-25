import { placementZoneLabel, resolveActiveZone, zonesForGarment } from '@/design/designObjects'
import { useDesign } from '@/design/useDesign'

export function ZoneChips({ hidden = false }: { hidden?: boolean }) {
  const { document, setActiveZone } = useDesign()
  const zone = resolveActiveZone(document)
  const garmentZones = zonesForGarment(document.garmentType)

  return (
    <div
      className={hidden ? 'sr-only' : 'flex flex-wrap gap-1'}
      data-placement-section="true"
      aria-hidden={hidden ? true : undefined}
    >
      {garmentZones.map((item) => (
        <button
          key={item}
          type="button"
          data-zone-option={item}
          aria-pressed={item === zone}
          onClick={() => setActiveZone(item)}
          className={`h-7 rounded-md border px-2 text-[11px] ${
            item === zone
              ? 'border-accent/50 bg-accent/10 text-ink'
              : 'border-line text-mute hover:text-ink'
          }`}
        >
          {placementZoneLabel(item)}
        </button>
      ))}
    </div>
  )
}
