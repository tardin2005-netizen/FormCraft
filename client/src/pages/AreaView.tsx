import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAreasStore } from '../store/areasStore'
import { useAreaItemsStore, type AreaItemType } from '../store/areaItemsStore'
import DeleteBtn from '../modules/DeleteBtn'
import s from './AreaView.module.css'

const TYPE_ICON: Record<AreaItemType, string> = { link: '🔗', note: '📝', file: '📄', chat: '💬' }
const TYPE_LABEL: Record<AreaItemType, string> = { link: 'Link', note: 'Nota', file: 'Arquivo', chat: 'Chat' }
const AREA_ITEM_TYPES: AreaItemType[] = ['link', 'note', 'file']

function AddItemModal({ areaId, onClose }: { areaId: string; onClose: () => void }) {
  const { addItem } = useAreaItemsStore()
  const [type, setType] = useState<AreaItemType>('link')
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [content, setContent] = useState('')
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const dragRef = useRef<{ mx: number; my: number; px: number; py: number } | null>(null)

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
    function onUp() { dragRef.current = null; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  function save() {
    if (!title.trim()) return
    addItem({ areaId, type, title: title.trim(), url: url.trim() || undefined, content: content.trim() || undefined })
    onClose()
  }

  return (
    <>
      <div className={s.backdrop} onClick={onClose} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', zIndex: 60, transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`, width: 440, maxWidth: 'calc(100vw - 32px)' }}>
      <motion.div
        className={s.modal}
        style={{ position: 'relative', top: 'auto', left: 'auto', transform: 'none', width: '100%' }}
        initial={{ opacity: 0, scale: .94, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: .94 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      >
        <div className={s.modalHeader} onMouseDown={onHeaderMouseDown} style={{ cursor: 'grab', userSelect: 'none' }}>
          <span>Adicionar item</span>
          <button className={s.modalClose} onClick={onClose}>✕</button>
        </div>
        <div className={s.modalBody}>
          <div className={s.typeRow}>
            {AREA_ITEM_TYPES.map(t => (
              <button
                key={t}
                className={`${s.typeBtn} ${type === t ? s.typeBtnActive : ''}`}
                onClick={() => setType(t)}
              >
                {TYPE_ICON[t]} {TYPE_LABEL[t]}
              </button>
            ))}
          </div>

          <div className={s.field}>
            <label className={s.label}>Título</label>
            <input
              className={s.input}
              placeholder="Nome do item..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          {type === 'link' && (
            <div className={s.field}>
              <label className={s.label}>URL</label>
              <input
                className={s.input}
                placeholder="https://..."
                value={url}
                onChange={e => setUrl(e.target.value)}
              />
            </div>
          )}

          {(type === 'note' || type === 'file') && (
            <div className={s.field}>
              <label className={s.label}>{type === 'note' ? 'Conteúdo' : 'Descrição'}</label>
              <textarea
                className={`${s.input} ${s.textarea}`}
                placeholder={type === 'note' ? 'Escreva sua nota...' : 'Descrição do arquivo...'}
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={4}
              />
            </div>
          )}

        </div>
        <div className={s.modalFooter}>
          <button className={s.cancelBtn} onClick={onClose}>Cancelar</button>
          <button className={s.saveBtn} disabled={!title.trim()} onClick={save}>Salvar</button>
        </div>
      </motion.div>
      </div>
    </>
  )
}

export default function AreaView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { areas, removeArea } = useAreasStore()
  const { getByArea, removeItem } = useAreaItemsStore()
  const [addOpen, setAddOpen] = useState(false)
  const area = areas.find(a => a.id === id)
  const allItems = id ? getByArea(id) : []
  const items = allItems.filter(i => i.type !== 'chat')
  const chatCount = allItems.filter(i => i.type === 'chat').length

  useEffect(() => {
    if (!area && areas.length > 0) navigate('/', { replace: true })
  }, [area, areas])

  if (!area) return null

  function handleDelete() {
    if (!confirm(`Apagar a área "${area!.title}"? Esta ação não pode ser desfeita.`)) return
    removeArea(area!.id)
    navigate('/', { replace: true })
  }

  return (
    <div className={s.page}>
      <div className={s.header}>
        <div className={s.headerLeft}>
          <span className={s.emoji}>{area.emoji}</span>
          <div>
            <h1 className={s.title}>{area.title}</h1>
            {area.desc && <p className={s.desc}>{area.desc}</p>}
          </div>
        </div>
        <div className={s.headerActions}>
          <button className={s.addBtn} style={{ background: area.color }} onClick={() => setAddOpen(true)}>
            + Adicionar
          </button>
          <button className={s.deleteAreaBtn} onClick={handleDelete} title="Apagar área">
            🗑 Apagar área
          </button>
        </div>
      </div>

      <div className={s.stripe} style={{ background: area.color }} />

      <div className={s.content}>
        {items.length === 0 && (
          <div className={s.empty}>
            <div className={s.emptyIcon}>📭</div>
            <div>Nenhum link, nota ou arquivo ainda.</div>
            {chatCount > 0 && (
              <div style={{ fontSize: 12, color: 'var(--accent)', marginTop: 4 }}>
                💬 {chatCount} canal{chatCount !== 1 ? 'is' : ''} disponível{chatCount !== 1 ? 's' : ''} na sidebar
              </div>
            )}
            <button className={s.emptyAddBtn} onClick={() => setAddOpen(true)}>+ Adicionar item</button>
          </div>
        )}

        <AnimatePresence>
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              className={s.item}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: i * .03 }}
            >
              <span className={s.itemIcon}>{TYPE_ICON[item.type]}</span>
              <div className={s.itemInfo}>
                <div className={s.itemTitle}>
                  {item.url ? (
                    <a href={item.url} target="_blank" rel="noopener noreferrer">{item.title}</a>
                  ) : item.title}
                </div>
                {item.content && <div className={s.itemContent}>{item.content}</div>}
                {item.url && item.type !== 'chat' && <div className={s.itemUrl}>{item.url}</div>}
                {item.type === 'chat' && item.url && (
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className={s.itemUrl} style={{ color: 'var(--accent)' }}>
                    Abrir conversa ↗
                  </a>
                )}
              </div>
              <span className={s.itemType}>{TYPE_LABEL[item.type]}</span>
              <DeleteBtn onConfirm={() => removeItem(item.id)} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {addOpen && <AddItemModal areaId={area.id} onClose={() => setAddOpen(false)} />}
      </AnimatePresence>
    </div>
  )
}
