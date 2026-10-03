import { useState, useRef, useCallback, useEffect } from 'react'
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useHubsStore, type Semester, type Subject, type ClassItem, type HubContent, type Concept } from '../store/hubsStore'
import { useDeadlinesStore, type DeadlineType, type DeadlineInput } from '../store/deadlinesStore'
import { useContentItemsStore } from '../store/contentItemsStore'
import { type WorkspaceModule } from '../store/workspacesStore'
import { type ModuleType, type ModuleLayout } from '../data/contextTemplates'
import DeleteBtn from '../modules/DeleteBtn'
import EmptyState from '../components/EmptyState'
import RichText from '../components/RichText'
import { imageToDataUrl } from '../utils/imageData'
import { CalendarDays, BookOpen, FileText, Lightbulb, Clock, CheckCircle2, Circle } from 'lucide-react'
import { uploadUserFile, MAX_UPLOAD_MB, type UploadedFile } from '../utils/fileUpload'
import { ref as storageRef, getDownloadURL } from 'firebase/storage'
import { storage } from '../firebase'
import PdfProcessorModal from '../components/PdfProcessorModal'
import ScriptsModule from '../modules/ScriptsModule'
import TroubleshootingModule from '../modules/TroubleshootingModule'
import ToolsDbModule from '../modules/ToolsDbModule'
import HubGenericModule from '../modules/GenericModule'
import ReferenceGallery from '../modules/ReferenceGallery'
import s from './HubView.module.css'

/* ─── helpers ─── */
const CLASS_TYPE_LABEL: Record<ClassItem['type'], string> = {
  aula: 'Aula', trabalho: 'Trabalho', prova: 'Prova', extra: 'Extra',
}
const CLASS_TYPE_COLOR: Record<ClassItem['type'], string> = {
  aula: '#7c6ef7', trabalho: '#f59e0b', prova: '#f43f5e', extra: '#3ecf8e',
}
const CONTENT_ICON: Record<HubContent['type'], string> = {
  link: '🔗', note: '📝', pdf: '📄', file: '📁',
}
const CONTENT_LABEL: Record<HubContent['type'], string> = {
  link: 'Link', note: 'Nota', pdf: 'PDF', file: 'Arquivo',
}
const EMOJIS = ['📚','💡','🔬','🎨','🖥️','📐','📊','⚗️','🌍','🏛️','📝','🎤','🎵','🧪','⚙️']
const COLORS  = ['#7c6ef7','#4f8ef7','#3ecf8e','#f78c4f','#e46ef7','#facc15','#f43f5e']
const CURRENT_YEAR = new Date().getFullYear()

function getDomain(url: string) {
  try { return new URL(url).hostname.replace('www.', '') } catch { return '' }
}

interface ContentBlock {
  type: 'text' | 'bullets'
  heading?: string
  text?: string
  items?: string[]
}

function PdfViewer({ url, title, onFixUrl, onReplace }: {
  url: string; title: string; onFixUrl: (url: string) => void; onReplace: () => void
}) {
  const [expanded, setExpanded] = useState(true)
  const path = storagePathFromUrl(url)
  // A Storage link without its access token only works while the bucket allows public reads.
  const needsToken = !!path && !/[?&]token=/.test(url)
  const [src, setSrc] = useState(needsToken ? '' : url)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!needsToken || !path) { setSrc(url); setFailed(false); return }
    let alive = true
    getDownloadURL(storageRef(storage, path))
      .then(fresh => { if (!alive) return; setSrc(fresh); onFixUrl(fresh) })
      .catch(() => { if (alive) setFailed(true) })
    return () => { alive = false }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url])

  return (
    <div className={s.pdfContainer}>
      <div className={s.pdfHeader}>
        <button className={s.pdfToggle} onClick={() => setExpanded(v => !v)}>
          {expanded ? '▲ Recolher slides' : '▼ Ver slides'}
        </button>
        {src && (
          <a href={src} target="_blank" rel="noopener noreferrer" className={s.pdfOpenLink}>
            Abrir PDF ↗
          </a>
        )}
      </div>
      {expanded && (failed ? (
        <div className={s.pdfError} role="alert">
          <b>Este PDF não abre mais pelo link salvo.</b>
          <span>
            Ele está no Firebase Storage, mas o link foi salvo sem a chave de acesso e as regras atuais do
            Storage não liberam a leitura dele. O arquivo continua lá. Envie o PDF de novo pelo computador
            para gerar um link que funciona.
          </span>
          <button className={s.pdfErrorBtn} onClick={onReplace}>Enviar o PDF de novo</button>
        </div>
      ) : src ? (
        <iframe src={src + '#toolbar=0&navpanes=0&scrollbar=1'} className={s.pdfFrame} title={title} />
      ) : (
        <div className={s.pdfLoading}>Abrindo PDF…</div>
      ))}
    </div>
  )
}

/** Object path inside this project's Storage bucket, if the URL points there. */
function storagePathFromUrl(url: string): string | null {
  if (url.startsWith('gs://')) return url.replace(/^gs:\/\/[^/]+\//, '') || null
  const m = url.match(/^https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/[^/]+\/o\/([^?#]+)/)
  return m ? decodeURIComponent(m[1]) : null
}

function parseContent(raw: string): ContentBlock[] {
  const blocks: ContentBlock[] = []
  const sections = raw.split('\n\n').filter(Boolean)
  for (const section of sections) {
    const lines = section.split('\n')
    const first = lines[0]
    const rest = lines.slice(1).join('\n').trim()
    const isHeader = /^[📋🎯📌]/.test(first)
    if (isHeader && rest) {
      const hasBullets = rest.startsWith('• ') || rest.includes('\n• ')
      if (hasBullets) {
        const items = rest.split('\n').filter(l => l.startsWith('• ')).map(l => l.slice(2).trim())
        blocks.push({ type: 'bullets', heading: first, items })
      } else {
        blocks.push({ type: 'text', heading: first, text: rest })
      }
    } else {
      blocks.push({ type: 'text', text: section })
    }
  }
  return blocks
}

/* ─── Right-click context menu ─── */
type CtxMenuState = { x: number; y: number; label: string; onDelete: () => void }

function ContextMenu({ state, onClose }: { state: CtxMenuState; onClose: () => void }) {
  useEffect(() => {
    const close = () => onClose()
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('click', close)
    window.addEventListener('contextmenu', close)
    window.addEventListener('keydown', key)
    return () => {
      window.removeEventListener('click', close)
      window.removeEventListener('contextmenu', close)
      window.removeEventListener('keydown', key)
    }
  }, [onClose])

  const menuW = 172, menuH = 68
  const left = Math.min(state.x, window.innerWidth - menuW - 8)
  const top  = Math.min(state.y, window.innerHeight - menuH - 8)

  return (
    <div className={s.ctxMenu} style={{ left, top }} onClick={e => e.stopPropagation()}>
      <div className={s.ctxMenuLabel}>{state.label}</div>
      <button
        className={s.ctxMenuDelete}
        onClick={e => {
          e.stopPropagation()
          if (confirm(`Excluir "${state.label}"?`)) state.onDelete()
          onClose()
        }}
      >🗑 Excluir</button>
    </div>
  )
}

function ContentCard({ c, onDelete }: { c: HubContent; onDelete: () => void }) {
  const [collapsed, setCollapsed] = useState(false)
  const blocks = c.content ? parseContent(c.content) : null
  const isPdf = c.type === 'pdf' && !!c.url
  const { updateContent } = useHubsStore()
  const replaceRef = useRef<HTMLInputElement>(null)
  const [replacing, setReplacing] = useState<number | null>(null)

  async function replaceFile(file: File | undefined) {
    if (!file) return
    setReplacing(0)
    try {
      const up = await uploadUserFile(file, pct => setReplacing(pct))
      updateContent(c.id, { url: up.url, storagePath: up.storagePath, fileSize: up.size })
    } catch (err) {
      alert((err as Error).message)
    } finally {
      setReplacing(null)
    }
  }

  return (
    <div className={s.contentCard}>
      <div className={s.contentCardHead}>
        <span className={s.cardTypeIcon}>{CONTENT_ICON[c.type]}</span>
        <span className={s.cardTitle}>
          {c.url && !isPdf
            ? <a href={c.url} target="_blank" rel="noopener noreferrer">{c.title}</a>
            : c.title}
        </span>
        {blocks && blocks.length > 1 && (
          <button className={s.collapseBtn} onClick={() => setCollapsed(v => !v)}>
            {collapsed ? '▼' : '▲'}
          </button>
        )}
        <DeleteBtn onConfirm={onDelete} />
      </div>

      {isPdf && (
        <>
          <input ref={replaceRef} type="file" accept="application/pdf,.pdf" hidden
            onChange={e => { replaceFile(e.target.files?.[0]); e.target.value = '' }} />
          {replacing !== null
            ? <div className={s.pdfLoading}>Enviando PDF… {replacing}%</div>
            : <PdfViewer
                url={c.url!}
                title={c.title}
                onFixUrl={url => updateContent(c.id, { url })}
                onReplace={() => replaceRef.current?.click()}
              />}
        </>
      )}

      {blocks && !collapsed && (
        <div className={s.cardBlocks}>
          {blocks.map((block, i) => (
            <div key={i} className={s.cardBlock}>
              {block.heading && <div className={s.blockLabel}>{block.heading}</div>}
              {block.type === 'bullets' && block.items ? (
                <ul className={s.blockList}>
                  {block.items.map((item, j) => <li key={j}>{item}</li>)}
                </ul>
              ) : (
                <p className={s.blockText}>{block.text}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {c.url && !c.content && !isPdf && (
        <div className={s.cardLinkBar}>
          <span className={s.cardLinkDomain}>{getDomain(c.url)}</span>
        </div>
      )}
    </div>
  )
}

/* ─── Concept card (read-only, inline) ─── */
function ConceptCard({ concept, onDelete }: { concept: Concept; onDelete: () => void }) {
  return (
    <div className={s.conceptCard}>
      {concept.imageData && (
        <div className={s.conceptImgWrap}>
          <img src={concept.imageData} alt={concept.termo} className={s.conceptImg} />
        </div>
      )}
      <div className={s.conceptBody}>
        <div className={s.conceptTermo}>{concept.termo}</div>
        <RichText text={concept.definicao} className={s.conceptDef} />
        {concept.tags.length > 0 && (
          <div className={s.conceptTags}>
            {concept.tags.map(t => <span key={t} className={s.conceptTag}>{t}</span>)}
          </div>
        )}
      </div>
      <DeleteBtn onConfirm={onDelete} />
    </div>
  )
}

/* ─── Faculdade template ─── */
function FaculdadeView({ hubId }: { hubId: string }) {
  const {
    semesters, subjects, classes, contents, concepts,
    addSemester, removeSemester,
    addSubject, removeSubject,
    addClassItem, removeClassItem,
    addContent, removeContent,
    addConcept, removeConcept,
  } = useHubsStore()

  const hubSemesters = semesters.filter(s => s.hubId === hubId)
    .sort((a, b) => a.year !== b.year ? a.year - b.year : Number(a.period) - Number(b.period))

  const [params, setParams] = useSearchParams()
  const [selSem, setSelSem]     = useState<string | null>(params.get('sem') ?? hubSemesters[0]?.id ?? null)
  const [selSubj, setSelSubj]   = useState<string | null>(params.get('subj'))
  const [selClass, setSelClass] = useState<string | null>(params.get('cls'))

  // Auto-select first subject so content is visible on refresh
  useEffect(() => {
    if (selSem && !selSubj) {
      const first = subjects.find(x => x.semesterId === selSem)
      if (first) setSelSubj(first.id)
    }
  }, [selSem, subjects])

  // Modals
  const [semModal,       setSemModal]       = useState(false)
  const [subjModal,      setSubjModal]      = useState(false)
  const [classModal,     setClassModal]     = useState(false)
  const [contentModal,   setContentModal]   = useState(false)
  const [pdfModal,       setPdfModal]       = useState(false)
  const [conceptModal,   setConceptModal]   = useState(false)

  // Forms
  const [semForm,  setSemForm]  = useState({ year: CURRENT_YEAR, period: '1' as '1'|'2', name: '' })
  const [subjForm, setSubjForm] = useState({ name: '', emoji: '📚', color: '#7c6ef7', professor: '' })
  const [clsForm,  setClsForm]  = useState({ title: '', type: 'aula' as ClassItem['type'], date: '', notes: '' })
  const [ctxForm,  setCtxForm]  = useState({ type: 'pdf' as HubContent['type'], title: '', url: '', content: '' })
  const [ctxSource, setCtxSource] = useState<'computer' | 'url'>('computer')
  const [ctxFile,   setCtxFile]   = useState<File | null>(null)
  const [ctxUpload, setCtxUpload] = useState({ busy: false, pct: 0, error: '' })
  const [ctxDrag,   setCtxDrag]   = useState(false)
  const ctxFileRef = useRef<HTMLInputElement>(null)
  const [cptForm,  setCptForm]  = useState({ termo: '', definicao: '', imageData: '', tags: '' })
  const [cptUploading, setCptUploading] = useState(false)
  const cptImgRef = useRef<HTMLInputElement>(null)

  // Prazos & Pendências
  const { deadlines, add: addDeadline, remove: removeDeadline, toggle: toggleDeadline } = useDeadlinesStore()
  const [dlModal, setDlModal] = useState(false)
  const [dlForm, setDlForm] = useState({ titulo: '', tipo: 'prova' as DeadlineType, data: '', peso: 20 })

  const [ctxMenu, setCtxMenu] = useState<CtxMenuState | null>(null)
  const closeCtx = useCallback(() => setCtxMenu(null), [])

  // ?novo=semestre | material — opened from "Primeiros passos" or "+ Guardar" on the home screen
  const novo = params.get('novo')
  const novoHandled = useRef(false)
  useEffect(() => {
    if (novoHandled.current || !novo) return
    // Consume the param so switching tabs (which remounts this view) doesn't reopen the modal.
    const consume = () => {
      novoHandled.current = true
      setParams(p => { const next = new URLSearchParams(p); next.delete('novo'); return next }, { replace: true })
    }
    if (novo === 'semestre' || !selSem) { consume(); setSemModal(true); return }
    if (novo === 'material') {
      if (!selSubj) {
        if (!subjects.some(x => x.semesterId === selSem)) { consume(); setSubjModal(true) }
        return
      }
      consume()
      setContentModal(true)
    }
  }, [novo, selSem, selSubj, subjects, setParams])

  const curSubjects  = subjects.filter(x => x.semesterId === selSem)
  const curClasses   = classes.filter(x => x.subjectId === selSubj).sort((a, b) => a.date.localeCompare(b.date))
  const curContents  = contents.filter(x =>
    selClass ? x.classId === selClass : (x.subjectId === selSubj && !x.classId)
  )
  const curConcepts  = concepts.filter(x => selClass ? x.classId === selClass : x.subjectId === selSubj)
  const curDeadlines = deadlines
    .filter(x => x.materiaId === selSubj)
    .sort((a, b) => a.data.localeCompare(b.data))

  function createSemester() {
    const dup = hubSemesters.find(x => x.year === semForm.year && x.period === semForm.period)
    if (dup) { alert(`${dup.name} já existe neste hub.`); return }
    const name = semForm.name || `${semForm.period}° Sem ${semForm.year}`
    const created = addSemester({ hubId, name, year: semForm.year, period: semForm.period })
    setSelSem(created.id); setSelSubj(null); setSelClass(null)
    setSemModal(false)
    setSemForm({ year: CURRENT_YEAR, period: '1', name: '' })
  }
  function createSubject() {
    if (!selSem || !subjForm.name.trim()) return
    const created = addSubject({ hubId, semesterId: selSem, name: subjForm.name.trim(), emoji: subjForm.emoji, color: subjForm.color, professor: subjForm.professor || undefined })
    setSelSubj(created.id); setSelClass(null)
    setSubjModal(false)
    setSubjForm({ name: '', emoji: '📚', color: '#7c6ef7', professor: '' })
  }
  function createClass() {
    if (!selSubj || !clsForm.title.trim()) return
    const sem = selSem!
    const createdClass = addClassItem({ hubId, semesterId: sem, subjectId: selSubj, title: clsForm.title.trim(), type: clsForm.type, date: clsForm.date || new Date().toISOString().split('T')[0], notes: clsForm.notes || undefined })
    setSelClass(createdClass.id)
    setClassModal(false)
    setClsForm({ title: '', type: 'aula', date: '', notes: '' })
  }
  const usesFile = (ctxForm.type === 'pdf' || ctxForm.type === 'file') && ctxSource === 'computer'
  const canSaveContent = !!ctxForm.title.trim() && !ctxUpload.busy && (!usesFile || !!ctxFile)

  function pickCtxFile(file: File | undefined) {
    if (!file) return
    setCtxUpload({ busy: false, pct: 0, error: '' })
    setCtxFile(file)
    setCtxForm(f => ({ ...f, title: f.title.trim() ? f.title : file.name.replace(/\.[^.]+$/, '') }))
  }

  function closeContentModal() {
    if (ctxUpload.busy) return
    setContentModal(false)
    setCtxForm({ type: 'pdf', title: '', url: '', content: '' })
    setCtxFile(null)
    setCtxUpload({ busy: false, pct: 0, error: '' })
  }

  async function createContent() {
    if (!canSaveContent) return
    let uploaded: UploadedFile | null = null
    if (usesFile && ctxFile) {
      setCtxUpload({ busy: true, pct: 0, error: '' })
      try {
        uploaded = await uploadUserFile(ctxFile, pct => setCtxUpload(u => ({ ...u, pct })))
      } catch (err) {
        setCtxUpload({ busy: false, pct: 0, error: (err as Error).message })
        return
      }
    }
    addContent({
      hubId,
      semesterId: selSem ?? undefined,
      subjectId: selSubj ?? undefined,
      classId: selClass ?? undefined,
      type: ctxForm.type,
      title: ctxForm.title.trim(),
      url: uploaded?.url ?? (ctxForm.url || undefined),
      content: ctxForm.content || undefined,
      ...(uploaded ? { storagePath: uploaded.storagePath, fileSize: uploaded.size } : {}),
    })
    setCtxUpload({ busy: false, pct: 0, error: '' })
    closeContentModal()
  }

  async function handleCptImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setCptUploading(true)
    try {
      const imageData = await imageToDataUrl(file)
      setCptForm(f => ({ ...f, imageData }))
    } catch (err) {
      alert((err as Error).message)
    } finally {
      setCptUploading(false)
    }
  }

  function createConcept() {
    if (!cptForm.termo.trim() || !cptForm.definicao.trim()) return
    if (!selSubj || !selClass || !selSem) return
    const tags = cptForm.tags.split(',').map(t => t.trim()).filter(Boolean)
    addConcept({
      hubId,
      semesterId: selSem,
      subjectId: selSubj,
      classId: selClass,
      termo: cptForm.termo.trim(),
      definicao: cptForm.definicao.trim(),
      imageData: cptForm.imageData || undefined,
      tags,
    })
    setConceptModal(false)
    setCptForm({ termo: '', definicao: '', imageData: '', tags: '' })
  }

  return (
    <div className={s.facPage}>
      {/* Semesters tab bar */}
      <div className={s.semBar}>
        {hubSemesters.map(sem => (
          <button
            key={sem.id}
            className={`${s.semTab} ${selSem === sem.id ? s.semTabActive : ''}`}
            onClick={() => { setSelSem(sem.id); setSelSubj(null); setSelClass(null) }}
          >{sem.name}</button>
        ))}
        <button className={s.addSemBtn} onClick={() => setSemModal(true)}>+ Semestre</button>
      </div>

      {!selSem ? (
        <EmptyState
          icon={<CalendarDays size={20} />}
          title="Nenhum semestre neste hub ainda"
          actions={[{ label: '+ Semestre', onClick: () => setSemModal(true) }]}
        >
          Semestres organizam suas matérias por período. Comece pelo semestre que você está cursando agora; os anteriores podem vir depois.
        </EmptyState>
      ) : (
        <div className={s.facContent}>
          {/* Subjects sidebar */}
          <div className={s.subjPanel}>
            <div className={s.panelHeader}>
              <span>Matérias</span>
              <button className={s.panelAdd} onClick={() => setSubjModal(true)}>+</button>
            </div>
            {curSubjects.length === 0
              ? <button className={s.panelEmptyAdd} onClick={() => setSubjModal(true)}>+ Adicionar matéria</button>
              : curSubjects.map(subj => (
                <div key={subj.id} className={`${s.subjItem} ${selSubj === subj.id ? s.subjActive : ''}`}
                  onClick={() => { setSelSubj(subj.id); setSelClass(null) }}
                  onContextMenu={e => { e.preventDefault(); setCtxMenu({ x: e.clientX, y: e.clientY, label: subj.name, onDelete: () => removeSubject(subj.id) }) }}
                >
                  <div className={s.subjDot} style={{ background: subj.color }} />
                  <span className={s.subjEmoji}>{subj.emoji}</span>
                  <span className={s.subjName}>{subj.name}</span>
                </div>
              ))
            }
          </div>

          {/* Main content area */}
          {!selSubj ? (
            curSubjects.length === 0 ? (
              <EmptyState
                icon={<BookOpen size={20} />}
                title="Adicione a primeira matéria deste semestre"
                actions={[{ label: '+ Matéria', onClick: () => setSubjModal(true) }]}
              >
                Cada matéria guarda suas aulas, provas, materiais em PDF e os conceitos que você quer achar depois.
              </EmptyState>
            ) : (
              <EmptyState icon={<BookOpen size={20} />} title="Escolha uma matéria">
                Clique numa matéria da lista para ver as aulas e os materiais dela.
              </EmptyState>
            )
          ) : (
            <div className={s.mainPanel}>
              {(() => {
                const subj = subjects.find(x => x.id === selSubj)!
                return (
                  <>
                    <div className={s.mainHeader}>
                      <div className={s.mainTitle}>
                        <span>{subj.emoji}</span>
                        <span>{subj.name}</span>
                        {subj.professor && <span className={s.professor}>• {subj.professor}</span>}
                      </div>
                      <div className={s.mainActions}>
                        <button className={s.actionBtn} onClick={() => setContentModal(true)}>+ Material</button>
                        <button className={s.actionBtn} onClick={() => setClassModal(true)}>+ Aula</button>
                        <button className={s.actionBtn} onClick={() => setConceptModal(true)} disabled={!selClass}>+ Conceito</button>
                        <button className={s.actionBtnPdf} onClick={() => setPdfModal(true)}>📄 PDF</button>
                      </div>
                    </div>

                    {/* Class list */}
                    {curClasses.length === 0 && (
                      <div className={s.contentSection} style={{ flex: 'none', paddingBottom: 0 }}>
                        <EmptyState
                          compact
                          icon={<CalendarDays size={16} />}
                          title="Nenhuma aula nesta matéria ainda"
                          actions={[{ label: '+ Aula', onClick: () => setClassModal(true) }]}
                        >
                          Cadastre aulas, provas e trabalhos com data. Eles aparecem no calendário da tela inicial, e cada aula guarda seus materiais e conceitos.
                        </EmptyState>
                      </div>
                    )}
                    <div className={s.classList}>
                      {curClasses.map(cl => (
                        <div
                          key={cl.id}
                          className={`${s.classRow} ${selClass === cl.id ? s.classActive : ''}`}
                          onClick={() => setSelClass(selClass === cl.id ? null : cl.id)}
                          onContextMenu={e => { e.preventDefault(); setCtxMenu({ x: e.clientX, y: e.clientY, label: cl.title, onDelete: () => removeClassItem(cl.id) }) }}
                        >
                          <span
                            className={s.classType}
                            style={{ background: CLASS_TYPE_COLOR[cl.type] }}
                          >{CLASS_TYPE_LABEL[cl.type]}</span>
                          <span className={s.classTitle}>{cl.title}</span>
                          <span className={s.classDate}>{cl.date}</span>
                        </div>
                      ))}
                    </div>

                    {/* Content list */}
                    <div className={s.contentSection}>
                      <div className={s.contentLabel}>
                        {selClass ? `Materiais da aula` : 'Materiais da matéria'}
                      </div>
                      {curContents.length === 0 && (
                        <EmptyState
                          compact
                          icon={<FileText size={16} />}
                          title={selClass ? 'Nenhum material nesta aula ainda' : 'Nenhum material geral nesta matéria'}
                          actions={[
                            { label: '+ Material', onClick: () => setContentModal(true) },
                            { label: 'Resumir PDF com IA', onClick: () => setPdfModal(true) },
                          ]}
                        >
                          {selClass
                            ? 'Guarde o PDF dos slides, um link ou seu resumo desta aula. Dá para arrastar o arquivo direto.'
                            : 'Aqui ficam materiais da matéria inteira, como o plano de ensino. Para guardar algo de uma aula, clique na aula primeiro.'}
                        </EmptyState>
                      )}
                      {curContents.map(c => (
                        <ContentCard key={c.id} c={c} onDelete={() => removeContent(c.id)} />
                      ))}
                    </div>

                    {/* Concepts list */}
                    {selClass && curConcepts.length === 0 && (
                      <div className={s.contentSection}>
                        <EmptyState
                          compact
                          icon={<Lightbulb size={16} />}
                          title="Nenhum conceito nesta aula ainda"
                          actions={[{ label: '+ Conceito', onClick: () => setConceptModal(true) }]}
                        >
                          Conceitos são os termos da aula que você quer achar depois pela busca da tela inicial, de qualquer semestre. Um print do slide ajuda a lembrar.
                        </EmptyState>
                      </div>
                    )}
                    {curConcepts.length > 0 && (
                      <div className={s.contentSection}>
                        <div className={s.contentLabel}>Conceitos indexados</div>
                        <div className={s.conceptList}>
                          {curConcepts.map(c => (
                            <ConceptCard key={c.id} concept={c} onDelete={() => removeConcept(c.id)} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Prazos & Pendências */}
                    <div className={s.contentSection}>
                      <div className={s.contentLabel}>
                        <span>Prazos & Pendências</span>
                        <button className={s.panelAdd} onClick={() => setDlModal(true)}>+</button>
                      </div>
                      {curDeadlines.length === 0 ? (
                        <button className={s.panelEmptyAdd} onClick={() => setDlModal(true)}>+ Adicionar prazo</button>
                      ) : (
                        <div className={s.deadlineList}>
                          {curDeadlines.map(dl => (
                            <div key={dl.id} className={`${s.deadlineRow} ${dl.status === 'concluido' ? s.deadlineDone : ''}`}>
                              <button className={s.deadlineToggle} onClick={() => toggleDeadline(dl.id)} title={dl.status === 'concluido' ? 'Marcar pendente' : 'Marcar concluído'}>
                                {dl.status === 'concluido' ? <CheckCircle2 size={15} /> : <Circle size={15} />}
                              </button>
                              <span className={s.deadlineTitle}>{dl.titulo}</span>
                              <span className={s.deadlineChip} data-tipo={dl.tipo}>{dl.tipo}</span>
                              {dl.data && <span className={s.deadlineDate}>{dl.data}</span>}
                              {dl.peso > 0 && <span className={s.deadlinePeso}>{dl.peso}%</span>}
                              <button className={s.deadlineRemove} onClick={() => removeDeadline(dl.id)} title="Remover">×</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )
              })()}
            </div>
          )}
        </div>
      )}

      {/* ── Modals ── */}
      <AnimatePresence>
        {semModal && (
          <Modal title="Novo Semestre" onClose={() => setSemModal(false)} onSave={createSemester} saveLabel="Criar">
            <div className={s.field}>
              <label className={s.label}>Ano</label>
              <input className={s.input} type="number" value={semForm.year} min={2020} max={2040}
                onChange={e => setSemForm(f => ({ ...f, year: Number(e.target.value) }))} />
            </div>
            <div className={s.field}>
              <label className={s.label}>Período</label>
              <div className={s.periodRow}>
                {(['1','2'] as const).map(p => (
                  <button key={p} className={`${s.periodBtn} ${semForm.period === p ? s.periodActive : ''}`}
                    onClick={() => setSemForm(f => ({ ...f, period: p }))}>
                    {p}° Semestre
                  </button>
                ))}
              </div>
            </div>
            <div className={s.field}>
              <label className={s.label}>Nome personalizado (opcional)</label>
              <input className={s.input} placeholder={`${semForm.period}° Sem ${semForm.year}`} value={semForm.name}
                onChange={e => setSemForm(f => ({ ...f, name: e.target.value }))} />
            </div>
          </Modal>
        )}

        {subjModal && (
          <Modal title="Nova Matéria" onClose={() => setSubjModal(false)} onSave={createSubject} saveLabel="Criar" disabled={!subjForm.name.trim()}>
            <div className={s.emojiRow}>
              {EMOJIS.map(e => (
                <button key={e} className={`${s.emojiBtn} ${subjForm.emoji === e ? s.emojiActive : ''}`}
                  onClick={() => setSubjForm(f => ({ ...f, emoji: e }))}>{e}</button>
              ))}
            </div>
            <div className={s.field}>
              <label className={s.label}>Nome da matéria</label>
              <input className={s.input} placeholder="ex: Cálculo I" value={subjForm.name} autoFocus
                onChange={e => setSubjForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className={s.field}>
              <label className={s.label}>Professor (opcional)</label>
              <input className={s.input} placeholder="Nome do professor" value={subjForm.professor}
                onChange={e => setSubjForm(f => ({ ...f, professor: e.target.value }))} />
            </div>
            <div className={s.colorRow}>
              {COLORS.map(c => (
                <button key={c} className={`${s.colorDot} ${subjForm.color === c ? s.colorActive : ''}`}
                  style={{ background: c }} onClick={() => setSubjForm(f => ({ ...f, color: c }))} />
              ))}
            </div>
          </Modal>
        )}

        {classModal && (
          <Modal title="Nova Aula / Atividade" onClose={() => setClassModal(false)} onSave={createClass} saveLabel="Criar" disabled={!clsForm.title.trim()}>
            <div className={s.field}>
              <label className={s.label}>Tipo</label>
              <div className={s.typeRow}>
                {(['aula','trabalho','prova','extra'] as ClassItem['type'][]).map(t => (
                  <button key={t}
                    className={`${s.typeBtn} ${clsForm.type === t ? s.typeActive : ''}`}
                    style={clsForm.type === t ? { borderColor: CLASS_TYPE_COLOR[t], color: CLASS_TYPE_COLOR[t] } : {}}
                    onClick={() => setClsForm(f => ({ ...f, type: t }))}
                  >{CLASS_TYPE_LABEL[t]}</button>
                ))}
              </div>
            </div>
            <div className={s.field}>
              <label className={s.label}>Título</label>
              <input className={s.input} placeholder="ex: Aula 01 — Introdução" value={clsForm.title} autoFocus
                onChange={e => setClsForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div className={s.field}>
              <label className={s.label}>Data</label>
              <input className={s.input} type="date" value={clsForm.date}
                onChange={e => setClsForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div className={s.field}>
              <label className={s.label}>Notas (opcional)</label>
              <textarea className={`${s.input} ${s.textarea}`} placeholder="Anotações rápidas..."
                value={clsForm.notes} onChange={e => setClsForm(f => ({ ...f, notes: e.target.value }))} rows={3} />
            </div>
          </Modal>
        )}

        {pdfModal && (() => {
          const subj = subjects.find(x => x.id === selSubj)
          return (
            <PdfProcessorModal
              subjectName={subj?.name ?? ''}
              onClose={() => setPdfModal(false)}
              onSave={(title, content) => {
                addContent({
                  hubId,
                  semesterId: selSem ?? undefined,
                  subjectId: selSubj ?? undefined,
                  classId: selClass ?? undefined,
                  type: 'note',
                  title,
                  content,
                })
                setPdfModal(false)
              }}
            />
          )
        })()}

        {contentModal && (
          <Modal
            title={selClass ? 'Adicionar material à aula' : 'Adicionar material à matéria'}
            onClose={closeContentModal}
            onSave={createContent}
            saveLabel={ctxUpload.busy ? `Enviando… ${ctxUpload.pct}%` : usesFile ? 'Enviar e salvar' : 'Salvar'}
            disabled={!canSaveContent}
          >
            <div className={s.field}>
              <label className={s.label}>Tipo</label>
              <div className={s.typeRow}>
                {(['pdf','link','note','file'] as HubContent['type'][]).map(t => (
                  <button key={t}
                    className={`${s.typeBtn} ${ctxForm.type === t ? s.typeActive : ''}`}
                    onClick={() => { setCtxForm(f => ({ ...f, type: t })); setCtxFile(null); setCtxUpload({ busy: false, pct: 0, error: '' }) }}
                    disabled={ctxUpload.busy}
                  >{CONTENT_ICON[t]} {CONTENT_LABEL[t]}</button>
                ))}
              </div>
            </div>

            {(ctxForm.type === 'pdf' || ctxForm.type === 'file') && (
              <div className={s.field}>
                <div className={s.sourceToggle} role="tablist">
                  <button role="tab" aria-selected={ctxSource === 'computer'} className={`${s.sourceBtn} ${ctxSource === 'computer' ? s.sourceActive : ''}`}
                    onClick={() => setCtxSource('computer')} disabled={ctxUpload.busy}>Do computador</button>
                  <button role="tab" aria-selected={ctxSource === 'url'} className={`${s.sourceBtn} ${ctxSource === 'url' ? s.sourceActive : ''}`}
                    onClick={() => setCtxSource('url')} disabled={ctxUpload.busy}>Por link (URL)</button>
                </div>
              </div>
            )}

            {usesFile && (
              <div className={s.field}>
                <input ref={ctxFileRef} type="file" hidden
                  accept={ctxForm.type === 'pdf' ? 'application/pdf,.pdf' : undefined}
                  onChange={e => { pickCtxFile(e.target.files?.[0]); e.target.value = '' }} />
                <button
                  type="button"
                  className={`${s.dropZone} ${ctxDrag ? s.dropZoneActive : ''}`}
                  onClick={() => ctxFileRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setCtxDrag(true) }}
                  onDragLeave={() => setCtxDrag(false)}
                  onDrop={e => { e.preventDefault(); setCtxDrag(false); pickCtxFile(e.dataTransfer.files?.[0]) }}
                  disabled={ctxUpload.busy}
                >
                  {ctxFile ? (
                    <>
                      <span className={s.dropIcon}>{ctxForm.type === 'pdf' ? '📄' : '📁'}</span>
                      <span className={s.dropName}>{ctxFile.name}</span>
                      <span className={s.dropHint}>{(ctxFile.size / 1024 / 1024).toFixed(1)} MB · clique para trocar</span>
                    </>
                  ) : (
                    <>
                      <span className={s.dropIcon}>⬆</span>
                      <span className={s.dropName}>Arraste o {ctxForm.type === 'pdf' ? 'PDF' : 'arquivo'} aqui ou clique para escolher</span>
                      <span className={s.dropHint}>Até {MAX_UPLOAD_MB} MB</span>
                    </>
                  )}
                </button>
                {ctxUpload.busy && (
                  <div className={s.progress} role="progressbar" aria-valuenow={ctxUpload.pct} aria-valuemin={0} aria-valuemax={100}>
                    <div className={s.progressBar} style={{ width: `${ctxUpload.pct}%` }} />
                  </div>
                )}
                {ctxUpload.error && <p className={s.uploadError}>{ctxUpload.error}</p>}
              </div>
            )}

            <div className={s.field}>
              <label className={s.label}>Título</label>
              <input className={s.input} placeholder="Nome do material" value={ctxForm.title} autoFocus
                onChange={e => setCtxForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            {(ctxForm.type === 'link' || ((ctxForm.type === 'pdf' || ctxForm.type === 'file') && ctxSource === 'url')) && (
              <div className={s.field}>
                <label className={s.label}>URL</label>
                <input className={s.input} placeholder="https://..." value={ctxForm.url}
                  onChange={e => setCtxForm(f => ({ ...f, url: e.target.value }))} />
              </div>
            )}
            {ctxForm.type === 'note' && (
              <div className={s.field}>
                <label className={s.label}>Conteúdo</label>
                <textarea className={`${s.input} ${s.textarea}`} placeholder="Sua nota..."
                  value={ctxForm.content} onChange={e => setCtxForm(f => ({ ...f, content: e.target.value }))} rows={4} />
              </div>
            )}
          </Modal>
        )}

        {dlModal && selSubj && (
          <Modal title="Novo Prazo / Pendência" onClose={() => setDlModal(false)}
            onSave={() => {
              if (!dlForm.titulo.trim() || !selSubj) return
              const sem = semesters.find(x => x.id === selSem)
              addDeadline({
                titulo: dlForm.titulo.trim(),
                tipo: dlForm.tipo,
                data: dlForm.data,
                peso: dlForm.peso,
                materiaId: selSubj,
                hubId,
                semesterId: selSem ?? '',
                status: 'pendente',
              } as DeadlineInput)
              setDlModal(false)
              setDlForm({ titulo: '', tipo: 'prova', data: '', peso: 20 })
            }}
            saveLabel="Adicionar"
            disabled={!dlForm.titulo.trim()}
          >
            <div className={s.field}>
              <label className={s.label}>Título</label>
              <input className={s.input} placeholder="ex: Prova N1" autoFocus value={dlForm.titulo}
                onChange={e => setDlForm(f => ({ ...f, titulo: e.target.value }))} />
            </div>
            <div className={s.field}>
              <label className={s.label}>Tipo</label>
              <div className={s.typeRow}>
                {(['prova','entrega','projeto','outro'] as DeadlineType[]).map(t => (
                  <button key={t} className={`${s.typeBtn} ${dlForm.tipo === t ? s.typeActive : ''}`}
                    onClick={() => setDlForm(f => ({ ...f, tipo: t }))}>{t}</button>
                ))}
              </div>
            </div>
            <div className={s.field}>
              <label className={s.label}>Data</label>
              <input className={s.input} type="date" value={dlForm.data}
                onChange={e => setDlForm(f => ({ ...f, data: e.target.value }))} />
            </div>
            <div className={s.field}>
              <label className={s.label}>Peso na nota (%)</label>
              <input className={s.input} type="number" min={0} max={100} value={dlForm.peso}
                onChange={e => setDlForm(f => ({ ...f, peso: Number(e.target.value) }))} />
            </div>
          </Modal>
        )}

        {conceptModal && (
          <Modal
            title="Novo Conceito"
            onClose={() => { setConceptModal(false); setCptForm({ termo: '', definicao: '', imageData: '', tags: '' }) }}
            onSave={createConcept}
            saveLabel="Salvar"
            disabled={!cptForm.termo.trim() || !cptForm.definicao.trim() || !selClass}
          >
            <div className={s.field}>
              <label className={s.label}>Termo *</label>
              <input className={s.input} placeholder="ex: Herança, Polimorfismo, HTTP..." autoFocus
                value={cptForm.termo} onChange={e => setCptForm(f => ({ ...f, termo: e.target.value }))} />
            </div>
            <div className={s.field}>
              <label className={s.label}>Definição *</label>
              <textarea className={`${s.input} ${s.textarea}`} placeholder="Explique em 1-2 frases o que é esse conceito..."
                value={cptForm.definicao} onChange={e => setCptForm(f => ({ ...f, definicao: e.target.value }))} rows={6} />
            </div>
            <div className={s.field}>
              <label className={s.label}>Imagem (print do slide)</label>
              <input ref={cptImgRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCptImage} />
              {cptForm.imageData ? (
                <div className={s.cptImgPreview}>
                  <img src={cptForm.imageData} alt="preview" className={s.cptImgThumb} />
                  <button className={s.cptImgRemove} onClick={() => setCptForm(f => ({ ...f, imageData: '' }))}>✕ Remover</button>
                </div>
              ) : (
                <button className={s.uploadBtn} onClick={() => cptImgRef.current?.click()} disabled={cptUploading}>
                  {cptUploading ? 'Carregando…' : '📷 Escolher imagem'}
                </button>
              )}
            </div>
            <div className={s.field}>
              <label className={s.label}>Tags (separadas por vírgula)</label>
              <input className={s.input} placeholder="ex: OOP, back-end, algoritmo"
                value={cptForm.tags} onChange={e => setCptForm(f => ({ ...f, tags: e.target.value }))} />
            </div>
            {!selClass && (
              <p className={s.cptHint}>Selecione uma aula antes de criar um conceito.</p>
            )}
          </Modal>
        )}
      </AnimatePresence>

      {ctxMenu && <ContextMenu state={ctxMenu} onClose={closeCtx} />}
    </div>
  )
}

/* ─── Workspace tabs for generic hubs ─── */
const WORKSPACE_TABS: { key: string; label: string; icon: string; type: ModuleType; layout: ModuleLayout }[] = [
  { key: 'tools-db',         label: 'Ferramentas',     icon: '🛠',  type: 'tools-db',         layout: 'grid'    },
  { key: 'scripts',          label: 'Scripts',         icon: '📜',  type: 'scripts',          layout: 'list'    },
  { key: 'troubleshooting',  label: 'Troubleshooting', icon: '🔧',  type: 'troubleshooting',  layout: 'table'   },
  { key: 'notes',            label: 'Notas',           icon: '📝',  type: 'notes',            layout: 'list'    },
  { key: 'references',       label: 'Referências',     icon: '🔖',  type: 'references',       layout: 'gallery' },
  { key: 'links',            label: 'Links',           icon: '🔗',  type: 'links',            layout: 'list'    },
]

function HubModuleTab({ hubId, tabKey, type, layout }: { hubId: string; tabKey: string; type: ModuleType; layout: ModuleLayout }) {
  const { items, addItem, updateItem, removeItem, toggleStar } = useContentItemsStore()
  const moduleId = `hub-${hubId}-${tabKey}`
  const moduleItems = items.filter(i => i.moduleId === moduleId)

  const syntheticModule: WorkspaceModule = {
    id: moduleId, type, name: '', icon: '', order: 0, enabled: true, layout,
  }
  const props = { module: syntheticModule, workspaceId: hubId, items: moduleItems, addItem, updateItem, removeItem, toggleStar }

  switch (type) {
    case 'tools-db':         return <ToolsDbModule {...props} />
    case 'scripts':          return <ScriptsModule {...props} />
    case 'troubleshooting':  return <TroubleshootingModule {...props} />
    case 'references':       return <ReferenceGallery {...props} />
    default:                 return <HubGenericModule {...props} />
  }
}

/* ─── Generic Hub ─── */
function GenericHubView({ hubId }: { hubId: string }) {
  const [activeTab, setActiveTab] = useState(WORKSPACE_TABS[0].key)
  const tab = WORKSPACE_TABS.find(t => t.key === activeTab) ?? WORKSPACE_TABS[0]

  return (
    <div className={s.genericPage}>
      <div className={s.wsTabs}>
        {WORKSPACE_TABS.map(t => (
          <button
            key={t.key}
            className={`${s.wsTab} ${activeTab === t.key ? s.wsTabActive : ''}`}
            onClick={() => setActiveTab(t.key)}
          >{t.icon} {t.label}</button>
        ))}
      </div>
      <div className={s.wsContent}>
        <HubModuleTab key={tab.key} hubId={hubId} tabKey={tab.key} type={tab.type} layout={tab.layout} />
      </div>
    </div>
  )
}

/* ─── Reusable Modal ─── */
function Modal({
  title, onClose, onSave, saveLabel, disabled, children,
}: {
  title: string; onClose: () => void; onSave: () => void; saveLabel: string; disabled?: boolean; children: React.ReactNode
}) {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const drag = useRef<{ mx: number; my: number; px: number; py: number } | null>(null)

  const onHeaderMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'BUTTON') return
    drag.current = { mx: e.clientX, my: e.clientY, px: pos.x, py: pos.y }
    const onMove = (ev: MouseEvent) => {
      if (!drag.current) return
      const maxX = window.innerWidth / 2 - 60
      const maxY = window.innerHeight / 2 - 60
      const nx = drag.current.px + ev.clientX - drag.current.mx
      const ny = drag.current.py + ev.clientY - drag.current.my
      setPos({
        x: Math.max(-maxX, Math.min(maxX, nx)),
        y: Math.max(-maxY, Math.min(maxY, ny)),
      })
    }
    const onUp = () => { drag.current = null; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [pos])

  return (
    <>
      <div className={s.backdrop} onClick={onClose} />
      {/* outer div handles drag position; inner motion.div handles enter/exit animation */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%', zIndex: 60,
        transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`,
      }}>
        <motion.div
          className={s.modal}
          initial={{ opacity: 0, scale: .94, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: .94 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          style={{ position: 'relative', top: 'auto', left: 'auto', transform: 'none' }}
        >
          <div className={`${s.modalHeader} ${s.modalDrag}`} onMouseDown={onHeaderMouseDown}>
            <span>{title}</span>
            <button className={s.modalClose} onClick={onClose}>✕</button>
          </div>
          <div className={s.modalBody}>{children}</div>
          <div className={s.modalFooter}>
            <button className={s.cancelBtn} onClick={onClose}>Cancelar</button>
            <button className={s.saveBtn} disabled={disabled} onClick={onSave}>{saveLabel}</button>
          </div>
        </motion.div>
      </div>
    </>
  )
}

/* ─── Chats (Discord-like) ─── */
const CHAT_EMOJIS = ['💬','🔥','📌','🛠','📚','⚡','🎯','🧩','💡','🌐']

function ChatsView({ hubId }: { hubId: string }) {
  const {
    hubChats, hubChatMessages, subjects,
    addChat, removeChat, addChatMessage, removeChatMessage, addContent,
  } = useHubsStore()

  const chats = hubChats.filter(c => c.hubId === hubId)
  const hubSubjects = subjects.filter(s => s.hubId === hubId)

  const [selChat, setSelChat] = useState<string | null>(null)
  const [ctxMenu, setCtxMenu] = useState<CtxMenuState | null>(null)
  const closeCtx = useCallback(() => setCtxMenu(null), [])
  const [newChatName, setNewChatName] = useState('')
  const [newChatEmoji, setNewChatEmoji] = useState('💬')
  const [addChatOpen, setAddChatOpen] = useState(false)
  const [msgText, setMsgText] = useState('')
  const [msgUrl, setMsgUrl] = useState('')
  const [msgSubjectId, setMsgSubjectId] = useState('')
  const feedRef = useRef<HTMLDivElement>(null)

  const messages = hubChatMessages.filter(m => m.chatId === selChat)

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight
    }
  }, [messages.length, selChat])

  function createChat() {
    if (!newChatName.trim()) return
    const chat = { hubId, name: newChatName.trim(), emoji: newChatEmoji }
    setSelChat(addChat(chat).id)
    setNewChatName('')
    setNewChatEmoji('💬')
    setAddChatOpen(false)
  }

  function sendMessage() {
    const text = msgText.trim()
    const url = msgUrl.trim()
    const subjectId = msgSubjectId
    if (!text || !selChat) return
    setMsgText('')
    setMsgUrl('')
    setMsgSubjectId('')
    addChatMessage({ chatId: selChat, hubId, text, url: url || undefined, subjectId: subjectId || undefined })
    if (subjectId) {
      addContent({
        hubId,
        subjectId,
        type: url ? 'link' : 'note',
        title: text.slice(0, 80),
        url: url || undefined,
        content: url ? undefined : text,
      })
    }
  }

  const currentChat = chats.find(c => c.id === selChat)

  function formatTime(iso: string) {
    const d = new Date(iso)
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }
  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
  }

  return (
    <div className={s.chatsPage}>
      {/* Left: channel list */}
      <div className={s.channelList}>
        <div className={s.channelHeader}>
          <span>Conversas</span>
          <button className={s.panelAdd} onClick={() => setAddChatOpen(true)} title="Novo canal">+</button>
        </div>

        {chats.length === 0 && (
          <div className={s.channelEmpty}>
            <div>Nenhum canal ainda</div>
            <button className={s.channelEmptyBtn} onClick={() => setAddChatOpen(true)}>+ Criar canal</button>
          </div>
        )}

        {chats.map(ch => (
          <div
            key={ch.id}
            className={`${s.channelItem} ${selChat === ch.id ? s.channelActive : ''}`}
            onClick={() => setSelChat(ch.id)}
            onContextMenu={e => { e.preventDefault(); setCtxMenu({ x: e.clientX, y: e.clientY, label: ch.name, onDelete: () => removeChat(ch.id) }) }}
          >
            <span className={s.channelHash}>{ch.emoji}</span>
            <span className={s.channelName}>{ch.name}</span>
          </div>
        ))}

        <AnimatePresence>
          {addChatOpen && (
            <motion.div
              className={s.addChatPanel}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <div className={s.chatEmojiRow}>
                {CHAT_EMOJIS.map(e => (
                  <button
                    key={e}
                    className={`${s.chatEmojiBtn} ${newChatEmoji === e ? s.chatEmojiActive : ''}`}
                    onClick={() => setNewChatEmoji(e)}
                  >{e}</button>
                ))}
              </div>
              <input
                className={s.input}
                placeholder="Nome do canal..."
                value={newChatName}
                onChange={e => setNewChatName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && createChat()}
                autoFocus
              />
              <div className={s.addChatBtns}>
                <button className={s.cancelBtn} onClick={() => setAddChatOpen(false)}>Cancelar</button>
                <button className={s.saveBtn} disabled={!newChatName.trim()} onClick={createChat}>Criar</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {ctxMenu && <ContextMenu state={ctxMenu} onClose={closeCtx} />}

      {/* Right: message feed */}
      <div className={s.chatMain}>
        {!selChat ? (
          <div className={s.chatEmpty}>
            <div className={s.chatEmptyIcon}>💬</div>
            <div>Selecione um canal para começar</div>
          </div>
        ) : (
          <>
            <div className={s.chatTopBar}>
              <span className={s.chatTopEmoji}>{currentChat?.emoji}</span>
              <span className={s.chatTopName}>{currentChat?.name}</span>
              <span className={s.chatTopCount}>{messages.length} msgs</span>
            </div>

            <div className={s.msgFeed} ref={feedRef}>
              {messages.length === 0 && (
                <div className={s.feedEmpty}>Nenhuma mensagem ainda. Comece a conversa!</div>
              )}
              <AnimatePresence initial={false}>
                {messages.map(msg => {
                  const sub = msg.subjectId ? hubSubjects.find(x => x.id === msg.subjectId) : null
                  return (
                    <motion.div
                      key={msg.id}
                      className={s.msgRow}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <div className={s.msgMeta}>
                        <span className={s.msgTime}>{formatDate(msg.createdAt)} · {formatTime(msg.createdAt)}</span>
                        {sub && (
                          <span className={s.msgTag} style={{ borderColor: sub.color, color: sub.color }}>
                            {sub.emoji} {sub.name}
                          </span>
                        )}
                      </div>
                      <div className={s.msgText}>{msg.text}</div>
                      {msg.url && (
                        <a href={msg.url} target="_blank" rel="noopener noreferrer" className={s.msgLink}>
                          🔗 {msg.url}
                        </a>
                      )}
                      <DeleteBtn onConfirm={() => removeChatMessage(msg.id)} />
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>

            <div className={s.msgInputArea}>
              {hubSubjects.length > 0 && (
                <select
                  className={s.msgSelect}
                  value={msgSubjectId}
                  onChange={e => setMsgSubjectId(e.target.value)}
                >
                  <option value="">Sem categoria</option>
                  {hubSubjects.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.emoji} {sub.name}</option>
                  ))}
                </select>
              )}
              <input
                className={s.msgUrlInput}
                placeholder="URL (opcional)"
                value={msgUrl}
                onChange={e => setMsgUrl(e.target.value)}
              />
              <div className={s.msgTextRow}>
                <textarea
                  className={s.msgTextarea}
                  placeholder={`Mensagem em ${currentChat?.name}...`}
                  value={msgText}
                  onChange={e => setMsgText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      sendMessage()
                    }
                  }}
                  rows={2}
                />
                <button
                  className={s.msgSendBtn}
                  disabled={!msgText.trim()}
                  onClick={sendMessage}
                >↑</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/* ─── Main HubView ─── */
export default function HubView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { hubs, removeHub } = useHubsStore()
  const hub = hubs.find(h => h.id === id)
  const [activeTab, setActiveTab] = useState<'content' | 'chats'>('content')

  if (!hub) {
    return (
      <div className={s.notFound}>
        <div>Hub não encontrado</div>
        <Link to="/hubs" className={s.backLink}>← Voltar para Hubs</Link>
      </div>
    )
  }

  return (
    <div className={s.hubPage}>
      <div className={s.hubHeader}>
        <div className={s.hubHeaderLeft}>
          <Link to="/hubs" className={s.breadcrumb}>Hubs</Link>
          <span className={s.breadcrumbSep}>›</span>
          <span className={s.hubEmoji}>{hub.emoji}</span>
          <h1 className={s.hubTitle}>{hub.name}</h1>
          <div className={s.hubBar} style={{ background: hub.color }} />
        </div>
        <div className={s.hubHeaderRight}>
          <div className={s.hubTabs}>
            <button
              className={`${s.hubTab} ${activeTab === 'content' ? s.hubTabActive : ''}`}
              onClick={() => setActiveTab('content')}
            >📁 Conteúdo</button>
            <button
              className={`${s.hubTab} ${activeTab === 'chats' ? s.hubTabActive : ''}`}
              onClick={() => setActiveTab('chats')}
            >💬 Conversas</button>
          </div>
          <button
            className={s.deleteHubBtn}
            onClick={() => {
              if (confirm(`Apagar o hub "${hub.name}"?`)) {
                removeHub(hub.id)
                navigate('/hubs')
              }
            }}
          >🗑</button>
        </div>
      </div>

      {activeTab === 'chats' ? (
        <ChatsView hubId={hub.id} />
      ) : hub.type === 'faculdade' ? (
        <FaculdadeView hubId={hub.id} />
      ) : (
        <GenericHubView hubId={hub.id} />
      )}
    </div>
  )
}
