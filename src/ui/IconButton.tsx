import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  active?: boolean
  label: string
}

export function IconButton({
  children,
  active = false,
  label,
  className = '',
  type = 'button',
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      title={label}
      aria-label={label}
      className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
        active
          ? 'bg-accent/15 text-accent'
          : 'text-mute hover:bg-panel-hover hover:text-ink'
      } disabled:cursor-not-allowed disabled:opacity-35 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
