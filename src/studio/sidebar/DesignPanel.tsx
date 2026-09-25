import { ACCEPTED_IMAGE_ACCEPT } from '@/design/ingestImage'
import {
  getDesignObjectsInZone,
  objectDisplayName,
  objectsSharePlacement,
  PLACEMENT_ZONE_LABELS,
  PLACEMENT_ZONES,
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
    selectedObjectIds,
    selectObject,
    setActiveZone,
    addDesignText,
    addDesignShape,
    addDesignImageFromFile,
    removeObjectById,
    removeSelected,
    duplicateSelectedObject,
    updateObjectById,
    moveSelectedObjectLayer,
    groupSelectedObjects,
    ungroupSelectedObjects,
  } = useDesign()
  const { gridVisible, snapToGrid, setGridVisible, setSnapToGrid } = useCanvasEditor()
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const zone = resolveActiveZone(document)
  const garmentZones = new Set(zonesForGarment(document.garmentType))
  const objects = getDesignObjectsInZone(document, zone, true)
  const selectedObjects = objects.filter((object) => selectedObjectIds.includes(object.id))
  const canGroup =
    selectedObjects.filter((object) => !object.locked).length >= 2 &&
    objectsSharePlacement(selectedObjects.filter((object) => !object.locked))
  const canUngroup = selectedObjects.some((object) => object.groupId)

  return (
    <div className="space-y-5" data-design-panel="true">
      <p className="text-[12px] leading-5 text-mute">
        Artwork lives on the Design Document as design objects. Construction stays on the garment.
      </p>

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
            No design objects on {PLACEMENT_ZONE_LABELS[zone]} yet.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {[...objects].reverse().map((object, order) => {
              const selected = selectedObjectIds.includes(object.id)
              const layerOrder = objects.length - order
              return (
                <li key={object.id}>
                  <div
                    className={`rounded-md border px-2 py-1.5 ${
                      selected ? 'border-accent/50 bg-accent/10' : 'border-line'
                    }`}
                    data-layer-row={object.id}
                    data-layer-selected={selected ? 'true' : 'false'}
                    data-layer-order={layerOrder}
                    data-layer-group={object.groupId ?? ''}
                  >
                    <div className="flex items-start gap-1">
                      <button
                        type="button"
                        data-layer-visibility={object.id}
                        aria-pressed={object.visible}
                        title={object.visible ? 'Hide' : 'Show'}
                        onClick={() => updateObjectById(object.id, { visible: !object.visible })}
                        className="mt-0.5 h-6 w-6 shrink-0 rounded border border-line text-[10px] text-mute hover:text-ink"
                      >
                        {object.visible ? 'V' : 'H'}
                      </button>
                      <button
                        type="button"
                        data-layer-lock={object.id}
                        aria-pressed={object.locked}
                        title={object.locked ? 'Unlock' : 'Lock'}
                        onClick={() => updateObjectById(object.id, { locked: !object.locked })}
                        className="mt-0.5 h-6 w-6 shrink-0 rounded border border-line text-[10px] text-mute hover:text-ink"
                      >
                        {object.locked ? 'L' : 'U'}
                      </button>
                      <button
                        type="button"
                        onClick={(event) =>
                          selectObject(object.id, { toggle: event.shiftKey })
                        }
                        className="min-w-0 flex-1 text-left text-[12px] text-ink"
                        data-layer-name={object.id}
                        title={objectDisplayName(object)}
                      >
                        {objectDisplayName(object)}
                        <span className="mt-0.5 block text-[10px] text-mute">
                          {object.type}
                          {object.visible ? ' · visible' : ' · hidden'}
                          {object.locked ? ' · locked' : ''}
                          {object.groupId ? ' · group' : ''}
                          {` · ${layerOrder}`}
                        </span>
                      </button>
                    </div>
                    {selected && object.id === selectedObjectId ? (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        <MiniButton onClick={() => moveSelectedObjectLayer('forward')}>Forward</MiniButton>
                        <MiniButton onClick={() => moveSelectedObjectLayer('backward')}>Back</MiniButton>
                        <MiniButton onClick={() => moveSelectedObjectLayer('front')}>Front</MiniButton>
                        <MiniButton onClick={() => moveSelectedObjectLayer('back')}>To back</MiniButton>
                        <MiniButton onClick={duplicateSelectedObject}>Duplicate</MiniButton>
                        <MiniButton onClick={() => removeObjectById(object.id)}>Delete</MiniButton>
                        <MiniButton disabled={!canGroup} onClick={groupSelectedObjects}>
                          Group
                        </MiniButton>
                        <MiniButton disabled={!canUngroup} onClick={ungroupSelectedObjects}>
                          Ungroup
                        </MiniButton>
                      </div>
                    ) : null}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
        {selectedObjectIds.length > 1 ? (
          <button
            type="button"
            className="text-[11px] text-mute hover:text-ink"
            onClick={removeSelected}
          >
            Delete selected
          </button>
        ) : null}
      </section>

      <section className="space-y-2" data-placement-section="true">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-mute">Placement</div>
        <div className="flex flex-wrap gap-1">
          {PLACEMENT_ZONES.map((item) => {
            const selected = item === zone
            const typical = garmentZones.has(item)
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
                    : typical
                      ? 'border-line text-mute hover:text-ink'
                      : 'border-line/70 text-mute/70 hover:text-ink'
                }`}
              >
                {PLACEMENT_ZONE_LABELS[item]}
              </button>
            )
          })}
        </div>
        <p className="text-[11px] leading-4 text-mute">
          Front and back are separate artwork surfaces. Sleeves and legs use a 2D overlay on their panel.
          Switching zones does not change objects on another zone.
        </p>
      </section>
    </div>
  )
}

function MiniButton({
  children,
  onClick,
  disabled,
}: {
  children: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="h-6 rounded border border-line px-1.5 text-[10px] text-mute hover:text-ink disabled:opacity-35"
    >
      {children}
    </button>
  )
}
