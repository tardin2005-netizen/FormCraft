import { useState, useEffect, useRef } from 'react'
import s from './modules.module.css'

interface Props {
  onConfirm: () => void
  label?: string
}

export default function DeleteBtn({ onConfirm, label = '×' }: Props) {
  const [pending, setPending] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleFirst(e: React.MouseEvent) {
    e.stopPropagation()
    setPending(true)
    timer.current = setTimeout(() => setPending(false), 2500)
  }

  function handleConfirm(e: React.MouseEvent) {
    e.stopPropagation()
    if (timer.current) clearTimeout(timer.current)
    setPending(false)
    onConfirm()
  }

  function handleCancel(e: React.MouseEvent) {
    e.stopPropagation()
    if (timer.current) clearTimeout(timer.current)
    setPending(false)
  }

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  if (pending) {
    return (
      <span className={s.deletePending}>
        <button className={s.deleteConfirmBtn} onClick={handleConfirm} title="Confirmar exclusão">✓</button>
        <button className={s.deleteCancelBtn} onClick={handleCancel} title="Cancelar">✕</button>
      </span>
    )
  }

  return (
    <button className={s.removeBtn} onClick={handleFirst} title="Excluir">
      {label}
    </button>
  )
}
