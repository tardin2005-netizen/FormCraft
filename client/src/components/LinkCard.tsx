import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SavedLink } from '../store/linksStore'
import s from '../pages/Inbox.module.css'

export function EditModal({ item, onClose, onSave }: {
  item: SavedLink
  onClose: () => void
  onSave: (patch: Partial<Omit<SavedLink, 'id' | 'savedAt'>>) => void
}) {
  const [title,    setTitle]    = useState(item.title)
  const [desc,     setDesc]     = useState(item.desc)
  const [url,      setUrl]      = useState(item.url && item.url !== '#' ? item.url : '')
  const [tags,     setTags]     = useState<string[]>(item.tags.map(t => t.replace(/^#+/, '')))
  const [tagInput, setTagInput] = useState('')
  const showUrl = item.type === 'link' || item.type === 'pdf'

  function commitTag(raw: string) {
    const t = raw.replace(/^#+/, '').trim().toLowerCase()
    if (t && !tags.includes(t)) setTags(prev => [...prev, t])
    setTagInput('')
  }
  function onTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ' ' || e.key === ',') { e.preventDefault(); commitTag(tagInput) }
    if (e.key === 'Backspace' && !tagInput && tags.length > 0) setTags(prev => prev.slice(0, -1))
  }

  function save() {
    const finalTags = tagInput.trim()
      ? [...tags, tagInput.replace(/^#+/, '').trim().toLowerCase()].filter(Boolean)
      : tags
    const patch: Partial<Omit<SavedLink, 'id' | 'savedAt'>> = {
      title: title.trim(),
      desc:  desc.trim(),
      tags:  finalTags,
    }
    if (showUrl && url.trim()) patch.url = url.trim()
    onSave(patch)
    onClose()
  }

  const fieldLabel: React.CSSProperties = { fontSize: 11, fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: 4 }
  const fieldInput: React.CSSProperties = { width: '100%', padding: '8px 10px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }

  return (
    <motion.div className={s.lightbox} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div
        className={s.fullModal}
        initial={{ scale: .94, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: .94, opacity: 0 }} transition={{ type: 'spring', stiffness: 340, damping: 28 }}
        onClick={e => e.stopPropagation()}
      >
        <div className={s.fullModalHeader}>
          <TypeBadge type={item.type} />
          <span className={s.fullModalTitle}>Editar</span>
          <button className={s.lightboxClose} onClick={onClose}>✕</button>
        </div>
        <div className={s.fullModalBody} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {showUrl && (
            <div>
              <label style={fieldLabel}>URL</label>
              <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." style={fieldInput} />
            </div>
          )}
          <div>
            <label style={fieldLabel}>Título</label>
            <input value={title} onChange={e => setTitle(e.target.value)} style={fieldInput} autoFocus />
          </div>
          <div>
            <label style={fieldLabel}>Descrição</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={4}
              style={{ ...fieldInput, resize: 'vertical', fontFamily: 'inherit' }} />
          </div>
          <div>
            <label style={fieldLabel}>Tags</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '6px 8px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, minHeight: 38, alignItems: 'center' }}>
              {tags.map(t => (
                <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--accent)22', color: 'var(--accent)', border: '1px solid var(--accent)44', borderRadius: 20, padding: '2px 8px', fontSize: 12, fontWeight: 500 }}>
                  #{t}
                  <button onClick={() => setTags(prev => prev.filter(x => x !== t))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, fontSize: 11, lineHeight: 1 }}>✕</button>
                </span>
              ))}
              <input
                value={tagInput} onChange={e => setTagInput(e.target.value)}
                onKeyDown={onTagKeyDown} onBlur={() => { if (tagInput.trim()) commitTag(tagInput) }}
                placeholder={tags.length === 0 ? 'ex: design, ia...' : ''}
                style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text)', fontSize: 13, flex: '1 1 80px', minWidth: 60 }}
              />
            </div>
            <span style={{ fontSize: 10, color: 'var(--text2)', marginTop: 3, display: 'block' }}>Espaço, Enter ou vírgula para criar tag</span>
          </div>
        </div>
        <div className={s.fullModalFooter}>
          <div />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onClose} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text2)', fontSize: 13, cursor: 'pointer' }}>Cancelar</button>
            <button onClick={save} disabled={!title.trim()} style={{ padding: '8px 20px', background: 'var(--accent)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: title.trim() ? 1 : .4 }}>Salvar</button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export const TYPE_COLOR: Record<string, string> = {
  link:   '#7c6ef7',
  pdf:    '#f43f5e',
  nota:   '#f59e0b',
  imagem: '#06b6d4',
  prompt: '#8b5cf6',
}

export function timeAgo(ms: number) {
  const diff = Date.now() - ms
  const h = Math.floor(diff / 3600000)
  const d = Math.floor(diff / 86400000)
  if (d > 0) return `${d}d atrás`
  if (h > 0) return `${h}h atrás`
  return 'agora'
}

export function FaviconImg({ src, fallback }: { src: string; fallback: string }) {
  if (src.startsWith('http')) {
    return <img src={src} alt="" className={s.favicon} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
  }
  return <span className={s.faviconEmoji}>{fallback}</span>
}

export function TypeBadge({ type }: { type: string }) {
  return (
    <span className={s.typeBadge} style={{ background: TYPE_COLOR[type] + '22', color: TYPE_COLOR[type] }}>
      {type}
    </span>
  )
}

export function TagChip({ tag, onSearch }: { tag: string; onSearch?: (t: string) => void }) {
  const display = tag.startsWith('#') ? tag : `#${tag}`
  const clean   = tag.replace(/^#+/, '')
  return (
    <span
      className={s.tagChip}
      style={onSearch ? { cursor: 'pointer' } : undefined}
      onClick={onSearch ? (e) => { e.stopPropagation(); onSearch(`#${clean}`) } : undefined}
      title={onSearch ? `Buscar por ${display}` : undefined}
    >
      {display}
    </span>
  )
}

export function FullContentModal({ item, onClose, onTagSearch }: { item: SavedLink; onClose: () => void; onTagSearch?: (t: string) => void }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(item.desc || item.title).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <motion.div
      className={s.lightbox}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={s.fullModal}
        initial={{ scale: .94, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: .94, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 340, damping: 28 }}
        onClick={e => e.stopPropagation()}
      >
        <div className={s.fullModalHeader}>
          <TypeBadge type={item.type} />
          <span className={s.fullModalTitle}>{item.title}</span>
          <button className={s.lightboxClose} onClick={onClose}>✕</button>
        </div>
        <div className={s.fullModalBody}>
          {item.ogImage && (
            <img src={item.ogImage} alt="" style={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 8, marginBottom: 16 }} />
          )}
          {item.url && item.url !== '#' && (
            <a href={item.url} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--accent)', marginBottom: 12, wordBreak: 'break-all' }}>
              ↗ {item.url}
            </a>
          )}
          <div className={s.fullModalContent}>{item.desc || '—'}</div>
        </div>
        <div className={s.fullModalFooter}>
          <div className={s.fullModalTags}>
            {item.tags.map(t => <TagChip key={t} tag={t} onSearch={onTagSearch} />)}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {item.url && item.url !== '#' && (
              <a href={item.url} target="_blank" rel="noopener noreferrer"
                className={s.fullModalCopy} style={{ textDecoration: 'none', background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)' }}>
                ↗ Abrir link
              </a>
            )}
            <button className={s.fullModalCopy} onClick={copy}>
              {copied ? '✓ Copiado!' : '📋 Copiar'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export function getDomain(url: string) {
  try { return new URL(url).hostname.replace('www.', '') } catch { return '' }
}

/* ── Lightbox ── */
export function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <motion.div
      className={s.lightbox}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <button className={s.lightboxClose} onClick={onClose} title="Fechar">✕</button>
      <motion.img
        src={src}
        className={s.lightboxImg}
        initial={{ scale: .9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: .9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        onClick={e => e.stopPropagation()}
      />
    </motion.div>
  )
}

/* ── Shared delete confirm hook ── */
export function useDeleteConfirm(onDelete: () => void) {
  const [confirming, setConfirming] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function requestDelete(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (confirming) {
      if (timerRef.current) clearTimeout(timerRef.current)
      setConfirming(false)
      onDelete()
    } else {
      setConfirming(true)
      timerRef.current = setTimeout(() => setConfirming(false), 3000)
    }
  }

  function cancelDelete(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (timerRef.current) clearTimeout(timerRef.current)
    setConfirming(false)
  }

  return { confirming, requestDelete, cancelDelete }
}

/* ── Grid card ── */
export function GridCard({ item, onDelete, onUpdate, onTagSearch, origin }: {
  item: SavedLink
  onDelete: () => void
  onUpdate?: (patch: Partial<Omit<SavedLink, 'id' | 'savedAt'>>) => void
  onTagSearch?: (t: string) => void
  /** Where the link lives when shown outside its own page, e.g. "Área · Design". */
  origin?: string
}) {
  const [hovered,   setHovered]   = useState(false)
  const [lightbox,  setLightbox]  = useState(false)
  const [showFull,  setShowFull]  = useState(false)
  const [showEdit,  setShowEdit]  = useState(false)
  const { confirming, requestDelete, cancelDelete } = useDeleteConfirm(onDelete)
  const isExpandable = !!item.desc
  const isImage = item.type === 'imagem'
  const imgSrc  = item.ogImage ?? ''
  const fallbackEmoji = item.type === 'nota' ? '📝' : item.type === 'pdf' ? '📄' : item.type === 'prompt' ? '🤖' : '🔗'
  const color = item.color ?? '#7c6ef7'
  const domain = getDomain(item.url)

  const cardContent = (
    <>
      {/* Thumbnail */}
      <div className={s.cardThumb} style={{ background: `linear-gradient(135deg, ${color}33 0%, ${color}11 100%)` }}>
        {item.ogImage
          ? <img src={item.ogImage} alt="" className={s.cardThumbImg} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
          : <span className={s.cardThumbEmoji}>{fallbackEmoji}</span>
        }
        <AnimatePresence>
          {(hovered || confirming) && (
            <motion.div
              className={`${s.deleteBtn} ${confirming ? s.deleteBtnConfirm : ''}`}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', alignItems: 'center', gap: 4 }}
            >
              {confirming ? (
                <>
                  <span style={{ fontSize: 10, whiteSpace: 'nowrap' }}>Apagar?</span>
                  <button onClick={requestDelete} title="Confirmar" style={{ background: 'rgba(255,255,255,0.25)', border: '1.5px solid rgba(255,255,255,0.5)', cursor: 'pointer', color: '#fff', fontSize: 15, fontWeight: 700, padding: '4px 10px', borderRadius: 6, lineHeight: 1 }}>✓</button>
                  <button onClick={cancelDelete} title="Cancelar" style={{ background: 'rgba(0,0,0,0.3)', border: '1.5px solid rgba(255,255,255,0.3)', cursor: 'pointer', color: '#fff', fontSize: 15, padding: '4px 10px', borderRadius: 6, lineHeight: 1 }}>✕</button>
                </>
              ) : (
                <button onClick={requestDelete} title="Remover" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: 13, width: '100%', height: '100%' }}>✕</button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        {imgSrc && hovered && (
          <motion.div
            className={s.expandHint}
            style={{ cursor: 'zoom-in', pointerEvents: 'auto' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={e => { e.preventDefault(); e.stopPropagation(); setLightbox(true) }}
          >⛶ Ver imagem</motion.div>
        )}
        <TypeBadge type={item.type} />
      </div>
      {/* Body */}
      <div className={s.cardBody}>
        <div className={s.cardTitle}>{item.title || 'Sem título'}</div>
        {domain && !isImage && <div className={s.cardDomain}>
          <FaviconImg src={item.favicon} fallback={fallbackEmoji} />
          <span>{domain}</span>
        </div>}
        {item.desc && <div className={s.cardDesc}>{item.desc}</div>}
        <div className={s.cardFooter}>
          {item.tags.length > 0 && (
            <div className={s.cardTags}>
              {item.tags.slice(0, 3).map(t => <TagChip key={t} tag={t} onSearch={onTagSearch} />)}
            </div>
          )}
          <div className={s.cardActions}>
            <span className={s.cardTime}>{origin ? <span className={s.cardOrigin} title={origin}>{origin}</span> : timeAgo(item.savedAt)}</span>
            <div className={s.cardBtns}>
              {isExpandable && item.desc && (
                <button
                  className={s.cardActionBtn}
                  onClick={e => { e.preventDefault(); e.stopPropagation(); setShowFull(true) }}
                >↗ ver tudo</button>
              )}
              {onUpdate && (
                <button
                  className={s.cardActionBtn}
                  onClick={e => { e.preventDefault(); e.stopPropagation(); setShowEdit(true) }}
                >✎ editar</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )

  const hasRealUrl = item.url && item.url !== '#'

  // If item has a real URL, always open it on click (even if type=imagem).
  // Lightbox is only for pure image items without a URL.
  if (isImage && !hasRealUrl) {
    return (
      <>
        <motion.div
          className={s.gridCard}
          style={{ '--card-color': color, cursor: 'zoom-in' } as React.CSSProperties}
          onHoverStart={() => setHovered(true)}
          onHoverEnd={() => setHovered(false)}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: .95 }}
          whileHover={{ y: -3 }}
          transition={{ duration: .2 }}
          onClick={() => { if (imgSrc) setLightbox(true) }}
        >
          {cardContent}
        </motion.div>
        <AnimatePresence>
          {lightbox && imgSrc && <Lightbox src={imgSrc} onClose={() => setLightbox(false)} />}
          {showEdit && onUpdate && <EditModal item={item} onClose={() => setShowEdit(false)} onSave={onUpdate} />}
        </AnimatePresence>
      </>
    )
  }

  return (
    <>
      <motion.a
        href={hasRealUrl ? item.url : undefined}
        target="_blank"
        rel="noopener noreferrer"
        className={s.gridCard}
        style={{ '--card-color': color } as React.CSSProperties}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: .95 }}
        whileHover={{ y: -3 }}
        transition={{ duration: .2 }}
      >
        {cardContent}
      </motion.a>
      <AnimatePresence>
        {lightbox && imgSrc && <Lightbox src={imgSrc} onClose={() => setLightbox(false)} />}
        {showFull && <FullContentModal item={item} onClose={() => setShowFull(false)} onTagSearch={onTagSearch} />}
        {showEdit && onUpdate && <EditModal item={item} onClose={() => setShowEdit(false)} onSave={onUpdate} />}
      </AnimatePresence>
    </>
  )
}