import { useState, useRef } from 'react'
import EmptyState from '../components/EmptyState'
import { Inbox as InboxIcon, Search } from 'lucide-react'
import { useOutletContext } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useLinksStore } from '../store/linksStore'
import { useContentItemsStore } from '../store/contentItemsStore'
import { useWorkspacesStore } from '../store/workspacesStore'
import { useHubsStore } from '../store/hubsStore'
import { isHubLink, hubLinkToSaved, savedPatchToHubLink } from '../utils/hubLinks'
import type { SavedLink } from '../store/linksStore'
import s from './Inbox.module.css'
import { GridCard, FaviconImg, TypeBadge, TagChip, FullContentModal, useDeleteConfirm, timeAgo, TYPE_COLOR } from '../components/LinkCard'
import Glyph from '../components/Glyph'


type OutletCtx = { onOpenSearch: (q?: string) => void; onOpenSaveLink: () => void }

type View    = 'grid' | 'list' | 'compact'
type Filter  = 'todos' | 'link' | 'pdf' | 'nota' | 'imagem' | 'prompt'

const FILTERS: { key: Filter; label: string; icon: string }[] = [
  { key: 'todos',   label: 'Todos',    icon: 'ph:clipboard' },
  { key: 'link',    label: 'Links',    icon: 'ph:link' },
  { key: 'pdf',     label: 'PDFs',     icon: 'ph:file-text' },
  { key: 'nota',    label: 'Notas',    icon: 'ph:note-pencil' },
  { key: 'imagem',  label: 'Imagens',  icon: 'ph:image' },
  { key: 'prompt',  label: 'Prompts',  icon: 'ph:robot' },
]


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
                  <Glyph value="ph:clipboard" size={13} /> Copiar
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

  const { links: inboxLinks, removeLink, updateLink } = useLinksStore()
  const contentItems = useContentItemsStore(st => st.items)
  const { updateItem, removeItem } = useContentItemsStore.getState()
  const workspaces = useWorkspacesStore(st => st.workspaces)
  const hubs = useHubsStore(st => st.hubs)

  // Links guardados em cada hub aparecem aqui também; editar ou apagar age no item do hub.
  const hubItems = contentItems.filter(isHubLink)
  const hubIds = new Set(hubItems.map(i => i.id))
  const origins = new Map(hubItems.map(i => [i.id, hubs.find(h => h.id === i.workspaceId)?.name ?? workspaces.find(w => w.id === i.workspaceId)?.name ?? 'Hub']))
  const links = [...inboxLinks, ...hubItems.map(hubLinkToSaved)].sort((a, b) => b.savedAt - a.savedAt)
  const remove = (id: string) => (hubIds.has(id) ? removeItem(id) : removeLink(id))
  const update = (id: string, patch: Parameters<typeof updateLink>[1]) => {
    const hubItem = hubItems.find(i => i.id === id)
    if (hubItem) updateItem(id, savedPatchToHubLink(hubItem, patch))
    else updateLink(id, patch)
  }
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
            <span className={s.searchIcon}><Glyph value="ph:magnifying-glass" size={16} /></span>
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
            <Glyph value={f.icon} size={14} /> {f.label}
            <span className={s.filterCount}>
              {f.key === 'todos' ? links.length : links.filter(l => l.type === f.key).length}
            </span>
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      <div className={s.content}>
        {filtered.length === 0 && (links.length === 0 ? (
          <EmptyState
            icon={<InboxIcon size={20} />}
            title="Seu Inbox está vazio"
            actions={[{ label: '+ Adicionar', onClick: onOpenSaveLink }]}
          >
            O Inbox guarda links, PDFs, notas e prompts que ainda não têm lugar. Depois você move cada item para uma área ou coleção. Atalho: Ctrl+S.
          </EmptyState>
        ) : (
          <EmptyState
            icon={<Search size={20} />}
            title={search ? `Nada com “${search}” no Inbox` : 'Nenhum item deste tipo'}
            actions={[{ label: 'Ver tudo', onClick: () => { setFilter('todos'); setSearch('') } }]}
          >
            {`Você tem ${links.length} ${links.length === 1 ? 'item' : 'itens'} no Inbox, mas nenhum com esse filtro.`}
          </EmptyState>
        ))}

        <AnimatePresence>
          {view === 'grid' && filtered.length > 0 && (
            <motion.div className={s.gridView} key="grid"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {filtered.map((item, i) => (
                <motion.div key={item.id} transition={{ delay: i * .04 }} style={{ height: '100%' }}>
                  <GridCard item={item} onDelete={() => remove(item.id)} onUpdate={patch => update(item.id, patch)} onTagSearch={onOpenSearch} origin={origins.has(item.id) ? origins.get(item.id) : undefined} />
                </motion.div>
              ))}
            </motion.div>
          )}

          {view === 'list' && filtered.length > 0 && (
            <motion.div className={s.listView} key="list"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {filtered.map(item => (
                <ListRow key={item.id} item={item} onDelete={() => remove(item.id)} onTagSearch={onOpenSearch} />
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
                <CompactRow key={item.id} item={item} onDelete={() => remove(item.id)} />
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
