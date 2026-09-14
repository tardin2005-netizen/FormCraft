import { useState } from 'react'
import type { ModuleProps } from './moduleProps'
import s from './modules.module.css'
import d from './ExamsModule.module.css'
import DeleteBtn from './DeleteBtn'

type Status = 'próxima' | 'realizada' | 'aguardando-nota'
type Tipo = 'prova' | 'avaliação' | 'quiz' | 'prova-final' | 'substitutiva'

interface ExamData {
  title: string
  disciplina: string
  data: string
  hora: string
  local: string
  tipo: Tipo
  conteudo: string
  nota: string
  status: Status
  observacoes: string
}

const TIPO_LABELS: Record<Tipo, string> = {
  'prova': 'Prova', 'avaliação': 'Avaliação', 'quiz': 'Quiz',
  'prova-final': 'Prova final', 'substitutiva': 'Substitutiva',
}

const STATUS_CONFIG: Record<Status, { label: string; color: string }> = {
  'próxima':         { label: 'Próxima',         color: '#3b82f6' },
  'aguardando-nota': { label: 'Aguardando nota', color: '#f59e0b' },
  'realizada':       { label: 'Realizada',        color: '#10b981' },
}

const EMPTY: ExamData = {
  title: '', disciplina: '', data: '', hora: '', local: '',
  tipo: 'prova', conteudo: '', nota: '', status: 'próxima', observacoes: '',
}

function getCountdown(dateStr: string, horaStr: string): { label: string; type: 'future' | 'today' | 'soon' | 'past' } {
  if (!dateStr) return { label: '', type: 'past' }
  const dateTime = new Date(`${dateStr}T${horaStr || '23:59'}`)
  const diff = dateTime.getTime() - Date.now()
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor(diff / 3600000)

  if (diff < 0) return { label: 'Concluída', type: 'past' }
  if (hours < 24) return { label: hours <= 0 ? 'Em breve' : `${hours}h`, type: 'today' }
  if (days <= 7) return { label: `${days} dias`, type: 'soon' }
  return { label: `${days} dias`, type: 'future' }
}

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  const dt = new Date(dateStr + 'T00:00:00')
  return dt.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })
}

function notaColor(nota: string) {
  const n = parseFloat(nota)
  if (isNaN(n)) return 'var(--text2)'
  if (n >= 7) return '#10b981'
  if (n >= 5) return '#f59e0b'
  return '#f43f5e'
}

type SortKey = 'data' | 'disciplina' | 'status'

export default function ExamsModule({ module, workspaceId, items, addItem, removeItem, toggleStar }: ModuleProps) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<ExamData>({ ...EMPTY })
  const [sortBy, setSortBy] = useState<SortKey>('data')
  const [filterStatus, setFilterStatus] = useState<Status | 'todas'>('todas')

  function set(patch: Partial<ExamData>) { setForm(p => ({ ...p, ...patch })) }

  function handleAdd() {
    if (!form.disciplina.trim()) return
    addItem({
      workspaceId,
      moduleId: module.id,
      contentType: 'exams',
      data: { ...form, title: form.title || form.disciplina } as unknown as Record<string, unknown>,
      tags: [form.disciplina, form.tipo, form.status].filter(Boolean),
      starred: false,
    })
    setShowForm(false)
    setForm({ ...EMPTY })
  }

  const filtered = items.filter(i => {
    const data = i.data as unknown as ExamData
    return filterStatus === 'todas' || data.status === filterStatus
  })

  const sorted = [...filtered].sort((a, b) => {
    const da = a.data as unknown as ExamData
    const db = b.data as unknown as ExamData
    if (sortBy === 'data') {
      const dateA = da.data || '9999'
      const dateB = db.data || '9999'
      return dateA.localeCompare(dateB)
    }
    if (sortBy === 'disciplina') return da.disciplina.localeCompare(db.disciplina)
    return da.status.localeCompare(db.status)
  })

  const upcoming = items.filter(i => (i.data as unknown as ExamData).status === 'próxima').length
  const waitingNota = items.filter(i => (i.data as unknown as ExamData).status === 'aguardando-nota').length

  return (
    <div>
      <div className={s.moduleHeader}>
        <h2 className={s.moduleTitle}>{module.name}</h2>
        <button className={s.addBtn} onClick={() => setShowForm(true)}>+ Adicionar prova</button>
      </div>

      {/* Quick stats */}
      {items.length > 0 && (
        <div className={d.statsRow}>
          {upcoming > 0 && (
            <div className={d.stat} style={{ '--sc': '#3b82f6' } as React.CSSProperties}>
              <span className={d.statNum}>{upcoming}</span>
              <span className={d.statLabel}>Próximas</span>
            </div>
          )}
          {waitingNota > 0 && (
            <div className={d.stat} style={{ '--sc': '#f59e0b' } as React.CSSProperties}>
              <span className={d.statNum}>{waitingNota}</span>
              <span className={d.statLabel}>Aguardando nota</span>
            </div>
          )}
        </div>
      )}

      {/* Controls */}
      {items.length > 0 && (
        <div className={d.controls}>
          <div className={s.filterRow} style={{ flex: 1 }}>
            {([['todas', 'Todas'], ['próxima', 'Próximas'], ['aguardando-nota', 'Aguardando nota'], ['realizada', 'Realizadas']] as const).map(([k, l]) => (
              <button
                key={k}
                className={`${s.filterBtn} ${filterStatus === k ? s.active : ''}`}
                onClick={() => setFilterStatus(k)}
              >
                {l}
              </button>
            ))}
          </div>
          <div className={d.sortRow}>
            <span className={d.sortLabel}>Ordenar:</span>
            {([['data', 'Data'], ['disciplina', 'Disciplina'], ['status', 'Status']] as const).map(([k, l]) => (
              <button
                key={k}
                className={`${d.sortBtn} ${sortBy === k ? d.sortActive : ''}`}
                onClick={() => setSortBy(k)}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      )}

      {sorted.length === 0 ? (
        <div className={s.empty}>
          <div className={s.emptyIcon}>◆</div>
          <div className={s.emptyTitle}>
            {items.length === 0 ? 'Nenhuma prova ainda' : 'Nenhum resultado para este filtro'}
          </div>
          <div className={s.emptyDesc}>
            {items.length === 0
              ? 'Adicione provas e avaliações com data, local e conteúdo cobrado.'
              : 'Tente outro filtro ou adicione uma nova prova.'}
          </div>
        </div>
      ) : (
        <div className={d.list}>
          {sorted.map(item => {
            const data = item.data as unknown as ExamData
            const countdown = getCountdown(data.data, data.hora)
            const statusCfg = STATUS_CONFIG[data.status] ?? STATUS_CONFIG['próxima']
            const isPast = data.status === 'realizada'

            return (
              <div key={item.id} className={`${d.row} ${isPast ? d.past : ''} ${item.starred ? d.starred : ''}`}>
                {/* Date column */}
                <div className={d.dateCol}>
                  {data.data ? (
                    <>
                      <div className={d.dateMain}>{formatDate(data.data)}</div>
                      {data.hora && <div className={d.dateHora}>{data.hora}</div>}
                    </>
                  ) : (
                    <div className={d.dateMain} style={{ color: 'var(--text2)', opacity: .4 }}>—</div>
                  )}
                </div>

                {/* Main info */}
                <div className={d.mainCol}>
                  <div className={d.rowTop}>
                    <span className={d.disciplina}>{data.disciplina}</span>
                    <span className={d.tipoBadge}>{TIPO_LABELS[data.tipo]}</span>
                  </div>
                  {(data.local || data.conteudo) && (
                    <div className={d.rowMeta}>
                      {data.local && <span className={d.metaItem}>📍 {data.local}</span>}
                      {data.conteudo && <span className={d.metaItem}>📖 {data.conteudo}</span>}
                    </div>
                  )}
                  {data.observacoes && <div className={d.obs}>{data.observacoes}</div>}
                </div>

                {/* Right column */}
                <div className={d.rightCol}>
                  {data.nota ? (
                    <div className={d.notaBlock}>
                      <span className={d.notaNum} style={{ color: notaColor(data.nota) }}>{data.nota}</span>
                      <span className={d.notaLabel}>nota</span>
                    </div>
                  ) : !isPast && countdown.label ? (
                    <div className={`${d.countdown} ${d[countdown.type]}`}>
                      {countdown.label}
                    </div>
                  ) : null}

                  <span
                    className={d.statusBadge}
                    style={{ background: statusCfg.color + '20', color: statusCfg.color }}
                  >
                    {statusCfg.label}
                  </span>
                </div>

                {/* Actions */}
                <div className={d.actions}>
                  <button className={`${s.starBtn} ${item.starred ? s.starActive : ''}`} onClick={() => toggleStar(item.id)}>
                    {item.starred ? '★' : '☆'}
                  </button>
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
            <h3 className={s.formTitle}>Nova prova / avaliação</h3>
            <div className={s.formGrid}>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Disciplina *</label>
                <input className={s.input} value={form.disciplina} onChange={e => set({ disciplina: e.target.value })} placeholder="Marketing Estratégico" autoFocus />
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Data</label>
                <input className={s.input} type="date" value={form.data} onChange={e => set({ data: e.target.value })} />
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Horário</label>
                <input className={s.input} type="time" value={form.hora} onChange={e => set({ hora: e.target.value })} />
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
                <label className={s.label}>Local / Sala</label>
                <input className={s.input} value={form.local} onChange={e => set({ local: e.target.value })} placeholder="Sala 204 — Bloco B" />
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Status</label>
                <select className={s.input} value={form.status} onChange={e => set({ status: e.target.value as Status })}>
                  <option value="próxima">Próxima</option>
                  <option value="aguardando-nota">Aguardando nota</option>
                  <option value="realizada">Realizada</option>
                </select>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Nota</label>
                <input className={s.input} value={form.nota} onChange={e => set({ nota: e.target.value })} placeholder="8.5" type="number" min="0" max="10" step="0.1" />
              </div>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Conteúdo cobrado</label>
                <input className={s.input} value={form.conteudo} onChange={e => set({ conteudo: e.target.value })} placeholder="Cap. 1 ao 5, Análise SWOT..." />
              </div>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Observações</label>
                <textarea className={s.textarea} value={form.observacoes} onChange={e => set({ observacoes: e.target.value })} rows={2} placeholder="Consulta, fórmula, instruções especiais..." />
              </div>
            </div>
            <div className={s.formFooter}>
              <button className={s.cancelBtn} onClick={() => setShowForm(false)}>Cancelar</button>
              <button className={s.saveBtn} onClick={handleAdd} disabled={!form.disciplina.trim()}>Salvar prova</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
