import { useState } from 'react'
import type { ModuleProps } from './moduleProps'
import s from './modules.module.css'
import d from './AccessibilityModule.module.css'
import DeleteBtn from './DeleteBtn'

type Level = 'A' | 'AA' | 'AAA'
type StatusA = 'pass' | 'fail' | 'parcial' | 'na'
type Categoria = 'perceptivel' | 'operavel' | 'compreensivel' | 'robusto' | 'outro'

interface A11yData {
  title: string
  criterio: string
  level: Level
  status: StatusA
  categoria: Categoria
  componente: string
  problema: string
  solucao: string
  link: string
  notas: string
  tags: string
}

const LEVELS: { key: Level; color: string }[] = [
  { key: 'A', color: '#10b981' },
  { key: 'AA', color: '#f59e0b' },
  { key: 'AAA', color: '#8b5cf6' },
]

const STATUSES: { key: StatusA; label: string; color: string }[] = [
  { key: 'pass',    label: 'Pass',    color: '#10b981' },
  { key: 'fail',    label: 'Fail',    color: '#f43f5e' },
  { key: 'parcial', label: 'Parcial', color: '#f59e0b' },
  { key: 'na',      label: 'N/A',     color: '#6b7280' },
]

const CATEGORIAS: { key: Categoria; label: string }[] = [
  { key: 'perceptivel',    label: 'Perceptível' },
  { key: 'operavel',       label: 'Operável' },
  { key: 'compreensivel',  label: 'Compreensível' },
  { key: 'robusto',        label: 'Robusto' },
  { key: 'outro',          label: 'Outro' },
]

const EMPTY: A11yData = {
  title: '', criterio: '', level: 'AA', status: 'fail', categoria: 'perceptivel',
  componente: '', problema: '', solucao: '', link: '', notas: '', tags: '',
}

export default function AccessibilityModule({ module, workspaceId, items, addItem, removeItem, toggleStar }: ModuleProps) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<A11yData>({ ...EMPTY })
  const [filterStatus, setFilterStatus] = useState<string>('todos')
  const [filterLevel, setFilterLevel] = useState<string>('todos')
  const [expanded, setExpanded] = useState<string | null>(null)

  function set(patch: Partial<A11yData>) { setForm(p => ({ ...p, ...patch })) }

  function handleAdd() {
    if (!form.title.trim()) return
    addItem({
      workspaceId, moduleId: module.id, contentType: 'accessibility',
      data: form as unknown as Record<string, unknown>,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      starred: false,
    })
    setShowForm(false)
    setForm({ ...EMPTY })
  }

  const statusCounts = STATUSES.reduce((acc, st) => {
    acc[st.key] = items.filter(i => (i.data as unknown as A11yData).status === st.key).length
    return acc
  }, {} as Record<string, number>)

  const passRate = items.length > 0 ? Math.round((statusCounts['pass'] || 0) / items.filter(i => (i.data as unknown as A11yData).status !== 'na').length * 100) : 0

  let visible = items
  if (filterStatus !== 'todos') visible = visible.filter(i => (i.data as unknown as A11yData).status === filterStatus)
  if (filterLevel !== 'todos') visible = visible.filter(i => (i.data as unknown as A11yData).level === filterLevel)

  return (
    <div>
      <div className={s.moduleHeader}>
        <h2 className={s.moduleTitle}>{module.name}</h2>
        <button className={s.addBtn} onClick={() => setShowForm(true)}>+ Novo critério</button>
      </div>

      {/* Stats bar */}
      {items.length > 0 && (
        <div className={d.statsBar}>
          {STATUSES.map(st => {
            const cnt = statusCounts[st.key] || 0
            if (!cnt) return null
            return (
              <div key={st.key} className={d.stat}
                style={{ background: `color-mix(in srgb,${st.color} 10%,transparent)`, borderColor: `color-mix(in srgb,${st.color} 30%,transparent)` }}>
                <span className={d.statNum} style={{ color: st.color }}>{cnt}</span>
                <span className={d.statLabel}>{st.label}</span>
              </div>
            )
          })}
          {!isNaN(passRate) && (
            <div className={d.stat} style={{ marginLeft: 'auto', background: 'var(--surface2)', borderColor: 'var(--border)' }}>
              <span className={d.statNum} style={{ color: passRate >= 80 ? '#10b981' : passRate >= 50 ? '#f59e0b' : '#f43f5e' }}>{passRate}%</span>
              <span className={d.statLabel}>aprovação</span>
            </div>
          )}
        </div>
      )}

      {items.length > 0 && (
        <div className={s.filterRow}>
          <button className={`${s.filterBtn} ${filterStatus === 'todos' ? s.active : ''}`} onClick={() => setFilterStatus('todos')}>Todos</button>
          {STATUSES.filter(st => statusCounts[st.key] > 0).map(st => (
            <button key={st.key}
              className={`${s.filterBtn} ${filterStatus === st.key ? s.active : ''}`}
              onClick={() => setFilterStatus(filterStatus === st.key ? 'todos' : st.key)}
              style={filterStatus === st.key ? { background: `color-mix(in srgb,${st.color} 15%,transparent)`, borderColor: st.color, color: st.color } : {}}>
              {st.label}
            </button>
          ))}
          <span style={{ width: 1, background: 'var(--border)', alignSelf: 'stretch' }} />
          {LEVELS.map(lv => (
            <button key={lv.key}
              className={`${s.filterBtn} ${filterLevel === lv.key ? s.active : ''}`}
              onClick={() => setFilterLevel(filterLevel === lv.key ? 'todos' : lv.key)}
              style={filterLevel === lv.key ? { background: `color-mix(in srgb,${lv.color} 15%,transparent)`, borderColor: lv.color, color: lv.color } : {}}>
              WCAG {lv.key}
            </button>
          ))}
        </div>
      )}

      {visible.length === 0 ? (
        <div className={s.empty}>
          <div className={s.emptyIcon}>◎</div>
          <div className={s.emptyTitle}>Nenhum critério ainda</div>
          <div className={s.emptyDesc}>Audite critérios WCAG com status, componente afetado e solução.</div>
        </div>
      ) : (
        <div className={d.list}>
          {visible.map(item => {
            const data = item.data as unknown as A11yData
            const isOpen = expanded === item.id
            const stInfo = STATUSES.find(x => x.key === data.status)
            const lvInfo = LEVELS.find(x => x.key === data.level)
            const catInfo = CATEGORIAS.find(x => x.key === data.categoria)
            return (
              <div key={item.id} className={`${d.row} ${item.starred ? d.starred : ''}`}
                style={stInfo ? { borderLeft: `3px solid ${stInfo.color}` } : {}}>
                <div className={d.rowMain} onClick={() => setExpanded(isOpen ? null : item.id)}>
                  <div className={d.rowLeft}>
                    {stInfo && (
                      <div className={d.statusIcon}
                        style={{ background: `color-mix(in srgb,${stInfo.color} 15%,transparent)`, color: stInfo.color }}>
                        {data.status === 'pass' ? '✓' : data.status === 'fail' ? '✕' : data.status === 'parcial' ? '◑' : '—'}
                      </div>
                    )}
                    <div className={d.rowInfo}>
                      <div className={d.rowTitle}>{data.title}</div>
                      <div className={d.rowMeta}>
                        {data.criterio && <span className={d.criterioChip}>{data.criterio}</span>}
                        {lvInfo && <span className={d.levelBadge} style={{ color: lvInfo.color, borderColor: `color-mix(in srgb,${lvInfo.color} 40%,transparent)` }}>WCAG {data.level}</span>}
                        {catInfo && <span className={d.catChip}>{catInfo.label}</span>}
                        {data.componente && <span className={d.compChip}>{data.componente}</span>}
                      </div>
                    </div>
                  </div>
                  <div className={d.rowActions}>
                    <button className={`${s.starBtn} ${item.starred ? s.starActive : ''}`} onClick={e => { e.stopPropagation(); toggleStar(item.id) }}>{item.starred ? '★' : '☆'}</button>
                    <DeleteBtn onConfirm={() => removeItem(item.id)} />
                    <span className={d.chevron}>{isOpen ? '↑' : '↓'}</span>
                  </div>
                </div>

                {data.problema && !isOpen && <div className={d.problemPreview}>{data.problema.length > 120 ? data.problema.slice(0, 120) + '…' : data.problema}</div>}

                {isOpen && (
                  <div className={d.expanded}>
                    {data.problema && <div className={d.section}><div className={d.sLabel} style={{ color: '#f43f5e' }}>Problema</div><p className={d.sText}>{data.problema}</p></div>}
                    {data.solucao && <div className={d.section}><div className={d.sLabel} style={{ color: '#10b981' }}>Solução</div><p className={d.sText}>{data.solucao}</p></div>}
                    {data.link && (
                      <div className={d.section}>
                        <div className={d.sLabel}>Referência WCAG</div>
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
          <div className={s.formModal} style={{ width: 580 }}>
            <h3 className={s.formTitle}>Novo critério de acessibilidade</h3>
            <div className={s.formGrid}>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Título *</label>
                <input className={s.input} value={form.title} onChange={e => set({ title: e.target.value })} placeholder="Ex: Texto alternativo em imagens" autoFocus />
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Critério WCAG</label>
                <input className={s.input} value={form.criterio} onChange={e => set({ criterio: e.target.value })} placeholder="1.1.1, 2.1.1, 4.1.2..." />
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Nível</label>
                <select className={s.input} value={form.level} onChange={e => set({ level: e.target.value as Level })}>
                  <option value="A">A</option>
                  <option value="AA">AA</option>
                  <option value="AAA">AAA</option>
                </select>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Status</label>
                <select className={s.input} value={form.status} onChange={e => set({ status: e.target.value as StatusA })}>
                  {STATUSES.map(st => <option key={st.key} value={st.key}>{st.label}</option>)}
                </select>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Categoria</label>
                <select className={s.input} value={form.categoria} onChange={e => set({ categoria: e.target.value as Categoria })}>
                  {CATEGORIAS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                </select>
              </div>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Componente / Página afetada</label>
                <input className={s.input} value={form.componente} onChange={e => set({ componente: e.target.value })} placeholder="Header, formulário de login, imagens do produto..." />
              </div>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Descrição do problema</label>
                <textarea className={s.textarea} value={form.problema} onChange={e => set({ problema: e.target.value })} rows={2} placeholder="O que está errado e como afeta o usuário..." />
              </div>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Solução</label>
                <textarea className={s.textarea} value={form.solucao} onChange={e => set({ solucao: e.target.value })} rows={2} placeholder="Como corrigir..." />
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Link WCAG</label>
                <input className={s.input} value={form.link} onChange={e => set({ link: e.target.value })} placeholder="https://www.w3.org/WAI/WCAG21/..." />
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Tags</label>
                <input className={s.input} value={form.tags} onChange={e => set({ tags: e.target.value })} placeholder="imagem, aria, contraste" />
              </div>
            </div>
            <div className={s.formFooter}>
              <button className={s.cancelBtn} onClick={() => setShowForm(false)}>Cancelar</button>
              <button className={s.saveBtn} onClick={handleAdd} disabled={!form.title.trim()}>Salvar critério</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
