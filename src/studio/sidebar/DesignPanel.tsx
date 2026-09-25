import { ACCEPTED_IMAGE_ACCEPT } from '@/design/ingestImage'
import { moveDesignObjectLayer } from '@/design/designObjects'
import {
  getDesignObjectsInZone,
  objectDisplayName,
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
    selectedObjectIds,
    selectObject,
    setActiveZone,
    addDesignText,
    addDesignShape,
    addDesignImageFromFile,
    removeObjectById,
    duplicateSelectedObject,
    updateObjectById,
    applyDocument,
  } = useDesign()
  const { gridVisible, snapToGrid, setGridVisible, setSnapToGrid } = useCanvasEditor()
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const zone = resolveActiveZone(document)
  const objects = getDesignObjectsInZone(document, zone, true)
  const garmentZones = zonesForGarment(document.garmentType)

  return (
    <div className="space-y-5" data-design-panel="true">
      <section className="space-y-2" data-design-section="true">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-mute">Design</div>
        <div className="grid grid-cols-1 gap-1.5">
          <Button variant="accent" className="w-full" data-add-design-text="true" onClick={addDesignText}>
            Add text
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
            {busy ? 'Uploading…' : 'Add logo / image'}
          </Button>
          <Button className="w-full" data-add-design-shape="true" onClick={addDesignShape}>
            Add shape
          </Button>
        </div>
        {error ? <p className="text-[12px] text-accent">{error}</p> : null}
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

      <section className="space-y-2" data-layers-section="true">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-mute">Layers</div>
        {objects.length === 0 ? (
          <p className="text-[12px] leading-5 text-mute">
            No artwork on {PLACEMENT_ZONE_LABELS[zone]} yet.
          </p>
        ) : (
          <ul className="space-y-1">
            {[...objects].reverse().map((object, order) => {
              const selected = selectedObjectIds.includes(object.id)
              const layerOrder = objects.length - order
              const renaming = editingId === object.id
              return (
                <li key={object.id}>
                  <div
                    className={`flex items-center gap-1 rounded-md border px-1.5 py-1 ${
                      selected ? 'border-accent/50 bg-accent/10' : 'border-line'
                    }`}
                    data-layer-row={object.id}
                    data-layer-selected={selected ? 'true' : 'false'}
                    data-layer-order={layerOrder}
                    data-layer-group={object.groupId ?? ''}
                  >
                    <button
                      type="button"
                      data-layer-visibility={object.id}
                      aria-pressed={object.visible}
                      title={object.visible ? 'Hide' : 'Show'}
                      aria-label={object.visible ? 'Hide' : 'Show'}
                      onClick={() => updateObjectById(object.id, { visible: !object.visible })}
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-mute hover:text-ink"
                    >
                      {object.visible ? <EyeIcon /> : <EyeOffIcon />}
                    </button>
                    {renaming ? (
                      <input
                        data-layer-rename={object.id}
                        autoFocus
                        defaultValue={objectDisplayName(object)}
                        onBlur={(event) => {
                          const name = event.target.value.trim()
                          if (name) {
                            updateObjectById(object.id, { name })
                          }
                          setEditingId(null)
                        }}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.currentTarget.blur()
                          }
                          if (event.key === 'Escape') {
                            setEditingId(null)
                          }
                        }}
                        className="h-6 min-w-0 flex-1 rounded border border-line bg-studio px-1 text-[12px] text-ink"
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={(event) => selectObject(object.id, { toggle: event.shiftKey })}
                        onDoubleClick={() => setEditingId(object.id)}
                        className="min-w-0 flex-1 truncate text-left text-[12px] text-ink"
                        data-layer-name={object.id}
                        title={`${objectDisplayName(object)} — double-click to rename`}
                      >
                        {objectDisplayName(object)}
                      </button>
                    )}
                    <button
                      type="button"
                      title="Bring forward"
                      aria-label="Bring forward"
                      onClick={() => applyDocument(moveDesignObjectLayer(document, object.id, 'forward'))}
                      className="flex h-6 w-5 items-center justify-center text-[10px] text-mute hover:text-ink"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      title="Send backward"
                      aria-label="Send backward"
                      onClick={() => applyDocument(moveDesignObjectLayer(document, object.id, 'backward'))}
                      className="flex h-6 w-5 items-center justify-center text-[10px] text-mute hover:text-ink"
                    >
                      ▼
                    </button>
                    <button
                      type="button"
                      data-layer-lock={object.id}
                      aria-pressed={object.locked}
                      title={object.locked ? 'Unlock' : 'Lock'}
                      aria-label={object.locked ? 'Unlock' : 'Lock'}
                      onClick={() => updateObjectById(object.id, { locked: !object.locked })}
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded ${
                        object.locked ? 'text-accent' : 'text-mute hover:text-ink'
                      }`}
                    >
                      {object.locked ? <LockIcon /> : <UnlockIcon />}
                    </button>
                  </div>
                  {selected && selectedObjectIds.length === 1 ? (
                    <div className="mt-1 flex flex-wrap gap-1 px-1">
                      <MiniButton onClick={duplicateSelectedObject}>Duplicate</MiniButton>
                      <MiniButton onClick={() => removeObjectById(object.id)}>Delete</MiniButton>
                    </div>
                  ) : null}
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section className="space-y-2" data-placement-section="true">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-mute">Panel</div>
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
      </section>
    </div>
  )
}

function MiniButton({ children, onClick }: { children: string; onClick: () => void }) {
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

function EyeIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M1.5 8s2.4-4.5 6.5-4.5S14.5 8 14.5 8s-2.4 4.5-6.5 4.5S1.5 8 1.5 8Z" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="8" cy="8" r="1.8" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 2.5 14 13.5M4 5.2C2.7 6.2 1.5 8 1.5 8s2.4 4.5 6.5 4.5c1 0 1.9-.2 2.7-.6M12 10.7c1.2-1 2.5-2.7 2.5-2.7S12.1 3.5 8 3.5c-.6 0-1.1.1-1.6.2" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="3.5" y="7" width="9" height="6.5" rx="1.2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5.5 7V5.2a2.5 2.5 0 0 1 5 0V7" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}

function UnlockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="3.5" y="7" width="9" height="6.5" rx="1.2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5.5 7V5.2a2.5 2.5 0 0 1 4.6-1.4" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}
