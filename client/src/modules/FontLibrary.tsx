import { useState } from 'react'
import type { ModuleProps } from './moduleProps'
import s from './modules.module.css'
import DeleteBtn from './DeleteBtn'

interface FontData {
  name: string
  category: 'sans-serif' | 'serif' | 'display' | 'mono' | 'variable'
  weights: string
  foundry: string
  url: string
  tags: string
  notes: string
  previewText: string
  rating: 1 | 2 | 3 | 4 | 5
}

const CATEGORY_LABELS: Record<string, string> = {
  'sans-serif': 'Sans-serif',
  'serif': 'Serif',
  'display': 'Display',
  'mono': 'Mono',
  'variable': 'Variable',
}

const WEIGHT_SAMPLES = ['100 Thin', '200 ExtraLight', '300 Light', '400 Regular', '500 Medium', '600 SemiBold', '700 Bold', '800 ExtraBold', '900 Black']

export default function FontLibrary({ module, workspaceId, items, addItem, removeItem, toggleStar }: ModuleProps) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<FontData>({
    name: '', category: 'sans-serif', weights: '400, 700', foundry: '',
    url: '', tags: '', notes: '', previewText: 'Aa Bb Cc', rating: 4,
  })
  const [filter, setFilter] = useState<string>('Todas')

  function handleAdd() {
    if (!form.name.trim()) return
    addItem({
      workspaceId,
      moduleId: module.id,
      contentType: 'fonts',
      data: form as unknown as Record<string, unknown>,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      starred: false,
    })
    setShowForm(false)
    setForm({ name: '', category: 'sans-serif', weights: '400, 700', foundry: '', url: '', tags: '', notes: '', previewText: 'Aa Bb Cc', rating: 4 })
  }

  const categories = ['Todas', 'Sans-serif', 'Serif', 'Display', 'Mono', 'Variable']
  const filtered = filter === 'Todas'
    ? items
    : items.filter(i => (i.data.category as string).toLowerCase() === filter.toLowerCase())

  return (
    <div>
      <div className={s.moduleHeader}>
        <h2 className={s.moduleTitle}>{module.name}</h2>
        <button className={s.addBtn} onClick={() => setShowForm(true)}>+ Adicionar fonte</button>
      </div>

      <div className={s.filterRow}>
        {categories.map(c => (
          <button key={c} className={`${s.filterBtn} ${filter === c ? s.active : ''}`} onClick={() => setFilter(c)}>{c}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className={s.empty}>
          <div className={s.emptyIcon}>Aa</div>
          <div className={s.emptyTitle}>Nenhuma fonte ainda</div>
          <div className={s.emptyDesc}>Adicione fontes para criar sua biblioteca tipográfica pessoal.</div>
        </div>
      ) : (
        <div className={s.fontsGrid}>
          {filtered.map(item => {
            const d = item.data as unknown as FontData
            return (
              <div key={item.id} className={`${s.fontCard} ${item.starred ? s.starred : ''}`}>
                <div className={s.fontCardTop}>
                  <div className={s.fontMeta}>
                    <span className={s.fontCategory}>{CATEGORY_LABELS[d.category] ?? d.category}</span>
                    {d.foundry && <span className={s.fontFoundry}>{d.foundry}</span>}
                  </div>
                  <div className={s.fontActions}>
                    <button className={`${s.starBtn} ${item.starred ? s.starActive : ''}`} onClick={() => toggleStar(item.id)}>
                      {item.starred ? '★' : '☆'}
                    </button>
                    {d.url && (
                      <a href={d.url} target="_blank" rel="noreferrer" className={s.linkBtn} title="Abrir fonte">↗</a>
                    )}
                    <DeleteBtn onConfirm={() => removeItem(item.id)} />
                  </div>
                </div>

                <div className={s.fontName}>{d.name}</div>

                <div className={s.fontPreview} style={{ fontFamily: `'${d.name}', sans-serif` }}>
                  {d.previewText || 'Aa Bb Cc Dd Ee Ff'}
                </div>

                <div className={s.fontAlphabet} style={{ fontFamily: `'${d.name}', sans-serif` }}>
                  ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />
                  abcdefghijklmnopqrstuvwxyz<br />
                  0 1 2 3 4 5 6 7 8 9
                </div>

                {d.weights && (
                  <div className={s.fontWeights}>
                    {d.weights.split(',').map(w => w.trim()).filter(Boolean).map(w => (
                      <span key={w} className={s.weightPill}>{w}</span>
                    ))}
                  </div>
                )}

                {item.tags.length > 0 && (
                  <div className={s.tags}>
                    {item.tags.map(t => <span key={t} className={s.tag}>#{t}</span>)}
                  </div>
                )}

                {d.notes && <div className={s.notes}>"{d.notes}"</div>}

                <div className={s.rating}>
                  {[1,2,3,4,5].map(n => (
                    <span key={n} style={{ color: n <= d.rating ? '#f59e0b' : 'var(--border)' }}>★</span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showForm && (
        <div className={s.backdrop} onClick={e => { if (e.target === e.currentTarget) setShowForm(false) }}>
          <div className={s.formModal}>
            <h3 className={s.formTitle}>Adicionar fonte</h3>

            <div className={s.formGrid}>
              <div className={s.formGroup}>
                <label className={s.label}>Nome da fonte *</label>
                <input className={s.input} placeholder="Inter, Geist, Sora..." value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} autoFocus />
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Categoria</label>
                <select className={s.input} value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value as FontData['category'] }))}>
                  <option value="sans-serif">Sans-serif</option>
                  <option value="serif">Serif</option>
                  <option value="display">Display</option>
                  <option value="mono">Mono</option>
                  <option value="variable">Variable</option>
                </select>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Pesos disponíveis</label>
                <input className={s.input} placeholder="400, 500, 700, 900" value={form.weights} onChange={e => setForm(p => ({ ...p, weights: e.target.value }))} />
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Foundry / Autor</label>
                <input className={s.input} placeholder="Google Fonts, Adobe..." value={form.foundry} onChange={e => setForm(p => ({ ...p, foundry: e.target.value }))} />
              </div>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>URL</label>
                <input className={s.input} placeholder="https://fonts.google.com/..." value={form.url} onChange={e => setForm(p => ({ ...p, url: e.target.value }))} />
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Preview</label>
                <input className={s.input} placeholder="Aa Bb Cc" value={form.previewText} onChange={e => setForm(p => ({ ...p, previewText: e.target.value }))} />
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Tags</label>
                <input className={s.input} placeholder="ui, minimal, clean" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} />
              </div>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Observações</label>
                <textarea className={s.textarea} placeholder="Onde usar, quando evitar, projetos..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Avaliação</label>
                <div className={s.ratingInput}>
                  {[1,2,3,4,5].map(n => (
                    <button key={n} className={s.ratingBtn} onClick={() => setForm(p => ({ ...p, rating: n as FontData['rating'] }))}>
                      <span style={{ color: n <= form.rating ? '#f59e0b' : 'var(--border)', fontSize: 20 }}>★</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className={s.formFooter}>
              <button className={s.cancelBtn} onClick={() => setShowForm(false)}>Cancelar</button>
              <button className={s.saveBtn} onClick={handleAdd} disabled={!form.name.trim()}>Salvar fonte</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
