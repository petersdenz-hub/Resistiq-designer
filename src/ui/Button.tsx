import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'ghost' | 'accent' | 'quiet'
}

export function Button({
  children,
  variant = 'ghost',
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  const styles = {
    ghost:
      'border-line bg-panel-hover text-ink hover:border-accent/40 hover:bg-[#1c212c] disabled:hover:border-line disabled:hover:bg-panel-hover',
    accent:
      'border-accent/30 bg-accent text-accent-ink hover:bg-[#d4b07a] disabled:hover:bg-accent',
    quiet:
      'border-transparent bg-transparent text-mute hover:bg-panel-hover hover:text-ink',
  } as const

  return (
    <button
      type={type}
      className={`inline-flex h-8 items-center justify-center gap-2 rounded-md border px-3 text-[12px] font-medium tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
