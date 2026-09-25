import { useRef, useState } from 'react'
import { GARMENT_COLOR_PRESETS, normalizeHex } from './color'
import { Field } from './Field'

interface ColorPickerProps {
  label: string
  value: string
  compact?: boolean
  presets?: readonly { value: string; label: string }[]
  onCommit: (value: string) => void
  onLiveChange?: (value: string) => void
  onLiveStart?: () => void
  onLiveEnd?: () => void
}

export function ColorPicker({
  label,
  value,
  compact = false,
  presets = GARMENT_COLOR_PRESETS,
  onCommit,
  onLiveChange,
  onLiveStart,
  onLiveEnd,
}: ColorPickerProps) {
  const committed = normalizeHex(value) ?? '#e8e4dc'
  const [hexDraft, setHexDraft] = useState({ committed, text: committed })
  const liveRef = useRef(false)

  if (hexDraft.committed !== committed) {
    setHexDraft({ committed, text: committed })
  }

  return (
    <Field label={label}>
      <div className="space-y-2.5">
        {compact ? null : (
        <div className="flex items-center gap-2">
          <input
            type="color"
            data-color-custom="true"
            value={committed}
            onChange={(event) => {
              const next = event.target.value
              if (onLiveChange) {
                if (!liveRef.current) {
                  liveRef.current = true
                  onLiveStart?.()
                }
                onLiveChange(next)
              } else {
                onCommit(next)
              }
            }}
            onBlur={() => {
              if (liveRef.current) {
                liveRef.current = false
                onLiveEnd?.()
              }
            }}
            className="h-9 w-9 shrink-0 cursor-pointer rounded-md border border-line bg-studio p-0.5"
            aria-label={label}
          />
          <input
            value={hexDraft.text}
            onChange={(event) =>
              setHexDraft((current) => ({ ...current, text: event.target.value }))
            }
            onBlur={() => {
              const next = normalizeHex(hexDraft.text)
              if (next && next !== committed) {
                onCommit(next)
              } else {
                setHexDraft({ committed, text: committed })
              }
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.currentTarget.blur()
              }
            }}
            spellCheck={false}
            className="h-9 flex-1 rounded-md border border-line bg-studio px-2 font-mono text-[12px] text-ink outline-none focus:border-accent/50"
            aria-label={`${label} hex`}
          />
        </div>
        )}
        {presets.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {presets.map((preset) => {
              const selected = committed === preset.value
              return (
                <button
                  key={preset.value}
                  type="button"
                  data-color-preset={preset.value}
                  title={preset.label}
                  aria-label={preset.label}
                  aria-pressed={selected}
                  onClick={() => onCommit(preset.value)}
                  className={`h-6 w-6 rounded-full border ${
                    selected ? 'border-accent ring-1 ring-accent/50' : 'border-line'
                  }`}
                  style={{ backgroundColor: preset.value }}
                />
              )
            })}
            {compact ? (
              <input
                type="color"
                data-color-custom="true"
                value={committed}
                aria-label={`${label} custom`}
                onChange={(event) => onCommit(event.target.value)}
                className="h-6 w-6 cursor-pointer rounded-full border border-line bg-studio p-0"
              />
            ) : null}
          </div>
        ) : null}
      </div>
    </Field>
  )
}
