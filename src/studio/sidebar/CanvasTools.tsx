import { useCanvasEditor } from '@/studio/canvasEditorContext'

export function CanvasTools() {
  const { gridVisible, snapToGrid, setGridVisible, setSnapToGrid } = useCanvasEditor()

  return (
    <section className="space-y-2" data-canvas-section="true">
      <ToggleRow
        label="Grid"
        pressed={gridVisible}
        dataAttr="data-toggle-grid"
        onChange={setGridVisible}
      />
      <ToggleRow
        label="Snap"
        pressed={snapToGrid}
        dataAttr="data-toggle-snap"
        onChange={setSnapToGrid}
      />
      <p className="text-[11px] leading-4 text-mute">Print area, safe area, and guides are on the canvas bar.</p>
    </section>
  )
}

function ToggleRow({
  label,
  pressed,
  dataAttr,
  onChange,
}: {
  label: string
  pressed: boolean
  dataAttr: 'data-toggle-grid' | 'data-toggle-snap'
  onChange: (value: boolean) => void
}) {
  return (
    <label className="flex items-center justify-between text-[12px] text-ink">
      <span>{label}</span>
      <input
        type="checkbox"
        {...{ [dataAttr]: 'true' }}
        checked={pressed}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  )
}
