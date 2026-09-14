import { useState } from 'react'
import type { ModuleProps } from './moduleProps'
import s from './modules.module.css'
import d from './AssignmentsModule.module.css'
import DeleteBtn from './DeleteBtn'

type Status = 'pendente' | 'em-andamento' | 'entregue' | 'avaliado'
type Tipo = 'trabalho' | 'seminário' | 'individual' | 'grupo' | 'projeto' | 'prova-prática' | 'outro'

interface AssignmentData {
  title: string
  disciplina: string
  tipo: Tipo
  entrega: string
  status: Status
  nota: string
  peso: string
  descricao: string
  link: string
}

const COLUMNS: { key: Status; label: string; color: string }[] = [
  { key: 'pendente',     label: 'Pendente',      color: '#6b7280' },
  { key: 'em-andamento', label: 'Em andamento',  color: '#f59e0b' },
  { key: 'entregue',     label: 'Entregue',      color: '#3b82f6' },
  { key: 'avaliado',     label: 'Avaliado',      color: '#10b981' },
]

const TIPO_LABELS: Record<Tipo, string> = {
  'trabalho': 'Trabalho', 'seminário': 'Seminário', 'individual': 'Individual',
  'grupo': 'Em grupo', 'projeto': 'Projeto', 'prova-prática': 'Prova prática', 'outro': 'Outro',
}

const EMPTY: AssignmentData = {
  title: '', disciplina: '', tipo: 'trabalho', entrega: '', status: 'pendente',
  nota: '', peso: '', descricao: '', link: '',
}

function daysUntil(dateStr: string): { label: string; urgent: boolean; overdue: boolean } {
  if (!dateStr) return { label: '', urgent: false, overdue: false }
  const diff = new Date(dateStr).setHours(23, 59, 59) - Date.now()
  const days = Math.ceil(diff / 86400000)
  if (days < 0) return { label: `${Math.abs(days)}d atrasado`, urgent: false, overdue: true }
  if (days === 0) return { label: 'Hoje', urgent: true, overdue: false }
  if (days === 1) return { label: 'Amanhã', urgent: true, overdue: false }
  if (days <= 5) return { label: `${days} dias`, urgent: true, overdue: false }
  return { label: `${days} dias`, urgent: false, overdue: false }
}

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  const dt = new Date(dateStr + 'T00:00:00')
  return dt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

export default function AssignmentsModule({ module, workspaceId, items, addItem, removeItem, toggleStar }: ModuleProps) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<AssignmentData>({ ...EMPTY })
  const [dragOver, setDragOver] = useState<Status | null>(null)
  const [dragging, setDragging] = useState<string | null>(null)

  function set(patch: Partial<AssignmentData>) { setForm(p => ({ ...p, ...patch })) }

  function handleAdd() {
    if (!form.title.trim()) return
    addItem({
      workspaceId,
      moduleId: module.id,
      contentType: 'assignments',
      data: form as unknown as Record<string, unknown>,
      tags: [form.disciplina, form.tipo].filter(Boolean),
      starred: false,
    })
    setShowForm(false)
    setForm({ ...EMPTY })
  }

  function handleDrop(status: Status) {
    if (!dragging) return
    const item = items.find(i => i.id === dragging)
    if (!item) return
    const data = item.data as unknown as AssignmentData
    // We can't call updateItem directly from props, so use removeItem + addItem as workaround
    // In this UI we'll just show a visual indicator — full drag impl needs updateItem prop
    setDragOver(null)
    setDragging(null)
  }

  const byStatus = (status: Status) => items.filter(i => (i.data as unknown as AssignmentData).status === status)

  return (
    <div>
      <div className={s.moduleHeader}>
        <h2 className={s.moduleTitle}>{module.name}</h2>
        <button className={s.addBtn} onClick={() => setShowForm(true)}>+ Adicionar trabalho</button>
      </div>

      {items.length === 0 ? (
        <div className={s.empty}>
          <div className={s.emptyIcon}>◈</div>
          <div className={s.emptyTitle}>Nenhum trabalho ainda</div>
          <div className={s.emptyDesc}>Adicione trabalhos e projetos com disciplina, prazo e status de entrega.</div>
        </div>
      ) : (
        <div className={d.kanban}>
          {COLUMNS.map(col => {
            const colItems = byStatus(col.key)
            return (
              <div
                key={col.key}
                className={`${d.column} ${dragOver === col.key ? d.dropTarget : ''}`}
                onDragOver={e => { e.preventDefault(); setDragOver(col.key) }}
                onDragLeave={() => setDragOver(null)}
                onDrop={() => handleDrop(col.key)}
              >
                <div className={d.colHeader}>
                  <span className={d.colDot} style={{ background: col.color }} />
                  <span className={d.colLabel}>{col.label}</span>
                  <span className={d.colCount}>{colItems.length}</span>
                </div>

                <div className={d.colItems}>
                  {colItems.map(item => {
                    const data = item.data as unknown as AssignmentData
                    const due = daysUntil(data.entrega)
                    return (
                      <div
                        key={item.id}
                        className={`${d.card} ${item.starred ? d.starred : ''}`}
                        draggable
                        onDragStart={() => setDragging(item.id)}
                        onDragEnd={() => { setDragging(null); setDragOver(null) }}
                      >
                        <div className={d.cardTitle}>{data.title}</div>

                        <div className={d.cardMeta}>
                          {data.disciplina && (
                            <span className={d.disciplinaChip}>{data.disciplina}</span>
                          )}
                          {data.tipo && (
                            <span className={d.tipoChip}>{TIPO_LABELS[data.tipo]}</span>
                          )}
                        </div>

                        {data.entrega && (
                          <div className={d.dueRow}>
                            <span className={d.dueDate}>{formatDate(data.entrega)}</span>
                            {due.label && (
                              <span className={`${d.dueBadge} ${due.overdue ? d.overdue : due.urgent ? d.urgent : ''}`}>
                                {due.label}
                              </span>
                            )}
                          </div>
                        )}

                        <div className={d.cardFooter}>
                          {data.peso && <span className={d.peso}>Peso: {data.peso}</span>}
                          {data.nota && col.key === 'avaliado' && (
                            <span className={d.nota}>Nota: {data.nota}</span>
                          )}
                          <div className={d.cardActions}>
                            <button
                              className={`${s.starBtn} ${item.starred ? s.starActive : ''}`}
                              onClick={() => toggleStar(item.id)}
                            >
                              {item.starred ? '★' : '☆'}
                            </button>
                            <DeleteBtn onConfirm={() => removeItem(item.id)} />
                          </div>
                        </div>

                        {data.descricao && <div className={d.cardDesc}>{data.descricao}</div>}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showForm && (
        <div className={s.backdrop} onClick={e => { if (e.target === e.currentTarget) setShowForm(false) }}>
          <div className={s.formModal}>
            <h3 className={s.formTitle}>Novo trabalho</h3>
            <div className={s.formGrid}>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Título *</label>
                <input className={s.input} value={form.title} onChange={e => set({ title: e.target.value })} placeholder="Nome do trabalho ou projeto" autoFocus />
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Disciplina</label>
                <input className={s.input} value={form.disciplina} onChange={e => set({ disciplina: e.target.value })} placeholder="Marketing Estratégico" />
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Tipo</label>
                <select className={s.input} value={form.tipo} onChange={e => set({ tipo: e.target.value as Tipo })}>
                  {(Object.entries(TIPO_LABELS) as [Tipo, string][]).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Data de entrega</label>
                <input className={s.input} type="date" value={form.entrega} onChange={e => set({ entrega: e.target.value })} />
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Status</label>
                <select className={s.input} value={form.status} onChange={e => set({ status: e.target.value as Status })}>
                  <option value="pendente">Pendente</option>
                  <option value="em-andamento">Em andamento</option>
                  <option value="entregue">Entregue</option>
                  <option value="avaliado">Avaliado</option>
                </select>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Peso / Valor</label>
                <input className={s.input} value={form.peso} onChange={e => set({ peso: e.target.value })} placeholder="10 pts ou 20%" />
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Nota recebida</label>
                <input className={s.input} value={form.nota} onChange={e => set({ nota: e.target.value })} placeholder="8.5" type="number" min="0" max="10" step="0.1" />
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Link</label>
                <input className={s.input} value={form.link} onChange={e => set({ link: e.target.value })} placeholder="https://..." />
              </div>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Instruções / Descrição</label>
                <textarea className={s.textarea} value={form.descricao} onChange={e => set({ descricao: e.target.value })} rows={3} placeholder="Detalhes do trabalho..." />
              </div>
            </div>
            <div className={s.formFooter}>
              <button className={s.cancelBtn} onClick={() => setShowForm(false)}>Cancelar</button>
              <button className={s.saveBtn} onClick={handleAdd} disabled={!form.title.trim()}>Salvar trabalho</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
