import { useState } from 'react'
import type { ModuleProps } from './moduleProps'
import s from './modules.module.css'
import vs from './SnippetsModule.module.css'
import DeleteBtn from './DeleteBtn'

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

const EMPTY_FORM: SnippetData = { title: '', body: '', category: 'Outro', tags: '' }

export default function SnippetsModule({ module, workspaceId, items, addItem, removeItem, toggleStar }: ModuleProps) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<SnippetData>(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  function copy(text: string, id: string) {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  function openNew() { setForm(EMPTY_FORM); setEditingId(null); setShowForm(true) }

  function openEdit(id: string) {
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
      // update via removeItem + addItem (store pattern)
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

  return (
    <div>
      <div className={s.moduleHeader}>
        <h2 className={s.moduleTitle}>{module.name || 'Snippets'}</h2>
        <button className={s.addBtn} onClick={openNew}>+ Adicionar</button>
      </div>

      {items.length === 0 ? (
        <div className={vs.empty}>
          <div className={vs.emptyIcon}>📋</div>
          <div className={vs.emptyTitle}>Nenhum snippet salvo</div>
          <div className={vs.emptyDesc}>
            Guarde mensagens prontas, endereços, tabelas de preço e procedimentos. Copie com um clique quando precisar.
          </div>
        </div>
      ) : (
        <div className={vs.grid}>
          {items.map(item => {
            const d = item.data as unknown as SnippetData
            const color = CATEGORY_COLOR[d.category] ?? CATEGORY_COLOR['Outro']
            const isCopied = copied === item.id
            return (
              <div key={item.id} className={`${vs.card} ${item.starred ? vs.starred : ''}`}>
                <div className={vs.cardTop}>
                  <span className={vs.badge} style={{ background: color.bg, color: color.text }}>
                    {d.category}
                  </span>
                  <div className={vs.actions}>
                    <button className={`${s.starBtn} ${item.starred ? s.starActive : ''}`} onClick={() => toggleStar(item.id)}>
                      {item.starred ? '★' : '☆'}
                    </button>
                    <button className={s.editBtn} onClick={() => openEdit(item.id)} title="Editar">✎</button>
                    <DeleteBtn onConfirm={() => removeItem(item.id)} />
                  </div>
                </div>

                <div className={vs.title}>{d.title}</div>
                <div className={vs.preview}>{d.body}</div>

                {item.tags.length > 0 && (
                  <div className={s.tags}>{item.tags.map(t => <span key={t} className={s.tag}>#{t}</span>)}</div>
                )}

                <button
                  className={`${vs.copyBtn} ${isCopied ? vs.copied : ''}`}
                  onClick={() => copy(d.body, item.id)}
                >
                  {isCopied ? '✓ Copiado!' : '📋 Copiar'}
                </button>
              </div>
            )
          })}
        </div>
      )}

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
