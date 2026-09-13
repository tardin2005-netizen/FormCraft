import { useState } from 'react'
import type { ModuleProps } from './moduleProps'
import s from './modules.module.css'

interface GenericData {
  title: string
  content: string
  url: string
  notes: string
  tags: string
}

export default function GenericModule({ module, workspaceId, items, addItem, removeItem, toggleStar }: ModuleProps) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<GenericData>({ title: '', content: '', url: '', notes: '', tags: '' })

  function handleAdd() {
    if (!form.title.trim()) return
    addItem({
      workspaceId,
      moduleId: module.id,
      contentType: module.type as 'notes',
      data: form as unknown as Record<string, unknown>,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      starred: false,
    })
    setShowForm(false)
    setForm({ title: '', content: '', url: '', notes: '', tags: '' })
  }

  return (
    <div>
      <div className={s.moduleHeader}>
        <h2 className={s.moduleTitle}>{module.name}</h2>
        <button className={s.addBtn} onClick={() => setShowForm(true)}>+ Adicionar</button>
      </div>

      {items.length === 0 ? (
        <div className={s.empty}>
          <div className={s.emptyIcon}>{module.icon}</div>
          <div className={s.emptyTitle}>Nenhum item ainda</div>
          <div className={s.emptyDesc}>Adicione itens em {module.name.toLowerCase()} para começar.</div>
        </div>
      ) : (
        <div className={s.genericList}>
          {items.map(item => {
            const d = item.data as unknown as GenericData
            return (
              <div key={item.id} className={`${s.genericItem} ${item.starred ? s.starred : ''}`}>
                <div className={s.genericLeft}>
                  <div className={s.genericTitle}>{d.title}</div>
                  {d.content && <div className={s.genericContent}>{d.content}</div>}
                  {d.url && <a href={d.url} target="_blank" rel="noreferrer" className={s.genericUrl}>{d.url}</a>}
                  {item.tags.length > 0 && (
                    <div className={s.tags}>{item.tags.map(t => <span key={t} className={s.tag}>#{t}</span>)}</div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  <button className={`${s.starBtn} ${item.starred ? s.starActive : ''}`} onClick={() => toggleStar(item.id)}>{item.starred ? '★' : '☆'}</button>
                  <button className={s.removeBtn} onClick={() => removeItem(item.id)}>×</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showForm && (
        <div className={s.backdrop} onClick={e => { if (e.target === e.currentTarget) setShowForm(false) }}>
          <div className={s.formModal}>
            <h3 className={s.formTitle}>Adicionar em {module.name}</h3>
            <div className={s.formGrid}>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Título *</label>
                <input className={s.input} placeholder="Nome do item..." value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} autoFocus />
              </div>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Conteúdo</label>
                <textarea className={s.textarea} placeholder="Texto, anotação, descrição..." value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} />
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>URL</label>
                <input className={s.input} placeholder="https://..." value={form.url} onChange={e => setForm(p => ({ ...p, url: e.target.value }))} />
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Tags</label>
                <input className={s.input} placeholder="tag1, tag2, tag3" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} />
              </div>
            </div>
            <div className={s.formFooter}>
              <button className={s.cancelBtn} onClick={() => setShowForm(false)}>Cancelar</button>
              <button className={s.saveBtn} onClick={handleAdd} disabled={!form.title.trim()}>Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
