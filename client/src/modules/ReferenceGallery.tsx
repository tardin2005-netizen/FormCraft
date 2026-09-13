import { useState, useEffect, useRef } from 'react'
import type { ModuleProps } from './moduleProps'
import s from './modules.module.css'
import DeleteBtn from './DeleteBtn'

interface ReferenceData {
  title: string
  url: string
  imageUrl: string
  pastedImage?: string
  description: string
  why: string
  tags: string
  category: string
}

export default function ReferenceGallery({ module, workspaceId, items, addItem, removeItem, toggleStar }: ModuleProps) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<ReferenceData>({ title: '', url: '', imageUrl: '', pastedImage: '', description: '', why: '', tags: '', category: '' })
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const fileInputRef = useRef<HTMLInputElement>(null)

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
          reader.onload = ev => setForm(p => ({ ...p, pastedImage: ev.target?.result as string }))
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
    reader.onload = ev => setForm(p => ({ ...p, pastedImage: ev.target?.result as string }))
    reader.readAsDataURL(file)
  }

  function handleAdd() {
    if (!form.title.trim()) return
    addItem({
      workspaceId,
      moduleId: module.id,
      contentType: module.type as 'references',
      data: form as unknown as Record<string, unknown>,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      starred: false,
    })
    setShowForm(false)
    setForm({ title: '', url: '', imageUrl: '', pastedImage: '', description: '', why: '', tags: '', category: '' })
  }

  return (
    <div>
      <div className={s.moduleHeader}>
        <h2 className={s.moduleTitle}>{module.name}</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className={`${s.viewToggle} ${view === 'grid' ? s.active : ''}`} onClick={() => setView('grid')}>⊞</button>
          <button className={`${s.viewToggle} ${view === 'list' ? s.active : ''}`} onClick={() => setView('list')}>☰</button>
          <button className={s.addBtn} onClick={() => setShowForm(true)}>+ Adicionar</button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className={s.empty}>
          <div className={s.emptyIcon}>◈</div>
          <div className={s.emptyTitle}>Nenhuma referência ainda</div>
          <div className={s.emptyDesc}>Salve screenshots, links e interfaces que te inspiram — e anote por que as salvou.</div>
        </div>
      ) : view === 'grid' ? (
        <div className={s.refGrid}>
          {items.map(item => {
            const d = item.data as unknown as ReferenceData
            return (
              <div key={item.id} className={`${s.refCard} ${item.starred ? s.starred : ''}`}>
                {(d.pastedImage || d.imageUrl) ? (
                  <img src={d.pastedImage || d.imageUrl} alt={d.title} className={s.refImage} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                ) : (
                  <div className={s.refImagePlaceholder}>{d.url ? '🔗' : '◈'}</div>
                )}
                <div className={s.refCardBody}>
                  <div className={s.refTopRow}>
                    <span className={s.refTitle}>{d.title}</span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className={`${s.starBtn} ${item.starred ? s.starActive : ''}`} onClick={() => toggleStar(item.id)}>{item.starred ? '★' : '☆'}</button>
                      {d.url && <a href={d.url} target="_blank" rel="noreferrer" className={s.linkBtn}>↗</a>}
                      <DeleteBtn onConfirm={() => removeItem(item.id)} />
                    </div>
                  </div>
                  {d.why && <div className={s.refWhy}>"{d.why}"</div>}
                  {d.description && <div className={s.refDesc}>{d.description}</div>}
                  {item.tags.length > 0 && (
                    <div className={s.tags}>{item.tags.map(t => <span key={t} className={s.tag}>#{t}</span>)}</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className={s.refList}>
          {items.map(item => {
            const d = item.data as unknown as ReferenceData
            return (
              <div key={item.id} className={s.refListItem}>
                <div className={s.refListLeft}>
                  {(d.pastedImage || d.imageUrl)
                    ? <img src={d.pastedImage || d.imageUrl} alt="" className={s.refListThumb} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    : <div className={s.refListThumbPlaceholder}>◈</div>
                  }
                </div>
                <div className={s.refListBody}>
                  <div className={s.refListTitle}>{d.title}</div>
                  {d.why && <div className={s.refWhy} style={{ fontSize: 11 }}>"{d.why}"</div>}
                  {item.tags.length > 0 && (
                    <div className={s.tags}>{item.tags.map(t => <span key={t} className={s.tag}>#{t}</span>)}</div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  <button className={`${s.starBtn} ${item.starred ? s.starActive : ''}`} onClick={() => toggleStar(item.id)}>{item.starred ? '★' : '☆'}</button>
                  {d.url && <a href={d.url} target="_blank" rel="noreferrer" className={s.linkBtn}>↗</a>}
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
            <h3 className={s.formTitle}>Adicionar referência</h3>
            <div className={s.formGrid}>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Título *</label>
                <input className={s.input} placeholder="Nome da referência..." value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} autoFocus />
              </div>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Por que salvei isso?</label>
                <input className={s.input} placeholder="O que me chamou atenção nessa referência..." value={form.why} onChange={e => setForm(p => ({ ...p, why: e.target.value }))} />
              </div>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Imagem <span style={{ fontWeight: 400, textTransform: 'none' }}>(cole ⌘V ou selecione arquivo)</span></label>
                {form.pastedImage ? (
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img src={form.pastedImage} alt="" style={{ maxHeight: 160, maxWidth: '100%', borderRadius: 8, display: 'block', border: '1px solid var(--border)' }} />
                    <button onClick={() => setForm(p => ({ ...p, pastedImage: '' }))}
                      style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,.5)', border: 'none', color: '#fff', borderRadius: 4, cursor: 'pointer', padding: '2px 6px', fontSize: 11 }}>
                      ✕ remover
                    </button>
                  </div>
                ) : (
                  <div className={s.imageDrop} onClick={() => fileInputRef.current?.click()}>
                    <span>📋 Cole com ⌘V ou clique para selecionar</span>
                    <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
                  </div>
                )}
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>URL do site</label>
                <input className={s.input} placeholder="https://..." value={form.url} onChange={e => setForm(p => ({ ...p, url: e.target.value }))} />
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>URL da imagem (externo)</label>
                <input className={s.input} placeholder="https://... (opcional)" value={form.imageUrl} onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))} />
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Categoria</label>
                <input className={s.input} placeholder="Landing Page, Dashboard, Mobile..." value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} />
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Tags</label>
                <input className={s.input} placeholder="minimalist, dark, editorial" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} />
              </div>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Descrição</label>
                <textarea className={s.textarea} placeholder="Detalhes adicionais..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              </div>
            </div>
            <div className={s.formFooter}>
              <button className={s.cancelBtn} onClick={() => setShowForm(false)}>Cancelar</button>
              <button className={s.saveBtn} onClick={handleAdd} disabled={!form.title.trim()}>Salvar referência</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
