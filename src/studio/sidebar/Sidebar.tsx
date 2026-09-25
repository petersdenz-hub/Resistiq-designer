import { useDesign } from '@/design/useDesign'
import { GarmentSelector } from '@/garments/GarmentSelector'
import { getGarment } from '@/garments/registry'
import {
  DEFAULT_OPEN_SECTIONS,
  toggleStudioSections,
  type StudioSectionId,
} from '@/studio/editorChrome'
import { DesignIcon } from '@/ui'
import { useState } from 'react'
import { CanvasTools } from './CanvasTools'
import { DesignActions, LayerList } from './DesignPanel'
import { StudioAccordion } from './StudioAccordion'

export function Sidebar({
  collapsed = false,
  overlay = false,
  focusSection,
  onExpand,
  onCollapse,
}: {
  collapsed?: boolean
  overlay?: boolean
  focusSection?: StudioSectionId | null
  onExpand?: () => void
  onCollapse?: () => void
}) {
  const [open, setOpen] = useState<StudioSectionId[]>([...DEFAULT_OPEN_SECTIONS])

  function toggle(id: StudioSectionId) {
    setOpen((current) => toggleStudioSections(current, id))
  }

  function openSection(id: StudioSectionId) {
    setOpen((current) => (current.includes(id) ? current : toggleStudioSections(current, id)))
  }

  function isOpen(id: StudioSectionId) {
    return focusSection ? focusSection === id : open.includes(id)
  }

  if (collapsed) {
    return (
      <aside
        className="flex w-11 shrink-0 flex-col items-center border-r border-line bg-panel py-3"
        data-sidebar-collapsed="true"
      >
        <button
          type="button"
          title="Show tools"
          aria-label="Show tools"
          onClick={onExpand}
          className="flex h-9 w-9 items-center justify-center rounded-md text-mute hover:bg-panel-hover hover:text-ink"
        >
          <DesignIcon />
        </button>
      </aside>
    )
  }

  const sections = (
    <>
      {(!focusSection || focusSection === 'garment') ? (
        <StudioAccordion
          id="garment"
          label="Garment"
          open={isOpen('garment')}
          onOpen={() => openSection('garment')}
          onToggle={() => toggle('garment')}
        >
          <GarmentTools />
        </StudioAccordion>
      ) : null}
      {(!focusSection || focusSection === 'design') ? (
        <StudioAccordion
          id="design"
          label="Design"
          open={isOpen('design')}
          onOpen={() => openSection('design')}
          onToggle={() => toggle('design')}
        >
          <DesignActions />
        </StudioAccordion>
      ) : null}
      {(!focusSection || focusSection === 'layers') ? (
        <StudioAccordion
          id="layers"
          label="Layers"
          open={isOpen('layers')}
          onOpen={() => openSection('layers')}
          onToggle={() => toggle('layers')}
        >
          <LayerList />
        </StudioAccordion>
      ) : null}
      {(!focusSection || focusSection === 'canvas') ? (
        <StudioAccordion
          id="canvas"
          label="Canvas"
          open={isOpen('canvas')}
          onOpen={() => openSection('canvas')}
          onToggle={() => toggle('canvas')}
        >
          <CanvasTools />
        </StudioAccordion>
      ) : null}
    </>
  )

  return (
    <aside
      className={`flex h-full w-[15rem] shrink-0 flex-col border-r border-line bg-panel ${
        overlay ? 'shadow-2xl' : ''
      }`}
      data-sidebar="true"
    >
      <div className="flex items-center justify-between border-b border-line px-3 py-2.5">
        <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-mute">Tools</div>
        {onCollapse ? (
          <button
            type="button"
            title="Hide tools"
            aria-label="Hide tools"
            data-collapse-sidebar="true"
            onClick={onCollapse}
            className="flex h-6 w-6 items-center justify-center rounded text-mute hover:bg-panel-hover hover:text-ink"
          >
            ‹
          </button>
        ) : null}
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto px-3 py-3">{sections}</div>
    </aside>
  )
}

function GarmentTools() {
  const { document } = useDesign()
  const garment = getGarment(document.garmentType)

  return (
    <div className="space-y-3" data-garment-nav="true">
      <GarmentSelector />
      <p className="text-[11px] text-mute" data-garment-path="true">
        <span className="text-ink">{garment.name}</span>
      </p>
    </div>
  )
}
