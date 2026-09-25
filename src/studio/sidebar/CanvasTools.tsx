import { useCanvasEditor } from '@/studio/canvasEditorContext'

export function CanvasTools() {
  const {
    gridVisible,
    snapToGrid,
    setGridVisible,
    setSnapToGrid,
    showPrintArea,
    showSafeAreas,
    showGuides,
    setShowPrintArea,
    setShowSafeAreas,
    setShowGuides,
  } = useCanvasEditor()

  return (
    <section className="space-y-2" data-studio-section="canvas" data-canvas-section="true">
      <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-mute">Canvas</div>
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
      <div className="flex flex-wrap gap-1 pt-1">
        <GuideChip
          pressed={showPrintArea}
          label="Print area"
          dataAttr="print-area"
          onClick={() => setShowPrintArea(!showPrintArea)}
        />
        <GuideChip
          pressed={showSafeAreas}
          label="Safe area"
          dataAttr="safe-area"
          onClick={() => setShowSafeAreas(!showSafeAreas)}
        />
        <GuideChip
          pressed={showGuides}
          label="Guides"
          dataAttr="guides"
          onClick={() => setShowGuides(!showGuides)}
        />
      </div>
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

function GuideChip({
  pressed,
  label,
  dataAttr,
  onClick,
}: {
  pressed: boolean
  label: string
  dataAttr: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      data-guide-toggle={dataAttr}
      aria-pressed={pressed}
      title={label}
      onClick={onClick}
      className={`h-7 rounded-md border px-2 text-[11px] ${
        pressed ? 'border-accent/40 bg-accent/10 text-ink' : 'border-line text-mute hover:text-ink'
      }`}
    >
      {label}
    </button>
  )
}
