import { useState, useRef, useCallback, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useHubsStore, type Semester, type Subject, type ClassItem, type HubContent } from '../store/hubsStore'
import DeleteBtn from '../modules/DeleteBtn'
import PdfProcessorModal from '../components/PdfProcessorModal'
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

  return (
    <div className={s.contentCard}>
      <div className={s.contentCardHead}>
        <span className={s.cardTypeIcon}>{CONTENT_ICON[c.type]}</span>
        <span className={s.cardTitle}>
          {c.url
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

      {c.url && !c.content && (
        <div className={s.cardLinkBar}>
          <span className={s.cardLinkDomain}>{getDomain(c.url)}</span>
        </div>
      )}
    </div>
  )
}

/* ─── Faculdade template ─── */
function FaculdadeView({ hubId }: { hubId: string }) {
  const {
    semesters, subjects, classes, contents,
    addSemester, removeSemester,
    addSubject, removeSubject,
    addClassItem, removeClassItem,
    addContent, removeContent,
  } = useHubsStore()

  const hubSemesters = semesters.filter(s => s.hubId === hubId)
    .sort((a, b) => a.year !== b.year ? a.year - b.year : Number(a.period) - Number(b.period))

  const [selSem, setSelSem]     = useState<string | null>(hubSemesters[0]?.id ?? null)
  const [selSubj, setSelSubj]   = useState<string | null>(null)
  const [selClass, setSelClass] = useState<string | null>(null)

  // Modals
  const [semModal,     setSemModal]     = useState(false)
  const [subjModal,    setSubjModal]    = useState(false)
  const [classModal,   setClassModal]   = useState(false)
  const [contentModal, setContentModal] = useState(false)
  const [pdfModal,     setPdfModal]     = useState(false)

  // Forms
  const [semForm,  setSemForm]  = useState({ year: CURRENT_YEAR, period: '1' as '1'|'2', name: '' })
  const [subjForm, setSubjForm] = useState({ name: '', emoji: '📚', color: '#7c6ef7', professor: '' })
  const [clsForm,  setClsForm]  = useState({ title: '', type: 'aula' as ClassItem['type'], date: '', notes: '' })
  const [ctxForm,  setCtxForm]  = useState({ type: 'link' as HubContent['type'], title: '', url: '', content: '' })

  const [ctxMenu, setCtxMenu] = useState<CtxMenuState | null>(null)
  const closeCtx = useCallback(() => setCtxMenu(null), [])

  const curSubjects = subjects.filter(x => x.semesterId === selSem)
  const curClasses  = classes.filter(x => x.subjectId === selSubj).sort((a, b) => a.date.localeCompare(b.date))
  const curContents = contents.filter(x =>
    selClass ? x.classId === selClass : (x.subjectId === selSubj && !x.classId)
  )

  function createSemester() {
    const name = semForm.name || `${semForm.period}° Sem ${semForm.year}`
    addSemester({ hubId, name, year: semForm.year, period: semForm.period })
    setSemModal(false)
    setSemForm({ year: CURRENT_YEAR, period: '1', name: '' })
  }
  function createSubject() {
    if (!selSem || !subjForm.name.trim()) return
    addSubject({ hubId, semesterId: selSem, name: subjForm.name.trim(), emoji: subjForm.emoji, color: subjForm.color, professor: subjForm.professor || undefined })
    setSubjModal(false)
    setSubjForm({ name: '', emoji: '📚', color: '#7c6ef7', professor: '' })
  }
  function createClass() {
    if (!selSubj || !clsForm.title.trim()) return
    const sem = selSem!
    addClassItem({ hubId, semesterId: sem, subjectId: selSubj, title: clsForm.title.trim(), type: clsForm.type, date: clsForm.date || new Date().toISOString().split('T')[0], notes: clsForm.notes || undefined })
    setClassModal(false)
    setClsForm({ title: '', type: 'aula', date: '', notes: '' })
  }
  function createContent() {
    if (!ctxForm.title.trim()) return
    addContent({
      hubId,
      semesterId: selSem ?? undefined,
      subjectId: selSubj ?? undefined,
      classId: selClass ?? undefined,
      type: ctxForm.type,
      title: ctxForm.title.trim(),
      url: ctxForm.url || undefined,
      content: ctxForm.content || undefined,
    })
    setContentModal(false)
    setCtxForm({ type: 'link', title: '', url: '', content: '' })
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
        <div className={s.emptyState}>
          <div>📅</div>
          <div>Crie seu primeiro semestre para começar</div>
        </div>
      ) : (
        <div className={s.facContent}>
          {/* Subjects sidebar */}
          <div className={s.subjPanel}>
            <div className={s.panelHeader}>
              <span>Matérias</span>
              <button className={s.panelAdd} onClick={() => setSubjModal(true)}>+</button>
            </div>
            {curSubjects.length === 0
              ? <div className={s.panelEmpty}>Nenhuma matéria</div>
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
            <div className={s.emptyState}>Selecione uma matéria</div>
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
                        <button className={s.actionBtnPdf} onClick={() => setPdfModal(true)}>📄 PDF</button>
                      </div>
                    </div>

                    {/* Class list */}
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
                        <div className={s.panelEmpty}>Nenhum material adicionado</div>
                      )}
                      {curContents.map(c => (
                        <ContentCard key={c.id} c={c} onDelete={() => removeContent(c.id)} />
                      ))}
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
          <Modal title="Adicionar Material" onClose={() => setContentModal(false)} onSave={createContent} saveLabel="Salvar" disabled={!ctxForm.title.trim()}>
            <div className={s.field}>
              <label className={s.label}>Tipo</label>
              <div className={s.typeRow}>
                {(['link','pdf','note','file'] as HubContent['type'][]).map(t => (
                  <button key={t}
                    className={`${s.typeBtn} ${ctxForm.type === t ? s.typeActive : ''}`}
                    onClick={() => setCtxForm(f => ({ ...f, type: t }))}
                  >{CONTENT_ICON[t]} {t}</button>
                ))}
              </div>
            </div>
            <div className={s.field}>
              <label className={s.label}>Título</label>
              <input className={s.input} placeholder="Nome do material" value={ctxForm.title} autoFocus
                onChange={e => setCtxForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            {(ctxForm.type === 'link' || ctxForm.type === 'pdf') && (
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
      </AnimatePresence>

      {ctxMenu && <ContextMenu state={ctxMenu} onClose={closeCtx} />}
    </div>
  )
}

/* ─── Generic Hub ─── */
function GenericHubView({ hubId }: { hubId: string }) {
  const { contents, addContent, removeContent } = useHubsStore()
  const [modal, setModal] = useState(false)
  const [form, setForm]   = useState({ type: 'link' as HubContent['type'], title: '', url: '', content: '' })

  const items = contents.filter(c => c.hubId === hubId && !c.semesterId)

  function save() {
    if (!form.title.trim()) return
    addContent({ hubId, type: form.type, title: form.title.trim(), url: form.url || undefined, content: form.content || undefined })
    setModal(false)
    setForm({ type: 'link', title: '', url: '', content: '' })
  }

  return (
    <div className={s.genericPage}>
      <div className={s.genericActions}>
        <button className={s.actionBtn} onClick={() => setModal(true)}>+ Adicionar conteúdo</button>
      </div>

      {items.length === 0 && (
        <div className={s.emptyState}>
          <div>📭</div>
          <div>Nenhum conteúdo ainda</div>
          <button className={s.actionBtn} onClick={() => setModal(true)}>+ Adicionar primeiro item</button>
        </div>
      )}

      <div className={s.contentList}>
        {items.map(c => (
          <ContentCard key={c.id} c={c} onDelete={() => removeContent(c.id)} />
        ))}
      </div>

      <AnimatePresence>
        {modal && (
          <Modal title="Adicionar Conteúdo" onClose={() => setModal(false)} onSave={save} saveLabel="Salvar" disabled={!form.title.trim()}>
            <div className={s.field}>
              <label className={s.label}>Tipo</label>
              <div className={s.typeRow}>
                {(['link','pdf','note','file'] as HubContent['type'][]).map(t => (
                  <button key={t}
                    className={`${s.typeBtn} ${form.type === t ? s.typeActive : ''}`}
                    onClick={() => setForm(f => ({ ...f, type: t }))}
                  >{CONTENT_ICON[t]} {t}</button>
                ))}
              </div>
            </div>
            <div className={s.field}>
              <label className={s.label}>Título</label>
              <input className={s.input} placeholder="Nome do item" value={form.title} autoFocus
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            {(form.type === 'link' || form.type === 'pdf') && (
              <div className={s.field}>
                <label className={s.label}>URL</label>
                <input className={s.input} placeholder="https://..." value={form.url}
                  onChange={e => setForm(f => ({ ...f, url: e.target.value }))} />
              </div>
            )}
            {form.type === 'note' && (
              <div className={s.field}>
                <label className={s.label}>Conteúdo</label>
                <textarea className={`${s.input} ${s.textarea}`} value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={4} />
              </div>
            )}
          </Modal>
        )}
      </AnimatePresence>
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
    addChat(chat)
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
