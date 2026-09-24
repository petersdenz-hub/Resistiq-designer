interface SegmentedControlProps<T extends string> {
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
  className?: string
}

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  className = 'w-full',
}: SegmentedControlProps<T>) {
  return (
    <div className={`flex rounded-lg border border-line bg-studio p-0.5 ${className}`}>
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`h-7 min-w-12 flex-1 rounded-md px-2.5 text-[12px] font-medium transition-colors ${
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
