import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useLinksStore } from '../store/linksStore'
import s from './QuickNote.module.css'

const DRAFT_KEY = 'formcraft-quicknote-draft'

interface Props { onClose: () => void }

export default function QuickNote({ onClose }: Props) {
  const { addLink } = useLinksStore()
  const [title, setTitle] = useState('')
  const [body,  setBody]  = useState('')
  const [saved, setSaved] = useState(false)
  const textRef = useRef<HTMLTextAreaElement>(null)

  // restore draft
  useEffect(() => {
    try {
      const d = JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}')
      if (d.title) setTitle(d.title)
      if (d.body)  setBody(d.body)
    } catch {}
    setTimeout(() => textRef.current?.focus(), 60)
  }, [])

  // auto-save draft
  useEffect(() => {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ title, body })) } catch {}
  }, [title, body])

  function handleSave() {
    if (!body.trim() && !title.trim()) return
    addLink({
      url: '#',
      title: title.trim() || 'Nota sem título',
      desc: body.trim(),
      favicon: '📝',
      areaId: '',
      tags: [],
      type: 'nota',
    })
    localStorage.removeItem(DRAFT_KEY)
    setSaved(true)
    setTimeout(onClose, 700)
  }

  function handleKey(e: React.KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleSave()
    if (e.key === 'Escape') onClose()
  }

  return (
    <>
      <div className={s.backdrop} onClick={onClose} />
      <motion.div
        className={s.panel}
        initial={{ opacity: 0, scale: .96, y: -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: .96, y: -8 }}
        transition={{ type: 'spring', stiffness: 420, damping: 30 }}
        onKeyDown={handleKey}
      >
        <div className={s.header}>
          <span className={s.icon}>📝</span>
          <input
            className={s.titleInput}
            placeholder="Título (opcional)"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <button className={s.closeBtn} onClick={onClose}>✕</button>
        </div>

        <textarea
          ref={textRef}
          className={s.textarea}
          placeholder="Escreva sua nota aqui..."
          value={body}
          onChange={e => setBody(e.target.value)}
        />

        <div className={s.footer}>
          <span className={s.hint}>⌘↵ para salvar · Esc para fechar</span>
          <div className={s.actions}>
            <button className={s.cancelBtn} onClick={onClose}>Descartar</button>
            <button
              className={`${s.saveBtn} ${saved ? s.savedBtn : ''}`}
              onClick={handleSave}
              disabled={!body.trim() && !title.trim()}
            >
              {saved ? '✓ Salvo!' : 'Salvar no Inbox'}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  )
}
