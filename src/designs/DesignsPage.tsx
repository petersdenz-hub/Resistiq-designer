import { deleteDesign, duplicateDesign, getDesign, listDesigns } from '@/persistence/designRepository'
import type { SavedDesignSummary } from '@/persistence/designRepository'
import type { DesignDocument } from '@/design/types'
import { getGarment } from '@/garments/registry'
import { Button, ConfirmDialog } from '@/ui'
import { useState } from 'react'

interface DesignsPageProps {
  onOpen: (document: DesignDocument) => void
  onRequestNew: () => void
}

export function DesignsPage({ onOpen, onRequestNew }: DesignsPageProps) {
  const [designs, setDesigns] = useState(listDesigns)
  const [pendingDelete, setPendingDelete] = useState<SavedDesignSummary | null>(null)

  function refresh() {
    setDesigns(listDesigns())
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-studio text-ink">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-line bg-panel px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent/15 text-[13px] font-semibold text-accent">
            R
          </div>
          <div>
            <div className="text-[13px] font-semibold tracking-wide">Resistiq Designer</div>
            <div className="text-[10px] uppercase tracking-[0.16em] text-mute">Designs</div>
          </div>
        </div>
        <Button variant="accent" onClick={onRequestNew}>
          New design
        </Button>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-8">
        {designs.length === 0 ? (
          <div className="mx-auto flex max-w-md flex-col items-center pt-24 text-center">
            <div className="text-[16px] font-medium">No designs yet</div>
            <p className="mt-2 text-[13px] leading-5 text-mute">
              Choose a garment, add text or a logo, then save it. Designs stay in this browser for now.
            </p>
            <Button className="mt-5" variant="accent" onClick={onRequestNew}>
              Create your first design
            </Button>
          </div>
        ) : (
          <ul className="mx-auto grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {designs.map((design) => (
              <li key={design.id}>
                <DesignCard
                  design={design}
                  onOpen={() => {
                    const saved = getDesign(design.id)
                    if (saved) {
                      onOpen(saved.document)
                    }
                  }}
                  onDuplicate={() => {
                    const copy = duplicateDesign(design.id)
                    refresh()
                    if (copy) {
                      onOpen(copy.document)
                    }
                  }}
                  onDelete={() => setPendingDelete(design)}
                />
              </li>
            ))}
          </ul>
        )}
      </main>

      {pendingDelete ? (
        <ConfirmDialog
          title="Delete design"
          message={`Delete “${pendingDelete.name}”? This removes the saved design. Image files are removed only if no other design uses them.`}
          confirmLabel="Delete"
          onCancel={() => setPendingDelete(null)}
          onConfirm={() => {
            void deleteDesign(pendingDelete.id).then(() => {
              setPendingDelete(null)
              refresh()
            })
          }}
        />
      ) : null}
    </div>
  )
}

function DesignCard({
  design,
  onOpen,
  onDuplicate,
  onDelete,
}: {
  design: SavedDesignSummary
  onOpen: () => void
  onDuplicate: () => void
  onDelete: () => void
}) {
  const garment = getGarment(design.garmentType)
  const updated = new Date(design.updatedAt).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <article className="overflow-hidden rounded-xl border border-line bg-panel">
      <button type="button" onClick={onOpen} className="block w-full">
        <div className="flex h-44 items-center justify-center bg-canvas">
          {design.thumbnail ? (
            <img src={design.thumbnail} alt="" className="h-full w-full object-contain" />
          ) : (
            <div
              className="h-24 w-20 rounded-md border border-line"
              style={{ backgroundColor: design.bodyColor }}
            />
          )}
        </div>
      </button>
      <div className="space-y-3 px-3 py-3">
        <div>
          <div className="truncate text-[13px] font-medium">{design.name}</div>
          <div className="mt-0.5 text-[11px] text-mute">
            {garment.label} · {updated}
          </div>
        </div>
        <div className="flex gap-2">
          <Button className="flex-1" variant="accent" onClick={onOpen}>
            Open
          </Button>
          <Button onClick={onDuplicate}>Duplicate</Button>
          <Button onClick={onDelete}>Delete</Button>
        </div>
      </div>
    </article>
  )
}
