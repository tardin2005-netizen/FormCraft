import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getFunctions, httpsCallable } from 'firebase/functions'
import app from '../firebase'
import { useLinksStore } from '../store/linksStore'
import { useAreasStore } from '../store/areasStore'
import s from './SaveLinkModal.module.css'

interface Props { onClose: () => void }

type ContentType = 'link' | 'pdf' | 'nota' | 'imagem' | 'prompt'
const TYPE_ICONS: Record<ContentType, string> = { link: '🔗', pdf: '📄', nota: '📝', imagem: '🖼️', prompt: '🤖' }

const functions = getFunctions(app, 'us-central1')
const analyzeLinkFn = httpsCallable<{ url: string }, { title: string; desc: string; image: string }>(
  functions, 'analyzeLink'
)

function detectType(u: string): ContentType {
  if (u.endsWith('.pdf')) return 'pdf'
  if (/\.(png|jpg|jpeg|gif|webp|svg)$/i.test(u)) return 'imagem'
  return 'link'
}

function getDomain(u: string) {
  try { return new URL(u).hostname.replace('www.', '') } catch { return '' }
}

export default function SaveLinkModal({ onClose }: Props) {
  const { addLink } = useLinksStore()
  const { areas }   = useAreasStore()

  const [url,         setUrl]         = useState('')
  const [title,       setTitle]       = useState('')
  const [desc,        setDesc]        = useState('')
  const [ogImage,     setOgImage]     = useState('')
  const [pastedImage, setPastedImage] = useState<string>('')
  const [type,        setType]        = useState<ContentType>('link')
  const [areaId,      setAreaId]      = useState(areas[0]?.id ?? '')
  const [tags,        setTags]        = useState<string[]>([])
  const [tagInput,    setTagInput]    = useState('')
  const [saved,       setSaved]       = useState(false)
  const [fetching,    setFetching]    = useState(false)
  const [fetchDone,   setFetchDone]   = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  // Global paste listener for images (Cmd+V / Ctrl+V anywhere on modal)
  useEffect(() => {
    function onGlobalPaste(e: ClipboardEvent) {
      const items = e.clipboardData?.items
      if (!items) return
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile()
          if (!file) continue
          const reader = new FileReader()
          reader.onload = ev => {
            const dataUrl = ev.target?.result as string
            setPastedImage(dataUrl)
            // só muda o tipo para imagem se não há URL — se tiver URL, a imagem é só thumbnail
            setType(prev => prev === 'link' || prev === 'pdf' ? prev : 'imagem')
          }
          reader.readAsDataURL(file)
          e.preventDefault()
          return
        }
      }
    }
    window.addEventListener('paste', onGlobalPaste)
    return () => window.removeEventListener('paste', onGlobalPaste)
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleSave()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [url, title, type, areaId, tags])

  function commitTag(raw: string) {
    const t = raw.replace(/^#+/, '').trim().toLowerCase()
    if (t && !tags.includes(t)) setTags(prev => [...prev, t])
    setTagInput('')
  }

  function onTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ' ' || e.key === ',') {
      e.preventDefault()
      commitTag(tagInput)
    }
    if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags(prev => prev.slice(0, -1))
    }
  }

  function onTagBlur() {
    if (tagInput.trim()) commitTag(tagInput)
  }

  const triggerFetch = useCallback(async (rawUrl: string) => {
    const u = rawUrl.trim()
    if (!u.startsWith('http')) return
    setFetching(true)
    setFetchDone(false)
    try {
      const result = await analyzeLinkFn({ url: u })
      const meta = result.data
      if (!title && meta.title) setTitle(meta.title)
      if (!desc  && meta.desc)  setDesc(meta.desc)
      if (meta.image) setOgImage(meta.image)
    } catch {
      // fail silently — user can fill manually
    } finally {
      setFetching(false)
      setFetchDone(true)
    }
  }, [title, desc])

  function handleUrlChange(val: string) {
    setUrl(val)
    setType(detectType(val))
    setFetchDone(false)
  }

  // Fetch on paste
  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData('text').trim()
    if (pasted.startsWith('http')) {
      setUrl(pasted)
      setType(detectType(pasted))
      triggerFetch(pasted)
      e.preventDefault()
    }
  }

  // Fetch on blur if URL valid and not yet fetched
  function handleBlur() {
    if (url.startsWith('http') && !fetchDone && !fetching) {
      triggerFetch(url)
    }
  }

  function handleSave() {
    const hasContent = url.trim().startsWith('http') || type === 'nota' || type === 'prompt' || !!pastedImage
    const finalTags = tagInput.trim() ? [...tags, tagInput.replace(/^#+/, '').trim().toLowerCase()].filter(Boolean) : tags
    if (!hasContent || finalTags.length === 0) return
    addLink({
      url: url.trim() || '#',
      title: title.trim() || url.trim() || 'Sem título',
      desc: desc.trim(),
      favicon: url.startsWith('http')
        ? `https://www.google.com/s2/favicons?domain=${getDomain(url)}&sz=32`
        : TYPE_ICONS[type],
      ogImage: pastedImage || ogImage || undefined,
      areaId,
      tags: finalTags,
      type,
    })
    setSaved(true)
    setTimeout(onClose, 800)
  }

  const domain = getDomain(url)
  const effectiveTags = tagInput.trim() ? [...tags, tagInput.replace(/^#+/, '').trim().toLowerCase()].filter(Boolean) : tags
  const canSave = (url.trim().startsWith('http') || type === 'nota' || type === 'prompt' || !!pastedImage) && effectiveTags.length > 0 && !saved

  // Drag
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const dragRef = useRef<{ mx: number; my: number; px: number; py: number } | null>(null)

  function onHeaderMouseDown(e: React.MouseEvent) {
    if ((e.target as HTMLElement).closest('button, a, input, select')) return
    dragRef.current = { mx: e.clientX, my: e.clientY, px: pos.x, py: pos.y }
    function onMove(ev: MouseEvent) {
      if (!dragRef.current) return
      const maxX = window.innerWidth / 2 - 80
      const maxY = window.innerHeight / 2 - 60
      setPos({
        x: Math.max(-maxX, Math.min(maxX, dragRef.current.px + ev.clientX - dragRef.current.mx)),
        y: Math.max(-maxY, Math.min(maxY, dragRef.current.py + ev.clientY - dragRef.current.my)),
      })
    }
    function onUp() { dragRef.current = null; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  return (
    <>
      <div className={s.backdrop} onClick={onClose} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', zIndex: 60, transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`, width: 440, maxWidth: 'calc(100vw - 32px)' }}>
      <motion.div
        className={s.modal}
        style={{ position: 'relative', top: 'auto', left: 'auto', transform: 'none', width: '100%' }}
        initial={{ opacity: 0, y: -16, scale: .96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -16, scale: .96 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      >
        <div className={s.header} onMouseDown={onHeaderMouseDown} style={{ cursor: 'grab', userSelect: 'none' }}>
          <span className={s.headerTitle}>🔗 Salvar conteúdo</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 10, color: 'var(--text2)', background: 'var(--surface2)', padding: '2px 7px', borderRadius: 5, border: '1px solid var(--border)', cursor: 'default', userSelect: 'none' }}>
              ⌘V para colar imagem
            </span>
            <button className={s.closeBtn} onClick={onClose}>✕</button>
          </div>
        </div>

        <div className={s.body}>
          {/* Pasted image preview */}
          <AnimatePresence>
            {pastedImage && (
              <motion.div
                className={s.previewBanner}
                style={{ height: 'auto' }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              >
                <img src={pastedImage} alt="Screenshot colado" className={s.previewImg} style={{ height: 120, objectFit: 'contain', background: 'var(--surface2)' }} />
                <div className={s.previewOverlay} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className={s.previewDomain}>📋 Imagem do clipboard</span>
                  <button onClick={() => setPastedImage('')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.8)', cursor: 'pointer', fontSize: 13 }}>✕</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* OG image preview */}
          <AnimatePresence>
            {ogImage && !pastedImage && (
              <motion.div
                className={s.previewBanner}
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 80 }} exit={{ opacity: 0, height: 0 }}
              >
                <img src={ogImage} alt="" className={s.previewImg} />
                <div className={s.previewOverlay}>
                  <span className={s.previewDomain}>{domain}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* URL — hidden for nota/prompt */}
          {type !== 'nota' && type !== 'prompt' && (
            <div className={s.field}>
              <label className={s.label}>
                URL
                {fetchDone && !fetching && (
                  <span className={s.fetchedBadge} style={{ marginLeft: 8 }}>✓ Análise completa</span>
                )}
              </label>
              <input
                ref={inputRef}
                className={s.input}
                placeholder="Cole a URL aqui..."
                value={url}
                onChange={e => handleUrlChange(e.target.value)}
                onPaste={handlePaste}
                onBlur={handleBlur}
              />
              {domain && <span className={s.domainHint}>{domain}</span>}
            </div>
          )}

          {/* Tipo */}
          <div className={s.field}>
            <label className={s.label}>Tipo</label>
            <div className={s.typePicker}>
              {(Object.keys(TYPE_ICONS) as ContentType[]).map(t => (
                <button
                  key={t}
                  className={`${s.typeBtn} ${type === t ? s.typeBtnActive : ''}`}
                  onClick={() => setType(t)}
                >
                  {TYPE_ICONS[t]} <span>{t}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className={s.field}>
            <label className={s.label}>Título <span className={s.optional}>(opcional)</span></label>
            <input
              className={s.input}
              placeholder={fetching ? 'Buscando...' : 'Nome do conteúdo'}
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          {/* Desc */}
          <div className={s.field}>
            <label className={s.label}>
              {type === 'prompt' ? 'Prompt / Contexto' : 'Descrição'}
              {type !== 'prompt' && <span className={s.optional}> (opcional)</span>}
              {fetching && <span className={s.fetchingBadge} style={{ marginLeft: 8 }}>⬡ IA analisando...</span>}
            </label>
            <textarea
              className={`${s.input} ${s.textarea}`}
              placeholder={
                type === 'prompt'
                  ? 'Cole seu prompt aqui...'
                  : fetching
                    ? 'Gerando descrição...'
                    : 'Descrição ou anotação...'
              }
              value={desc}
              onChange={e => setDesc(e.target.value)}
              rows={type === 'prompt' ? 5 : 2}
            />
          </div>

          {/* Area + Tags row */}
          <div className={s.twoCol}>
            {areas.length > 0 && (
              <div className={s.field}>
                <label className={s.label}>Área <span className={s.optional}>(opcional)</span></label>
                <select className={s.select} value={areaId} onChange={e => setAreaId(e.target.value)}>
                  <option value="">— Sem área —</option>
                  {areas.map(a => <option key={a.id} value={a.id}>{a.emoji} {a.title}</option>)}
                </select>
              </div>
            )}
            <div className={s.field} style={areas.length === 0 ? { gridColumn: '1 / -1' } : {}}>
              <label className={s.label}>
                Tags <span className={s.required}>*</span>
              </label>
              <div className={`${s.tagBox} ${effectiveTags.length === 0 && tagInput.length > 0 ? '' : ''}`}>
                {tags.map(t => (
                  <span key={t} className={s.tagChip}>
                    #{t}
                    <button className={s.tagChipRemove} onClick={() => setTags(prev => prev.filter(x => x !== t))}>✕</button>
                  </span>
                ))}
                <input
                  className={s.tagInput}
                  placeholder={tags.length === 0 ? '#prompt #curso...' : ''}
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={onTagKeyDown}
                  onBlur={onTagBlur}
                />
              </div>
              {effectiveTags.length === 0 && (
                <span className={s.fieldHint}>Espaço, Enter ou vírgula para criar tag</span>
              )}
            </div>
          </div>
        </div>

        <div className={s.footer}>
          <button className={s.cancelBtn} onClick={onClose}>Cancelar</button>
          <button
            className={`${s.saveBtn} ${saved ? s.saveBtnSaved : ''}`}
            onClick={handleSave}
            disabled={!canSave}
          >
            <AnimatePresence mode="wait">
              {saved
                ? <motion.span key="ok"   initial={{opacity:0}} animate={{opacity:1}}>✓ Salvo!</motion.span>
                : <motion.span key="idle" initial={{opacity:0}} animate={{opacity:1}}>Salvar <kbd>⌘↵</kbd></motion.span>
              }
            </AnimatePresence>
          </button>
        </div>
      </motion.div>
      </div>
    </>
  )
}
