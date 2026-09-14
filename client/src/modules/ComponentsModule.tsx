import { useState } from 'react'
import type { ModuleProps } from './moduleProps'
import s from './modules.module.css'
import d from './ComponentsModule.module.css'
import DeleteBtn from './DeleteBtn'

type Tipo = 'button' | 'input' | 'select' | 'modal' | 'card' | 'nav' | 'table' | 'form' | 'feedback' | 'layout' | 'outro'
type Status = 'draft' | 'em-review' | 'ready' | 'deprecated'

interface ComponentData {
  title: string
  tipo: Tipo
  status: Status
  framework: string
  variantes: string
  props: string
  link: string
  descricao: string
  acessibilidade: string
  notas: string
  tags: string
}

const TIPOS: { key: Tipo; label: string }[] = [
  { key: 'button', label: 'Button' }, { key: 'input', label: 'Input' },
  { key: 'select', label: 'Select' }, { key: 'modal', label: 'Modal' },
  { key: 'card', label: 'Card' }, { key: 'nav', label: 'Navigation' },
  { key: 'table', label: 'Table' }, { key: 'form', label: 'Form' },
  { key: 'feedback', label: 'Feedback' }, { key: 'layout', label: 'Layout' },
  { key: 'outro', label: 'Outro' },
]

const STATUSES: { key: Status; label: string; color: string }[] = [
  { key: 'draft',       label: 'Draft',       color: '#6b7280' },
  { key: 'em-review',   label: 'Em review',   color: '#f59e0b' },
  { key: 'ready',       label: 'Ready',       color: '#10b981' },
  { key: 'deprecated',  label: 'Deprecated',  color: '#f43f5e' },
]

const EMPTY: ComponentData = {
  title: '', tipo: 'button', status: 'draft', framework: '',
  variantes: '', props: '', link: '', descricao: '', acessibilidade: '', notas: '', tags: '',
}

export default function ComponentsModule({ module, workspaceId, items, addItem, removeItem, toggleStar }: ModuleProps) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<ComponentData>({ ...EMPTY })
  const [filterTipo, setFilterTipo] = useState<string>('todos')
  const [filterStatus, setFilterStatus] = useState<string>('todos')
  const [expanded, setExpanded] = useState<string | null>(null)

  function set(patch: Partial<ComponentData>) { setForm(p => ({ ...p, ...patch })) }

  function handleAdd() {
    if (!form.title.trim()) return
    addItem({
      workspaceId, moduleId: module.id, contentType: 'components',
      data: form as unknown as Record<string, unknown>,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      starred: false,
    })
    setShowForm(false)
    setForm({ ...EMPTY })
  }

  const tipos = [...new Set(items.map(i => (i.data as unknown as ComponentData).tipo).filter(Boolean))]

  let visible = items
  if (filterTipo !== 'todos') visible = visible.filter(i => (i.data as unknown as ComponentData).tipo === filterTipo)
  if (filterStatus !== 'todos') visible = visible.filter(i => (i.data as unknown as ComponentData).status === filterStatus)

  return (
    <div>
      <div className={s.moduleHeader}>
        <h2 className={s.moduleTitle}>{module.name}</h2>
        <button className={s.addBtn} onClick={() => setShowForm(true)}>+ Novo componente</button>
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

      {items.length > 0 && (
        <div className={s.filterRow} style={{ marginTop: 4 }}>
          {STATUSES.map(st => {
            const cnt = items.filter(i => (i.data as unknown as ComponentData).status === st.key).length
            if (!cnt) return null
            return (
              <button key={st.key}
                className={`${s.filterBtn} ${filterStatus === st.key ? s.active : ''}`}
                onClick={() => setFilterStatus(filterStatus === st.key ? 'todos' : st.key)}
                style={filterStatus === st.key ? { background: `color-mix(in srgb,${st.color} 15%,transparent)`, borderColor: st.color, color: st.color } : {}}>
                {st.label}
              </button>
            )
          })}
        </div>
      )}

      {visible.length === 0 ? (
        <div className={s.empty}>
          <div className={s.emptyIcon}>⊞</div>
          <div className={s.emptyTitle}>Nenhum componente ainda</div>
          <div className={s.emptyDesc}>Documente componentes UI com variantes, props e status de maturidade.</div>
        </div>
      ) : (
        <div className={d.grid}>
          {visible.map(item => {
            const data = item.data as unknown as ComponentData
            const isOpen = expanded === item.id
            const stInfo = STATUSES.find(x => x.key === data.status)
            const tipoInfo = TIPOS.find(x => x.key === data.tipo)
            return (
              <div key={item.id} className={`${d.card} ${item.starred ? d.starred : ''}`}
                onClick={() => setExpanded(isOpen ? null : item.id)}>
                <div className={d.cardTop}>
                  <div className={d.badges}>
                    {tipoInfo && <span className={d.tipoBadge}>{tipoInfo.label}</span>}
                    {stInfo && (
                      <span className={d.statusBadge}
                        style={{ background: `color-mix(in srgb,${stInfo.color} 12%,transparent)`, color: stInfo.color }}>
                        {stInfo.label}
                      </span>
                    )}
                  </div>
                  <div className={d.cardActions} onClick={e => e.stopPropagation()}>
                    <button className={`${s.starBtn} ${item.starred ? s.starActive : ''}`} onClick={() => toggleStar(item.id)}>{item.starred ? '★' : '☆'}</button>
                    <DeleteBtn onConfirm={() => removeItem(item.id)} />
                    <span className={d.chevron}>{isOpen ? '↑' : '↓'}</span>
                  </div>
                </div>

                <div className={d.name}>{data.title}</div>

                {data.descricao && <div className={d.desc}>{data.descricao}</div>}

                <div className={d.meta}>
                  {data.framework && <span className={d.fwChip}>{data.framework}</span>}
                </div>

                {data.variantes && (
                  <div className={d.varianteRow}>
                    {data.variantes.split(',').map(v => v.trim()).filter(Boolean).map(v => (
                      <span key={v} className={d.varianteChip}>{v}</span>
                    ))}
                  </div>
                )}

                {isOpen && (
                  <div className={d.expanded} onClick={e => e.stopPropagation()}>
                    {data.props && (
                      <div className={d.section}>
                        <div className={d.sLabel}>Props / API</div>
                        <pre className={d.propsBlock}>{data.props}</pre>
                      </div>
                    )}
                    {data.acessibilidade && <div className={d.section}><div className={d.sLabel}>Acessibilidade</div><p className={d.sText}>{data.acessibilidade}</p></div>}
                    {data.link && (
                      <div className={d.section}>
                        <div className={d.sLabel}>Link / Storybook</div>
                        <a href={data.link} target="_blank" rel="noopener noreferrer" className={d.linkEl}>{data.link}</a>
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
            <h3 className={s.formTitle}>Novo componente</h3>
            <div className={s.formGrid}>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Nome *</label>
                <input className={s.input} value={form.title} onChange={e => set({ title: e.target.value })} placeholder="Ex: PrimaryButton, SearchInput, DataTable" autoFocus />
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Tipo</label>
                <select className={s.input} value={form.tipo} onChange={e => set({ tipo: e.target.value as Tipo })}>
                  {TIPOS.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
                </select>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Status</label>
                <select className={s.input} value={form.status} onChange={e => set({ status: e.target.value as Status })}>
                  {STATUSES.map(st => <option key={st.key} value={st.key}>{st.label}</option>)}
                </select>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Framework</label>
                <input className={s.input} value={form.framework} onChange={e => set({ framework: e.target.value })} placeholder="React, Vue, Angular..." />
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Link / Storybook</label>
                <input className={s.input} value={form.link} onChange={e => set({ link: e.target.value })} placeholder="https://storybook...." />
              </div>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Descrição</label>
                <input className={s.input} value={form.descricao} onChange={e => set({ descricao: e.target.value })} placeholder="O que o componente faz..." />
              </div>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Variantes <span style={{ fontWeight: 400, textTransform: 'none', opacity: .7 }}>(separar por vírgula)</span></label>
                <input className={s.input} value={form.variantes} onChange={e => set({ variantes: e.target.value })} placeholder="primary, secondary, ghost, danger, sm, md, lg" />
              </div>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Props principais</label>
                <textarea className={`${s.textarea}`} style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12 }} value={form.props} onChange={e => set({ props: e.target.value })} rows={4} placeholder={'onClick: () => void\ndisabled?: boolean\nsize?: "sm" | "md" | "lg"'} />
              </div>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Acessibilidade</label>
                <input className={s.input} value={form.acessibilidade} onChange={e => set({ acessibilidade: e.target.value })} placeholder="role=button, aria-label, keyboard support..." />
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Tags</label>
                <input className={s.input} value={form.tags} onChange={e => set({ tags: e.target.value })} placeholder="core, form, interactive" />
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Observações</label>
                <input className={s.input} value={form.notas} onChange={e => set({ notas: e.target.value })} placeholder="Comportamentos especiais, TODOs..." />
              </div>
            </div>
            <div className={s.formFooter}>
              <button className={s.cancelBtn} onClick={() => setShowForm(false)}>Cancelar</button>
              <button className={s.saveBtn} onClick={handleAdd} disabled={!form.title.trim()}>Salvar componente</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
