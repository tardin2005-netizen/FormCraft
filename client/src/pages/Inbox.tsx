import { useState, useRef } from 'react'
import { useOutletContext } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useLinksStore } from '../store/linksStore'
import type { SavedLink } from '../store/linksStore'
import s from './Inbox.module.css'

type OutletCtx = { onOpenSearch: () => void; onOpenSaveLink: () => void }

type View    = 'grid' | 'list' | 'compact'
type Filter  = 'todos' | 'link' | 'pdf' | 'nota' | 'imagem' | 'prompt'

const FILTERS: { key: Filter; label: string; icon: string }[] = [
  { key: 'todos',   label: 'Todos',    icon: '✦' },
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

function TagChip({ tag }: { tag: string }) {
  return <span className={s.tagChip}>{tag}</span>
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
function GridCard({ item, onDelete }: { item: SavedLink; onDelete: () => void }) {
  const [hovered,   setHovered]   = useState(false)
  const [lightbox,  setLightbox]  = useState(false)
  const { confirming, requestDelete, cancelDelete } = useDeleteConfirm(onDelete)
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
                  <button onClick={requestDelete} title="Confirmar" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: 13, padding: '0 2px' }}>✓</button>
                  <button onClick={cancelDelete} title="Cancelar" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: 13, padding: '0 2px' }}>✕</button>
                </>
              ) : (
                <button onClick={requestDelete} title="Remover" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: 13, width: '100%', height: '100%' }}>✕</button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        {isImage && hovered && (
          <motion.div
            className={s.expandHint}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >⛶ Ver em tela cheia</motion.div>
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
          <div className={s.cardTags}>
            {item.tags.slice(0, 2).map(t => <TagChip key={t} tag={t} />)}
          </div>
          <span className={s.cardTime}>{timeAgo(item.savedAt)}</span>
        </div>
      </div>
    </>
  )

  if (isImage) {
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
        </AnimatePresence>
      </>
    )
  }

  return (
    <motion.a
      href={item.url && item.url !== '#' ? item.url : undefined}
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
  )
}

/* ── List row ── */
function ListRow({ item, onDelete }: { item: SavedLink; onDelete: () => void }) {
  const { confirming, requestDelete, cancelDelete } = useDeleteConfirm(onDelete)
  return (
    <motion.div
      className={s.listRow}
      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
      transition={{ duration: .18 }}
      whileHover={{ backgroundColor: 'var(--surface2)' }}
    >
      <div className={s.listLeft}>
        <span className={s.listColorDot} style={{ background: item.color ?? '#7c6ef7' }} />
        <FaviconImg src={item.favicon} fallback={item.type === 'nota' ? '📝' : item.type === 'pdf' ? '📄' : item.type === 'prompt' ? '🤖' : '🔗'} />
        <div className={s.listMid}>
          <div className={s.listTitle}>{item.title}</div>
          {item.desc && <div className={s.listDesc}>{item.desc}</div>}
        </div>
      </div>
      <div className={s.listRight}>
        {item.tags.slice(0, 3).map(t => <TagChip key={t} tag={t} />)}
        <TypeBadge type={item.type} />
        <span className={s.listTime}>{timeAgo(item.savedAt)}</span>
        {confirming ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--danger, #f43f5e)' }}>
            <span>Apagar?</span>
            <button className={s.listDeleteBtn} onClick={requestDelete} title="Confirmar" style={{ color: 'var(--danger, #f43f5e)' }}>✓</button>
            <button className={s.listDeleteBtn} onClick={cancelDelete} title="Cancelar">✕</button>
          </span>
        ) : (
          <button className={s.listDeleteBtn} onClick={requestDelete} title="Remover">✕</button>
        )}
      </div>
    </motion.div>
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
        <span style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 11, color: 'var(--danger, #f43f5e)' }}>
          <span>Apagar?</span>
          <button className={s.compactDelete} onClick={requestDelete} title="Confirmar" style={{ color: 'var(--danger, #f43f5e)' }}>✓</button>
          <button className={s.compactDelete} onClick={cancelDelete} title="Cancelar">✕</button>
        </span>
      ) : (
        <button className={s.compactDelete} onClick={requestDelete} title="Remover">✕</button>
      )}
    </motion.div>
  )
}

/* ── Main Inbox ── */
export default function Inbox() {
  const { onOpenSaveLink } = useOutletContext<OutletCtx>()
  const { links, removeLink } = useLinksStore()
  const [view,   setView]   = useState<View>('grid')
  const [filter, setFilter] = useState<Filter>('todos')
  const [search, setSearch] = useState('')

  const filtered = links.filter(l =>
    (filter === 'todos' || l.type === filter) &&
    (
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.desc.toLowerCase().includes(search.toLowerCase())  ||
      l.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
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
            {f.key !== 'todos' && (
              <span className={s.filterCount}>
                {links.filter(l => l.type === f.key).length}
              </span>
            )}
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
                <motion.div key={item.id} transition={{ delay: i * .04 }}>
                  <GridCard item={item} onDelete={() => removeLink(item.id)} />
                </motion.div>
              ))}
            </motion.div>
          )}

          {view === 'list' && filtered.length > 0 && (
            <motion.div className={s.listView} key="list"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {filtered.map(item => (
                <ListRow key={item.id} item={item} onDelete={() => removeLink(item.id)} />
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
