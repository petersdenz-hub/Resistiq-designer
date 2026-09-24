import { FONT_WEIGHTS, TEXT_ALIGNS, TEXT_FONT_FAMILIES } from '@/design/typography'
import { getPanelById, getPanelColor } from '@/design/selectors'
import {
  isGraphicElement,
  isLockedElement,
  isPlacedImage,
  isTextElement,
  type LayerDirection,
} from '@/design/types'
import { useDesign } from '@/design/useDesign'
import { minLocalSize, getGarmentPanel } from '@/garments/coordinates'
import { getGarment } from '@/garments/registry'
import { Button, ColorPicker, Field, NumberField, SegmentedControl } from '@/ui'
import { useRef, useState } from 'react'

export function PropertiesPanel() {
  const { selectedElement } = useDesign()

  return (
    <aside className="flex w-64 shrink-0 flex-col border-l border-line bg-panel">
      <div className="border-b border-line px-4 py-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-mute">
          Properties
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {selectedElement ? <SelectedProperties /> : <SelectedPanelProperties />}
      </div>
    </aside>
  )
}

function SelectedPanelProperties() {
  const { document, setPanelColor, commitGesture } = useDesign()
  const panel = getPanelById(document, document.activePanelId)
  const originRef = useRef(document)
  const viewLabel =
    document.views.find((view) => view.id === panel?.viewId)?.label ?? panel?.viewId ?? '—'
  const color = panel ? getPanelColor(document, panel.id) : null

  if (!panel || !color) {
    return (
      <p className="text-[12px] leading-5 text-mute">
        Select a garment panel to change its color. Design elements stay separate.
      </p>
    )
  }

  return (
    <div className="space-y-4" data-properties-kind="panel">
      <div>
        <div className="text-[12px] font-medium text-ink">Panel</div>
        <div className="mt-1 text-[11px] text-mute">{panel.label}</div>
      </div>
      <p className="text-[11px] leading-4 text-mute">
        This is garment structure, not a design element. Color is stored on the Design Document.
      </p>
      <div className="rounded-md border border-line px-3 py-2 text-[12px]">
        <div className="text-[10px] uppercase tracking-[0.14em] text-mute">View</div>
        <div className="mt-0.5 text-ink">{viewLabel}</div>
      </div>
      <ColorPicker
        label="Panel color"
        value={color}
        onCommit={(value) => setPanelColor(panel.id, value)}
        onLiveStart={() => {
          originRef.current = document
        }}
        onLiveChange={(value) => setPanelColor(panel.id, value, 'replace')}
        onLiveEnd={() => commitGesture(originRef.current)}
      />
    </div>
  )
}

function SelectedProperties() {
  const { document, selectedElement, updateSelected, moveSelectedLayer, removeSelected } =
    useDesign()

  if (!selectedElement) {
    return null
  }

  const panel = getPanelById(document, selectedElement.panelId)
  const garmentPanel = getGarmentPanel(getGarment(document.garmentType), selectedElement.panelId)
  const minSize = garmentPanel ? minLocalSize(garmentPanel) : 12

  return (
    <div className="space-y-4" data-properties-kind="element">
      <div>
        <div className="text-[12px] font-medium capitalize text-ink">{selectedElement.type}</div>
        <div className="mt-1 text-[11px] text-mute">{panel?.label ?? selectedElement.panelId}</div>
      </div>

      <p className="text-[11px] leading-4 text-mute">
        Position and size are relative to this panel, not the browser window.
      </p>

      {isPlacedImage(selectedElement) ? <ImageMetaFields /> : null}

      {isTextElement(selectedElement) ? <TextStyleFields /> : null}

      {isGraphicElement(selectedElement) ? <GraphicStyleFields /> : null}

      <div className="grid grid-cols-2 gap-2">
        <LiveNumber
          label="X"
          value={selectedElement.x}
          disabled={isLockedElement(selectedElement)}
          onCommit={(value) => updateSelected({ x: value })}
        />
        <LiveNumber
          label="Y"
          value={selectedElement.y}
          disabled={isLockedElement(selectedElement)}
          onCommit={(value) => updateSelected({ y: value })}
        />
        <LiveNumber
          label="W"
          value={selectedElement.width}
          min={minSize}
          disabled={isLockedElement(selectedElement)}
          onCommit={(value) => updateSelected({ width: value })}
        />
        <LiveNumber
          label="H"
          value={selectedElement.height}
          min={minSize}
          disabled={isLockedElement(selectedElement)}
          onCommit={(value) => updateSelected({ height: value })}
        />
      </div>

      <LiveNumber
        label="Rotation"
        value={Number(selectedElement.rotation.toFixed(1))}
        digits={1}
        disabled={isLockedElement(selectedElement)}
        onCommit={(value) => updateSelected({ rotation: value })}
      />

      <OpacityField />

      <LayerButtons onMove={moveSelectedLayer} />

      <Button className="w-full" onClick={removeSelected}>
        Remove element
      </Button>
    </div>
  )
}

function ImageMetaFields() {
  const { selectedElement, updateSelected } = useDesign()

  if (!selectedElement || !isPlacedImage(selectedElement)) {
    return null
  }

  const format = selectedElement.mimeType.includes('svg')
    ? 'SVG'
    : selectedElement.mimeType.includes('png')
      ? 'PNG'
      : selectedElement.mimeType.includes('webp')
        ? 'WEBP'
        : 'JPG'

  return (
    <>
      <div>
        <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-mute">File</div>
        <div className="mt-1 truncate text-[12px] text-ink" title={selectedElement.fileName}>
          {selectedElement.fileName}
        </div>
        <div className="mt-0.5 text-[11px] text-mute">{format} · stays a separate asset</div>
      </div>
      <button
        type="button"
        aria-pressed={selectedElement.locked}
        onClick={() => updateSelected({ locked: !selectedElement.locked })}
        className={`h-8 w-full rounded-md border text-[12px] ${
          selectedElement.locked
            ? 'border-accent/50 bg-accent/10 text-ink'
            : 'border-line text-mute hover:text-ink'
        }`}
      >
        {selectedElement.locked ? 'Unlock placement' : 'Lock placement'}
      </button>
    </>
  )
}

function GraphicStyleFields() {
  const { selectedElement, updateSelected, document, commitGesture } = useDesign()
  const originRef = useRef(document)

  if (!selectedElement || !isGraphicElement(selectedElement)) {
    return null
  }

  return (
    <>
      <Field label="Shape">
        <SegmentedControl
          value={selectedElement.shape}
          options={[
            { value: 'rect' as const, label: 'Rect' },
            { value: 'ellipse' as const, label: 'Ellipse' },
          ]}
          onChange={(shape) => updateSelected({ shape })}
        />
      </Field>
      {selectedElement.shape === 'rect' ? (
        <LiveNumber
          label="Corner"
          value={selectedElement.cornerRadius}
          min={0}
          onCommit={(value) => updateSelected({ cornerRadius: value })}
        />
      ) : null}
      <ColorPicker
        label="Color"
        value={selectedElement.color}
        presets={[]}
        onCommit={(color) => updateSelected({ color })}
        onLiveStart={() => {
          originRef.current = document
        }}
        onLiveChange={(color) => updateSelected({ color }, 'replace')}
        onLiveEnd={() => commitGesture(originRef.current)}
      />
    </>
  )
}

function TextStyleFields() {
  const { selectedElement, updateSelected, document, commitGesture } = useDesign()
  const originRef = useRef(document)

  if (!selectedElement || !isTextElement(selectedElement)) {
    return null
  }

  return (
    <>
      <TextContentField />
      <Field label="Font">
        <select
          value={selectedElement.fontFamily}
          onChange={(event) => updateSelected({ fontFamily: event.target.value })}
          className="h-8 w-full rounded-md border border-line bg-studio px-2 text-[12px] text-ink outline-none focus:border-accent/50"
        >
          {TEXT_FONT_FAMILIES.map((font) => (
            <option key={font.id} value={font.id}>
              {font.label}
            </option>
          ))}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <LiveNumber
          label="Size"
          value={selectedElement.fontSize}
          min={6}
          digits={1}
          onCommit={(value) => updateSelected({ fontSize: value })}
        />
        <LiveNumber
          label="Tracking"
          value={selectedElement.letterSpacing}
          digits={1}
          onCommit={(value) => updateSelected({ letterSpacing: value })}
        />
      </div>
      <Field label="Weight">
        <SegmentedControl
          value={String(selectedElement.fontWeight)}
          options={FONT_WEIGHTS.map((weight) => ({
            value: String(weight),
            label: weight === 400 ? 'Reg' : weight === 500 ? 'Med' : 'Bold',
          }))}
          onChange={(value) =>
            updateSelected({ fontWeight: Number(value) as (typeof FONT_WEIGHTS)[number] })
          }
        />
      </Field>
      <Field label="Style">
        <button
          type="button"
          aria-pressed={selectedElement.italic}
          onClick={() => updateSelected({ italic: !selectedElement.italic })}
          className={`h-8 w-full rounded-md border text-[12px] italic ${
            selectedElement.italic
              ? 'border-accent/50 bg-accent/10 text-ink'
              : 'border-line text-mute hover:text-ink'
          }`}
        >
          Italic
        </button>
      </Field>
      <Field label="Align">
        <SegmentedControl
          value={selectedElement.textAlign}
          options={TEXT_ALIGNS.map((align) => ({
            value: align,
            label: align === 'left' ? 'Left' : align === 'right' ? 'Right' : 'Center',
          }))}
          onChange={(textAlign) => updateSelected({ textAlign })}
        />
      </Field>
      <ColorPicker
        label="Text color"
        value={selectedElement.color}
        presets={[]}
        onCommit={(color) => updateSelected({ color })}
        onLiveStart={() => {
          originRef.current = document
        }}
        onLiveChange={(color) => updateSelected({ color }, 'replace')}
        onLiveEnd={() => commitGesture(originRef.current)}
      />
    </>
  )
}

function LayerButtons({ onMove }: { onMove: (direction: LayerDirection) => void }) {
  return (
    <div className="space-y-2">
      <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-mute">Layer</div>
      <div className="grid grid-cols-2 gap-2">
        <Button onClick={() => onMove('backward')}>Backward</Button>
        <Button onClick={() => onMove('forward')}>Forward</Button>
        <Button onClick={() => onMove('back')}>To back</Button>
        <Button onClick={() => onMove('front')}>To front</Button>
      </div>
    </div>
  )
}

function OpacityField() {
  const { selectedElement, document, updateSelected, commitGesture } = useDesign()
  const originRef = useRef(document)

  if (!selectedElement) {
    return null
  }

  return (
    <Field label="Opacity">
      <input
        type="range"
        min={0.1}
        max={1}
        step={0.05}
        value={selectedElement.opacity}
        onPointerDown={() => {
          originRef.current = document
        }}
        onChange={(event) =>
          updateSelected({ opacity: Number(event.target.value) }, 'replace')
        }
        onPointerUp={() => {
          commitGesture(originRef.current)
        }}
        className="w-full accent-accent"
      />
    </Field>
  )
}

function TextContentField() {
  const { selectedElement, updateSelected } = useDesign()
  const committed =
    selectedElement && isTextElement(selectedElement) ? selectedElement.content : ''
  const [draft, setDraft] = useState({ committed, text: committed })

  if (draft.committed !== committed) {
    setDraft({ committed, text: committed })
  }

  if (!selectedElement || !isTextElement(selectedElement)) {
    return null
  }

  return (
    <Field label="Content">
      <textarea
        value={draft.text}
        rows={3}
        onChange={(event) =>
          setDraft((current) => ({ ...current, text: event.target.value }))
        }
        onBlur={() => {
          if (draft.text !== selectedElement.content) {
            updateSelected({ content: draft.text })
          }
        }}
        className="w-full resize-none rounded-md border border-line bg-studio px-2 py-1.5 text-[12px] leading-5 text-ink outline-none focus:border-accent/50"
      />
    </Field>
  )
}

function LiveNumber({
  label,
  value,
  min,
  digits = 0,
  disabled = false,
  onCommit,
}: {
  label: string
  value: number
  min?: number
  digits?: number
  disabled?: boolean
  onCommit: (value: number) => void
}) {
  const display = digits > 0 ? value.toFixed(digits) : String(Math.round(value))
  const [draft, setDraft] = useState({ value, text: display })

  if (draft.value !== value) {
    setDraft({ value, text: display })
  }

  return (
    <NumberField
      label={label}
      value={draft.text}
      disabled={disabled}
      step={digits > 0 ? 0.1 : 1}
      onChange={(event) =>
        setDraft((current) => ({ ...current, text: event.target.value }))
      }
      onBlur={() => {
        const next = Number(draft.text)
        if (Number.isFinite(next)) {
          onCommit(min === undefined ? next : Math.max(min, next))
        } else {
          setDraft({ value, text: display })
        }
      }}
    />
  )
}
