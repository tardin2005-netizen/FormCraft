import { useState } from 'react'
import type { ModuleProps } from './moduleProps'
import s from './modules.module.css'
import d from './DesignSystemsModule.module.css'
import DeleteBtn from './DeleteBtn'

type Tipo = 'open-source' | 'proprietary' | 'custom' | 'interno'

interface DSData {
  title: string
  tipo: Tipo
  framework: string
  versao: string
  url: string
  docs: string
  componentes: string
  tokens: string
  uso: string
  pros: string
  contras: string
  notas: string
  tags: string
}

const TIPOS: { key: Tipo; label: string; color: string }[] = [
  { key: 'open-source',  label: 'Open Source',  color: '#10b981' },
  { key: 'proprietary',  label: 'Proprietário',  color: '#f59e0b' },
  { key: 'custom',       label: 'Custom',        color: '#8b5cf6' },
  { key: 'interno',      label: 'Interno',       color: '#3b82f6' },
]

const EMPTY: DSData = {
  title: '', tipo: 'open-source', framework: '', versao: '', url: '',
  docs: '', componentes: '', tokens: '', uso: '', pros: '', contras: '', notas: '', tags: '',
}

export default function DesignSystemsModule({ module, workspaceId, items, addItem, removeItem, toggleStar }: ModuleProps) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<DSData>({ ...EMPTY })
  const [filterTipo, setFilterTipo] = useState<string>('todos')
  const [expanded, setExpanded] = useState<string | null>(null)

  function set(patch: Partial<DSData>) { setForm(p => ({ ...p, ...patch })) }

  function handleAdd() {
    if (!form.title.trim()) return
    addItem({
      workspaceId, moduleId: module.id, contentType: 'design-systems',
      data: form as unknown as Record<string, unknown>,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      starred: false,
    })
    setShowForm(false)
    setForm({ ...EMPTY })
  }

  const tipos = [...new Set(items.map(i => (i.data as unknown as DSData).tipo).filter(Boolean))]
  const visible = filterTipo === 'todos' ? items : items.filter(i => (i.data as unknown as DSData).tipo === filterTipo)

  return (
    <div>
      <div className={s.moduleHeader}>
        <h2 className={s.moduleTitle}>{module.name}</h2>
        <button className={s.addBtn} onClick={() => setShowForm(true)}>+ Novo design system</button>
      </div>

      {tipos.length > 0 && (
        <div className={s.filterRow}>
          <button className={`${s.filterBtn} ${filterTipo === 'todos' ? s.active : ''}`} onClick={() => setFilterTipo('todos')}>Todos</button>
          {tipos.map(t => {
            const ti = TIPOS.find(x => x.key === t)
            return <button key={t} className={`${s.filterBtn} ${filterTipo === t ? s.active : ''}`} onClick={() => setFilterTipo(t)}>{ti?.label || t}</button>
          })}
        </div>
      )}

      {visible.length === 0 ? (
        <div className={s.empty}>
          <div className={s.emptyIcon}>⊡</div>
          <div className={s.emptyTitle}>Nenhum design system ainda</div>
          <div className={s.emptyDesc}>Catalogue sistemas de design com componentes, tokens e contexto de uso.</div>
        </div>
      ) : (
        <div className={d.grid}>
          {visible.map(item => {
            const data = item.data as unknown as DSData
            const isOpen = expanded === item.id
            const tipoInfo = TIPOS.find(x => x.key === data.tipo)
            return (
              <div key={item.id} className={`${d.card} ${item.starred ? d.starred : ''}`}
                style={tipoInfo ? { borderTop: `3px solid ${tipoInfo.color}` } : {}}>
                <div className={d.cardHeader}>
                  <div className={d.initial} style={tipoInfo ? { color: tipoInfo.color, background: `color-mix(in srgb,${tipoInfo.color} 12%,transparent)` } : {}}>
                    {data.title.charAt(0).toUpperCase()}
                  </div>
                  <div className={d.cardActions}>
                    <button className={`${s.starBtn} ${item.starred ? s.starActive : ''}`} onClick={() => toggleStar(item.id)}>{item.starred ? '★' : '☆'}</button>
                    <DeleteBtn onConfirm={() => removeItem(item.id)} />
                  </div>
                </div>

                <div className={d.nameRow}>
                  <div className={d.name}>{data.title}</div>
                  {data.url && <a href={data.url} target="_blank" rel="noopener noreferrer" className={d.link}>↗</a>}
                </div>

                <div className={d.badges}>
                  {tipoInfo && <span className={d.tipoBadge} style={{ background: `color-mix(in srgb,${tipoInfo.color} 10%,transparent)`, color: tipoInfo.color }}>{tipoInfo.label}</span>}
                  {data.framework && <span className={d.fwChip}>{data.framework}</span>}
                  {data.versao && <span className={d.verChip}>v{data.versao}</span>}
                </div>

                {data.uso && <div className={d.uso}>{data.uso}</div>}

                {data.componentes && (
                  <div className={d.chips}>
                    {data.componentes.split(',').map(c => c.trim()).filter(Boolean).map(c => (
                      <span key={c} className={d.componenteChip}>{c}</span>
                    ))}
                  </div>
                )}

                <button className={d.expandBtn} onClick={() => setExpanded(isOpen ? null : item.id)}>
                  {isOpen ? '↑ Ver menos' : '↓ Ver mais'}
                </button>

                {isOpen && (
                  <div className={d.expanded}>
                    {data.tokens && <div className={d.section}><div className={d.sLabel}>Design Tokens</div><p className={d.sText}>{data.tokens}</p></div>}
                    {data.docs && (
                      <div className={d.section}>
                        <div className={d.sLabel}>Documentação</div>
                        <a href={data.docs} target="_blank" rel="noopener noreferrer" className={d.docLink}>{data.docs}</a>
                      </div>
                    )}
                    {(data.pros || data.contras) && (
                      <div className={d.prosContras}>
                        {data.pros && (
                          <div className={d.pro}>
                            <div className={d.pcLabel} style={{ color: '#10b981' }}>Prós</div>
                            <p className={d.sText}>{data.pros}</p>
                          </div>
                        )}
                        {data.contras && (
                          <div className={d.contra}>
                            <div className={d.pcLabel} style={{ color: '#f43f5e' }}>Contras</div>
                            <p className={d.sText}>{data.contras}</p>
                          </div>
                        )}
                      </div>
                    )}
                    {data.notas && <div className={d.section}><div className={d.sLabel}>Observações</div><p className={d.sText}>{data.notas}</p></div>}
                    {item.tags.length > 0 && <div className={s.tags}>{item.tags.map(t => <span key={t} className={s.tag}>#{t}</span>)}</div>}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {showForm && (
        <div className={s.backdrop} onClick={e => { if (e.target === e.currentTarget) setShowForm(false) }}>
          <div className={s.formModal}>
            <h3 className={s.formTitle}>Novo design system</h3>
            <div className={s.formGrid}>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Nome *</label>
                <input className={s.input} value={form.title} onChange={e => set({ title: e.target.value })} placeholder="Ex: Material UI, Radix, Tailwind..." autoFocus />
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Tipo</label>
                <select className={s.input} value={form.tipo} onChange={e => set({ tipo: e.target.value as Tipo })}>
                  {TIPOS.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
                </select>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Framework / Stack</label>
                <input className={s.input} value={form.framework} onChange={e => set({ framework: e.target.value })} placeholder="React, Vue, Web Components..." />
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Versão</label>
                <input className={s.input} value={form.versao} onChange={e => set({ versao: e.target.value })} placeholder="5.0.3" />
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>URL</label>
                <input className={s.input} value={form.url} onChange={e => set({ url: e.target.value })} placeholder="https://..." />
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Documentação</label>
                <input className={s.input} value={form.docs} onChange={e => set({ docs: e.target.value })} placeholder="https://docs.mui.com/..." />
              </div>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Uso no projeto</label>
                <input className={s.input} value={form.uso} onChange={e => set({ uso: e.target.value })} placeholder="Base de componentes do dashboard..." />
              </div>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Componentes notáveis <span style={{ fontWeight: 400, textTransform: 'none', opacity: .7 }}>(separar por vírgula)</span></label>
                <input className={s.input} value={form.componentes} onChange={e => set({ componentes: e.target.value })} placeholder="Button, Dialog, DataGrid, Select..." />
              </div>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Design Tokens</label>
                <input className={s.input} value={form.tokens} onChange={e => set({ tokens: e.target.value })} placeholder="Cores, tipografia, espaçamento, shadows..." />
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Prós</label>
                <textarea className={s.textarea} value={form.pros} onChange={e => set({ pros: e.target.value })} rows={2} placeholder="Pontos positivos..." />
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Contras</label>
                <textarea className={s.textarea} value={form.contras} onChange={e => set({ contras: e.target.value })} rows={2} placeholder="Limitações, desvantagens..." />
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Tags</label>
                <input className={s.input} value={form.tags} onChange={e => set({ tags: e.target.value })} placeholder="components, tokens, headless" />
              </div>
            </div>
            <div className={s.formFooter}>
              <button className={s.cancelBtn} onClick={() => setShowForm(false)}>Cancelar</button>
              <button className={s.saveBtn} onClick={handleAdd} disabled={!form.title.trim()}>Salvar design system</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
