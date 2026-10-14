import { Pencil } from 'lucide-react'
import s from './ActionButtons.module.css'

interface Props {
  onClick: (e: React.MouseEvent) => void
  variant?: 'full' | 'icon'
}

export default function EditBtn({ onClick, variant = 'full' }: Props) {
  return (
    <button
      type="button"
      className={`${s.btn} ${variant === 'icon' ? s.iconOnly : ''}`}
      onClick={e => { e.stopPropagation(); onClick(e) }}
      title="Editar"
      aria-label="Editar"
    >
      <Pencil size={15} strokeWidth={2.2} className={s.icoEdit} />
      {variant === 'full' && <span>Editar</span>}
    </button>
  )
}
