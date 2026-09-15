import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Check, Calendar, Tag, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { useTasksStore, type Task, type TaskStatus, type TaskUrgency, type TaskRecurrence, type SubTask } from '../store/tasksStore'
import s from './Tarefas.module.css'

// ── Constants ──────────────────────────────────────────────────────────────
const URGENCY_LABEL: Record<TaskUrgency, string> = {
  low: 'Baixa', medium: 'Média', high: 'Alta', urgent: 'Urgente',
}
const RECURRENCE_LABEL: Record<TaskRecurrence, string> = {
  once: 'Avulsa', daily: 'Diária', weekly: 'Semanal', monthly: 'Mensal', yearly: 'Anual',
}
const COLUMNS: { key: TaskStatus; label: string; emoji: string }[] = [
  { key: 'todo',  label: 'A Fazer',     emoji: '○' },
  { key: 'doing', label: 'Em Andamento', emoji: '◑' },
  { key: 'done',  label: 'Concluído',   emoji: '●' },
]

const SUGGESTED_TAGS = ['Pessoal', 'Trabalho', 'Financeiro', 'Saúde', 'Estudo', 'Casa', 'Urgente']

function formatDate(iso?: string) {
  if (!iso) return ''
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function isOverdue(dueDate?: string) {
  if (!dueDate) return false
  return new Date(dueDate + 'T23:59:59') < new Date()
}

function todayIso() { return new Date().toISOString().slice(0, 10) }
function tomorrowIso() {
  const d = new Date(); d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

// ── Task Modal ─────────────────────────────────────────────────────────────
interface ModalProps {
  task?: Task
  defaultStatus?: TaskStatus
  onClose: () => void
}

function TaskModal({ task, defaultStatus = 'todo', onClose }: ModalProps) {
  const { addTask, updateTask, deleteTask } = useTasksStore()

  const [title,       setTitle]      = useState(task?.title ?? '')
  const [status,      setStatus]     = useState<TaskStatus>(task?.status ?? defaultStatus)
  const [urgency,     setUrgency]    = useState<TaskUrgency>(task?.urgency ?? 'medium')
  const [recurrence,  setRec]        = useState<TaskRecurrence>(task?.recurrence ?? 'once')
  const [area,        setArea]       = useState(task?.area ?? '')
  const [description, setDesc]       = useState(task?.description ?? '')
  const [dueDate,     setDueDate]    = useState(task?.dueDate ?? '')
  const [tags,        setTags]       = useState<string[]>(task?.tags ?? [])
  const [tagInput,    setTagInput]   = useState('')
  const [subtasks,    setSubtasks]   = useState<SubTask[]>(task?.subtasks ?? [])
  const [subInput,    setSubInput]   = useState('')
  const [confirmDel,  setConfirmDel] = useState(false)

  const titleRef = useRef<HTMLInputElement>(null)
  useEffect(() => { titleRef.current?.focus() }, [])

  function save() {
    if (!title.trim()) return
    const data = {
      title: title.trim(), status, urgency, recurrence,
      area: area.trim() || undefined,
      description: description.trim() || undefined,
      dueDate: dueDate || undefined,
      tags, subtasks,
    }
    if (task) updateTask(task.id, data)
    else addTask(data)
    onClose()
  }

  function addTag() {
    const t = tagInput.trim()
    if (t && !tags.includes(t)) setTags([...tags, t])
    setTagInput('')
  }

  function addSubtask() {
    const t = subInput.trim()
    if (!t) return
    setSubtasks([...subtasks, { id: crypto.randomUUID(), title: t, done: false }])
    setSubInput('')
  }

  function toggleSub(id: string) {
    setSubtasks(subtasks.map(s => s.id === id ? { ...s, done: !s.done } : s))
  }

  function removeSub(id: string) {
    setSubtasks(subtasks.filter(s => s.id !== id))
  }

  return (
    <div className={s.modalBackdrop} onClick={onClose}>
      <motion.div
        className={s.modal}
        onClick={e => e.stopPropagation()}
        initial={{ opacity: 0, y: 16, scale: .97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: .97 }}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      >
        {/* Header */}
        <div className={s.modalHead}>
          <span className={s.modalHeadLabel}>{task ? 'EDITAR TAREFA' : 'NOVA TAREFA'}</span>
          {task && <span className={s.modalId}>#{task.id.slice(0, 8).toUpperCase()}</span>}
          <button className={s.modalClose} onClick={onClose}><X size={16} /></button>
        </div>

        <div className={s.modalBody}>
          {/* Title */}
          <label className={s.fieldLabel}>TÍTULO DA TAREFA *</label>
          <input
            ref={titleRef}
            className={s.fieldInput}
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') onClose() }}
            placeholder="O que precisa ser feito?"
          />

          {/* Area */}
          <label className={s.fieldLabel}>ÁREA / PROJETO</label>
          <input
            className={s.fieldInput}
            value={area}
            onChange={e => setArea(e.target.value)}
            placeholder="Ex: Pessoal, Trabalho, Financeiro..."
          />

          {/* Status + Urgency */}
          <div className={s.row2}>
            <div className={s.fieldGroup}>
              <label className={s.fieldLabel}>COLUNA / STATUS</label>
              <div className={s.pills}>
                {COLUMNS.map(c => (
                  <button
                    key={c.key}
                    className={`${s.pill} ${status === c.key ? s.pillActive : ''}`}
                    onClick={() => setStatus(c.key)}
                  >{c.label}</button>
                ))}
              </div>
            </div>
            <div className={s.fieldGroup}>
              <label className={s.fieldLabel}>URGÊNCIA</label>
              <div className={s.pills}>
                {(['low','medium','high','urgent'] as TaskUrgency[]).map(u => (
                  <button
                    key={u}
                    className={`${s.pill} ${s[`urgency_${u}`]} ${urgency === u ? s.pillActive : ''}`}
                    onClick={() => setUrgency(u)}
                  >{URGENCY_LABEL[u]}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Recurrence */}
          <label className={s.fieldLabel}>RECORRÊNCIA</label>
          <div className={s.pills}>
            {(['once','daily','weekly','monthly','yearly'] as TaskRecurrence[]).map(r => (
              <button
                key={r}
                className={`${s.pill} ${recurrence === r ? s.pillActive : ''}`}
                onClick={() => setRec(r)}
              >{RECURRENCE_LABEL[r]}</button>
            ))}
          </div>
          {recurrence !== 'once' && (
            <p className={s.recurrenceHint}>
              Ao concluir, o próximo ciclo será criado automaticamente.
            </p>
          )}

          {/* Description */}
          <label className={s.fieldLabel}>DESCRIÇÃO</label>
          <textarea
            className={s.fieldTextarea}
            value={description}
            onChange={e => setDesc(e.target.value)}
            placeholder="Objetivos, critérios de aceite..."
            rows={3}
          />

          {/* Due Date */}
          <label className={s.fieldLabel}>DATA DE ENTREGA</label>
          <div className={s.dateRow}>
            <input
              type="date"
              className={s.fieldInputDate}
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
            />
            <button className={s.dateShortcut} onClick={() => setDueDate(todayIso())}>Hoje</button>
            <button className={s.dateShortcut} onClick={() => setDueDate(tomorrowIso())}>Amanhã</button>
            {dueDate && <button className={s.dateClear} onClick={() => setDueDate('')}><X size={12}/></button>}
          </div>

          {/* Tags */}
          <label className={s.fieldLabel}>TAGS</label>
          <div className={s.tagInputRow}>
            <input
              className={s.fieldInputSm}
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
              placeholder="Digite uma tag e pressione Enter..."
            />
            <button className={s.tagAddBtn} onClick={addTag}>+ Adicionar</button>
          </div>
          {tags.length > 0 && (
            <div className={s.tagList}>
              {tags.map(t => (
                <span key={t} className={s.tag}>
                  #{t}
                  <button className={s.tagRemove} onClick={() => setTags(tags.filter(x => x !== t))}>×</button>
                </span>
              ))}
            </div>
          )}
          <div className={s.tagSuggested}>
            Sugeridas:{' '}
            {SUGGESTED_TAGS.filter(t => !tags.includes(t)).map(t => (
              <button key={t} className={s.tagSuggest} onClick={() => setTags([...tags, t])}>+{t}</button>
            ))}
          </div>

          {/* Subtasks */}
          <label className={s.fieldLabel}>
            CHECKLIST DE SUBTAREFAS ({subtasks.filter(s => s.done).length}/{subtasks.length})
          </label>
          <div className={s.subtaskList}>
            {subtasks.map(sub => (
              <div key={sub.id} className={s.subtaskItem}>
                <button
                  className={`${s.subtaskCheck} ${sub.done ? s.subtaskDone : ''}`}
                  onClick={() => toggleSub(sub.id)}
                >
                  {sub.done && <Check size={10} />}
                </button>
                <span className={sub.done ? s.subtaskTitleDone : s.subtaskTitle}>{sub.title}</span>
                <button className={s.subtaskDel} onClick={() => removeSub(sub.id)}><X size={11}/></button>
              </div>
            ))}
            <div className={s.subtaskAdd}>
              <input
                className={s.fieldInputSm}
                value={subInput}
                onChange={e => setSubInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSubtask() } }}
                placeholder="Nova subtarefa..."
              />
              <button className={s.tagAddBtn} onClick={addSubtask}>+ Item</button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={s.modalFoot}>
          {task && (
            confirmDel ? (
              <div className={s.confirmRow}>
                <span className={s.confirmText}>Excluir tarefa?</span>
                <button className={s.confirmYes} onClick={() => { deleteTask(task.id); onClose() }}>Sim</button>
                <button className={s.confirmNo} onClick={() => setConfirmDel(false)}>Não</button>
              </div>
            ) : (
              <button className={s.deleteBtn} onClick={() => setConfirmDel(true)}>
                <Trash2 size={14} /> Excluir
              </button>
            )
          )}
          <div className={s.footRight}>
            <button className={s.cancelBtn} onClick={onClose}>Cancelar</button>
            <button className={s.saveBtn} onClick={save} disabled={!title.trim()}>
              {task ? 'Salvar' : 'Criar tarefa'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ── Task Card ──────────────────────────────────────────────────────────────
function TaskCard({ task, onClick }: { task: Task; onClick: () => void }) {
  const { updateTask } = useTasksStore()
  const doneSubs  = task.subtasks.filter(s => s.done).length
  const totalSubs = task.subtasks.length
  const overdue   = task.status !== 'done' && isOverdue(task.dueDate)

  function cycleStatus(e: React.MouseEvent) {
    e.stopPropagation()
    const next: Record<TaskStatus, TaskStatus> = { todo: 'doing', doing: 'done', done: 'todo' }
    updateTask(task.id, { status: next[task.status] })
  }

  return (
    <motion.div
      className={`${s.card} ${task.status === 'done' ? s.cardDone : ''}`}
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: .95 }}
      onClick={onClick}
      whileHover={{ y: -1 }}
    >
      {/* Urgency stripe */}
      <div className={`${s.cardStripe} ${s[`stripe_${task.urgency}`]}`} />

      <div className={s.cardInner}>
        <div className={s.cardTop}>
          <button
            className={`${s.statusBtn} ${s[`status_${task.status}`]}`}
            onClick={cycleStatus}
            title="Mudar status"
          >
            {task.status === 'done' ? <Check size={10} /> :
             task.status === 'doing' ? '◑' : '○'}
          </button>
          <span className={s.cardTitle}>{task.title}</span>
        </div>

        {task.area && <div className={s.cardArea}>{task.area}</div>}

        {task.description && (
          <p className={s.cardDesc}>{task.description.slice(0, 80)}{task.description.length > 80 ? '…' : ''}</p>
        )}

        {totalSubs > 0 && (
          <div className={s.cardSubBar}>
            <div className={s.cardSubProgress}>
              <div
                className={s.cardSubFill}
                style={{ width: `${(doneSubs / totalSubs) * 100}%` }}
              />
            </div>
            <span className={s.cardSubCount}>{doneSubs}/{totalSubs}</span>
          </div>
        )}

        <div className={s.cardMeta}>
          {task.dueDate && (
            <span className={`${s.cardDate} ${overdue ? s.cardDateOverdue : ''}`}>
              <Calendar size={11} /> {formatDate(task.dueDate)}
              {overdue && ' (atrasada)'}
            </span>
          )}
          {task.recurrence !== 'once' && (
            <span className={s.cardRecurrence}>↻ {RECURRENCE_LABEL[task.recurrence]}</span>
          )}
          <span className={`${s.urgencyBadge} ${s[`badge_${task.urgency}`]}`}>
            {URGENCY_LABEL[task.urgency]}
          </span>
        </div>

        {task.tags.length > 0 && (
          <div className={s.cardTags}>
            {task.tags.map(t => <span key={t} className={s.cardTag}>#{t}</span>)}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ── Column ─────────────────────────────────────────────────────────────────
function Column({
  col, tasks, onAdd, onCard,
}: {
  col: typeof COLUMNS[0]
  tasks: Task[]
  onAdd: () => void
  onCard: (t: Task) => void
}) {
  return (
    <div className={s.column}>
      <div className={s.columnHead}>
        <span className={s.columnEmoji}>{col.emoji}</span>
        <span className={s.columnTitle}>{col.label}</span>
        <span className={s.columnCount}>{tasks.length}</span>
        <button className={s.columnAdd} onClick={onAdd} title="Adicionar tarefa">
          <Plus size={14} />
        </button>
      </div>

      <div className={s.columnBody}>
        <AnimatePresence mode="popLayout">
          {tasks.map(t => (
            <TaskCard key={t.id} task={t} onClick={() => onCard(t)} />
          ))}
        </AnimatePresence>

        {tasks.length === 0 && (
          <div className={s.columnEmpty}>
            <button className={s.columnEmptyAdd} onClick={onAdd}>
              <Plus size={13} /> Adicionar tarefa
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────
type DateFilter = 'all' | 'today' | 'week' | 'month'

export default function Tarefas() {
  const { tasks } = useTasksStore()
  const [modalTask,    setModalTask]    = useState<Task | null | 'new'>(null)
  const [newStatus,    setNewStatus]    = useState<TaskStatus>('todo')
  const [dateFilter,   setDateFilter]   = useState<DateFilter>('all')
  const [urgFilter,    setUrgFilter]    = useState<TaskUrgency | 'all'>('all')

  function openNew(status: TaskStatus) {
    setNewStatus(status)
    setModalTask('new')
  }

  function filteredByDate(task: Task): boolean {
    if (dateFilter === 'all') return true
    if (!task.dueDate) return false
    const due  = new Date(task.dueDate + 'T00:00:00')
    const now  = new Date()
    if (dateFilter === 'today') {
      return due.toDateString() === now.toDateString()
    }
    if (dateFilter === 'week') {
      const end = new Date(now); end.setDate(now.getDate() + 7)
      return due <= end
    }
    if (dateFilter === 'month') {
      return due.getMonth() === now.getMonth() && due.getFullYear() === now.getFullYear()
    }
    return true
  }

  const filtered = tasks.filter(t =>
    filteredByDate(t) &&
    (urgFilter === 'all' || t.urgency === urgFilter)
  )

  const todoCount  = tasks.filter(t => t.status === 'todo').length
  const doingCount = tasks.filter(t => t.status === 'doing').length
  const doneCount  = tasks.filter(t => t.status === 'done').length
  const overdueCount = tasks.filter(t => t.status !== 'done' && isOverdue(t.dueDate)).length

  return (
    <div className={s.page}>
      {/* Top bar */}
      <div className={s.topBar}>
        <div className={s.topLeft}>
          <h1 className={s.pageTitle}>Tarefas</h1>
          <div className={s.stats}>
            <span className={s.stat}><span className={s.statDot} style={{ background: 'var(--text2)' }} />{todoCount} a fazer</span>
            <span className={s.stat}><span className={s.statDot} style={{ background: '#f59e0b' }} />{doingCount} em andamento</span>
            <span className={s.stat}><span className={s.statDot} style={{ background: 'var(--accent)' }} />{doneCount} concluídas</span>
            {overdueCount > 0 && <span className={`${s.stat} ${s.statOverdue}`}>⚠ {overdueCount} atrasada{overdueCount > 1 ? 's' : ''}</span>}
          </div>
        </div>

        <div className={s.topRight}>
          {/* Date filter */}
          <div className={s.filterGroup}>
            {(['all','today','week','month'] as DateFilter[]).map(f => (
              <button
                key={f}
                className={`${s.filterBtn} ${dateFilter === f ? s.filterActive : ''}`}
                onClick={() => setDateFilter(f)}
              >
                {f === 'all' ? 'Todas' : f === 'today' ? 'Hoje' : f === 'week' ? 'Esta semana' : 'Este mês'}
              </button>
            ))}
          </div>

          {/* Urgency filter */}
          <div className={s.filterGroup}>
            <button className={`${s.filterBtn} ${urgFilter === 'all' ? s.filterActive : ''}`} onClick={() => setUrgFilter('all')}>
              Todas
            </button>
            {(['low','medium','high','urgent'] as TaskUrgency[]).map(u => (
              <button
                key={u}
                className={`${s.filterBtn} ${s[`urgFilter_${u}`]} ${urgFilter === u ? s.filterActive : ''}`}
                onClick={() => setUrgFilter(u)}
              >
                {URGENCY_LABEL[u]}
              </button>
            ))}
          </div>

          <button className={s.newBtn} onClick={() => openNew('todo')}>
            <Plus size={15} /> Nova tarefa
          </button>
        </div>
      </div>

      {/* Kanban */}
      <div className={s.kanban}>
        {COLUMNS.map(col => (
          <Column
            key={col.key}
            col={col}
            tasks={filtered.filter(t => t.status === col.key)}
            onAdd={() => openNew(col.key)}
            onCard={t => setModalTask(t)}
          />
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalTask && (
          <TaskModal
            task={modalTask === 'new' ? undefined : modalTask}
            defaultStatus={newStatus}
            onClose={() => setModalTask(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
