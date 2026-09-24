import { getElementsInView, getPanelById, getPanelsInView } from '@/design/selectors'
import { useDesign } from '@/design/useDesign'
import { AVAILABLE_GARMENTS, PLANNED_GARMENT_LABELS } from '@/garments/registry'
import {
  Button,
  ImageIcon,
  LayersIcon,
  LogoIcon,
  MaterialIcon,
  PaletteIcon,
  ShirtIcon,
  TextIcon,
} from '@/ui'
import { useState } from 'react'

type ToolId = 'garment' | 'colors' | 'materials' | 'logo' | 'image' | 'text' | 'elements'

const TOOLS: { id: ToolId; label: string; icon: typeof ShirtIcon }[] = [
  { id: 'garment', label: 'Garment', icon: ShirtIcon },
  { id: 'colors', label: 'Colors', icon: PaletteIcon },
  { id: 'materials', label: 'Materials', icon: MaterialIcon },
  { id: 'logo', label: 'Logo', icon: LogoIcon },
  { id: 'image', label: 'Image', icon: ImageIcon },
  { id: 'text', label: 'Text', icon: TextIcon },
  { id: 'elements', label: 'Elements', icon: LayersIcon },
]

export function Sidebar() {
  const [tool, setTool] = useState<ToolId>('elements')
  const active = TOOLS.find((item) => item.id === tool) ?? TOOLS[0]

  return (
    <aside className="flex w-[17.5rem] shrink-0 border-r border-line bg-panel">
      <div className="flex w-14 flex-col items-center gap-1 border-r border-line py-3">
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
          {tool === 'materials' ? <Placeholder text="Materials are not in this first version. They will be stored on the Design Document later." /> : null}
          {tool === 'logo' ? <Placeholder text="Logo upload is not available yet. The Design Document already has a logo element type." /> : null}
          {tool === 'image' ? <Placeholder text="Image upload is not available yet. The Design Document already has an image element type." /> : null}
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
  const { document, setActivePanel } = useDesign()
  const viewPanels = getPanelsInView(document, document.activeView)

  return (
    <div className="space-y-4">
      <button
        type="button"
        className="w-full rounded-lg border border-accent/40 bg-accent/10 px-3 py-2.5 text-left"
      >
        <div className="text-[12px] font-medium text-ink">
          {AVAILABLE_GARMENTS.find((garment) => garment.id === document.garmentType)?.label ??
            'T-shirt'}
        </div>
        <div className="mt-0.5 text-[11px] text-mute">Current garment</div>
      </button>
      <div>
        <div className="mb-2 text-[10px] font-medium uppercase tracking-[0.14em] text-mute">
          Panels on this view
        </div>
        <ul className="space-y-1.5">
          {viewPanels.map((panel) => {
            const active = panel.id === document.activePanelId
            return (
              <li key={panel.id}>
                <button
                  type="button"
                  onClick={() => setActivePanel(panel.id)}
                  className={`w-full rounded-md border px-3 py-1.5 text-left text-[12px] ${
                    active
                      ? 'border-accent/50 bg-accent/10 text-ink'
                      : 'border-line text-mute hover:text-ink'
                  }`}
                >
                  {panel.label}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
      <div>
        <div className="mb-2 text-[10px] font-medium uppercase tracking-[0.14em] text-mute">
          Later garments
        </div>
        <ul className="space-y-1.5 text-[12px] text-mute">
          {PLANNED_GARMENT_LABELS.map((label) => (
            <li key={label} className="rounded-md border border-line/70 px-3 py-1.5">
              {label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function ColorsPanel() {
  const { document, setBodyColor } = useDesign()
  const body = document.colors.find((color) => color.role === 'body')

  if (!body) {
    return <Placeholder text="This design has no body color yet." />
  }

  return (
    <div className="space-y-3">
      <label className="block">
        <span className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.14em] text-mute">
          Body color
        </span>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={body.value}
            onChange={(event) => setBodyColor(event.target.value)}
            className="h-9 w-9 cursor-pointer rounded border border-line bg-studio"
            aria-label="Body color"
          />
          <input
            value={body.value}
            onChange={(event) => setBodyColor(event.target.value)}
            className="h-9 flex-1 rounded-md border border-line bg-studio px-2 font-mono text-[12px] text-ink outline-none focus:border-accent/50"
            aria-label="Body color hex"
          />
        </div>
      </label>
    </div>
  )
}

function TextPanel() {
  const { addText } = useDesign()

  return (
    <div className="space-y-3">
      <p className="text-[12px] leading-5 text-mute">
        Adds text to the active panel. You can move, resize, and rotate it.
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
  const elements = getElementsInView(document, document.activeView)

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
          No elements on this view yet. Choose a panel, then add a graphic.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {elements.map((element) => {
            const selected = element.id === selectedElementId
            return (
              <li key={element.id}>
                <div
                  className={`flex items-center gap-2 rounded-md border px-2 py-1.5 ${
                    selected ? 'border-accent/50 bg-accent/10' : 'border-line'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => selectElement(element.id)}
                    className="min-w-0 flex-1 text-left text-[12px] text-ink"
                  >
                    <span className="capitalize">{element.type}</span>
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
