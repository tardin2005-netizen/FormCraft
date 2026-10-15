import { useEffect, useMemo, useRef, useState } from 'react'
import { Plus } from 'lucide-react'
import { useNotesStore, type Note } from '../store/notesStore'
import { useHubsStore } from '../store/hubsStore'
import DeleteBtn from '../modules/DeleteBtn'
import s from './Notas.module.css'

const MONTHS = ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ']
const TINTS = ['#fff0d6', '#fddc9a', '#e6e3ff', '#d6f5e6', '#fde0e4', '#dbeafe']
const todayKey = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
const stamp = (date: string) => ({ d: date.slice(8, 10) || '--', m: MONTHS[Number(date.slice(5, 7)) - 1] ?? '---' })
const tintFor = (subject: string) => {
  let h = 0
  for (const ch of subject.trim().toLowerCase()) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return TINTS[h % TINTS.length]
}

export default function Notas() {
  const notes = useNotesStore(st => st.notes)
  const { addNote, updateNote, deleteNote } = useNotesStore.getState()
  const hubSubjects = useHubsStore(st => st.subjects)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [date, setDate] = useState(todayKey())
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [filter, setFilter] = useState<string>('todas')
  const [justSaved, setJustSaved] = useState(false)
  const bodyRef = useRef<HTMLTextAreaElement>(null)
  const editorRef = useRef<HTMLElement>(null)
  const loaded = useRef(false)

  const sorted = useMemo(
    () => [...notes].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)),
    [notes],
  )
  const subjectNames = useMemo(() => {
    const set = new Set<string>()
    hubSubjects.forEach(x => x.name && set.add(x.name))
    notes.forEach(n => n.subject && set.add(n.subject))
    return [...set].sort((a, b) => a.localeCompare(b, 'pt-BR'))
  }, [hubSubjects, notes])
  const usedSubjects = useMemo(() => [...new Set(notes.map(n => n.subject).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR')), [notes])
  const visible = filter === 'todas' ? sorted : sorted.filter(n => n.subject === filter)

  // Editando uma nota já guardada: salva sozinho, sem botão.
  useEffect(() => {
    if (!editingId) return
    if (!loaded.current) { loaded.current = true; return }
    const t = setTimeout(() => {
      updateNote(editingId, { date, subject: subject.trim(), body })
      setJustSaved(true)
    }, 600)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, subject, body])

  function startNew() {
    loaded.current = false
    setEditingId(null); setDate(todayKey()); setSubject(filter !== 'todas' ? filter : ''); setBody(''); setJustSaved(false)
    editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setTimeout(() => bodyRef.current?.focus(), 50)
  }
  function open(n: Note) {
    loaded.current = false
    setEditingId(n.id); setDate(n.date); setSubject(n.subject); setBody(n.body); setJustSaved(false)
    editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  function save() {
    if (!body.trim()) { bodyRef.current?.focus(); return }
    addNote({ date, subject: subject.trim(), body })
    setBody(''); setJustSaved(true)
    setTimeout(() => setJustSaved(false), 2500)
  }
  function onKey(e: React.KeyboardEvent) {
    if (!editingId && (e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); save() }
  }

  return (
    <div className={s.page}>
      <h1 className={s.title}>Bloco de notas</h1>

      <section ref={editorRef} className={s.editor} style={{ background: editingId ? tintFor(subject) : '#fff0d6' }} onKeyDown={onKey}>
        <div className={s.row}>
          <label className={s.field}>
            <span className={s.label}>Data da aula</span>
            <input className={s.input} type="date" value={date} onChange={e => setDate(e.target.value)} />
          </label>
          <label className={`${s.field} ${s.grow}`}>
            <span className={s.label}>Matéria</span>
            <input className={s.input} list="notas-materias" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Escolha ou escreva a matéria" />
            <datalist id="notas-materias">{subjectNames.map(n => <option key={n} value={n} />)}</datalist>
          </label>
        </div>
        <label className={s.field}>
          <span className={s.label}>{editingId ? 'Anotações' : 'O que foi dito na aula'}</span>
          <textarea ref={bodyRef} className={`${s.input} ${s.area}`} value={body} onChange={e => setBody(e.target.value)} placeholder="Comece a escrever..." rows={6} />
        </label>
        <div className={s.foot}>
          {editingId ? (
            <>
              <span className={`${s.saved} ${justSaved ? s.savedOn : ''}`}>{justSaved ? 'Salvo agora há pouco' : 'Salva automaticamente'}</span>
              <button className={s.ghost} onClick={startNew}>Fechar</button>
              <DeleteBtn name="esta nota" onConfirm={() => { deleteNote(editingId); startNew() }} />
            </>
          ) : (
            <>
              <button className={s.save} onClick={save}>Salvar nota</button>
              <span className={s.hint}>{justSaved ? 'Nota guardada ✓' : '⌘ + Enter também salva'}</span>
            </>
          )}
        </div>
      </section>

      <div className={s.chips} role="tablist" aria-label="Filtrar por matéria">
        {['todas', ...usedSubjects].map(k => (
          <button key={k} role="tab" aria-selected={filter === k} className={`${s.chip} ${filter === k ? s.chipOn : ''}`} onClick={() => setFilter(k)}>
            {k === 'todas' ? 'Todas' : k}
          </button>
        ))}
      </div>

      <div className={s.grid}>
        <button className={s.newCard} onClick={startNew}>
          <Plus size={28} strokeWidth={3} />
          <span>Nova nota</span>
        </button>
        {visible.map(n => {
          const { d, m } = stamp(n.date)
          return (
            <button key={n.id} className={`${s.sheet} ${n.id === editingId ? s.sheetOn : ''}`} style={{ background: tintFor(n.subject) }} onClick={() => open(n)}>
              <span className={s.stamp}><i>{m}</i><b>{d}</b></span>
              <span className={s.sheetTitle}>{n.subject || 'Sem matéria'}</span>
              <span className={s.sheetBody}>{n.body}</span>
            </button>
          )
        })}
      </div>
      {notes.length === 0 && <p className={s.empty}>Nenhuma nota ainda. Escreva acima o que foi dito na aula e aperte Salvar nota.</p>}
    </div>
  )
}
