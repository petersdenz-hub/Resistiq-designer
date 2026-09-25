import {
  objectsSharePlacement,
  type Alignment,
  type Distribution,
} from '@/design/objectEditing'
import { useDesign } from '@/design/useDesign'
import { toolbarMode } from '@/studio/editorChrome'
import { Button } from '@/ui'

export function EditToolbar() {
  const {
    selectedObjects,
    selectedObject,
    groupSelectedObjects,
    ungroupSelectedObjects,
    duplicateSelectedObject,
    alignSelectedObjects,
    distributeSelectedObjects,
    removeSelected,
    updateSelectedObject,
    moveSelectedObjectLayer,
  } = useDesign()
  const mode = toolbarMode(selectedObjects.length)
  const unlocked = selectedObjects.filter((object) => !object.locked)
  const canGroup = unlocked.length >= 2 && objectsSharePlacement(unlocked)
  const canUngroup = selectedObjects.some((object) => object.groupId)
  const canAlign = unlocked.length >= 2
  const canDistribute = unlocked.length >= 3
  const canMutate = unlocked.length > 0
  const locked = selectedObject?.locked === true

  return (
    <div
      className={`flex flex-wrap items-center gap-1 ${
        mode === 'empty' ? '' : 'rounded-md border border-line bg-panel/95 px-2 py-1.5'
      }`}
      data-edit-toolbar="true"
      data-toolbar-mode={mode}
      data-selected-count={selectedObjects.length}
    >
      {mode === 'single' ? (
        <>
          <ToolButton data-action="duplicate" disabled={locked} onClick={duplicateSelectedObject}>
            Duplicate
          </ToolButton>
          <ToolButton data-action="delete" disabled={locked} onClick={removeSelected}>
            Delete
          </ToolButton>
          <ToolButton
            data-action="lock"
            title={locked ? 'Unlock' : 'Lock'}
            onClick={() => updateSelectedObject({ locked: !locked })}
          >
            {locked ? 'Unlock' : 'Lock'}
          </ToolButton>
          <ToolButton
            data-action="forward"
            disabled={locked}
            title="Bring forward"
            onClick={() => moveSelectedObjectLayer('forward')}
          >
            Bring forward
          </ToolButton>
          <ToolButton
            data-action="backward"
            disabled={locked}
            title="Send backward"
            onClick={() => moveSelectedObjectLayer('backward')}
          >
            Send backward
          </ToolButton>
        </>
      ) : null}

      {mode === 'multi' ? (
        <>
          <ToolButton data-action="group" disabled={!canGroup} onClick={groupSelectedObjects}>
            Group
          </ToolButton>
          <ToolButton data-action="ungroup" disabled={!canUngroup} onClick={ungroupSelectedObjects}>
            Ungroup
          </ToolButton>
          <ToolButton data-action="duplicate" disabled={!canMutate} onClick={duplicateSelectedObject}>
            Duplicate
          </ToolButton>
          <AlignRow disabled={!canAlign} onAlign={alignSelectedObjects} />
          <DistributeRow disabled={!canDistribute} onDistribute={distributeSelectedObjects} />
          <ToolButton data-action="delete" disabled={!canMutate} onClick={removeSelected}>
            Delete
          </ToolButton>
        </>
      ) : null}
    </div>
  )
}

function ToolButton({
  children,
  onClick,
  disabled,
  title,
  ...props
}: {
  children: string
  onClick: () => void
  disabled?: boolean
  title?: string
  'data-action': string
  'data-add-design-text'?: string
  'data-add-design-image'?: string
  'data-add-design-shape'?: string
}) {
  return (
    <Button
      variant="quiet"
      disabled={disabled}
      onClick={onClick}
      title={title ?? children}
      aria-label={title ?? children}
      className="h-7 px-2 text-[11px]"
      {...props}
    >
      {children}
    </Button>
  )
}

export function AlignRow({
  disabled,
  onAlign,
}: {
  disabled?: boolean
  onAlign: (alignment: Alignment) => void
}) {
  return (
    <div className="flex items-center gap-0.5" data-align-row="true">
      <span className="mr-1 text-[10px] uppercase tracking-[0.12em] text-mute">Align</span>
      <AlignIcon alignment="left" label="Align left" disabled={disabled} onAlign={onAlign} />
      <AlignIcon alignment="center" label="Align center" disabled={disabled} onAlign={onAlign} />
      <AlignIcon alignment="right" label="Align right" disabled={disabled} onAlign={onAlign} />
      <AlignIcon alignment="top" label="Align top" disabled={disabled} onAlign={onAlign} />
      <AlignIcon alignment="middle" label="Align middle" disabled={disabled} onAlign={onAlign} />
      <AlignIcon alignment="bottom" label="Align bottom" disabled={disabled} onAlign={onAlign} />
    </div>
  )
}

export function DistributeRow({
  disabled,
  onDistribute,
}: {
  disabled?: boolean
  onDistribute: (axis: Distribution) => void
}) {
  return (
    <div className="flex items-center gap-0.5" data-distribute-row="true">
      <span className="mr-1 text-[10px] uppercase tracking-[0.12em] text-mute">Distribute</span>
      <button
        type="button"
        data-distribute="horizontal"
        title="Distribute horizontally"
        aria-label="Distribute horizontally"
        disabled={disabled}
        onClick={() => onDistribute('horizontal')}
        className="flex h-7 w-7 items-center justify-center rounded border border-line text-mute hover:text-ink disabled:opacity-35"
      >
        <AlignGlyph kind="spread-h" />
      </button>
      <button
        type="button"
        data-distribute="vertical"
        title="Distribute vertically"
        aria-label="Distribute vertically"
        disabled={disabled}
        onClick={() => onDistribute('vertical')}
        className="flex h-7 w-7 items-center justify-center rounded border border-line text-mute hover:text-ink disabled:opacity-35"
      >
        <AlignGlyph kind="spread-v" />
      </button>
    </div>
  )
}

function AlignIcon({
  alignment,
  label,
  disabled,
  onAlign,
}: {
  alignment: Alignment
  label: string
  disabled?: boolean
  onAlign: (alignment: Alignment) => void
}) {
  return (
    <button
      type="button"
      data-align={alignment}
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={() => onAlign(alignment)}
      className="flex h-7 w-7 items-center justify-center rounded border border-line text-mute hover:text-ink disabled:opacity-35"
    >
      <AlignGlyph kind={alignment} />
    </button>
  )
}

function AlignGlyph({ kind }: { kind: Alignment | 'spread-h' | 'spread-v' }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      {kind === 'left' ? <path d="M2 1.5v9M4 3.5h6v2H4v-2Zm0 3h4v2H4V6.5Z" stroke="currentColor" strokeWidth="1.2" /> : null}
      {kind === 'center' ? <path d="M6 1.5v9M3 3.5h6v2H3v-2Zm1.5 3h3v2h-3V6.5Z" stroke="currentColor" strokeWidth="1.2" /> : null}
      {kind === 'right' ? <path d="M10 1.5v9M2 3.5h6v2H2v-2Zm2 3h4v2H4V6.5Z" stroke="currentColor" strokeWidth="1.2" /> : null}
      {kind === 'top' ? <path d="M1.5 2h9M3.5 4v6h2V4h-2Zm3 0v4h2V4H6.5Z" stroke="currentColor" strokeWidth="1.2" /> : null}
      {kind === 'middle' ? <path d="M1.5 6h9M3.5 3v6h2V3h-2Zm3 1.5v3h2v-3H6.5Z" stroke="currentColor" strokeWidth="1.2" /> : null}
      {kind === 'bottom' ? <path d="M1.5 10h9M3.5 2v6h2V2h-2Zm3 2v4h2V4H6.5Z" stroke="currentColor" strokeWidth="1.2" /> : null}
      {kind === 'spread-h' ? <path d="M2 2v8M10 2v8M4.5 5h3M4.5 5l1.2-1.2M7.5 5 6.3 3.8M4.5 7h3M4.5 7l1.2 1.2M7.5 7 6.3 8.2" stroke="currentColor" strokeWidth="1.2" /> : null}
      {kind === 'spread-v' ? <path d="M2 2h8M2 10h8M5 4.5v3M5 4.5 3.8 3.3M5 7.5 3.8 8.7M7 4.5v3M7 4.5l1.2-1.2M7 7.5l1.2 1.2" stroke="currentColor" strokeWidth="1.2" /> : null}
    </svg>
  )
}
