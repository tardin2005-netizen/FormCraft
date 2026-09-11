import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCollectionsStore } from '../store/collectionsStore'
import type { Collection } from '../store/collectionsStore'
import { useLinksStore } from '../store/linksStore'
import type { SavedLink } from '../store/linksStore'
import s from './Collections.module.css'

const EMOJIS = ['🎨','⚙️','🤖','🎓','📚','💡','🚀','🎯','🌐','🔬','📸','🎵','💼','🏆','🔐','🌱']
const COLORS  = ['#7c6ef7','#3178c6','#f43f5e','#f59e0b','#10b981','#06b6d4','#8b5cf6','#ec4899','#ef4444','#0ea5e9']

const TYPE_ICON: Record<string, string> = { link:'🔗', pdf:'📄', nota:'📝', imagem:'🖼️', prompt:'🤖' }

/* ── Small item card inside a collection ── */
function MiniCard({ item }: { item: SavedLink }) {
  return (
    <div className={s.miniCard}>
      <span className={s.miniIcon}>{TYPE_ICON[item.type] ?? '🔗'}</span>
      <span className={s.miniTitle}>{item.title}</span>
    </div>
  )
}

/* ── Collection card (closed state) ── */
function ColCard({
  col,
  items,
  onOpen,
  onDelete,
}: {
  col: Collection
  items: SavedLink[]
  onOpen: () => void
  onDelete: () => void
}) {
  const preview = items.slice(0, 4)

  return (
    <motion.div
      className={s.colCard}
      style={{ '--col-color': col.color } as React.CSSProperties}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: .95 }}
      whileHover={{ y: -3, boxShadow: `0 8px 32px ${col.color}33` }}
      transition={{ duration: .2 }}
      onClick={onOpen}
    >
      <div className={s.colCardTop}>
        <span className={s.colEmoji}>{col.emoji}</span>
        <button
          className={s.colDeleteBtn}
          onClick={e => { e.stopPropagation(); onDelete() }}
          title="Remover coleção"
        >✕</button>
      </div>
      <div className={s.colCardStripe} style={{ background: col.color }} />
      <div className={s.colCardBody}>
        <div className={s.colName}>{col.name}</div>
        <div className={s.colDesc}>{col.desc}</div>
        <div className={s.colPreviewGrid}>
          {preview.map(i => (
            <div key={i.id} className={s.colPreviewItem}>
              <span>{TYPE_ICON[i.type] ?? '🔗'}</span>
              <span className={s.colPreviewTitle}>{i.title}</span>
            </div>
          ))}
          {items.length === 0 && <span className={s.colEmpty}>Nenhum item ainda</span>}
        </div>
        <div className={s.colFooter}>
          <span className={s.colCount}>{items.length} {items.length === 1 ? 'item' : 'itens'}</span>
          <span className={s.colOpen}>Abrir →</span>
        </div>
      </div>
    </motion.div>
  )
}

/* ── Collection detail panel ── */
function ColDetail({
  col,
  items,
  allLinks,
  onClose,
  onRemoveItem,
  onAddItem,
}: {
  col: Collection
  items: SavedLink[]
  allLinks: SavedLink[]
  onClose: () => void
  onRemoveItem: (itemId: string) => void
  onAddItem: (itemId: string) => void
}) {
  const [addOpen, setAddOpen] = useState(false)
  const available = allLinks.filter(l => !col.itemIds.includes(l.id))
  const TYPE_COLOR: Record<string, string> = {
    link:'#7c6ef7', pdf:'#f43f5e', nota:'#f59e0b', imagem:'#06b6d4', prompt:'#8b5cf6'
  }

  return (
    <motion.div
      className={s.detail}
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
    >
      <div className={s.detailHeader} style={{ borderBottomColor: col.color + '55' }}>
        <div className={s.detailHeading}>
          <span className={s.detailEmoji}>{col.emoji}</span>
          <div>
            <div className={s.detailName}>{col.name}</div>
            <div className={s.detailDesc}>{col.desc}</div>
          </div>
        </div>
        <div className={s.detailActions}>
          <button
            className={s.detailAddBtn}
            style={{ background: col.color }}
            onClick={() => setAddOpen(v => !v)}
          >
            + Adicionar
          </button>
          <button className={s.detailCloseBtn} onClick={onClose}>✕ Fechar</button>
        </div>
      </div>

      {/* Add from vault */}
      <AnimatePresence>
        {addOpen && (
          <motion.div
            className={s.addFromVault}
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
          >
            <div className={s.vaultLabel}>Adicionar do acervo</div>
            {available.length === 0 && <div className={s.vaultEmpty}>Todos os itens já estão na coleção</div>}
            {available.map(l => (
              <button key={l.id} className={s.vaultItem} onClick={() => { onAddItem(l.id); }}>
                <span>{TYPE_ICON[l.type]}</span>
                <span className={s.vaultItemTitle}>{l.title}</span>
                <span className={s.vaultAdd}>+</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className={s.detailList}>
        {items.length === 0 && (
          <div className={s.detailEmpty}>
            <span>📭</span>
            <span>Nenhum item nesta coleção. Clique em "+ Adicionar" para incluir itens do seu acervo.</span>
          </div>
        )}
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            className={s.detailItem}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ delay: i * .04 }}
          >
            <span className={s.detailItemDot} style={{ background: TYPE_COLOR[item.type] ?? '#7c6ef7' }} />
            <span className={s.detailItemType} style={{ color: TYPE_COLOR[item.type] ?? '#7c6ef7' }}>
              {item.type}
            </span>
            <div className={s.detailItemInfo}>
              <div className={s.detailItemTitle}>{item.title}</div>
              {item.desc && <div className={s.detailItemDesc}>{item.desc}</div>}
            </div>
            <div className={s.detailItemTags}>
              {item.tags.slice(0, 2).map(t => (
                <span key={t} className={s.tag}>{t}</span>
              ))}
            </div>
            <button className={s.detailRemoveBtn} onClick={() => onRemoveItem(item.id)} title="Remover da coleção">✕</button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

/* ── New Collection Modal ── */
function NewColModal({ onSave, onClose }: { onSave: (data: { name: string; emoji: string; color: string; desc: string }) => void; onClose: () => void }) {
  const [name,  setName]  = useState('')
  const [emoji, setEmoji] = useState('🎨')
  const [color, setColor] = useState(COLORS[0])
  const [desc,  setDesc]  = useState('')

  return (
    <>
      <div className={s.modalBackdrop} onClick={onClose} />
      <motion.div
        className={s.newModal}
        initial={{ opacity: 0, scale: .94, y: -12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: .94, y: -12 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      >
        <div className={s.newModalHeader}>
          <span>Nova coleção</span>
          <button className={s.newModalClose} onClick={onClose}>✕</button>
        </div>
        <div className={s.newModalBody}>
          <div className={s.newPreview} style={{ background: color + '18', border: `2px solid ${color}` }}>
            <span style={{ fontSize: 28 }}>{emoji}</span>
            <span className={s.newPreviewName}>{name || 'Nome da coleção'}</span>
          </div>

          <div className={s.newField}>
            <label className={s.newLabel}>Emoji</label>
            <div className={s.emojiGrid}>
              {EMOJIS.map(e => (
                <button key={e} className={`${s.emojiBtn} ${emoji === e ? s.emojiBtnActive : ''}`}
                  style={emoji === e ? { borderColor: color } : {}}
                  onClick={() => setEmoji(e)}>{e}</button>
              ))}
            </div>
          </div>

          <div className={s.newField}>
            <label className={s.newLabel}>Cor</label>
            <div className={s.colorRow}>
              {COLORS.map(c => (
                <button key={c} className={`${s.colorDot} ${color === c ? s.colorDotActive : ''}`}
                  style={{ background: c }}
                  onClick={() => setColor(c)} />
              ))}
            </div>
          </div>

          <div className={s.newField}>
            <label className={s.newLabel}>Nome</label>
            <input className={s.newInput} placeholder="Ex: Referências de UX" value={name} onChange={e => setName(e.target.value)} autoFocus />
          </div>

          <div className={s.newField}>
            <label className={s.newLabel}>Descrição <span style={{ fontWeight: 400, textTransform: 'none' }}>(opcional)</span></label>
            <input className={s.newInput} placeholder="Sobre o que é esta coleção..." value={desc} onChange={e => setDesc(e.target.value)} />
          </div>
        </div>
        <div className={s.newModalFooter}>
          <button className={s.newCancelBtn} onClick={onClose}>Cancelar</button>
          <button
            className={s.newSaveBtn}
            style={{ background: color }}
            disabled={!name.trim()}
            onClick={() => { if (name.trim()) { onSave({ name, emoji, color, desc }); onClose() } }}
          >
            Criar coleção
          </button>
        </div>
      </motion.div>
    </>
  )
}

/* ── Page ── */
export default function Collections() {
  const { collections, addCollection, removeCollection, addItemToCollection, removeItemFromCollection } = useCollectionsStore()
  const { links } = useLinksStore()
  const [openId,    setOpenId]    = useState<string | null>(null)
  const [newOpen,   setNewOpen]   = useState(false)

  const openCol = collections.find(c => c.id === openId) ?? null

  function getItems(col: Collection) {
    return col.itemIds.map(id => links.find(l => l.id === id)).filter(Boolean) as import('../store/linksStore').SavedLink[]
  }

  return (
    <div className={s.page}>
      <div className={s.topBar}>
        <div className={s.topLeft}>
          <h2 className={s.title}>Coleções</h2>
          <span className={s.count}>{collections.length}</span>
        </div>
        <button className={s.newBtn} onClick={() => setNewOpen(true)}>+ Nova coleção</button>
      </div>

      <div className={s.layout}>
        {/* Grid */}
        <div className={`${s.grid} ${openId ? s.gridNarrow : ''}`}>
          <AnimatePresence>
            {collections.map((col, i) => (
              <motion.div key={col.id} transition={{ delay: i * .05 }}>
                <ColCard
                  col={col}
                  items={getItems(col)}
                  onOpen={() => setOpenId(openId === col.id ? null : col.id)}
                  onDelete={() => { removeCollection(col.id); if (openId === col.id) setOpenId(null) }}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {collections.length === 0 && (
            <div className={s.empty}>
              <div>🗂️</div>
              <div>Nenhuma coleção ainda. Crie a primeira!</div>
            </div>
          )}
        </div>

        {/* Detail panel */}
        <AnimatePresence>
          {openId && openCol && (
            <ColDetail
              key={openId}
              col={openCol}
              items={getItems(openCol)}
              allLinks={links}
              onClose={() => setOpenId(null)}
              onRemoveItem={(itemId) => removeItemFromCollection(openId, itemId)}
              onAddItem={(itemId) => addItemToCollection(openId, itemId)}
            />
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {newOpen && (
          <NewColModal
            onSave={(data) => addCollection({ ...data, itemIds: [] })}
            onClose={() => setNewOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
