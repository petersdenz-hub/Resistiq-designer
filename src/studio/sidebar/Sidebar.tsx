import { ACCEPTED_IMAGE_ACCEPT } from '@/design/ingestImage'
import { DesignPanel } from './DesignPanel'
import { MaterialsPanel } from './MaterialsPanel'
import { PLACEMENT_ZONE_LABELS, resolveActiveZone, zonesForGarment } from '@/design/designObjects'
import { getElementsInView, getPanelById } from '@/design/selectors'
import { useDesign } from '@/design/useDesign'
import { GarmentSelector } from '@/garments/GarmentSelector'
import { getGarment } from '@/garments/registry'
import { isPrintablePanel, panelName } from '@/garments/model'
import { GARMENT_CATEGORY_LABELS } from '@/garments/types'
import {
  Button,
  ColorPicker,
  DesignIcon,
  ImageIcon,
  LayersIcon,
  LogoIcon,
  MaterialIcon,
  PaletteIcon,
  ShirtIcon,
  TextIcon,
} from '@/ui'
import { useRef, useState } from 'react'

type ToolId = 'garment' | 'colors' | 'materials' | 'design' | 'logo' | 'image' | 'text' | 'elements'

const TOOLS: { id: ToolId; label: string; icon: typeof ShirtIcon }[] = [
  { id: 'garment', label: 'Garment', icon: ShirtIcon },
  { id: 'colors', label: 'Colors', icon: PaletteIcon },
  { id: 'materials', label: 'Materials', icon: MaterialIcon },
  { id: 'design', label: 'Design', icon: DesignIcon },
  { id: 'logo', label: 'Logo', icon: LogoIcon },
  { id: 'image', label: 'Image', icon: ImageIcon },
  { id: 'text', label: 'Text', icon: TextIcon },
  { id: 'elements', label: 'Elements', icon: LayersIcon },
]

export function Sidebar({
  collapsed = false,
  onExpand,
  onCollapse,
}: {
  collapsed?: boolean
  onExpand?: () => void
  onCollapse?: () => void
}) {
  const [tool, setTool] = useState<ToolId>('design')
  const active = TOOLS.find((item) => item.id === tool) ?? TOOLS[0]

  if (collapsed) {
    return (
      <aside className="flex w-12 shrink-0 flex-col items-center border-r border-line bg-panel py-3" data-sidebar-collapsed="true">
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
    <aside className="flex w-[15.5rem] shrink-0 border-r border-line bg-panel" data-sidebar="true">
      <div className="flex w-12 flex-col items-center gap-1 border-r border-line py-3">
        {TOOLS.map((item) => {
          const Icon = item.icon
          const selected = item.id === tool
          return (
            <button
              key={item.id}
              type="button"
              title={item.label}
              aria-label={item.label}
              aria-pressed={selected}
              onClick={() => setTool(item.id)}
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
          <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-mute">
            {active.label}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {tool === 'garment' ? <GarmentPanel /> : null}
          {tool === 'colors' ? <ColorsPanel /> : null}
          {tool === 'materials' ? <MaterialsPanel /> : null}
          {tool === 'design' ? <DesignPanel /> : null}
          {tool === 'logo' ? <UploadPanel role="logo" /> : null}
          {tool === 'image' ? <UploadPanel role="image" /> : null}
          {tool === 'text' ? <TextPanel /> : null}
          {tool === 'elements' ? <ElementsPanel /> : null}
        </div>
      </div>
    </aside>
  )
}

function Placeholder({ text }: { text: string }) {
  return <p className="text-[12px] leading-5 text-mute">{text}</p>
}

function GarmentPanel() {
  const { document, setActivePanel, setActiveZone } = useDesign()
  const garment = getGarment(document.garmentType)
  const viewPanels = garment.panels.filter((panel) => panel.viewId === document.activeView)
  const garmentZones = zonesForGarment(document.garmentType)
  const zone = resolveActiveZone(document)
  const activePanel = garment.panels.find((panel) => panel.id === document.activePanelId)
  const viewLabel =
    document.views.find((view) => view.id === document.activeView)?.label ?? document.activeView

  return (
    <div className="space-y-4" data-garment-nav="true">
      <GarmentSelector />
      <div
        className="rounded-md border border-line px-3 py-2 text-[11px] text-mute"
        data-garment-path="true"
      >
        <span className="text-ink">{garment.name}</span>
        <span className="mx-1">→</span>
        <span>{viewLabel}</span>
        <span className="mx-1">→</span>
        <span className="text-ink">{PLACEMENT_ZONE_LABELS[zone]}</span>
      </div>
      <div>
        <div className="mb-2 text-[10px] font-medium uppercase tracking-[0.14em] text-mute">
          Panel
        </div>
        <ul className="space-y-1.5">
          {viewPanels.map((panel) => {
            const active = panel.id === document.activePanelId
            const safe = document.safeAreas.find((area) => area.panelId === panel.id)
            return (
              <li key={panel.id}>
                <button
                  type="button"
                  data-panel-option={panel.id}
                  onClick={() => setActivePanel(panel.id)}
                  className={`w-full rounded-md border px-3 py-1.5 text-left ${
                    active
                      ? 'border-accent/50 bg-accent/10 text-ink'
                      : 'border-line text-mute hover:text-ink'
                  }`}
                >
                  <span className="block text-[12px]">{panelName(panel)}</span>
                  <span className="mt-0.5 block text-[10px] text-mute">
                    {isPrintablePanel(panel) ? (safe?.label ?? 'Printable') : 'Structure'}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
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
              {PLACEMENT_ZONE_LABELS[item]}
            </button>
          ))}
        </div>
        {activePanel && isPrintablePanel(activePanel) && activePanel.designZones?.length ? (
          <ul className="mt-2 space-y-1" data-panel-design-zones="true">
            {activePanel.designZones.map((item) => (
              <li key={item.id} className="text-[11px] text-mute">
                {item.name}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <p className="text-[11px] leading-5 text-mute">
        {GARMENT_CATEGORY_LABELS[garment.category]} · artwork stays on its original panels when you
        switch garments.
      </p>
    </div>
  )
}

function ColorsPanel() {
  const { document, setBodyColor, commitGesture } = useDesign()
  const body = document.colors.find((color) => color.role === 'body')
  const originRef = useRef(document)

  if (!body) {
    return <Placeholder text="This design has no body color yet." />
  }

  return (
    <div className="space-y-3">
      <p className="text-[12px] leading-5 text-mute">
        Body color is the fallback for any panel without its own color. Select a panel to override it. Trim colors come later.
      </p>
      <ColorPicker
        label="Garment color"
        value={body.value}
        onCommit={(value) => setBodyColor(value)}
        onLiveStart={() => {
          originRef.current = document
        }}
        onLiveChange={(value) => setBodyColor(value, 'replace')}
        onLiveEnd={() => commitGesture(originRef.current)}
      />
    </div>
  )
}

function UploadPanel({ role }: { role: 'image' | 'logo' }) {
  const { document, addImageFromFile } = useDesign()
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const panel = getPanelById(document, document.activePanelId)
  const label = role === 'logo' ? 'Upload logo' : 'Upload image'

  return (
    <div className="space-y-3">
      <p className="text-[12px] leading-5 text-mute">
        Places a {role} on {panel?.label ?? 'the active panel'}. The file is stored locally in
        this browser and referenced from the Design Document.
      </p>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_ACCEPT}
        className="absolute h-px w-px overflow-hidden opacity-0"
        onChange={(event) => {
          const file = event.target.files?.[0]
          event.target.value = ''
          if (!file) {
            return
          }
          setBusy(true)
          setError(null)
          void addImageFromFile(file, role).then((message) => {
            setBusy(false)
            setError(message)
          })
        }}
      />
      <Button
        variant="accent"
        className="w-full"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
      >
        {busy ? 'Uploading…' : label}
      </Button>
      <p className="text-[11px] text-mute">PNG, JPG, WEBP, or SVG. Max 8 MB.</p>
      {error ? <p className="text-[12px] text-accent">{error}</p> : null}
    </div>
  )
}

function TextPanel() {
  const { document, addText } = useDesign()
  const panel = getPanelById(document, document.activePanelId)

  return (
    <div className="space-y-3">
      <p className="text-[12px] leading-5 text-mute">
        Adds structured text to {panel?.label ?? 'the active panel'}. Typography stays in the
        Design Document — it is never converted to an image.
      </p>
      <Button variant="accent" className="w-full" onClick={addText}>
        Add text
      </Button>
    </div>
  )
}

function ElementsPanel() {
  const { document, selectedElementId, selectElement, addGraphic, removeElementById } =
    useDesign()
  const elements = getElementsInView(document, document.activeView, 'stack')

  return (
    <div className="space-y-4">
      <p className="text-[11px] text-mute">
        Adding to {getPanelById(document, document.activePanelId)?.label ?? 'the active panel'}
      </p>
      <Button variant="accent" className="w-full" onClick={addGraphic}>
        Add graphic
      </Button>
      {elements.length === 0 ? (
        <p className="text-[12px] leading-5 text-mute">
          No elements on this view yet. Choose a panel, then add a graphic, text, or image.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {elements.map((element, index) => {
            const selected = element.id === selectedElementId
            return (
              <li key={element.id}>
                <div
                  className={`flex items-center gap-2 rounded-md border px-2 py-1.5 ${
                    selected ? 'border-accent/50 bg-accent/10' : 'border-line'
                  }`}
                >
                  <span className="w-4 shrink-0 text-center font-mono text-[10px] text-mute">
                    {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => selectElement(element.id)}
                    className="min-w-0 flex-1 text-left text-[12px] text-ink"
                  >
                    <span className="capitalize">{elementLabel(element.type, element)}</span>
                    <span className="mt-0.5 block text-[10px] text-mute">
                      {getPanelById(document, element.panelId)?.label ?? element.panelId}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeElementById(element.id)}
                    className="text-[11px] text-mute hover:text-ink"
                  >
                    Remove
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function elementLabel(
  type: string,
  element: { type: string; content?: unknown; fileName?: unknown },
): string {
  if (type === 'text' && 'content' in element && typeof element.content === 'string') {
    const preview = element.content.trim() || 'Text'
    return preview.length > 22 ? `${preview.slice(0, 22)}…` : preview
  }
  if ((type === 'image' || type === 'logo') && typeof element.fileName === 'string') {
    const preview = element.fileName.trim() || type
    return preview.length > 22 ? `${preview.slice(0, 22)}…` : preview
  }
  return type
}
