import { useState } from 'react'
import type { ModuleProps } from './moduleProps'
import s from './modules.module.css'
import d from './HeuristicsModule.module.css'
import DeleteBtn from './DeleteBtn'

type Severidade = 0 | 1 | 2 | 3 | 4
type Status = 'identificado' | 'corrigindo' | 'corrigido' | 'aceito'

const NIELSEN = [
  { num: 1,  name: 'Visibilidade do status do sistema',       desc: 'O sistema deve informar os usuários sobre o que está acontecendo.' },
  { num: 2,  name: 'Compatibilidade com o mundo real',        desc: 'Falar a linguagem do usuário, não termos técnicos do sistema.' },
  { num: 3,  name: 'Controle e liberdade do usuário',         desc: 'Saídas de emergência claras para ações acidentais.' },
  { num: 4,  name: 'Consistência e padrões',                  desc: 'Não fazer o usuário adivinhar se palavras e situações diferentes significam a mesma coisa.' },
  { num: 5,  name: 'Prevenção de erros',                      desc: 'Melhor que boas mensagens de erro é um design que previne problemas.' },
  { num: 6,  name: 'Reconhecimento em vez de lembrança',      desc: 'Minimizar a carga de memória do usuário tornando objetos e opções visíveis.' },
  { num: 7,  name: 'Flexibilidade e eficiência',              desc: 'Atalhos para usuários experientes, sem prejudicar iniciantes.' },
  { num: 8,  name: 'Estética e design minimalista',           desc: 'Não mostrar informação irrelevante ou raramente necessária.' },
  { num: 9,  name: 'Ajudar a reconhecer e corrigir erros',   desc: 'Mensagens de erro em linguagem simples, indicando o problema e sugerindo solução.' },
  { num: 10, name: 'Ajuda e documentação',                    desc: 'Facilitar a busca por ajuda, com passos concretos e focados na tarefa.' },
]

const SEV_LABELS: { val: Severidade; label: string; color: string }[] = [
  { val: 0, label: '0 — Sem problema',   color: '#10b981' },
  { val: 1, label: '1 — Cosmético',      color: '#6b7280' },
  { val: 2, label: '2 — Pequeno',        color: '#f59e0b' },
  { val: 3, label: '3 — Grande',         color: '#f97316' },
  { val: 4, label: '4 — Catastrófico',   color: '#f43f5e' },
]

const STATUSES: { key: Status; label: string; color: string }[] = [
  { key: 'identificado', label: 'Identificado', color: '#f43f5e' },
  { key: 'corrigindo',   label: 'Corrigindo',   color: '#f59e0b' },
  { key: 'corrigido',    label: 'Corrigido',    color: '#10b981' },
  { key: 'aceito',       label: 'Aceito',       color: '#6b7280' },
]

interface HeuristicData {
  title: string
  heuristica: number
  severidade: Severidade
  status: Status
  tela: string
  problema: string
  recomendacao: string
  notas: string
  tags: string
}

const EMPTY: HeuristicData = {
  title: '', heuristica: 1, severidade: 2, status: 'identificado',
  tela: '', problema: '', recomendacao: '', notas: '', tags: '',
}

export default function HeuristicsModule({ module, workspaceId, items, addItem, removeItem, toggleStar }: ModuleProps) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<HeuristicData>({ ...EMPTY })
  const [filterStatus, setFilterStatus] = useState<string>('todos')
  const [filterSev, setFilterSev] = useState<string>('todos')
  const [expanded, setExpanded] = useState<string | null>(null)

  function set(patch: Partial<HeuristicData>) { setForm(p => ({ ...p, ...patch })) }

  function handleAdd() {
    if (!form.title.trim() || !form.problema.trim()) return
    addItem({
      workspaceId, moduleId: module.id, contentType: 'heuristics',
      data: form as unknown as Record<string, unknown>,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      starred: false,
    })
    setShowForm(false)
    setForm({ ...EMPTY })
  }

  const statusCounts = STATUSES.reduce((acc, st) => {
    acc[st.key] = items.filter(i => (i.data as unknown as HeuristicData).status === st.key).length
    return acc
  }, {} as Record<string, number>)

  let visible = items
  if (filterStatus !== 'todos') visible = visible.filter(i => (i.data as unknown as HeuristicData).status === filterStatus)
  if (filterSev !== 'todos') visible = visible.filter(i => String((i.data as unknown as HeuristicData).severidade) === filterSev)

  const sortedVisible = [...visible].sort((a, b) => {
    const da = a.data as unknown as HeuristicData
    const db = b.data as unknown as HeuristicData
    return (db.severidade as number) - (da.severidade as number)
  })

  return (
    <div>
      <div className={s.moduleHeader}>
        <h2 className={s.moduleTitle}>{module.name}</h2>
        <button className={s.addBtn} onClick={() => setShowForm(true)}>+ Nova violação</button>
      </div>

      {items.length > 0 && (
        <>
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
          <div className={s.filterRow} style={{ marginTop: 4 }}>
            <span style={{ fontSize: 10, color: 'var(--text2)', alignSelf: 'center' }}>Severidade:</span>
            <button className={`${s.filterBtn} ${filterSev === 'todos' ? s.active : ''}`} onClick={() => setFilterSev('todos')}>Todas</button>
            {SEV_LABELS.slice(1).map(sv => {
              const cnt = items.filter(i => (i.data as unknown as HeuristicData).severidade === sv.val).length
              if (!cnt) return null
              return (
                <button key={sv.val}
                  className={`${s.filterBtn} ${filterSev === String(sv.val) ? s.active : ''}`}
                  onClick={() => setFilterSev(filterSev === String(sv.val) ? 'todos' : String(sv.val))}
                  style={filterSev === String(sv.val) ? { background: `color-mix(in srgb,${sv.color} 15%,transparent)`, borderColor: sv.color, color: sv.color } : {}}>
                  {sv.val}
                </button>
              )
            })}
          </div>
        </>
      )}

      {sortedVisible.length === 0 ? (
        <div className={s.empty}>
          <div className={s.emptyIcon}>◈</div>
          <div className={s.emptyTitle}>Nenhuma violação registrada</div>
          <div className={s.emptyDesc}>Avalie a interface usando as 10 Heurísticas de Nielsen com severidade e recomendações.</div>
        </div>
      ) : (
        <div className={d.list}>
          {sortedVisible.map(item => {
            const data = item.data as unknown as HeuristicData
            const isOpen = expanded === item.id
            const sevInfo = SEV_LABELS.find(x => x.val === data.severidade)
            const stInfo = STATUSES.find(x => x.key === data.status)
            const nielsen = NIELSEN.find(x => x.num === Number(data.heuristica))
            return (
              <div key={item.id} className={`${d.row} ${item.starred ? d.starred : ''}`}
                style={sevInfo ? { borderLeft: `3px solid ${sevInfo.color}` } : {}}>
                <div className={d.rowTop} onClick={() => setExpanded(isOpen ? null : item.id)}>
                  <div className={d.sevDot}
                    style={{ background: sevInfo?.color || 'var(--accent)' }}
                    title={sevInfo?.label}>
                    {data.severidade}
                  </div>
                  <div className={d.rowInfo}>
                    <div className={d.rowTitle}>{data.title}</div>
                    <div className={d.rowMeta}>
                      {nielsen && <span className={d.hNum}>H{nielsen.num}</span>}
                      {nielsen && <span className={d.hName}>{nielsen.name}</span>}
                      {data.tela && <span className={d.telaChip}>{data.tela}</span>}
                      {stInfo && (
                        <span className={d.statusChip}
                          style={{ background: `color-mix(in srgb,${stInfo.color} 10%,transparent)`, color: stInfo.color }}>
                          {stInfo.label}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={d.rowActions}>
                    <button className={`${s.starBtn} ${item.starred ? s.starActive : ''}`} onClick={e => { e.stopPropagation(); toggleStar(item.id) }}>{item.starred ? '★' : '☆'}</button>
                    <DeleteBtn onConfirm={() => removeItem(item.id)} />
                    <span className={d.chevron}>{isOpen ? '↑' : '↓'}</span>
                  </div>
                </div>

                {data.problema && !isOpen && <div className={d.preview}>{data.problema.length > 120 ? data.problema.slice(0, 120) + '…' : data.problema}</div>}

                {isOpen && (
                  <div className={d.expanded}>
                    {nielsen && <div className={d.section}><div className={d.sLabel}>Heurística</div><p className={d.sText}><strong>H{nielsen.num}: {nielsen.name}</strong><br />{nielsen.desc}</p></div>}
                    {data.problema && <div className={d.section}><div className={d.sLabel} style={{ color: '#f43f5e' }}>Problema</div><p className={d.sText}>{data.problema}</p></div>}
                    {data.recomendacao && <div className={d.section}><div className={d.sLabel} style={{ color: '#10b981' }}>Recomendação</div><p className={d.sText}>{data.recomendacao}</p></div>}
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
            <h3 className={s.formTitle}>Nova violação heurística</h3>
            <div className={s.formGrid}>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Título *</label>
                <input className={s.input} value={form.title} onChange={e => set({ title: e.target.value })} placeholder="Ex: Mensagem de erro confusa no formulário" autoFocus />
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Heurística de Nielsen</label>
                <select className={s.input} value={form.heuristica} onChange={e => set({ heuristica: Number(e.target.value) })}>
                  {NIELSEN.map(n => <option key={n.num} value={n.num}>H{n.num}: {n.name}</option>)}
                </select>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Severidade</label>
                <select className={s.input} value={form.severidade} onChange={e => set({ severidade: Number(e.target.value) as Severidade })}>
                  {SEV_LABELS.map(sv => <option key={sv.val} value={sv.val}>{sv.label}</option>)}
                </select>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Status</label>
                <select className={s.input} value={form.status} onChange={e => set({ status: e.target.value as Status })}>
                  {STATUSES.map(st => <option key={st.key} value={st.key}>{st.label}</option>)}
                </select>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Tela / Componente</label>
                <input className={s.input} value={form.tela} onChange={e => set({ tela: e.target.value })} placeholder="Checkout, formulário de cadastro..." />
              </div>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Descrição do problema *</label>
                <textarea className={s.textarea} value={form.problema} onChange={e => set({ problema: e.target.value })} rows={3} placeholder="O que está violando a heurística e como afeta o usuário..." />
              </div>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Recomendação</label>
                <textarea className={s.textarea} value={form.recomendacao} onChange={e => set({ recomendacao: e.target.value })} rows={2} placeholder="Como corrigir ou melhorar..." />
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Tags</label>
                <input className={s.input} value={form.tags} onChange={e => set({ tags: e.target.value })} placeholder="formulário, mobile, feedback" />
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Observações</label>
                <input className={s.input} value={form.notas} onChange={e => set({ notas: e.target.value })} placeholder="Contexto adicional..." />
              </div>
            </div>
            <div className={s.formFooter}>
              <button className={s.cancelBtn} onClick={() => setShowForm(false)}>Cancelar</button>
              <button className={s.saveBtn} onClick={handleAdd} disabled={!form.title.trim() || !form.problema.trim()}>Salvar violação</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
