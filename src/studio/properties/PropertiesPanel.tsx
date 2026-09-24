import { useDesign } from '@/design/useDesign'
import { isGraphicElement, isTextElement } from '@/design/types'
import { Button, Field, NumberField } from '@/ui'
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
        {selectedElement ? <SelectedProperties /> : (
          <p className="text-[12px] leading-5 text-mute">
            Select an element on the garment to edit position, size, rotation, and color.
          </p>
        )}
      </div>
    </aside>
  )
}

function SelectedProperties() {
  const { selectedElement, updateSelected, moveSelectedLayer, removeSelected } = useDesign()

  if (!selectedElement) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="text-[12px] font-medium capitalize text-ink">{selectedElement.type}</div>

      <div className="grid grid-cols-2 gap-2">
        <LiveNumber
          label="X"
          value={selectedElement.x}
          onCommit={(value) => updateSelected({ x: value })}
        />
        <LiveNumber
          label="Y"
          value={selectedElement.y}
          onCommit={(value) => updateSelected({ y: value })}
        />
        <LiveNumber
          label="W"
          value={selectedElement.width}
          min={16}
          onCommit={(value) => updateSelected({ width: value })}
        />
        <LiveNumber
          label="H"
          value={selectedElement.height}
          min={16}
          onCommit={(value) => updateSelected({ height: value })}
        />
      </div>

      <LiveNumber
        label="Rotation"
        value={Number(selectedElement.rotation.toFixed(1))}
        onCommit={(value) => updateSelected({ rotation: value })}
      />

      <OpacityField />

      {isGraphicElement(selectedElement) ? (
        <Field label="Color">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={selectedElement.color}
              onChange={(event) => updateSelected({ color: event.target.value })}
              className="h-8 w-8 cursor-pointer rounded border border-line bg-studio"
              aria-label="Element color"
            />
            <span className="font-mono text-[12px] text-mute">{selectedElement.color}</span>
          </div>
        </Field>
      ) : null}

      {isTextElement(selectedElement) ? (
        <>
          <TextContentField />
          <Field label="Color">
            <input
              type="color"
              value={selectedElement.color}
              onChange={(event) => updateSelected({ color: event.target.value })}
              className="h-8 w-8 cursor-pointer rounded border border-line bg-studio"
              aria-label="Text color"
            />
          </Field>
        </>
      ) : null}

      <div className="flex gap-2">
        <Button className="flex-1" onClick={() => moveSelectedLayer('backward')}>
          Backward
        </Button>
        <Button className="flex-1" onClick={() => moveSelectedLayer('forward')}>
          Forward
        </Button>
      </div>

      <Button className="w-full" onClick={removeSelected}>
        Remove element
      </Button>
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
      <input
        value={draft.text}
        onChange={(event) =>
          setDraft((current) => ({ ...current, text: event.target.value }))
        }
        onBlur={() => {
          if (draft.text !== selectedElement.content) {
            updateSelected({ content: draft.text })
          }
        }}
        className="h-8 w-full rounded-md border border-line bg-studio px-2 text-[12px] text-ink outline-none focus:border-accent/50"
      />
    </Field>
  )
}

function LiveNumber({
  label,
  value,
  min,
  onCommit,
}: {
  label: string
  value: number
  min?: number
  onCommit: (value: number) => void
}) {
  const [draft, setDraft] = useState({ value, text: String(Math.round(value)) })

  if (draft.value !== value) {
    setDraft({ value, text: String(Math.round(value)) })
  }

  return (
    <NumberField
      label={label}
      value={draft.text}
      onChange={(event) =>
        setDraft((current) => ({ ...current, text: event.target.value }))
      }
      onBlur={() => {
        const next = Number(draft.text)
        if (Number.isFinite(next)) {
          onCommit(min === undefined ? next : Math.max(min, next))
        } else {
          setDraft({ value, text: String(Math.round(value)) })
        }
      }}
    />
  )
}
