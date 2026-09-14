import { useState } from 'react'
import type { ModuleProps } from './moduleProps'
import s from './modules.module.css'
import d from './UserFlowsModule.module.css'
import DeleteBtn from './DeleteBtn'

type Status = 'rascunho' | 'revisao' | 'aprovado'

interface FlowData {
  title: string
  descricao: string
  trigger: string
  passos: string
  endpoint: string
  status: Status
  ferramenta: string
  link: string
  notas: string
  tags: string
}

const STATUSES: { key: Status; label: string; color: string }[] = [
  { key: 'rascunho', label: 'Rascunho', color: '#6b7280' },
  { key: 'revisao',  label: 'Em revisão', color: '#f59e0b' },
  { key: 'aprovado', label: 'Aprovado', color: '#10b981' },
]

const EMPTY: FlowData = {
  title: '', descricao: '', trigger: '', passos: '', endpoint: '',
  status: 'rascunho', ferramenta: '', link: '', notas: '', tags: '',
}

export default function UserFlowsModule({ module, workspaceId, items, addItem, removeItem, toggleStar }: ModuleProps) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<FlowData>({ ...EMPTY })
  const [filterStatus, setFilterStatus] = useState<string>('todos')
  const [expanded, setExpanded] = useState<string | null>(null)

  function set(patch: Partial<FlowData>) { setForm(p => ({ ...p, ...patch })) }

  function handleAdd() {
    if (!form.title.trim()) return
    addItem({
      workspaceId, moduleId: module.id, contentType: 'user-flows',
      data: form as unknown as Record<string, unknown>,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      starred: false,
    })
    setShowForm(false)
    setForm({ ...EMPTY })
  }

  const statusCounts = STATUSES.reduce((acc, st) => {
    acc[st.key] = items.filter(i => (i.data as unknown as FlowData).status === st.key).length
    return acc
  }, {} as Record<string, number>)

  const visible = filterStatus === 'todos' ? items : items.filter(i => (i.data as unknown as FlowData).status === filterStatus)

  return (
    <div>
      <div className={s.moduleHeader}>
        <h2 className={s.moduleTitle}>{module.name}</h2>
        <button className={s.addBtn} onClick={() => setShowForm(true)}>+ Novo fluxo</button>
      </div>

      {items.length > 0 && (
        <div className={s.filterRow}>
          <button className={`${s.filterBtn} ${filterStatus === 'todos' ? s.active : ''}`} onClick={() => setFilterStatus('todos')}>Todos</button>
          {STATUSES.filter(st => statusCounts[st.key] > 0).map(st => (
            <button key={st.key}
              className={`${s.filterBtn} ${filterStatus === st.key ? s.active : ''}`}
              onClick={() => setFilterStatus(filterStatus === st.key ? 'todos' : st.key)}
              style={filterStatus === st.key ? { background: `color-mix(in srgb,${st.color} 15%,transparent)`, borderColor: st.color, color: st.color } : {}}>
              {st.label} <span style={{ opacity: .6, fontSize: 10 }}>({statusCounts[st.key]})</span>
            </button>
          ))}
        </div>
      )}

      {visible.length === 0 ? (
        <div className={s.empty}>
          <div className={s.emptyIcon}>◆</div>
          <div className={s.emptyTitle}>Nenhum fluxo ainda</div>
          <div className={s.emptyDesc}>Documente fluxos de navegação com trigger, passos e endpoint.</div>
        </div>
      ) : (
        <div className={d.list}>
          {visible.map(item => {
            const data = item.data as unknown as FlowData
            const isOpen = expanded === item.id
            const stInfo = STATUSES.find(x => x.key === data.status)
            const steps = data.passos.split('\n').map(l => l.trim()).filter(Boolean)
            return (
              <div key={item.id} className={`${d.card} ${item.starred ? d.starred : ''}`}>
                <div className={d.cardTop} onClick={() => setExpanded(isOpen ? null : item.id)}>
                  <div className={d.meta}>
                    {stInfo && (
                      <span className={d.statusPill}
                        style={{ background: `color-mix(in srgb,${stInfo.color} 15%,transparent)`, color: stInfo.color }}>
                        {stInfo.label}
                      </span>
                    )}
                    {data.ferramenta && <span className={d.toolChip}>{data.ferramenta}</span>}
                  </div>
                  <div className={d.cardActions}>
                    {data.link && (
                      <a href={data.link} target="_blank" rel="noopener noreferrer" className={d.extLink} onClick={e => e.stopPropagation()}>↗ Abrir</a>
                    )}
                    <button className={`${s.starBtn} ${item.starred ? s.starActive : ''}`} onClick={e => { e.stopPropagation(); toggleStar(item.id) }}>{item.starred ? '★' : '☆'}</button>
                    <DeleteBtn onConfirm={() => removeItem(item.id)} />
                    <span className={d.chevron}>{isOpen ? '↑' : '↓'}</span>
                  </div>
                </div>

                <div className={d.cardTitle}>{data.title}</div>
                {data.descricao && <div className={d.desc}>{data.descricao}</div>}

                {/* Inline flow diagram */}
                {(data.trigger || steps.length > 0 || data.endpoint) && (
                  <div className={d.flow}>
                    {data.trigger && (
                      <>
                        <div className={d.flowNode} style={{ background: 'color-mix(in srgb, #10b981 12%, var(--surface2))', borderColor: '#10b981' }}>
                          <div className={d.nodeLabel}>Trigger</div>
                          <div className={d.nodeText}>{data.trigger}</div>
                        </div>
                        {(steps.length > 0 || data.endpoint) && <div className={d.arrow}>↓</div>}
                      </>
                    )}
                    {steps.map((step, i) => (
                      <div key={i} className={d.stepWrap}>
                        <div className={d.flowNode}>
                          <div className={d.nodeNum}>{i + 1}</div>
                          <div className={d.nodeText}>{step}</div>
                        </div>
                        {(i < steps.length - 1 || data.endpoint) && <div className={d.arrow}>↓</div>}
                      </div>
                    ))}
                    {data.endpoint && (
                      <div className={d.flowNode} style={{ background: 'color-mix(in srgb, #3b82f6 12%, var(--surface2))', borderColor: '#3b82f6' }}>
                        <div className={d.nodeLabel}>Endpoint</div>
                        <div className={d.nodeText}>{data.endpoint}</div>
                      </div>
                    )}
                  </div>
                )}

                {isOpen && (
                  <div className={d.expanded}>
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
            <h3 className={s.formTitle}>Novo fluxo</h3>
            <div className={s.formGrid}>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Nome do fluxo *</label>
                <input className={s.input} value={form.title} onChange={e => set({ title: e.target.value })} placeholder="Ex: Fluxo de onboarding" autoFocus />
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Status</label>
                <select className={s.input} value={form.status} onChange={e => set({ status: e.target.value as Status })}>
                  {STATUSES.map(st => <option key={st.key} value={st.key}>{st.label}</option>)}
                </select>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Ferramenta</label>
                <input className={s.input} value={form.ferramenta} onChange={e => set({ ferramenta: e.target.value })} placeholder="Figma, Miro, FigJam..." />
              </div>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Descrição</label>
                <input className={s.input} value={form.descricao} onChange={e => set({ descricao: e.target.value })} placeholder="Contexto e objetivo do fluxo..." />
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Trigger / Ponto de entrada</label>
                <input className={s.input} value={form.trigger} onChange={e => set({ trigger: e.target.value })} placeholder="Usuário clica em 'Criar conta'" />
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Endpoint / Resultado final</label>
                <input className={s.input} value={form.endpoint} onChange={e => set({ endpoint: e.target.value })} placeholder="Conta criada, usuário no dashboard" />
              </div>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Passos <span style={{ fontWeight: 400, textTransform: 'none', opacity: .7 }}>(um por linha)</span></label>
                <textarea className={s.textarea} style={{ minHeight: 100 }} value={form.passos} onChange={e => set({ passos: e.target.value })} placeholder={"Tela de boas-vindas\nFormulário de dados\nConfirmação por e-mail\nPerfil de onboarding"} />
              </div>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Link externo</label>
                <input className={s.input} value={form.link} onChange={e => set({ link: e.target.value })} placeholder="https://figma.com/..." />
              </div>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Observações</label>
                <textarea className={s.textarea} value={form.notas} onChange={e => set({ notas: e.target.value })} rows={2} placeholder="Edge cases, decisões, variações..." />
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Tags</label>
                <input className={s.input} value={form.tags} onChange={e => set({ tags: e.target.value })} placeholder="onboarding, mobile, checkout" />
              </div>
            </div>
            <div className={s.formFooter}>
              <button className={s.cancelBtn} onClick={() => setShowForm(false)}>Cancelar</button>
              <button className={s.saveBtn} onClick={handleAdd} disabled={!form.title.trim()}>Salvar fluxo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
