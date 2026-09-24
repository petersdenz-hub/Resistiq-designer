import { ACCEPTED_IMAGE_ACCEPT } from '@/design/ingestImage'
import { getElementsInView, getPanelById, getPanelsInView } from '@/design/selectors'
import { useDesign } from '@/design/useDesign'
import { AVAILABLE_GARMENTS, PLANNED_GARMENT_LABELS } from '@/garments/registry'
import {
  Button,
  ColorPicker,
  ImageIcon,
  LayersIcon,
  LogoIcon,
  MaterialIcon,
  PaletteIcon,
  ShirtIcon,
  TextIcon,
} from '@/ui'
import { useRef, useState } from 'react'

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
  const { document, setActivePanel } = useDesign()
  const viewPanels = getPanelsInView(document, document.activeView)

  return (
    <div className="space-y-4">
      <div className="w-full rounded-lg border border-accent/40 bg-accent/10 px-3 py-2.5">
        <div className="text-[12px] font-medium text-ink">
          {AVAILABLE_GARMENTS.find((garment) => garment.id === document.garmentType)?.label ??
            'T-shirt'}
        </div>
        <div className="mt-0.5 text-[11px] text-mute">Current garment</div>
      </div>
      <div>
        <div className="mb-2 text-[10px] font-medium uppercase tracking-[0.14em] text-mute">
          Panels on this view
        </div>
        <ul className="space-y-1.5">
          {viewPanels.map((panel) => {
            const active = panel.id === document.activePanelId
            const safe = document.safeAreas.find((area) => area.panelId === panel.id)
            return (
              <li key={panel.id}>
                <button
                  type="button"
                  onClick={() => setActivePanel(panel.id)}
                  className={`w-full rounded-md border px-3 py-1.5 text-left ${
                    active
                      ? 'border-accent/50 bg-accent/10 text-ink'
                      : 'border-line text-mute hover:text-ink'
                  }`}
                >
                  <span className="block text-[12px]">{panel.label}</span>
                  {safe ? (
                    <span className="mt-0.5 block text-[10px] text-mute">{safe.label}</span>
                  ) : null}
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
  const { document, setBodyColor, commitGesture } = useDesign()
  const body = document.colors.find((color) => color.role === 'body')
  const originRef = useRef(document)

  if (!body) {
    return <Placeholder text="This design has no body color yet." />
  }

  return (
    <div className="space-y-3">
      <p className="text-[12px] leading-5 text-mute">
        Garment color is stored on the Design Document. It is not baked into the artwork.
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
