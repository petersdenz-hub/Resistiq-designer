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
    <header className="relative flex min-h-14 shrink-0 flex-wrap items-center gap-2 border-b border-line bg-panel px-3 py-2 lg:grid lg:h-14 lg:grid-cols-[1fr_minmax(10rem,22rem)_1fr] lg:flex-nowrap lg:py-0">
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

      <div className="flex min-w-0 flex-1 items-center justify-center gap-2">
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
          className="h-8 w-full max-w-xs rounded-md border border-transparent bg-transparent px-3 text-center text-[13px] font-medium text-ink outline-none hover:border-line focus:border-accent/40 focus:bg-studio"
        />
        <span
          data-save-status={dirty ? 'unsaved' : 'saved'}
          className="hidden shrink-0 text-[10px] uppercase tracking-[0.12em] text-mute sm:inline"
        >
          {dirty ? 'Unsaved' : 'Saved'}
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button onClick={undo} disabled={!canUndo} aria-label="Undo">
          <UndoIcon />
          <span className="hidden sm:inline">Undo</span>
        </Button>
        <Button onClick={redo} disabled={!canRedo} aria-label="Redo">
          <RedoIcon />
          <span className="hidden sm:inline">Redo</span>
        </Button>
        <div className="mx-1 hidden h-5 w-px bg-line sm:block" />
        <Button onClick={() => requestSave('save')} title="Save this design">
          Save
        </Button>
        <Button onClick={() => requestSave('save-as')} title="Save a copy of this design">
          Save as
        </Button>
        <Button onClick={onPreview}>Preview</Button>
        <span className="hidden md:inline-flex">
          <Button
            variant="accent"
            disabled={!EXPORT_AVAILABLE}
            title="Export is not available yet."
          >
            Export
          </Button>
        </span>
      </div>

      {toast ? (
        <div className="pointer-events-none absolute left-1/2 top-16 z-20 -translate-x-1/2 rounded-md border border-accent/40 bg-panel px-3 py-1.5 text-[12px] text-ink">
          {toast}
        </div>
      ) : null}

      {namePrompt ? (
        <Dialog
          title={namePrompt === 'save-as' ? 'Save a copy' : 'Name this design'}
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
