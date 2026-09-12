import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAreasStore } from '../store/areasStore'
import { useAreaItemsStore, type AreaItemType } from '../store/areaItemsStore'
import s from './AreaView.module.css'

const TYPE_ICON: Record<AreaItemType, string> = { link: '🔗', note: '📝', file: '📄' }
const TYPE_LABEL: Record<AreaItemType, string> = { link: 'Link', note: 'Nota', file: 'Arquivo' }

function AddItemModal({ areaId, onClose }: { areaId: string; onClose: () => void }) {
  const { addItem } = useAreaItemsStore()
  const [type, setType] = useState<AreaItemType>('link')
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [content, setContent] = useState('')

  function save() {
    if (!title.trim()) return
    addItem({ areaId, type, title: title.trim(), url: url.trim() || undefined, content: content.trim() || undefined })
    onClose()
  }

  return (
    <>
      <div className={s.backdrop} onClick={onClose} />
      <motion.div
        className={s.modal}
        initial={{ opacity: 0, scale: .94, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: .94 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      >
        <div className={s.modalHeader}>
          <span>Adicionar item</span>
          <button className={s.modalClose} onClick={onClose}>✕</button>
        </div>
        <div className={s.modalBody}>
          <div className={s.typeRow}>
            {(['link', 'note', 'file'] as AreaItemType[]).map(t => (
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
  const items = id ? getByArea(id) : []

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
            <div>Nenhum item ainda.</div>
            <button className={s.emptyAddBtn} onClick={() => setAddOpen(true)}>+ Adicionar primeiro item</button>
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
                {item.url && <div className={s.itemUrl}>{item.url}</div>}
              </div>
              <span className={s.itemType}>{TYPE_LABEL[item.type]}</span>
              <button
                className={s.itemDelete}
                onClick={() => removeItem(item.id)}
                title="Remover"
              >✕</button>
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
