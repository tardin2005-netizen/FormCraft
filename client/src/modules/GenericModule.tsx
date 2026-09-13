import { useState, useEffect, useRef } from 'react'
import type { ModuleProps } from './moduleProps'
import s from './modules.module.css'
import DeleteBtn from './DeleteBtn'

interface GenericData {
  title: string
  content: string
  url: string
  notes: string
  tags: string
  imageData?: string
}

export default function GenericModule({ module, workspaceId, items, addItem, removeItem, toggleStar }: ModuleProps) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<GenericData>({ title: '', content: '', url: '', notes: '', tags: '', imageData: '' })
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Paste listener for images (Cmd+V)
  useEffect(() => {
    if (!showForm) return
    function onPaste(e: ClipboardEvent) {
      const items = e.clipboardData?.items
      if (!items) return
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile()
          if (!file) continue
          const reader = new FileReader()
          reader.onload = ev => setForm(p => ({ ...p, imageData: ev.target?.result as string }))
          reader.readAsDataURL(file)
          e.preventDefault()
          return
        }
      }
    }
    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
  }, [showForm])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setForm(p => ({ ...p, imageData: ev.target?.result as string }))
    reader.readAsDataURL(file)
  }

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
    setForm({ title: '', content: '', url: '', notes: '', tags: '', imageData: '' })
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
          <div className={s.emptyDesc}>Adicione itens em {module.name.toLowerCase()} para começar. Suporta imagens (⌘V para colar).</div>
        </div>
      ) : (
        <div className={s.genericList}>
          {items.map(item => {
            const d = item.data as unknown as GenericData
            return (
              <div key={item.id} className={`${s.genericItem} ${item.starred ? s.starred : ''}`}>
                {d.imageData && (
                  <img src={d.imageData} alt={d.title} className={s.genericThumb} />
                )}
                <div className={s.genericLeft}>
                  <div className={s.genericTitle}>{d.title}</div>
                  {d.content && <div className={s.genericContent}>{d.content}</div>}
                  {d.url && <a href={d.url} target="_blank" rel="noreferrer" className={s.genericUrl}>{d.url}</a>}
                  {d.notes && <div className={s.notes}>"{d.notes}"</div>}
                  {item.tags.length > 0 && (
                    <div className={s.tags}>{item.tags.map(t => <span key={t} className={s.tag}>#{t}</span>)}</div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 4, flexShrink: 0, alignItems: 'center' }}>
                  <button className={`${s.starBtn} ${item.starred ? s.starActive : ''}`} onClick={() => toggleStar(item.id)}>{item.starred ? '★' : '☆'}</button>
                  <DeleteBtn onConfirm={() => removeItem(item.id)} />
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
                <label className={s.label}>Imagem <span style={{ fontWeight: 400, textTransform: 'none' }}>(cole com ⌘V ou selecione)</span></label>
                {form.imageData ? (
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img src={form.imageData} alt="" style={{ maxHeight: 140, maxWidth: '100%', borderRadius: 8, display: 'block', border: '1px solid var(--border)' }} />
                    <button onClick={() => setForm(p => ({ ...p, imageData: '' }))}
                      style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,.5)', border: 'none', color: '#fff', borderRadius: 4, cursor: 'pointer', padding: '2px 6px', fontSize: 11 }}>
                      ✕ remover
                    </button>
                  </div>
                ) : (
                  <div
                    className={s.imageDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <span>📋 Cole com ⌘V ou clique para selecionar arquivo</span>
                    <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
                  </div>
                )}
              </div>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Conteúdo / Descrição</label>
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
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Notas</label>
                <input className={s.input} placeholder="Observações rápidas..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
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
