import { useState, useRef } from 'react'
import { useOutletContext } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useLinksStore } from '../store/linksStore'
import type { SavedLink } from '../store/linksStore'
import s from './Inbox.module.css'

function EditModal({ item, onClose, onSave }: {
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

type OutletCtx = { onOpenSearch: (q?: string) => void; onOpenSaveLink: () => void }

type View    = 'grid' | 'list' | 'compact'
type Filter  = 'todos' | 'link' | 'pdf' | 'nota' | 'imagem' | 'prompt'

const FILTERS: { key: Filter; label: string; icon: string }[] = [
  { key: 'todos',   label: 'Todos',    icon: '📋' },
  { key: 'link',    label: 'Links',    icon: '🔗' },
  { key: 'pdf',     label: 'PDFs',     icon: '📄' },
  { key: 'nota',    label: 'Notas',    icon: '📝' },
  { key: 'imagem',  label: 'Imagens',  icon: '🖼️' },
  { key: 'prompt',  label: 'Prompts',  icon: '🤖' },
]

const TYPE_COLOR: Record<string, string> = {
  link:   '#7c6ef7',
  pdf:    '#f43f5e',
  nota:   '#f59e0b',
  imagem: '#06b6d4',
  prompt: '#8b5cf6',
}

function timeAgo(ms: number) {
  const diff = Date.now() - ms
  const h = Math.floor(diff / 3600000)
  const d = Math.floor(diff / 86400000)
  if (d > 0) return `${d}d atrás`
  if (h > 0) return `${h}h atrás`
  return 'agora'
}

function FaviconImg({ src, fallback }: { src: string; fallback: string }) {
  if (src.startsWith('http')) {
    return <img src={src} alt="" className={s.favicon} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
  }
  return <span className={s.faviconEmoji}>{fallback}</span>
}

function TypeBadge({ type }: { type: string }) {
  return (
    <span className={s.typeBadge} style={{ background: TYPE_COLOR[type] + '22', color: TYPE_COLOR[type] }}>
      {type}
    </span>
  )
}

function TagChip({ tag, onSearch }: { tag: string; onSearch?: (t: string) => void }) {
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

function FullContentModal({ item, onClose, onTagSearch }: { item: SavedLink; onClose: () => void; onTagSearch?: (t: string) => void }) {
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

function getDomain(url: string) {
  try { return new URL(url).hostname.replace('www.', '') } catch { return '' }
}

/* ── Lightbox ── */
function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
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
function useDeleteConfirm(onDelete: () => void) {
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
function GridCard({ item, onDelete, onUpdate, onTagSearch }: { item: SavedLink; onDelete: () => void; onUpdate: (patch: Partial<Omit<SavedLink, 'id' | 'savedAt'>>) => void; onTagSearch?: (t: string) => void }) {
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
            <span className={s.cardTime}>{timeAgo(item.savedAt)}</span>
            <div className={s.cardBtns}>
              {isExpandable && item.desc && (
                <button
                  className={s.cardActionBtn}
                  onClick={e => { e.preventDefault(); e.stopPropagation(); setShowFull(true) }}
                >↗ ver tudo</button>
              )}
              <button
                className={s.cardActionBtn}
                onClick={e => { e.preventDefault(); e.stopPropagation(); setShowEdit(true) }}
              >✎ editar</button>
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
          {showEdit && <EditModal item={item} onClose={() => setShowEdit(false)} onSave={onUpdate} />}
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
        {showEdit && <EditModal item={item} onClose={() => setShowEdit(false)} onSave={onUpdate} />}
      </AnimatePresence>
    </>
  )
}

/* ── List row ── */
function ListRow({ item, onDelete, onTagSearch }: { item: SavedLink; onDelete: () => void; onTagSearch?: (t: string) => void }) {
  const { confirming, requestDelete, cancelDelete } = useDeleteConfirm(onDelete)
  const [expanded, setExpanded] = useState(false)
  const [showFull, setShowFull] = useState(false)
  const hasUrl = item.url && item.url !== '#'
  const isExpandable = !!item.desc

  function handleRowClick(e: React.MouseEvent) {
    if ((e.target as HTMLElement).closest('button')) return
    if (hasUrl) window.open(item.url, '_blank', 'noopener,noreferrer')
    else if (isExpandable) setExpanded(v => !v)
  }

  const fallback = item.type === 'nota' ? '📝' : item.type === 'pdf' ? '📄' : item.type === 'prompt' ? '🤖' : '🔗'

  return (
    <>
      <motion.div
        className={`${s.listRow} ${(hasUrl || isExpandable) ? s.listRowClickable : ''}`}
        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
        transition={{ duration: .18 }}
        whileHover={{ backgroundColor: 'var(--surface2)' }}
        onClick={handleRowClick}
      >
        <div className={s.listLeft}>
          <span className={s.listColorDot} style={{ background: item.color ?? '#7c6ef7' }} />
          <FaviconImg src={item.favicon} fallback={fallback} />
          <div className={s.listMid}>
            <div className={s.listTitle}>
              {item.title}
              {hasUrl && <span className={s.listLinkIcon}>↗</span>}
              {isExpandable && !hasUrl && <span className={s.listExpandChevron}>{expanded ? '↑' : '↓'}</span>}
            </div>
            {item.desc && !expanded && (
              <div className={s.listDesc}>{item.desc.length > 100 ? item.desc.slice(0, 100) + '…' : item.desc}</div>
            )}
            {expanded && (
              <div className={s.listExpandedContent}>
                <div className={s.listFullText}>{item.desc}</div>
                <button className={s.listCopyBtn} onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(item.desc || '').catch(() => {}); }}>
                  📋 Copiar
                </button>
              </div>
            )}
          </div>
        </div>
        <div className={s.listRight}>
          {item.tags.slice(0, 3).map(t => <TagChip key={t} tag={t} onSearch={onTagSearch} />)}
          <TypeBadge type={item.type} />
          <span className={s.listTime}>{timeAgo(item.savedAt)}</span>
          {isExpandable && item.desc && item.desc.length > 100 && !expanded && (
            <button
              className={s.expandBtn}
              onClick={e => { e.stopPropagation(); setShowFull(true) }}
              title="Ver conteúdo completo"
            >↗ ver tudo</button>
          )}
          {confirming ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--danger, #f43f5e)' }}>
              <span style={{ whiteSpace: 'nowrap' }}>Apagar?</span>
              <button onClick={requestDelete} title="Confirmar" style={{ background: '#f43f5e', border: 'none', cursor: 'pointer', color: '#fff', fontSize: 14, fontWeight: 700, padding: '5px 12px', borderRadius: 6, lineHeight: 1 }}>✓</button>
              <button onClick={cancelDelete} title="Cancelar" style={{ background: 'var(--surface2)', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text2)', fontSize: 14, padding: '5px 12px', borderRadius: 6, lineHeight: 1 }}>✕</button>
            </span>
          ) : (
            <button className={s.listDeleteBtn} onClick={requestDelete} title="Remover">✕</button>
          )}
        </div>
      </motion.div>
      <AnimatePresence>
        {showFull && <FullContentModal item={item} onClose={() => setShowFull(false)} onTagSearch={onTagSearch} />}
      </AnimatePresence>
    </>
  )
}

/* ── Compact row ── */
function CompactRow({ item, onDelete }: { item: SavedLink; onDelete: () => void }) {
  const { confirming, requestDelete, cancelDelete } = useDeleteConfirm(onDelete)
  return (
    <motion.div
      className={s.compactRow}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: .15 }}
      whileHover={{ backgroundColor: 'var(--surface2)' }}
    >
      <span className={s.compactDot} style={{ background: item.color ?? '#7c6ef7' }} />
      <span className={s.compactType} style={{ color: TYPE_COLOR[item.type] }}>{item.type}</span>
      <span className={s.compactTitle}>{item.title}</span>
      <span className={s.compactTags}>{item.tags.slice(0, 2).join(', ')}</span>
      <span className={s.compactTime}>{timeAgo(item.savedAt)}</span>
      {confirming ? (
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--danger, #f43f5e)' }}>
          <button onClick={requestDelete} title="Confirmar" style={{ background: '#f43f5e', border: 'none', cursor: 'pointer', color: '#fff', fontSize: 13, fontWeight: 700, padding: '4px 10px', borderRadius: 6, lineHeight: 1 }}>✓</button>
          <button onClick={cancelDelete} title="Cancelar" style={{ background: 'var(--surface2)', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text2)', fontSize: 13, padding: '4px 10px', borderRadius: 6, lineHeight: 1 }}>✕</button>
        </span>
      ) : (
        <button className={s.compactDelete} onClick={requestDelete} title="Remover">✕</button>
      )}
    </motion.div>
  )
}

/* ── Main Inbox ── */
export default function Inbox() {
  const { onOpenSaveLink, onOpenSearch } = useOutletContext<OutletCtx>()

  const { links, removeLink, updateLink } = useLinksStore()
  const [view,   setView]   = useState<View>('grid')
  const [filter, setFilter] = useState<Filter>('todos')
  const [search, setSearch] = useState('')

  const searchTerm = search.startsWith('#') ? search.slice(1) : search

  const filtered = links.filter(l =>
    (filter === 'todos' || l.type === filter) &&
    (
      l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.desc.toLowerCase().includes(searchTerm.toLowerCase())  ||
      l.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  )

  const VIEW_BTNS: { key: View; icon: string; title: string }[] = [
    { key: 'grid',    icon: '▦', title: 'Grade'     },
    { key: 'list',    icon: '☷', title: 'Lista'     },
    { key: 'compact', icon: '≡', title: 'Compacto'  },
  ]

  return (
    <div className={s.page}>
      {/* ── Top bar ── */}
      <div className={s.topBar}>
        <div className={s.topLeft}>
          <h2 className={s.title}>Inbox</h2>
          <span className={s.count}>{filtered.length}</span>
        </div>
        <div className={s.topRight}>
          <div className={s.searchWrap}>
            <span className={s.searchIcon}>🔍</span>
            <input
              className={s.searchInput}
              placeholder="Filtrar..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className={s.viewBtns}>
            {VIEW_BTNS.map(v => (
              <button
                key={v.key}
                className={`${s.viewBtn} ${view === v.key ? s.viewBtnActive : ''}`}
                onClick={() => setView(v.key)}
                title={v.title}
              >
                {v.icon}
              </button>
            ))}
          </div>
          <button className={s.addBtn} onClick={onOpenSaveLink}>
            + Adicionar
          </button>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className={s.filters}>
        {FILTERS.map(f => (
          <button
            key={f.key}
            className={`${s.filterBtn} ${filter === f.key ? s.filterBtnActive : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.icon} {f.label}
            <span className={s.filterCount}>
              {f.key === 'todos' ? links.length : links.filter(l => l.type === f.key).length}
            </span>
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      <div className={s.content}>
        {filtered.length === 0 && (
          <div className={s.empty}>
            <div className={s.emptyIcon}>📭</div>
            <div className={s.emptyTitle}>Inbox vazio</div>
            <div className={s.emptyDesc}>
              Use o botão "+ Adicionar" ou o atalho <kbd>⌘S</kbd> para salvar seu primeiro item.
            </div>
          </div>
        )}

        <AnimatePresence>
          {view === 'grid' && filtered.length > 0 && (
            <motion.div className={s.gridView} key="grid"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {filtered.map((item, i) => (
                <motion.div key={item.id} transition={{ delay: i * .04 }} style={{ height: '100%' }}>
                  <GridCard item={item} onDelete={() => removeLink(item.id)} onUpdate={patch => updateLink(item.id, patch)} onTagSearch={onOpenSearch} />
                </motion.div>
              ))}
            </motion.div>
          )}

          {view === 'list' && filtered.length > 0 && (
            <motion.div className={s.listView} key="list"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {filtered.map(item => (
                <ListRow key={item.id} item={item} onDelete={() => removeLink(item.id)} onTagSearch={onOpenSearch} />
              ))}
            </motion.div>
          )}

          {view === 'compact' && filtered.length > 0 && (
            <motion.div className={s.compactView} key="compact"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className={s.compactHeader}>
                <span>tipo</span><span>título</span><span>tags</span><span>quando</span>
              </div>
              {filtered.map(item => (
                <CompactRow key={item.id} item={item} onDelete={() => removeLink(item.id)} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── FAB ── */}
      <motion.button
        className={s.fab}
        onClick={onOpenSaveLink}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: .94 }}
        title="Adicionar conteúdo (⌘S)"
      >
        + Adicionar
      </motion.button>
    </div>
  )
}
