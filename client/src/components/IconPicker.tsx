import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { PH_ICONS } from '../data/phosphor'
import Glyph from './Glyph'
import s from './IconPicker.module.css'

const CATEGORIES = [
  { label: 'Tudo', filter: '' },
  { label: 'Trabalho', filter: 'trabalho empresa dinheiro finanças negócio' },
  { label: 'Tech', filter: 'código ti computador ia dev banco' },
  { label: 'Estudo', filter: 'faculdade estudo escola ciência aula' },
  { label: 'Design e mídia', filter: 'design arte foto vídeo música imagem' },
  { label: 'Pessoal', filter: 'casa pessoal natureza comida viagem saúde' },
]

interface Props {
  value: string
  onChange: (icon: string) => void
  onClose: () => void
}

export default function IconPicker({ value, onChange, onClose }: Props) {
  const [query, setQuery] = useState('')
  const [cat, setCat] = useState('')
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const dragRef = useRef<{ mx: number; my: number; px: number; py: number } | null>(null)

  const q = query.toLowerCase().trim()
  const filtered = PH_ICONS.filter(item => {
    const hay = `${item.key.replace(/-/g, ' ')} ${item.words}`
    const matchQuery = !q || hay.includes(q)
    const matchCat = !cat || item.words.split(' ').some(w => cat.includes(w))
    return matchQuery && matchCat
  })

  function onHeaderMouseDown(e: React.MouseEvent) {
    if ((e.target as HTMLElement).closest('button, input')) return
    dragRef.current = { mx: e.clientX, my: e.clientY, px: pos.x, py: pos.y }
    function onMove(ev: MouseEvent) {
      if (!dragRef.current) return
      const maxX = window.innerWidth / 2 - 60
      const maxY = window.innerHeight / 2 - 40
      setPos({
        x: Math.max(-maxX, Math.min(maxX, dragRef.current.px + ev.clientX - dragRef.current.mx)),
        y: Math.max(-maxY, Math.min(maxY, dragRef.current.py + ev.clientY - dragRef.current.my)),
      })
    }
    function onUp() {
      dragRef.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  return (
    <>
      <div className={s.backdrop} onClick={onClose} />
      <motion.div
        className={s.picker}
        style={{ translate: `calc(-50% + ${pos.x}px) calc(-50% + ${pos.y}px)` }}
        initial={{ opacity: 0, scale: .94, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: .94, y: -10 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      >
        <div className={s.header} onMouseDown={onHeaderMouseDown} style={{ cursor: 'grab', userSelect: 'none' }}>
          <span className={s.title}>Escolher ícone</span>
          <button className={s.closeBtn} onClick={onClose} aria-label="Fechar"><Glyph value="ph:x" size={14} /></button>
        </div>

        <div className={s.searchRow}>
          <input
            className={s.searchInput}
            placeholder="Buscar ícone: foguete, pasta, finanças…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
          />
        </div>

        <div className={s.collectionRow}>
          {CATEGORIES.map(c => (
            <button
              key={c.label}
              className={`${s.colBtn} ${cat === c.filter ? s.colBtnActive : ''}`}
              onClick={() => setCat(c.filter)}
            >{c.label}</button>
          ))}
        </div>

        <div className={s.grid}>
          {filtered.length === 0 && (
            <div className={s.empty}>Nenhum ícone encontrado</div>
          )}
          {filtered.map(item => (
            <button
              key={item.key}
              className={`${s.iconBtn} ${value === `ph:${item.key}` ? s.iconBtnActive : ''}`}
              onClick={() => { onChange(`ph:${item.key}`); onClose() }}
              title={item.words.split(' ')[0]}
              aria-label={item.words.split(' ')[0]}
            >
              <item.C size={22} weight="bold" aria-hidden="true" />
            </button>
          ))}
        </div>
      </motion.div>
    </>
  )
}

export function IconDisplay({ value, size = 24, className, color }: { value: string; size?: number; color?: string; className?: string }) {
  if (!value) return null
  return <Glyph value={value} size={size} className={className} color={color} />
}
