import type { ReactNode } from 'react'
import { Button } from './Button'

interface DialogProps {
  title: string
  children: ReactNode
  onClose: () => void
  size?: 'sm' | 'lg'
}

export function Dialog({ title, children, onClose, size = 'sm' }: DialogProps) {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/55 px-4">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Dismiss"
        onClick={onClose}
      />
      <div
        data-dialog="true"
        className={`relative w-full rounded-xl border border-line bg-panel p-4 shadow-2xl ${
          size === 'lg' ? 'max-w-2xl' : 'max-w-sm'
        }`}
      >
        <div className="text-[13px] font-medium text-ink">{title}</div>
        <div className="mt-3">{children}</div>
      </div>
    </div>
  )
}

export function DialogActions({ children }: { children: ReactNode }) {
  return <div className="mt-4 flex justify-end gap-2">{children}</div>
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel,
  onCancel,
  onConfirm,
}: {
  title: string
  message: string
  confirmLabel: string
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <Dialog title={title} onClose={onCancel}>
      <p className="text-[12px] leading-5 text-mute" data-confirm-message="true">
        {message}
      </p>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button variant="accent" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
