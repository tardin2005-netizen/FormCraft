import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLinksStore } from '../store/linksStore'
import { useAreasStore } from '../store/areasStore'
import s from './SaveLinkModal.module.css'

interface Props { onClose: () => void }

type ContentType = 'link' | 'pdf' | 'nota' | 'imagem' | 'prompt'
const TYPE_ICONS: Record<ContentType, string> = { link: '🔗', pdf: '📄', nota: '📝', imagem: '🖼️', prompt: '🤖' }

async function fetchMeta(url: string): Promise<{ title: string; desc: string; image: string } | null> {
  try {
    const proxy = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
    const res = await fetch(proxy, { signal: AbortSignal.timeout(6000) })
    const html = await res.text()
    const doc  = new DOMParser().parseFromString(html, 'text/html')
    const og   = (sel: string) => doc.querySelector(sel)?.getAttribute('content') ?? ''
    const title = og('meta[property="og:title"]') || og('meta[name="twitter:title"]') || doc.querySelector('title')?.textContent?.trim() || ''
    const desc  = og('meta[property="og:description"]') || og('meta[name="description"]') || og('meta[name="twitter:description"]') || ''
    const image = og('meta[property="og:image"]') || og('meta[name="twitter:image"]') || ''
    return { title, desc, image }
  } catch {
    return null
  }
}

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
  const [tags,        setTags]        = useState('')
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
            setType('imagem')
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

  const triggerFetch = useCallback(async (rawUrl: string) => {
    const u = rawUrl.trim()
    if (!u.startsWith('http')) return
    setFetching(true)
    setFetchDone(false)
    const meta = await fetchMeta(u)
    setFetching(false)
    setFetchDone(true)
    if (meta) {
      if (!title && meta.title) setTitle(meta.title)
      if (!desc  && meta.desc)  setDesc(meta.desc)
      if (meta.image) setOgImage(meta.image)
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
    if (!hasContent) return
    addLink({
      url: url.trim() || '#',
      title: title.trim() || url.trim() || 'Sem título',
      desc: desc.trim(),
      favicon: url.startsWith('http')
        ? `https://www.google.com/s2/favicons?domain=${getDomain(url)}&sz=32`
        : TYPE_ICONS[type],
      ogImage: pastedImage || ogImage || undefined,
      areaId,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      type,
    })
    setSaved(true)
    setTimeout(onClose, 800)
  }

  const domain = getDomain(url)
  const canSave = (url.trim().startsWith('http') || type === 'nota' || type === 'prompt' || !!pastedImage) && !saved

  return (
    <>
      <div className={s.backdrop} onClick={onClose} />
      <motion.div
        className={s.modal}
        initial={{ opacity: 0, y: -20, scale: .96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: .96 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      >
        <div className={s.header}>
          <span className={s.headerTitle}>🔗 Salvar conteúdo</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 10, color: 'var(--text2)', background: 'var(--surface2)', padding: '2px 7px', borderRadius: 5, border: '1px solid var(--border)' }}>
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

          {/* URL */}
          <div className={s.field}>
            <label className={s.label}>
              URL
              <AnimatePresence>
                {fetching && (
                  <motion.span className={s.fetchingBadge}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    ⟳ Buscando metadados...
                  </motion.span>
                )}
                {fetchDone && !fetching && (
                  <motion.span className={s.fetchedBadge}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    ✓ Metadados carregados
                  </motion.span>
                )}
              </AnimatePresence>
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
          {(desc || fetchDone) && (
            <div className={s.field}>
              <label className={s.label}>Descrição <span className={s.optional}>(opcional)</span></label>
              <textarea
                className={`${s.input} ${s.textarea}`}
                placeholder="Descrição ou anotação..."
                value={desc}
                onChange={e => setDesc(e.target.value)}
                rows={2}
              />
            </div>
          )}

          {/* Area + Tags row */}
          <div className={s.twoCol}>
            <div className={s.field}>
              <label className={s.label}>Área</label>
              <select className={s.select} value={areaId} onChange={e => setAreaId(e.target.value)}>
                {areas.map(a => <option key={a.id} value={a.id}>{a.emoji} {a.title}</option>)}
              </select>
            </div>
            <div className={s.field}>
              <label className={s.label}>Tags <span className={s.optional}>(vírgula)</span></label>
              <input
                className={s.input}
                placeholder="design, ux, ref..."
                value={tags}
                onChange={e => setTags(e.target.value)}
              />
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
    </>
  )
}
