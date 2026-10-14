import { useState, useEffect, useRef } from 'react'
import { Trash2, Check, X } from 'lucide-react'
import s from './ActionButtons.module.css'

interface Props {
  onConfirm: () => void
  /** Item name shown in the confirmation question, e.g. Excluir "TI"? */
  name?: string
  variant?: 'full' | 'icon'
}

export default function DeleteBtn({ onConfirm, name, variant = 'full' }: Props) {
  const [pending, setPending] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const icon = variant === 'icon'

  function clear() { if (timer.current) clearTimeout(timer.current) }

  function handleFirst(e: React.MouseEvent) {
    e.stopPropagation()
    setPending(true)
    clear()
    timer.current = setTimeout(() => setPending(false), 7000)
  }

  function handleConfirm(e: React.MouseEvent) {
    e.stopPropagation()
    clear()
    setPending(false)
    onConfirm()
  }

  function handleCancel(e: React.MouseEvent) {
    e.stopPropagation()
    clear()
    setPending(false)
  }

  useEffect(() => clear, [])

  if (pending) {
    return (
      <span className={s.pending} onClick={e => e.stopPropagation()}>
        <span className={s.question}>{name ? `Excluir "${name}"?` : 'Excluir?'}</span>
        <button type="button" className={`${s.btn} ${s.solidDanger} ${icon ? s.iconOnly : ''}`} onClick={handleConfirm} title="Confirmar exclusão" aria-label="Sim, excluir">
          <Check size={15} strokeWidth={2.4} className={s.icoCheck} />{!icon && <span>Sim, excluir</span>}
        </button>
        <button type="button" className={`${s.btn} ${icon ? s.iconOnly : ''}`} onClick={handleCancel} title="Cancelar" aria-label="Cancelar">
          <X size={15} strokeWidth={2.4} className={s.icoX} />{!icon && <span>Cancelar</span>}
        </button>
      </span>
    )
  }

  return (
    <button type="button" className={`${s.btn} ${s.danger} ${icon ? s.iconOnly : ''}`} onClick={handleFirst} title="Excluir" aria-label="Excluir">
      <Trash2 size={15} strokeWidth={2.2} className={s.icoTrash} />{!icon && <span>Excluir</span>}
    </button>
  )
}
