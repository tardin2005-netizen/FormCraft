import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { useHubsStore, type ClassItem } from '../../store/hubsStore'
import { useAuth } from '../../contexts/AuthContext'
import { useGoogleCalendar } from '../../hooks/useGoogleCalendar'
import s from './Home.module.css'

const TYPE_LABEL: Record<ClassItem['type'] | 'gcal', string> = {
  aula: 'Aula', trabalho: 'Trabalho', prova: 'Prova', extra: 'Extra', gcal: 'Google'
}
const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
const MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
const WINDOW_DAYS = 14

const pad = (n: number) => String(n).padStart(2, '0')
const keyOf = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const parseKey = (k: string) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, (m || 1) - 1, d || 1) }
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const dayDiff = (a: Date, b: Date) => Math.round((startOfDay(a).getTime() - startOfDay(b).getTime()) / 86400000)

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

type AnyItem = ClassItem | GCalItem

export default function Upcoming() {
  const navigate = useNavigate()
  const { hubs, subjects, classes } = useHubsStore()
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

  const allDated = useMemo<AnyItem[]>(() => [...dated, ...gcalItems], [dated, gcalItems])

  const byDay = useMemo(() => {
    const m = new Map<string, AnyItem[]>()
    for (const c of allDated) m.set(c.date, [...(m.get(c.date) ?? []), c])
    return m
  }, [allDated])

  const list = useMemo(() => {
    if (picked) return byDay.get(picked) ?? []
    return allDated
      .filter(c => { const d = dayDiff(parseKey(c.date), today); return d >= 0 && d <= WINDOW_DAYS })
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
    if (c.type === 'gcal') { window.open(c.htmlLink, '_blank', 'noopener'); return }
    navigate(`/hub/${c.hubId}?sem=${c.semesterId}&subj=${c.subjectId}&cls=${c.id}`)
  }

  async function handleConnectGcal() {
    setConnectingGcal(true)
    try { await requestCalendarAccess() } catch { /* dismissed */ } finally { setConnectingGcal(false) }
  }

  const calKinds = (items: AnyItem[]) =>
    [...new Set(items.map(i => i.type === 'gcal' ? 'gcal' : i.type))].slice(0, 4)

  return (
    <section className={s.upcoming} aria-labelledby="upcoming-title">
      <div className={s.upList}>
        <div className={s.upHead}>
          <div>
            <h2 id="upcoming-title" className={s.upTitle}>
              {picked ? parseKey(picked).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Próximos 14 dias'}
            </h2>
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
            {picked && <button className={s.linkBtn} onClick={() => setPicked(null)}>Ver próximos 14 dias</button>}
          </div>
        </div>

        {list.length === 0 ? (
          <div className={s.upEmpty}>
            <CalendarDays size={20} aria-hidden="true" />
            <div>
              <p><b>{picked ? 'Nada marcado neste dia.' : 'Nenhuma aula, prova ou entrega nos próximos 14 dias.'}</b></p>
              <p>As datas vêm das aulas que você cadastra no hub. Crie uma aula, prova ou trabalho com data para ela aparecer aqui.</p>
              {facHub && !picked && <button className={s.ghostBtn} onClick={() => navigate(`/hub/${facHub.id}`)}>Abrir {facHub.name}</button>}
            </div>
          </div>
        ) : (
          <ul className={s.upItems}>
            {list.map(c => {
              const d = parseKey(c.date)
              const diff = dayDiff(d, today)
              const isGcal = c.type === 'gcal'
              return (
                <li key={c.id}>
                  <button className={s.upItem} onClick={() => openItem(c)}>
                    <span className={s.upDate}>
                      <b>{pad(d.getDate())}</b>
                      <span>{MONTHS[d.getMonth()].slice(0, 3)}</span>
                    </span>
                    <span className={s.upInfo}>
                      <span className={s.upItemTitle}>{c.title}</span>
                      <span className={s.upItemSub}>
                        {isGcal
                          ? ((c as GCalItem).startTime ? `${(c as GCalItem).startTime} · Google Agenda` : 'Google Agenda')
                          : subjectName((c as ClassItem).subjectId)}
                      </span>
                    </span>
                    <span className={s.upRight}>
                      <span className={s.typeTag} data-kind={c.type}>{TYPE_LABEL[c.type]}</span>
                      <span className={`${s.upWhen} ${diff <= 3 && c.type !== 'aula' && c.type !== 'gcal' ? s.upSoon : ''}`}>{countdown(diff)}</span>
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
          {gcalItems.length > 0 && <span><i data-kind="gcal" />Google</span>}
        </div>
      </div>
    </section>
  )
}
