import { placementZoneLabel, resolveActiveZone, zonesForGarment } from '@/design/designObjects'
import { useDesign } from '@/design/useDesign'
import { GarmentSelector } from '@/garments/GarmentSelector'
import { getGarment } from '@/garments/registry'
import { STUDIO_SECTIONS, type StudioSectionId } from '@/studio/editorChrome'
import { DesignIcon, LayersIcon, MaterialIcon, ShirtIcon } from '@/ui'
import { useRef, useState } from 'react'
import { CanvasTools } from './CanvasTools'
import { DesignPanel } from './DesignPanel'

const SECTION_ICONS = {
  garment: ShirtIcon,
  design: DesignIcon,
  layers: LayersIcon,
  canvas: MaterialIcon,
} as const

export function Sidebar({
  collapsed = false,
  overlay = false,
  onExpand,
  onCollapse,
}: {
  collapsed?: boolean
  overlay?: boolean
  onExpand?: () => void
  onCollapse?: () => void
}) {
  const [section, setSection] = useState<StudioSectionId>('design')
  const scrollRef = useRef<HTMLDivElement>(null)

  function jump(id: StudioSectionId) {
    setSection(id)
    const node = scrollRef.current?.querySelector(`[data-studio-section="${id}"]`)
    node?.scrollIntoView({ block: 'start', behavior: 'smooth' })
  }

  if (collapsed) {
    return (
      <aside
        className="flex w-12 shrink-0 flex-col items-center border-r border-line bg-panel py-3"
        data-sidebar-collapsed="true"
      >
        <button
          type="button"
          title="Show tools"
          aria-label="Show tools"
          onClick={onExpand}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-mute hover:bg-panel-hover hover:text-ink"
        >
          <DesignIcon />
        </button>
      </aside>
    )
  }

  return (
    <aside
      className={`flex h-full w-[16.75rem] shrink-0 border-r border-line bg-panel ${
        overlay ? 'shadow-2xl' : ''
      }`}
      data-sidebar="true"
    >
      <div className="flex w-12 flex-col items-center gap-1 border-r border-line py-3">
        {STUDIO_SECTIONS.map((item) => {
          const Icon = SECTION_ICONS[item.id]
          const selected = item.id === section
          return (
            <button
              key={item.id}
              type="button"
              title={item.label}
              aria-label={item.label}
              aria-pressed={selected}
              onClick={() => jump(item.id)}
              className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
                selected ? 'bg-accent/15 text-accent' : 'text-mute hover:bg-panel-hover hover:text-ink'
              }`}
            >
              <Icon />
            </button>
          )
        })}
        {onCollapse ? (
          <button
            type="button"
            title="Hide tools"
            aria-label="Hide tools"
            data-collapse-sidebar="true"
            onClick={onCollapse}
            className="mt-auto flex h-8 w-8 items-center justify-center rounded-md text-[11px] text-mute hover:bg-panel-hover hover:text-ink"
          >
            ‹
          </button>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="border-b border-line px-4 py-3">
          <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-mute">Tools</div>
        </div>
        <div ref={scrollRef} className="flex-1 space-y-6 overflow-y-auto px-4 py-4">
          <GarmentTools />
          <DesignPanel />
          <CanvasTools />
        </div>
      </div>
    </aside>
  )
}

function GarmentTools() {
  const { document, setActiveView, setActiveZone } = useDesign()
  const garment = getGarment(document.garmentType)
  const garmentZones = zonesForGarment(document.garmentType)
  const zone = resolveActiveZone(document)
  const viewLabel =
    document.views.find((view) => view.id === document.activeView)?.label ?? document.activeView

  return (
    <div className="space-y-4" data-studio-section="garment" data-garment-nav="true">
      <GarmentSelector />
      <div>
        <div className="mb-2 text-[10px] font-medium uppercase tracking-[0.14em] text-mute">View</div>
        <div className="flex rounded-md border border-line p-0.5">
          {document.views.map((view) => (
            <button
              key={view.id}
              type="button"
              data-garment-view={view.id}
              aria-pressed={document.activeView === view.id}
              onClick={() => setActiveView(view.id)}
              className={`h-7 flex-1 rounded px-2 text-[11px] ${
                document.activeView === view.id
                  ? 'bg-accent/15 text-ink'
                  : 'text-mute hover:text-ink'
              }`}
            >
              {view.label}
            </button>
          ))}
        </div>
      </div>
      <div
        className="rounded-md border border-line px-3 py-2 text-[11px] text-mute"
        data-garment-path="true"
      >
        <span className="text-ink">{garment.name}</span>
        <span className="mx-1.5 text-mute">·</span>
        <span>{viewLabel}</span>
        <span className="mx-1.5 text-mute">·</span>
        <span className="text-ink">{placementZoneLabel(zone)}</span>
      </div>
      <div>
        <div className="mb-2 text-[10px] font-medium uppercase tracking-[0.14em] text-mute">
          Design area
        </div>
        <div className="flex flex-wrap gap-1">
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
      </div>
    </div>
  )
}
