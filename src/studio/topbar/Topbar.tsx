import { useDesign } from '@/design/useDesign'
import { EXPORT_AVAILABLE } from '@/export'
import { Button, RedoIcon, UndoIcon } from '@/ui'
import { useState } from 'react'

export function Topbar() {
  const { document, canUndo, canRedo, undo, redo, renameDesign } = useDesign()
  const [nameDraft, setNameDraft] = useState({
    committed: document.name,
    text: document.name,
  })

  if (nameDraft.committed !== document.name) {
    setNameDraft({ committed: document.name, text: document.name })
  }

  return (
    <header className="grid h-14 shrink-0 grid-cols-[1fr_minmax(12rem,22rem)_1fr] items-center border-b border-line bg-panel px-4">
      <div className="flex items-center gap-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent/15 text-[13px] font-semibold text-accent">
          R
        </div>
        <div>
          <div className="text-[13px] font-semibold tracking-wide text-ink">
            Resistiq Designer
          </div>
          <div className="text-[10px] uppercase tracking-[0.16em] text-mute">
            In memory only
          </div>
        </div>
      </div>

      <input
        value={nameDraft.text}
        onChange={(event) =>
          setNameDraft((current) => ({ ...current, text: event.target.value }))
        }
        onBlur={() => {
          const next = nameDraft.text.trim()
          if (next && next !== document.name) {
            renameDesign(next)
          } else {
            setNameDraft({ committed: document.name, text: document.name })
          }
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.currentTarget.blur()
          }
        }}
        aria-label="Design name"
        className="h-8 w-full rounded-md border border-transparent bg-transparent px-3 text-center text-[13px] font-medium text-ink outline-none hover:border-line focus:border-accent/40 focus:bg-studio"
      />

      <div className="flex items-center justify-end gap-2">
        <Button onClick={undo} disabled={!canUndo} aria-label="Undo">
          <UndoIcon />
          Undo
        </Button>
        <Button onClick={redo} disabled={!canRedo} aria-label="Redo">
          <RedoIcon />
          Redo
        </Button>
        <div className="mx-1 h-5 w-px bg-line" />
        <Button disabled title="Saving is not available yet. Designs exist only in this session.">
          Save
        </Button>
        <Button disabled title="Preview rendering is not available yet.">
          Preview
        </Button>
        <Button
          variant="accent"
          disabled={!EXPORT_AVAILABLE}
          title="Export is not available yet. Designs stay as structured data."
        >
          Export
        </Button>
      </div>
    </header>
  )
}
