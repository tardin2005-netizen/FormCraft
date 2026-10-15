import { useState } from 'react'
import type { ModuleProps } from './moduleProps'
import s from './modules.module.css'
import vs from './SnippetsModule.module.css'
import DeleteBtn from './DeleteBtn'
import Glyph from '../components/Glyph'
import ItemActions from './ItemActions'

type SnippetCategory = 'Mensagem' | 'Endereço' | 'Preço' | 'Procedimento' | 'Outro'

interface SnippetData {
  title: string
  body: string
  category: SnippetCategory
  tags: string
}

const CATEGORY_COLOR: Record<SnippetCategory, { bg: string; text: string }> = {
  'Mensagem':    { bg: '#7c6ef722', text: '#7c6ef7' },
  'Endereço':    { bg: '#3ecf8e22', text: '#3ecf8e' },
  'Preço':       { bg: '#f59e0b22', text: '#f59e0b' },
  'Procedimento':{ bg: '#4f8ef722', text: '#4f8ef7' },
  'Outro':       { bg: '#6b728022', text: '#6b7280' },
}

const CATEGORIES: SnippetCategory[] = ['Mensagem', 'Endereço', 'Preço', 'Procedimento', 'Outro']

const EMPTY_FORM: SnippetData = { title: '', body: '', category: 'Outro', tags: '' }

export default function SnippetsModule({ module, workspaceId, items, addItem, removeItem, toggleStar }: ModuleProps) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<SnippetData>(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<SnippetCategory | 'Todos'>('Todos')

  function copy(text: string, id: string) {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  function openNew() { setForm(EMPTY_FORM); setEditingId(null); setShowForm(true) }

  function openEdit(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    const item = items.find(i => i.id === id)
    if (!item) return
    const d = item.data as unknown as SnippetData
    setForm(d)
    setEditingId(id)
    setShowForm(true)
  }

  function handleSave() {
    if (!form.title.trim() || !form.body.trim()) return
    const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean)
    if (editingId) {
      removeItem(editingId)
    }
    addItem({
      workspaceId,
      moduleId: module.id,
      contentType: 'snippets',
      data: form as unknown as Record<string, unknown>,
      tags,
      starred: false,
    })
    setShowForm(false)
    setForm(EMPTY_FORM)
    setEditingId(null)
  }

  const expandedItem = expandedId ? items.find(i => i.id === expandedId) : null
  const expandedData = expandedItem ? (expandedItem.data as unknown as SnippetData) : null

  const visible = items
    .slice()
    .sort((a, b) => (b.starred ? 1 : 0) - (a.starred ? 1 : 0))
    .filter(item => {
      const d = item.data as unknown as SnippetData
      if (activeCategory !== 'Todos' && d.category !== activeCategory) return false
      if (search) {
        const q = search.toLowerCase()
        if (!d.title.toLowerCase().includes(q) && !d.body.toLowerCase().includes(q)) return false
      }
      return true
    })

  return (
    <div>
      <div className={s.moduleHeader}>
        <h2 className={s.moduleTitle}>{module.name || 'Snippets'}</h2>
        <button className={s.addBtn} onClick={openNew}>+ Adicionar</button>
      </div>

      {items.length > 0 && (
        <div className={vs.toolbar}>
          <div className={vs.searchWrap}>
            <span className={vs.searchIcon}><Glyph value="ph:magnifying-glass" size={15} /></span>
            <input
              className={vs.searchInput}
              placeholder="Buscar snippets…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className={vs.searchClear} onClick={() => setSearch('')}>✕</button>
            )}
          </div>
          <div className={vs.filters}>
            {(['Todos', ...CATEGORIES] as (SnippetCategory | 'Todos')[]).map(cat => (
              <button
                key={cat}
                className={`${vs.filterBtn} ${activeCategory === cat ? vs.filterActive : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className={vs.empty}>
          <div className={vs.emptyIcon}><Glyph value="ph:clipboard" size={32} /></div>
          <div className={vs.emptyTitle}>Nenhum snippet salvo</div>
          <div className={vs.emptyDesc}>
            Guarde mensagens prontas, endereços, tabelas de preço e procedimentos. Copie com um clique quando precisar.
          </div>
        </div>
      ) : visible.length === 0 ? (
        <div className={vs.empty}>
          <div className={vs.emptyIcon}><Glyph value="ph:magnifying-glass" size={32} /></div>
          <div className={vs.emptyTitle}>Nenhum resultado</div>
          <div className={vs.emptyDesc}>Tente ajustar o filtro ou a busca.</div>
        </div>
      ) : (
        <div className={vs.grid}>
          {visible.map(item => {
            const d = item.data as unknown as SnippetData
            const color = CATEGORY_COLOR[d.category] ?? CATEGORY_COLOR['Outro']
            const isCopied = copied === item.id
            return (
              <div
                key={item.id}
                className={`${vs.card} ${item.starred ? vs.starred : ''}`}
                onClick={() => setExpandedId(item.id)}
              >
                <div className={vs.cardTop}>
                  <span className={vs.badge} style={{ background: color.bg, color: color.text }}>
                    {d.category}
                  </span>
                  <div className={vs.actions}>
                    <button
                      className={`${s.starBtn} ${item.starred ? s.starActive : ''}`}
                      onClick={e => { e.stopPropagation(); toggleStar(item.id) }}
                    >
                      <Glyph value="ph:star" size={15} weight={item.starred ? 'fill' : 'bold'} />
                    </button>
                    <ItemActions onEdit={e => openEdit(item.id, e)} onDelete={() => removeItem(item.id)} />
                  </div>
                </div>

                <div className={vs.title}>{d.title}</div>
                <div className={vs.preview}>{d.body}</div>

                {item.tags.length > 0 && (
                  <div className={s.tags}>{item.tags.map(t => <span key={t} className={s.tag}>#{t}</span>)}</div>
                )}

                <button
                  className={`${vs.copyBtn} ${isCopied ? vs.copied : ''}`}
                  onClick={e => { e.stopPropagation(); copy(d.body, item.id) }}
                >
                  {isCopied ? <><Glyph value="ph:check" size={13} /> Copiado!</> : <><Glyph value="ph:clipboard" size={13} /> Copiar</>}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Expand modal ── */}
      {expandedId && expandedData && (
        <div className={s.backdrop} onClick={() => setExpandedId(null)}>
          <div className={vs.expandModal} onClick={e => e.stopPropagation()}>
            <div className={vs.expandHeader}>
              <div>
                <span
                  className={vs.badge}
                  style={{
                    background: CATEGORY_COLOR[expandedData.category]?.bg,
                    color: CATEGORY_COLOR[expandedData.category]?.text,
                  }}
                >
                  {expandedData.category}
                </span>
                <div className={vs.expandTitle}>{expandedData.title}</div>
              </div>
              <button className={vs.expandClose} onClick={() => setExpandedId(null)}>✕</button>
            </div>
            <div className={vs.expandBody}>{expandedData.body}</div>
            <div className={vs.expandFooter}>
              <button
                className={`${vs.copyBtn} ${copied === expandedId ? vs.copied : ''}`}
                onClick={() => copy(expandedData.body, expandedId)}
              >
                {copied === expandedId ? <><Glyph value="ph:check" size={13} /> Copiado!</> : <><Glyph value="ph:clipboard" size={13} /> Copiar conteúdo</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Form modal ── */}
      {showForm && (
        <div className={s.backdrop} onClick={e => { if (e.target === e.currentTarget) setShowForm(false) }}>
          <div className={s.formModal}>
            <h3 className={s.formTitle}>{editingId ? 'Editar snippet' : 'Novo snippet'}</h3>
            <div className={s.formGrid}>
              <div className={s.formGroup}>
                <label className={s.label}>Título *</label>
                <input
                  className={s.input}
                  placeholder="ex: Template Recebimento, Endereço Artplan…"
                  value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  autoFocus
                />
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Categoria</label>
                <select
                  className={s.input}
                  value={form.category}
                  onChange={e => setForm(p => ({ ...p, category: e.target.value as SnippetCategory }))}
                >
                  <option>Mensagem</option>
                  <option>Endereço</option>
                  <option>Preço</option>
                  <option>Procedimento</option>
                  <option>Outro</option>
                </select>
              </div>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Conteúdo *</label>
                <textarea
                  className={s.textarea}
                  placeholder="Cole o texto, endereço, tabela ou mensagem aqui…"
                  value={form.body}
                  onChange={e => setForm(p => ({ ...p, body: e.target.value }))}
                  rows={8}
                />
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Tags</label>
                <input
                  className={s.input}
                  placeholder="macbook, artplan, transportadora"
                  value={form.tags}
                  onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
                />
              </div>
            </div>
            <div className={s.formFooter}>
              <button className={s.cancelBtn} onClick={() => setShowForm(false)}>Cancelar</button>
              <button
                className={s.saveBtn}
                onClick={handleSave}
                disabled={!form.title.trim() || !form.body.trim()}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
