import type { StudioSectionId } from '@/studio/editorChrome'
import type { ReactNode } from 'react'

export function StudioAccordion({
  id,
  label,
  open,
  onOpen,
  onToggle,
  children,
}: {
  id: StudioSectionId
  label: string
  open: boolean
  onOpen: () => void
  onToggle: () => void
  children: ReactNode
}) {
  return (
    <section data-studio-section={id} data-section-open={open ? 'true' : 'false'}>
      <div className="flex h-8 items-center justify-between">
        <button
          type="button"
          aria-label={label}
          aria-expanded={open}
          aria-pressed={open}
          onClick={onOpen}
          className="rounded-md px-1 text-left text-[10px] font-medium uppercase tracking-[0.16em] text-mute hover:text-ink"
        >
          {label}
        </button>
        <button
          type="button"
          aria-label={open ? `Collapse ${label}` : `Expand ${label}`}
          onClick={onToggle}
          className="flex h-6 w-6 items-center justify-center rounded text-[10px] text-mute hover:bg-panel-hover hover:text-ink"
        >
          {open ? '▾' : '▸'}
        </button>
      </div>
      <div className={open ? 'mt-2' : 'hidden'}>{children}</div>
    </section>
  )
}
