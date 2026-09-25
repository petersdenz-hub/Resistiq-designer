import {
  objectsSharePlacement,
  type Alignment,
  type Distribution,
} from '@/design/objectEditing'
import { useDesign } from '@/design/useDesign'
import { Button } from '@/ui'
import { useState, type ReactNode } from 'react'

export function EditToolbar() {
  const {
    selectedObjects,
    groupSelectedObjects,
    ungroupSelectedObjects,
    duplicateSelectedObject,
    alignSelectedObjects,
    distributeSelectedObjects,
    removeSelected,
  } = useDesign()
  const [open, setOpen] = useState<'align' | 'distribute' | null>(null)

  if (selectedObjects.length === 0) {
    return null
  }

  const unlocked = selectedObjects.filter((object) => !object.locked)
  const canGroup = unlocked.length >= 2 && objectsSharePlacement(unlocked)
  const canUngroup = selectedObjects.some((object) => object.groupId)
  const canAlign = unlocked.length >= 2
  const canDistribute = unlocked.length >= 3
  const canDelete = unlocked.length > 0

  return (
    <div
      className="flex flex-wrap items-center gap-1 rounded-md border border-line bg-panel/95 px-2 py-1.5"
      data-edit-toolbar="true"
      data-selected-count={selectedObjects.length}
    >
      <span className="mr-1 text-[10px] uppercase tracking-[0.12em] text-mute">
        {selectedObjects.length} selected
      </span>
      <ToolButton data-action="group" disabled={!canGroup} onClick={groupSelectedObjects}>
        Group
      </ToolButton>
      <ToolButton data-action="ungroup" disabled={!canUngroup} onClick={ungroupSelectedObjects}>
        Ungroup
      </ToolButton>
      <ToolButton data-action="duplicate" onClick={duplicateSelectedObject}>
        Duplicate
      </ToolButton>
      <div className="relative">
        <ToolButton
          data-action="align"
          disabled={!canAlign}
          onClick={() => setOpen((value) => (value === 'align' ? null : 'align'))}
        >
          Align
        </ToolButton>
        {open === 'align' && canAlign ? (
          <Menu>
            <AlignButton alignment="left" label="Left" onPick={alignSelectedObjects} close={() => setOpen(null)} />
            <AlignButton alignment="center" label="Center" onPick={alignSelectedObjects} close={() => setOpen(null)} />
            <AlignButton alignment="right" label="Right" onPick={alignSelectedObjects} close={() => setOpen(null)} />
            <AlignButton alignment="top" label="Top" onPick={alignSelectedObjects} close={() => setOpen(null)} />
            <AlignButton alignment="middle" label="Middle" onPick={alignSelectedObjects} close={() => setOpen(null)} />
            <AlignButton alignment="bottom" label="Bottom" onPick={alignSelectedObjects} close={() => setOpen(null)} />
          </Menu>
        ) : null}
      </div>
      <div className="relative">
        <ToolButton
          data-action="distribute"
          disabled={!canDistribute}
          onClick={() => setOpen((value) => (value === 'distribute' ? null : 'distribute'))}
        >
          Distribute
        </ToolButton>
        {open === 'distribute' && canDistribute ? (
          <Menu>
            <DistributeButton axis="horizontal" label="Horizontal" onPick={distributeSelectedObjects} close={() => setOpen(null)} />
            <DistributeButton axis="vertical" label="Vertical" onPick={distributeSelectedObjects} close={() => setOpen(null)} />
          </Menu>
        ) : null}
      </div>
      <ToolButton data-action="delete" disabled={!canDelete} onClick={removeSelected}>
        Delete
      </ToolButton>
    </div>
  )
}

function ToolButton({
  children,
  onClick,
  disabled,
  ...props
}: {
  children: string
  onClick: () => void
  disabled?: boolean
  'data-action': string
}) {
  return (
    <Button
      variant="quiet"
      disabled={disabled}
      onClick={onClick}
      className="h-7 px-2 text-[11px]"
      {...props}
    >
      {children}
    </Button>
  )
}

function Menu({ children }: { children: ReactNode }) {
  return (
    <div className="absolute left-0 top-full z-20 mt-1 min-w-28 rounded-md border border-line bg-panel p-1 shadow-lg">
      {children}
    </div>
  )
}

function AlignButton({
  alignment,
  label,
  onPick,
  close,
}: {
  alignment: Alignment
  label: string
  onPick: (alignment: Alignment) => void
  close: () => void
}) {
  return (
    <button
      type="button"
      data-align={alignment}
      onClick={() => {
        onPick(alignment)
        close()
      }}
      className="block h-7 w-full rounded px-2 text-left text-[11px] text-ink hover:bg-accent/10"
    >
      {label}
    </button>
  )
}

function DistributeButton({
  axis,
  label,
  onPick,
  close,
}: {
  axis: Distribution
  label: string
  onPick: (axis: Distribution) => void
  close: () => void
}) {
  return (
    <button
      type="button"
      data-distribute={axis}
      onClick={() => {
        onPick(axis)
        close()
      }}
      className="block h-7 w-full rounded px-2 text-left text-[11px] text-ink hover:bg-accent/10"
    >
      {label}
    </button>
  )
}
