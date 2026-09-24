import { ACCEPTED_IMAGE_ACCEPT } from '@/design/ingestImage'
import {
  getDesignObjectsInZone,
  PLACEMENT_ZONE_LABELS,
  resolveActiveZone,
  zonesForGarment,
} from '@/design'
import { useDesign } from '@/design/useDesign'
import { useCanvasEditor } from '@/studio/canvasEditorContext'
import { Button } from '@/ui'
import { useRef, useState } from 'react'

export function DesignPanel() {
  const {
    document,
    selectedObjectId,
    selectObject,
    setActiveZone,
    addDesignText,
    addDesignShape,
    addDesignImageFromFile,
    removeObjectById,
    duplicateSelectedObject,
    updateObjectById,
    moveSelectedObjectLayer,
  } = useDesign()
  const { gridVisible, snapToGrid, setGridVisible, setSnapToGrid } = useCanvasEditor()
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const zone = resolveActiveZone(document)
  const zones = zonesForGarment(document.garmentType)
  const objects = getDesignObjectsInZone(document, zone, true)

  return (
    <div className="space-y-5" data-design-panel="true">
      <p className="text-[12px] leading-5 text-mute">
        Artwork lives on the Design Document as design objects. Construction stays on the garment.
      </p>

      <section className="space-y-2">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-mute">Placement</div>
        <div className="flex flex-wrap gap-1">
          {zones.map((item) => {
            const selected = item === zone
            return (
              <button
                key={item}
                type="button"
                data-zone-option={item}
                aria-pressed={selected}
                onClick={() => setActiveZone(item)}
                className={`h-7 rounded-md border px-2 text-[11px] ${
                  selected
                    ? 'border-accent/50 bg-accent/10 text-ink'
                    : 'border-line text-mute hover:text-ink'
                }`}
              >
                {PLACEMENT_ZONE_LABELS[item]}
              </button>
            )
          })}
        </div>
      </section>

      <section className="space-y-2">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-mute">Add</div>
        <div className="grid grid-cols-1 gap-1.5">
          <Button variant="accent" className="w-full" data-add-design-text="true" onClick={addDesignText}>
            Add text
          </Button>
          <Button className="w-full" data-add-design-shape="true" onClick={addDesignShape}>
            Add shape
          </Button>
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
              void addDesignImageFromFile(file).then((message) => {
                setBusy(false)
                setError(message)
              })
            }}
          />
          <Button
            className="w-full"
            data-add-design-image="true"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            {busy ? 'Uploading…' : 'Add image'}
          </Button>
        </div>
        {error ? <p className="text-[12px] text-accent">{error}</p> : null}
      </section>

      <section className="space-y-2">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-mute">Canvas</div>
        <label className="flex items-center justify-between text-[12px] text-ink">
          <span>Grid</span>
          <input
            type="checkbox"
            data-toggle-grid="true"
            checked={gridVisible}
            onChange={(event) => setGridVisible(event.target.checked)}
          />
        </label>
        <label className="flex items-center justify-between text-[12px] text-ink">
          <span>Snap</span>
          <input
            type="checkbox"
            data-toggle-snap="true"
            checked={snapToGrid}
            onChange={(event) => setSnapToGrid(event.target.checked)}
          />
        </label>
      </section>

      <section className="space-y-2">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-mute">Layers</div>
        {objects.length === 0 ? (
          <p className="text-[12px] leading-5 text-mute">No design objects on {PLACEMENT_ZONE_LABELS[zone]} yet.</p>
        ) : (
          <ul className="space-y-1.5">
            {[...objects].reverse().map((object) => {
              const selected = object.id === selectedObjectId
              return (
                <li key={object.id}>
                  <div
                    className={`rounded-md border px-2 py-1.5 ${
                      selected ? 'border-accent/50 bg-accent/10' : 'border-line'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => selectObject(object.id)}
                      className="block w-full text-left text-[12px] capitalize text-ink"
                    >
                      {object.type === 'text' ? object.content || 'Text' : object.type}
                      <span className="mt-0.5 block text-[10px] text-mute">
                        {object.visible ? 'Visible' : 'Hidden'}
                        {object.locked ? ' · locked' : ''}
                      </span>
                    </button>
                    {selected ? (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        <MiniButton onClick={() => updateObjectById(object.id, { visible: !object.visible })}>
                          {object.visible ? 'Hide' : 'Show'}
                        </MiniButton>
                        <MiniButton onClick={() => updateObjectById(object.id, { locked: !object.locked })}>
                          {object.locked ? 'Unlock' : 'Lock'}
                        </MiniButton>
                        <MiniButton onClick={duplicateSelectedObject}>Duplicate</MiniButton>
                        <MiniButton onClick={() => moveSelectedObjectLayer('forward')}>Up</MiniButton>
                        <MiniButton onClick={() => moveSelectedObjectLayer('backward')}>Down</MiniButton>
                        <MiniButton onClick={() => removeObjectById(object.id)}>Delete</MiniButton>
                      </div>
                    ) : null}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}

function MiniButton({
  children,
  onClick,
}: {
  children: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-6 rounded border border-line px-1.5 text-[10px] text-mute hover:text-ink"
    >
      {children}
    </button>
  )
}
