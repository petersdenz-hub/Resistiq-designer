interface SegmentedControlProps<T extends string> {
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
}

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <div className="inline-flex rounded-lg border border-line bg-studio p-0.5">
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`h-7 min-w-16 rounded-md px-3 text-[12px] font-medium transition-colors ${
              selected ? 'bg-panel-hover text-ink' : 'text-mute hover:text-ink'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
