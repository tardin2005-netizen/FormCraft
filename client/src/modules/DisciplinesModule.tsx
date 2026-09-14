import { useState } from 'react'
import type { ModuleProps } from './moduleProps'
import s from './modules.module.css'
import d from './DisciplinesModule.module.css'
import DeleteBtn from './DeleteBtn'

type Status = 'cursando' | 'aprovado' | 'reprovado' | 'trancado'
type Filter = 'todas' | Status

interface DisciplineData {
  professor: string
  semestre: string
  creditos: string
  status: Status
  nota: string
  horario: string
  sala: string
  descricao: string
}

const STATUS_CONFIG: Record<Status, { label: string; color: string }> = {
  cursando:  { label: 'Cursando',  color: '#3b82f6' },
  aprovado:  { label: 'Aprovado',  color: '#10b981' },
  reprovado: { label: 'Reprovado', color: '#f43f5e' },
  trancado:  { label: 'Trancado',  color: '#6b7280' },
}

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'todas',     label: 'Todas' },
  { key: 'cursando',  label: 'Cursando' },
  { key: 'aprovado',  label: 'Aprovado' },
  { key: 'reprovado', label: 'Reprovado' },
  { key: 'trancado',  label: 'Trancado' },
]

const EMPTY: DisciplineData = {
  professor: '', semestre: '', creditos: '', status: 'cursando',
  nota: '', horario: '', sala: '', descricao: '',
}

export default function DisciplinesModule({ module, workspaceId, items, addItem, removeItem, toggleStar }: ModuleProps) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<DisciplineData & { title: string }>({ title: '', ...EMPTY })
  const [filter, setFilter] = useState<Filter>('todas')

  function set(patch: Partial<typeof form>) { setForm(p => ({ ...p, ...patch })) }

  function handleAdd() {
    if (!form.title.trim()) return
    addItem({
      workspaceId,
      moduleId: module.id,
      contentType: 'disciplines',
      data: form as unknown as Record<string, unknown>,
      tags: form.semestre ? [form.semestre] : [],
      starred: false,
    })
    setShowForm(false)
    setForm({ title: '', ...EMPTY })
  }

  const visible = filter === 'todas'
    ? items
    : items.filter(i => (i.data as unknown as DisciplineData).status === filter)

  const counts = (['cursando', 'aprovado', 'reprovado', 'trancado'] as Status[]).reduce(
    (acc, st) => {
      acc[st] = items.filter(i => (i.data as unknown as DisciplineData).status === st).length
      return acc
    },
    {} as Record<Status, number>,
  )

  return (
    <div>
      <div className={s.moduleHeader}>
        <h2 className={s.moduleTitle}>{module.name}</h2>
        <button className={s.addBtn} onClick={() => setShowForm(true)}>+ Adicionar disciplina</button>
      </div>

      {/* Stats row */}
      {items.length > 0 && (
        <div className={d.statsRow}>
          {(Object.entries(STATUS_CONFIG) as [Status, { label: string; color: string }][]).map(([st, cfg]) => (
            counts[st] > 0 && (
              <div key={st} className={d.stat} style={{ '--sc': cfg.color } as React.CSSProperties}>
                <span className={d.statNum}>{counts[st]}</span>
                <span className={d.statLabel}>{cfg.label}</span>
              </div>
            )
          ))}
        </div>
      )}

      <div className={s.filterRow}>
        {FILTERS.map(f => (
          <button
            key={f.key}
            className={`${s.filterBtn} ${filter === f.key ? s.active : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
            {f.key !== 'todas' && counts[f.key as Status] > 0 && (
              <span className={d.filterCount}>{counts[f.key as Status]}</span>
            )}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className={s.empty}>
          <div className={s.emptyIcon}>◉</div>
          <div className={s.emptyTitle}>
            {filter === 'todas' ? 'Nenhuma disciplina ainda' : `Nenhuma disciplina ${STATUS_CONFIG[filter as Status]?.label.toLowerCase()}`}
          </div>
          <div className={s.emptyDesc}>Adicione disciplinas com professor, semestre e status acadêmico.</div>
        </div>
      ) : (
        <div className={d.grid}>
          {visible.map(item => {
            const data = item.data as unknown as DisciplineData & { title: string }
            const cfg = STATUS_CONFIG[data.status] ?? STATUS_CONFIG.cursando
            return (
              <div key={item.id} className={`${d.card} ${item.starred ? d.starred : ''}`}>
                <div className={d.cardTop}>
                  <div className={d.cardName}>{data.title}</div>
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

                <div className={d.cardMeta}>
                  {data.professor && <span className={d.metaRow}>Prof. {data.professor}</span>}
                  {data.semestre && <span className={d.chip}>{data.semestre}</span>}
                  {data.creditos && <span className={d.chip}>{data.creditos} créditos</span>}
                  {data.horario && <span className={d.metaRow}>{data.horario}</span>}
                </div>

                <div className={d.cardBottom}>
                  <span className={d.statusBadge} style={{ background: cfg.color + '22', color: cfg.color }}>
                    {cfg.label}
                  </span>
                  {data.nota && (
                    <span className={d.notaChip}>
                      {parseFloat(data.nota) >= 5 ? '✓' : '✗'} {data.nota}
                    </span>
                  )}
                </div>

                {data.descricao && <div className={d.cardDesc}>{data.descricao}</div>}
              </div>
            )
          })}
        </div>
      )}

      {showForm && (
        <div className={s.backdrop} onClick={e => { if (e.target === e.currentTarget) setShowForm(false) }}>
          <div className={s.formModal}>
            <h3 className={s.formTitle}>Nova disciplina</h3>
            <div className={s.formGrid}>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Nome da disciplina *</label>
                <input className={s.input} value={form.title} onChange={e => set({ title: e.target.value })} placeholder="Ex: Marketing Estratégico" autoFocus />
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Professor</label>
                <input className={s.input} value={form.professor} onChange={e => set({ professor: e.target.value })} placeholder="Nome do professor" />
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Semestre</label>
                <input className={s.input} value={form.semestre} onChange={e => set({ semestre: e.target.value })} placeholder="2026.2" />
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Créditos</label>
                <input className={s.input} value={form.creditos} onChange={e => set({ creditos: e.target.value })} placeholder="4" type="number" min="1" />
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Horário</label>
                <input className={s.input} value={form.horario} onChange={e => set({ horario: e.target.value })} placeholder="Seg/Qua 19h" />
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Sala</label>
                <input className={s.input} value={form.sala} onChange={e => set({ sala: e.target.value })} placeholder="Sala 204" />
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Status</label>
                <select className={s.input} value={form.status} onChange={e => set({ status: e.target.value as Status })}>
                  <option value="cursando">Cursando</option>
                  <option value="aprovado">Aprovado</option>
                  <option value="reprovado">Reprovado</option>
                  <option value="trancado">Trancado</option>
                </select>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Nota final</label>
                <input className={s.input} value={form.nota} onChange={e => set({ nota: e.target.value })} placeholder="8.5" type="number" min="0" max="10" step="0.1" />
              </div>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Observações</label>
                <textarea className={s.textarea} value={form.descricao} onChange={e => set({ descricao: e.target.value })} rows={2} placeholder="Notas sobre a disciplina..." />
              </div>
            </div>
            <div className={s.formFooter}>
              <button className={s.cancelBtn} onClick={() => setShowForm(false)}>Cancelar</button>
              <button className={s.saveBtn} onClick={handleAdd} disabled={!form.title.trim()}>Salvar disciplina</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
