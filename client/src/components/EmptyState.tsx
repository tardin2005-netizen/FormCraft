import type { ReactNode } from 'react'
import s from './EmptyState.module.css'

interface Action { label: string; onClick: () => void; primary?: boolean }

interface Props {
  icon?: ReactNode
  title: string
  children?: ReactNode
  actions?: Action[]
  /** Smaller, left-aligned version for panels and lists. */
  compact?: boolean
}

export default function EmptyState({ icon, title, children, actions = [], compact }: Props) {
  return (
    <div className={`${s.empty} ${compact ? s.compact : ''}`}>
      {icon && <div className={s.icon} aria-hidden="true">{icon}</div>}
      <div className={s.text}>
        <p className={s.title}>{title}</p>
        {children && <p className={s.desc}>{children}</p>}
        {actions.length > 0 && (
          <div className={s.actions}>
            {actions.map((a, i) => (
              <button key={a.label} type="button" className={a.primary ?? i === 0 ? s.primary : s.secondary} onClick={a.onClick}>
                {a.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
