import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { useHubsStore, type ClassItem } from '../../store/hubsStore'
import { useTasksStore } from '../../store/tasksStore'
import { useAuth } from '../../contexts/AuthContext'
import { useGoogleCalendar } from '../../hooks/useGoogleCalendar'
import s from './Home.module.css'

const TYPE_LABEL: Record<ClassItem['type'] | 'gcal' | 'task', string> = {
  aula: 'Aula', trabalho: 'Trabalho', prova: 'Prova', extra: 'Extra', gcal: 'Google', task: 'Tarefa'
}
const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
const MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
const WINDOW_DAYS = 14
/** Entregas (ADOs, apresentações, provas) aparecem com mais antecedência que o resto. */
const DELIVERY_DAYS = 60
const isDelivery = (c: { type: string }) => c.type === 'trabalho' || c.type === 'prova'

const pad = (n: number) => String(n).padStart(2, '0')
const keyOf = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const parseKey = (k: string) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, (m || 1) - 1, d || 1) }
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const dayDiff = (a: Date, b: Date) => Math.round((startOfDay(a).getTime() - startOfDay(b).getTime()) / 86400000)

const WD_SHORT = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB']
type Tone = 'red' | 'orange' | 'blue' | 'purple' | 'slate'

function urgencyOf(diff: number, kind: string, eow: number): { tone: Tone; label: string } {
  if (diff < 0) return { tone: 'red', label: 'ATRASADO' }
  if (diff === 0) return { tone: 'red', label: 'URGENTE · HOJE' }
  if (kind === 'aula' || kind === 'extra') return { tone: 'slate', label: diff <= eow ? 'ESSA SEMANA' : 'PRÓXIMA SEMANA' }
  if (diff <= eow) return { tone: 'orange', label: 'ESSA SEMANA' }
  if (diff <= eow + 7) return { tone: 'blue', label: 'PRÓXIMA SEMANA' }
  return { tone: 'blue', label: 'MAIS ADIANTE' }
}

function countdown(days: number) {
  if (days === 0) return 'hoje'
  if (days === 1) return 'amanhã'
  if (days === -1) return 'ontem'
  return days > 0 ? `em ${days} dias` : `há ${-days} dias`
}

interface GCalItem {
  id: string
  date: string
  title: string
  type: 'gcal'
  source: 'gcal'
  htmlLink: string
  startTime?: string
}

interface TaskItem {
  id: string
  date: string
  title: string
  type: 'task'
  source: 'task'
  urgency: string
}

type AnyItem = ClassItem | GCalItem | TaskItem

export default function Upcoming() {
  const navigate = useNavigate()
  const { hubs, subjects, classes } = useHubsStore()
  const { tasks } = useTasksStore()
  const { googleAccessToken, requestCalendarAccess } = useAuth()
  const { events: gcalEvents, tokenExpired } = useGoogleCalendar(googleAccessToken)

  const today = startOfDay(new Date())
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))
  const [picked, setPicked] = useState<string | null>(null)
  const [connectingGcal, setConnectingGcal] = useState(false)

  const dated = useMemo(() => classes.filter(c => /^\d{4}-\d{2}-\d{2}$/.test(c.date)), [classes])

  const gcalItems = useMemo<GCalItem[]>(() => gcalEvents.map(ev => ({
    id: `gcal-${ev.id}`,
    date: ev.date,
    title: ev.summary,
    type: 'gcal' as const,
    source: 'gcal' as const,
    htmlLink: ev.htmlLink,
    startTime: ev.startTime,
  })), [gcalEvents])

  const taskItems = useMemo<TaskItem[]>(() =>
    tasks
      .filter(t => t.status !== 'done' && t.dueDate && /^\d{4}-\d{2}-\d{2}$/.test(t.dueDate))
      .map(t => ({
        id: `task-${t.id}`,
        date: t.dueDate!,
        title: t.title,
        type: 'task' as const,
        source: 'task' as const,
        urgency: t.urgency,
      })),
    [tasks]
  )

  const allDated = useMemo<AnyItem[]>(() => [...dated, ...gcalItems, ...taskItems], [dated, gcalItems, taskItems])

  const byDay = useMemo(() => {
    const m = new Map<string, AnyItem[]>()
    for (const c of allDated) m.set(c.date, [...(m.get(c.date) ?? []), c])
    return m
  }, [allDated])

  const list = useMemo(() => {
    if (picked) return byDay.get(picked) ?? []
    return allDated
      .filter(c => {
        const d = dayDiff(parseKey(c.date), today)
        if (isDelivery(c)) return d >= 0 && d <= DELIVERY_DAYS
        if (c.type === 'task') return (d >= 0 && d <= WINDOW_DAYS) || (d < 0 && d >= -30)
        if (c.type === 'gcal') return d >= 0 && d <= WINDOW_DAYS
        return false // aulas e extras ficam no calendário, não nas pendências
      })
      .sort((a, b) => a.date.localeCompare(b.date) || (a.type === 'prova' ? -1 : 1))
  }, [picked, byDay, allDated, today])

  const nextExam = dated
    .filter(c => (c.type === 'prova' || c.type === 'trabalho') && dayDiff(parseKey(c.date), today) >= 0)
    .sort((a, b) => a.date.localeCompare(b.date))[0]

  const cells = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1)
    const start = new Date(first); start.setDate(1 - first.getDay())
    return Array.from({ length: 42 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d })
  }, [month])
  const lastRowUsed = cells.slice(35).some(d => d.getMonth() === month.getMonth())
  const visibleCells = lastRowUsed ? cells : cells.slice(0, 35)

  const facHub = hubs.find(h => h.type === 'faculdade') ?? hubs[0]
  const subjectName = (id: string) => subjects.find(x => x.id === id)?.name ?? ''
  const openItem = (c: AnyItem) => {
    if (c.type === 'gcal') { window.open((c as GCalItem).htmlLink, '_blank', 'noopener'); return }
    if (c.type === 'task') { navigate('/tarefas'); return }
    navigate(`/hub/${(c as ClassItem).hubId}?sem=${(c as ClassItem).semesterId}&subj=${(c as ClassItem).subjectId}&cls=${c.id}`)
  }

  async function handleConnectGcal() {
    setConnectingGcal(true)
    try { await requestCalendarAccess() } catch { /* dismissed */ } finally { setConnectingGcal(false) }
  }

  const calKinds = (items: AnyItem[]) =>
    [...new Set(items.map(i => i.type))].slice(0, 4)

  return (
    <section className={s.upcoming} aria-labelledby="upcoming-title">
      <div className={s.upList}>
        <div className={s.upHead}>
          <div>
            <span className={s.pzKicker}>Pendências</span>
            <h2 id="upcoming-title" className={s.pzTitle}>
              {picked ? parseKey(picked).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Próximos prazos'}
            </h2>
            <p className={s.pzSub}>
              {picked
                ? `${list.length} ${list.length === 1 ? 'compromisso' : 'compromissos'} neste dia`
                : `${list.length} ${list.length === 1 ? 'pendência' : 'pendências'} · ADOs, apresentações, provas e tarefas`}
              {' · '}hoje é {WD_SHORT[today.getDay()].toLowerCase()}, {pad(today.getDate())}/{pad(today.getMonth() + 1)}
            </p>
            {!picked && nextExam && (
              <p className={s.upNext}>
                Próxima {nextExam.type === 'prova' ? 'prova' : 'entrega'}: <b>{nextExam.title}</b> · {countdown(dayDiff(parseKey(nextExam.date), today))}
              </p>
            )}
          </div>
          <div className={s.upHeadRight}>
            {(!googleAccessToken || tokenExpired) && (
              <button
                className={s.gcalConnectBtn}
                onClick={handleConnectGcal}
                disabled={connectingGcal}
                title="Mostrar eventos do Google Agenda aqui"
              >
                <img src="https://www.gstatic.com/images/branding/product/1x/calendar_2020q4_16dp.png" width={14} height={14} alt="" />
                {connectingGcal ? 'Conectando…' : tokenExpired ? 'Reconectar Google Agenda' : 'Conectar Google Agenda'}
              </button>
            )}
            {picked && <button className={s.linkBtn} onClick={() => setPicked(null)}>Ver pendências</button>}
          </div>
        </div>

        {list.length === 0 ? (
          <div className={s.upEmpty}>
            <CalendarDays size={20} aria-hidden="true" />
            <div>
              <p><b>{picked ? 'Nada marcado neste dia.' : 'Nenhuma entrega, prova ou tarefa pendente.'}</b></p>
              <p>Cadastre ADOs, apresentações e provas como Trabalho ou Prova na matéria. As aulas continuam no calendário ao lado.</p>
              {facHub && !picked && <button className={s.ghostBtn} onClick={() => navigate(`/hub/${facHub.id}`)}>Abrir {facHub.name}</button>}
            </div>
          </div>
        ) : (
          <ul className={s.upItems}>
            {list.map(c => {
              const d = parseKey(c.date)
              const diff = dayDiff(d, today)
              const isGcal = c.type === 'gcal'
              const isTask = c.type === 'task'
              const eow = 6 - today.getDay()
              const { tone, label } = urgencyOf(diff, c.type, eow)
              const sub = isGcal
                ? 'GOOGLE AGENDA'
                : isTask
                  ? `TAREFA · URGÊNCIA ${(c as TaskItem).urgency === 'urgent' ? 'URGENTE' : (c as TaskItem).urgency === 'high' ? 'ALTA' : (c as TaskItem).urgency === 'medium' ? 'MÉDIA' : 'BAIXA'}`
                  : subjectName((c as ClassItem).subjectId).toUpperCase()
              const when = isGcal && (c as GCalItem).startTime ? ` · ${(c as GCalItem).startTime}` : ''
              const big = diff < 0 ? 'Atrasado' : diff === 0 ? 'Hoje' : diff === 1 ? 'Amanhã' : `${diff} dias`
              const small = diff < 0 ? `há ${-diff} ${-diff === 1 ? 'dia' : 'dias'}` : diff === 0 ? 'último dia' : diff === 1 ? 'prazo' : 'restantes'
              return (
                <li key={c.id}>
                  <button className={s.pz} data-tone={tone} onClick={() => openItem(c)}>
                    <span className={s.pzDate} aria-hidden="true">
                      <i>{WD_SHORT[d.getDay()]}</i>
                      <b>{pad(d.getDate())}</b>
                    </span>
                    <span className={s.pzMain}>
                      <span className={s.pzLabel}>{label}{c.type !== 'task' && c.type !== 'gcal' ? ` · ${TYPE_LABEL[c.type].toUpperCase()}` : ''}</span>
                      <span className={s.pzName}>{c.title}</span>
                      <span className={s.pzSubject}>{sub}</span>
                      <span className={s.pzWhen}>{pad(d.getDate())}/{pad(d.getMonth() + 1)}{when}</span>
                    </span>
                    <span className={s.pzCount}>
                      <b>{big}</b>
                      <span>{small}</span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <div className={s.cal} aria-label="Calendário">
        <div className={s.calHead}>
          <button className={s.calNav} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} aria-label="Mês anterior"><ChevronLeft size={15} /></button>
          <span className={s.calMonth}>{MONTHS[month.getMonth()]} {month.getFullYear()}</span>
          <button className={s.calNav} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} aria-label="Próximo mês"><ChevronRight size={15} /></button>
        </div>
        <div className={s.calGrid} role="grid">
          {WEEKDAYS.map((w, i) => <span key={i} className={s.calWd} aria-hidden="true">{w}</span>)}
          {visibleCells.map(d => {
            const k = keyOf(d)
            const items = byDay.get(k) ?? []
            const kinds = calKinds(items)
            const outside = d.getMonth() !== month.getMonth()
            const isToday = k === keyOf(today)
            return (
              <button
                key={k}
                role="gridcell"
                className={`${s.calDay} ${outside ? s.calOut : ''} ${isToday ? s.calToday : ''} ${picked === k ? s.calPicked : ''}`}
                onClick={() => setPicked(picked === k ? null : k)}
                aria-label={`${d.getDate()} de ${MONTHS[d.getMonth()]}${items.length ? `, ${items.length} ${items.length === 1 ? 'item' : 'itens'}` : ''}`}
                aria-pressed={picked === k}
              >
                <span>{d.getDate()}</span>
                {kinds.length > 0 && <span className={s.calDots}>{kinds.map(t => <i key={t} data-kind={t} />)}</span>}
              </button>
            )
          })}
        </div>
        <div className={s.calLegend}>
          {(['aula', 'prova', 'trabalho'] as const).map(t => <span key={t}><i data-kind={t} />{TYPE_LABEL[t]}</span>)}
          {taskItems.length > 0 && <span><i data-kind="task" />Tarefa</span>}
          {gcalItems.length > 0 && <span><i data-kind="gcal" />Google</span>}
        </div>
      </div>
    </section>
  )
}
