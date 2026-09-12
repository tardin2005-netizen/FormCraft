import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import s from './IconPicker.module.css'

const COLLECTIONS = [
  { id: 'lucide',           label: 'Lucide' },
  { id: 'ph',               label: 'Phosphor' },
  { id: 'tabler',           label: 'Tabler' },
  { id: 'material-symbols', label: 'Material' },
  { id: 'heroicons',        label: 'Heroicons' },
  { id: 'ri',               label: 'Remix' },
  { id: 'mdi',              label: 'MDI' },
]

const DEFAULTS = [
  'lucide:folder','lucide:star','lucide:heart','lucide:bookmark','lucide:tag',
  'lucide:link','lucide:image','lucide:file-text','lucide:code','lucide:database',
  'lucide:globe','lucide:camera','lucide:music','lucide:video','lucide:brain',
  'lucide:zap','lucide:rocket','lucide:trophy','lucide:target','lucide:compass',
  'lucide:shield','lucide:lock','lucide:key','lucide:settings','lucide:wrench',
  'lucide:palette','lucide:pen-tool','lucide:layout-dashboard','lucide:grid-2x2','lucide:layers',
  'lucide:chart-bar','lucide:trending-up','lucide:dollar-sign','lucide:shopping-bag','lucide:box',
  'lucide:users','lucide:user','lucide:mail','lucide:calendar','lucide:clock',
  'lucide:map-pin','lucide:home','lucide:building','lucide:flask-conical','lucide:graduation-cap',
  'lucide:book-open','lucide:newspaper','lucide:megaphone','lucide:send','lucide:bell',
]

function iconUrl(id: string, color = '%23888888') {
  const [prefix, ...rest] = id.split(':')
  return `https://api.iconify.design/${prefix}/${rest.join(':')}.svg?color=${color}`
}

async function searchIcons(query: string, prefix: string): Promise<string[]> {
  const p = prefix === 'all'
    ? 'lucide,ph,tabler,material-symbols,heroicons,ri,mdi'
    : prefix
  const url = `https://api.iconify.design/search?query=${encodeURIComponent(query)}&limit=54&prefixes=${p}`
  const res = await fetch(url)
  if (!res.ok) return []
  const data = await res.json()
  return data.icons ?? []
}

interface Props {
  value: string
  onChange: (icon: string) => void
  onClose: () => void
  accentColor?: string
}

export default function IconPicker({ value, onChange, onClose, accentColor = '#7c6ef7' }: Props) {
  const [query,      setQuery]      = useState('')
  const [collection, setCollection] = useState('lucide')
  const [results,    setResults]    = useState<string[]>(DEFAULTS)
  const [loading,    setLoading]    = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => { inputRef.current?.focus() }, [])

  const doSearch = useCallback(async (q: string, col: string) => {
    if (!q.trim()) { setResults(DEFAULTS); return }
    setLoading(true)
    const icons = await searchIcons(q, col)
    setResults(icons)
    setLoading(false)
  }, [])

  useEffect(() => {
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => doSearch(query, collection), 350)
    return () => clearTimeout(timerRef.current)
  }, [query, collection, doSearch])

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Escape') onClose()
  }

  return (
    <>
      <div className={s.backdrop} onClick={onClose} />
      <motion.div
        className={s.picker}
        initial={{ opacity: 0, scale: .94, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: .94, y: -10 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        onKeyDown={handleKey}
      >
        <div className={s.header}>
          <span className={s.title}>Escolher ícone</span>
          <button className={s.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={s.searchRow}>
          <input
            ref={inputRef}
            className={s.searchInput}
            placeholder="Buscar ícone…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>

        <div className={s.collectionRow}>
          <button
            className={`${s.colBtn} ${collection === 'all' ? s.colBtnActive : ''}`}
            style={collection === 'all' ? { borderColor: accentColor, color: accentColor } : {}}
            onClick={() => setCollection('all')}
          >Todos</button>
          {COLLECTIONS.map(c => (
            <button
              key={c.id}
              className={`${s.colBtn} ${collection === c.id ? s.colBtnActive : ''}`}
              style={collection === c.id ? { borderColor: accentColor, color: accentColor } : {}}
              onClick={() => setCollection(c.id)}
            >{c.label}</button>
          ))}
        </div>

        <div className={s.grid}>
          {loading && (
            <div className={s.loadingRow}>
              <span className={s.spinner} />
            </div>
          )}
          {!loading && results.length === 0 && (
            <div className={s.empty}>Nenhum ícone encontrado</div>
          )}
          {!loading && results.map(id => (
            <button
              key={id}
              className={`${s.iconBtn} ${value === id ? s.iconBtnActive : ''}`}
              style={value === id ? { background: accentColor + '22', borderColor: accentColor } : {}}
              onClick={() => { onChange(id); onClose() }}
              title={id.split(':')[1]}
            >
              <img
                src={iconUrl(id, value === id ? encodeURIComponent(accentColor) : '%23888888')}
                width={20} height={20}
                alt=""
                loading="lazy"
              />
            </button>
          ))}
        </div>

        <div className={s.footer}>
          <span className={s.footerNote}>
            via <a href="https://iconify.design" target="_blank" rel="noopener noreferrer">Iconify</a>
            {' · '}Lucide · Phosphor · Tabler · Material · Heroicons · Remix
          </span>
        </div>
      </motion.div>
    </>
  )
}

export function IconDisplay({
  value,
  size = 24,
  color,
  className,
}: {
  value: string
  size?: number
  color?: string
  className?: string
}) {
  if (!value) return null
  if (value.includes(':')) {
    const hex = color ? encodeURIComponent(color) : '%23888888'
    const [prefix, ...rest] = value.split(':')
    return (
      <img
        src={`https://api.iconify.design/${prefix}/${rest.join(':')}.svg?color=${hex}`}
        width={size} height={size}
        alt=""
        style={{ display: 'block', flexShrink: 0 }}
        className={className}
      />
    )
  }
  return <span style={{ fontSize: size, lineHeight: 1 }} className={className}>{value}</span>
}
