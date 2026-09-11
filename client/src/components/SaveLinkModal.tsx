import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLinksStore } from '../store/linksStore'
import { useAreasStore } from '../store/areasStore'
import s from './SaveLinkModal.module.css'

interface Props { onClose: () => void }

type ContentType = 'link' | 'pdf' | 'nota' | 'imagem'

const TYPE_ICONS: Record<ContentType, string> = {
  link: '🔗', pdf: '📄', nota: '📝', imagem: '🖼️'
}

export default function SaveLinkModal({ onClose }: Props) {
  const { addLink } = useLinksStore()
  const { areas } = useAreasStore()

  const [url,     setUrl]     = useState('')
  const [title,   setTitle]   = useState('')
  const [type,    setType]    = useState<ContentType>('link')
  const [areaId,  setAreaId]  = useState(areas[0]?.id ?? '')
  const [tags,    setTags]    = useState('')
  const [saved,   setSaved]   = useState(false)
  const [loading, setLoading] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleSave()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [url, title, type, areaId, tags])

  function detectType(u: string): ContentType {
    if (u.endsWith('.pdf')) return 'pdf'
    if (/\.(png|jpg|jpeg|gif|webp|svg)$/i.test(u)) return 'imagem'
    return 'link'
  }

  function handleUrlChange(val: string) {
    setUrl(val)
    if (!title) setType(detectType(val))
  }

  function handleSave() {
    if (!url.trim()) return
    setLoading(true)
    setTimeout(() => {
      addLink({
        url: url.trim(),
        title: title.trim() || url.trim(),
        desc: '',
        favicon: `https://www.google.com/s2/favicons?domain=${url}&sz=32`,
        areaId,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        type,
      })
      setSaved(true)
      setLoading(false)
      setTimeout(onClose, 900)
    }, 400)
  }

  return (
    <>
      <div className={s.backdrop} onClick={onClose} />
      <motion.div
        className={s.modal}
        initial={{ opacity: 0, y: -16, scale: .96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -16, scale: .96 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      >
        <div className={s.header}>
          <span className={s.headerTitle}>🔗 Salvar conteúdo</span>
          <button className={s.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={s.body}>
          {/* URL */}
          <div className={s.field}>
            <label className={s.label}>URL ou link</label>
            <input
              ref={inputRef}
              className={s.input}
              placeholder="https://..."
              value={url}
              onChange={e => handleUrlChange(e.target.value)}
            />
          </div>

          {/* Title */}
          <div className={s.field}>
            <label className={s.label}>Título <span className={s.optional}>(opcional)</span></label>
            <input
              className={s.input}
              placeholder="Nome do conteúdo"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          {/* Type + Area in a row */}
          <div className={s.row}>
            <div className={s.field}>
              <label className={s.label}>Tipo</label>
              <div className={s.typePicker}>
                {(Object.keys(TYPE_ICONS) as ContentType[]).map(t => (
                  <button
                    key={t}
                    className={`${s.typeBtn} ${type === t ? s.typeBtnActive : ''}`}
                    onClick={() => setType(t)}
                    title={t}
                  >
                    {TYPE_ICONS[t]} <span>{t}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Area */}
          <div className={s.field}>
            <label className={s.label}>Área</label>
            <select
              className={s.select}
              value={areaId}
              onChange={e => setAreaId(e.target.value)}
            >
              {areas.map(a => (
                <option key={a.id} value={a.id}>{a.emoji} {a.title}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className={s.field}>
            <label className={s.label}>Tags <span className={s.optional}>(separadas por vírgula)</span></label>
            <input
              className={s.input}
              placeholder="design, referência, ux"
              value={tags}
              onChange={e => setTags(e.target.value)}
            />
          </div>
        </div>

        <div className={s.footer}>
          <button className={s.cancelBtn} onClick={onClose}>Cancelar</button>
          <button
            className={`${s.saveBtn} ${saved ? s.saveBtnSaved : ''}`}
            onClick={handleSave}
            disabled={!url.trim() || loading || saved}
          >
            <AnimatePresence mode="wait">
              {saved ? (
                <motion.span key="saved" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  ✓ Salvo!
                </motion.span>
              ) : loading ? (
                <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  Salvando...
                </motion.span>
              ) : (
                <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  Salvar <kbd>⌘↵</kbd>
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.div>
    </>
  )
}
