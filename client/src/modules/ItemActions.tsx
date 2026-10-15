import { useEffect, useRef, useState } from 'react'
import EditBtn from './EditBtn'
import DeleteBtn from './DeleteBtn'

interface Props {
  onEdit: (e: React.MouseEvent) => void
  onDelete: () => void
  /** Shown in the delete confirmation, e.g. Excluir "TI"? */
  name?: string
}

/** Only "Editar" is visible. Pressing it opens the editor and, for a short while, reveals "Excluir". */
export default function ItemActions({ onEdit, onDelete, name }: Props) {
  const [armed, setArmed] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  function edit(e: React.MouseEvent) {
    onEdit(e)
    setArmed(true)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setArmed(false), 15000)
  }

  return (
    <>
      <EditBtn onClick={edit} />
      {armed && <span onClick={e => e.stopPropagation()} style={{ display: 'contents' }}><DeleteBtn name={name} onConfirm={onDelete} /></span>}
    </>
  )
}
