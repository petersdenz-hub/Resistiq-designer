import { createId } from '@/design/ids'
import { useDesign } from '@/design/useDesign'
import { EXPORT_AVAILABLE } from '@/export'
import { captureStageThumbnail } from '@/preview/captureThumbnail'
import { getDesign, needsDesignName, saveDesign } from '@/persistence/designRepository'
import { Button, Dialog, DialogActions, Field, RedoIcon, UndoIcon } from '@/ui'
import { useEffect, useState } from 'react'

interface TopbarProps {
  onClose: () => void
  onNew: () => void
  onPreview: () => void
}

export function Topbar({ onClose, onNew, onPreview }: TopbarProps) {
  const { document, canUndo, canRedo, undo, redo, hydrateDocument } = useDesign()
  const [nameDraft, setNameDraft] = useState({
    committed: document.name,
    text: document.name,
  })
  const [savedSnap, setSavedSnap] = useState(() => snapshotOf(getDesign(document.id)?.document ?? null))
  const [toast, setToast] = useState<string | null>(null)
  const [namePrompt, setNamePrompt] = useState<'save' | 'save-as' | null>(null)
  const [nameInput, setNameInput] = useState(document.name)
  const [leavePrompt, setLeavePrompt] = useState<'close' | 'new' | null>(null)

  if (nameDraft.committed !== document.name) {
    setNameDraft({ committed: document.name, text: document.name })
  }

  const dirty = snapshotOf(document) !== savedSnap

  useEffect(() => {
    if (!toast) {
      return
    }
    const timer = window.setTimeout(() => setToast(null), 2200)
    return () => window.clearTimeout(timer)
  }, [toast])

  async function persist(nextDocument = document) {
    const stage = window.document.getElementById('design-stage')
    const thumbnail = await captureStageThumbnail(
      stage instanceof SVGSVGElement ? stage : null,
    )
    const saved = saveDesign(nextDocument, thumbnail)
    hydrateDocument(saved.document)
    setSavedSnap(snapshotOf(saved.document))
    setToast('Design saved')
  }

  function requestSave(mode: 'save' | 'save-as') {
    if (mode === 'save-as' || needsDesignName(document.name)) {
      setNameInput(mode === 'save-as' ? copyLabel(document.name) : document.name.replace(/^untitled\s*/i, '').trim())
      setNamePrompt(mode)
      return
    }
    void persist()
  }

  function confirmName() {
    const name = nameInput.trim()
    if (!name) {
      return
    }
    const mode = namePrompt
    setNamePrompt(null)
    if (mode === 'save-as') {
      const now = new Date().toISOString()
      void persist({
        ...document,
        id: createId(),
        name,
        createdAt: now,
        updatedAt: now,
      })
      return
    }
    void persist({ ...document, name })
  }

  function requestLeave(action: 'close' | 'new') {
    if (dirty) {
      setLeavePrompt(action)
      return
    }
    if (action === 'new') {
      onNew()
    } else {
      onClose()
    }
  }

  return (
    <header className="relative grid h-14 shrink-0 grid-cols-[1fr_minmax(10rem,20rem)_1fr] items-center border-b border-line bg-panel px-3">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent/15 text-[13px] font-semibold text-accent">
          R
        </div>
        <Button variant="quiet" onClick={() => requestLeave('close')}>
          Designs
        </Button>
        <Button variant="quiet" onClick={() => requestLeave('new')}>
          New
        </Button>
      </div>

      <input
        value={nameDraft.text}
        onChange={(event) =>
          setNameDraft((current) => ({ ...current, text: event.target.value }))
        }
        onBlur={() => {
          const next = nameDraft.text.trim()
          if (next && next !== document.name) {
            hydrateDocument({ ...document, name: next, updatedAt: new Date().toISOString() })
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
        <Button onClick={() => requestSave('save')} title="Save this design in this browser">
          Save
        </Button>
        <Button onClick={() => requestSave('save-as')} title="Save a new copy with its own id">
          Save as
        </Button>
        <Button onClick={onPreview}>Preview</Button>
        <Button
          variant="accent"
          disabled={!EXPORT_AVAILABLE}
          title="Export is not available yet. Designs stay as structured data."
        >
          Export
        </Button>
      </div>

      {toast ? (
        <div className="pointer-events-none absolute left-1/2 top-16 z-20 -translate-x-1/2 rounded-md border border-accent/40 bg-panel px-3 py-1.5 text-[12px] text-ink">
          {toast}
        </div>
      ) : null}

      {namePrompt ? (
        <Dialog
          title={namePrompt === 'save-as' ? 'Save as' : 'Name this design'}
          onClose={() => setNamePrompt(null)}
        >
          <Field label="Design name">
            <input
              autoFocus
              value={nameInput}
              onChange={(event) => setNameInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  confirmName()
                }
              }}
              className="h-8 w-full rounded-md border border-line bg-studio px-2 text-[12px] text-ink outline-none focus:border-accent/50"
            />
          </Field>
          <DialogActions>
            <Button onClick={() => setNamePrompt(null)}>Cancel</Button>
            <Button variant="accent" onClick={confirmName} disabled={!nameInput.trim()}>
              Save
            </Button>
          </DialogActions>
        </Dialog>
      ) : null}

      {leavePrompt ? (
        <Dialog title="Leave without saving?" onClose={() => setLeavePrompt(null)}>
          <p className="text-[12px] leading-5 text-mute">
            This design has changes that are not saved. Saved designs will stay as they are.
          </p>
          <DialogActions>
            <Button onClick={() => setLeavePrompt(null)}>Stay</Button>
            <Button
              variant="accent"
              onClick={() => {
                const action = leavePrompt
                setLeavePrompt(null)
                if (action === 'new') {
                  onNew()
                } else {
                  onClose()
                }
              }}
            >
              Leave
            </Button>
          </DialogActions>
        </Dialog>
      ) : null}
    </header>
  )
}

function snapshotOf(document: { updatedAt: string; name: string; id: string } | null) {
  return document ? JSON.stringify(document) : ''
}

function copyLabel(name: string) {
  return name.endsWith(' copy') ? `${name} 2` : `${name} copy`
}
