import { useDesign } from '@/design/useDesign'

export function ViewToggle({ className = '' }: { className?: string }) {
  const { document, setActiveView } = useDesign()

  return (
    <div className={`flex rounded-md border border-line p-0.5 ${className}`} data-view-toggle="true">
      {document.views.map((view) => (
        <button
          key={view.id}
          type="button"
          data-garment-view={view.id}
          aria-pressed={document.activeView === view.id}
          onClick={() => setActiveView(view.id)}
          className={`h-7 rounded px-2.5 text-[11px] ${
            document.activeView === view.id
              ? 'bg-accent/15 text-ink'
              : 'text-mute hover:bg-panel-hover hover:text-ink'
          }`}
        >
          {view.label}
        </button>
      ))}
    </div>
  )
}
