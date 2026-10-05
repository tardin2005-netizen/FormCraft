import { useEffect, useMemo, useRef, useState } from 'react'
import { Pin, PinOff, Palette, Image as ImageIcon, ListChecks, Type, Trash2, Tag, X, Search } from 'lucide-react'
import type { ModuleProps } from './moduleProps'
import type { ContentItem } from '../store/contentItemsStore'
import { useThemeStore } from '../store/themeStore'
import { imageToDataUrl } from '../utils/imageData'
import { normalize } from '../utils/globalSearch'
import s from './KeepNotes.module.css'

/* Stored color = Keep's light value (compatible with notes created before); dark theme shows Keep's dark variant. */
const COLORS: { value: string; label: string; dark: string }[] = [
  { value: '',        label: 'Padrão',     dark: '' },
  { value: '#f28b82', label: 'Vermelho',   dark: '#5c2b29' },
  { value: '#fbbc04', label: 'Laranja',    dark: '#614a19' },
  { value: '#fff9c4', label: 'Amarelo',    dark: '#635d19' },
  { value: '#ccff90', label: 'Verde',      dark: '#345920' },
  { value: '#a7ffeb', label: 'Verde-água', dark: '#16504b' },
  { value: '#cbf0f8', label: 'Azul claro', dark: '#2d555e' },
  { value: '#aecbfa', label: 'Azul',       dark: '#1e3a5f' },
  { value: '#d7aefb', label: 'Lavanda',    dark: '#42275e' },
  { value: '#fdcfe8', label: 'Rosa',       dark: '#5b2245' },
  { value: '#e6c9a8', label: 'Bege',       dark: '#442f19' },
  { value: '#e8eaed', label: 'Cinza',      dark: '#3c3f43' },
]

interface CheckItem { id: string; text: string; done: boolean }
interface Note {
  title: string
  content: string
  color: string
  image?: string
  checklist?: CheckItem[]
  labels: string[]
  pinned: boolean
}

const newId = () => crypto.randomUUID()

function readNote(item: ContentItem): Note {
  const d = (item.data ?? {}) as Record<string, unknown>
  const tagStr = typeof d.tags === 'string' ? d.tags.split(',').map(t => t.trim()).filter(Boolean) : []
  return {
    title: typeof d.title === 'string' ? d.title : '',
    content: typeof d.content === 'string' ? d.content : '',
    color: typeof d.color === 'string' ? d.color : '',
    image: typeof d.image === 'string' ? d.image : undefined,
    checklist: Array.isArray(d.checklist) ? (d.checklist as CheckItem[]) : undefined,
    labels: item.tags?.length ? item.tags : tagStr,
    pinned: !!item.starred,
  }
}

function toPatch(n: Note): Partial<ContentItem> {
  return {
    data: {
      title: n.title, content: n.content, color: n.color, tags: n.labels.join(', '),
      ...(n.image ? { image: n.image } : {}),
      ...(n.checklist ? { checklist: n.checklist } : {}),
    },
    tags: n.labels,
    starred: n.pinned,
  }
}

const isEmpty = (n: Note) => !n.title.trim() && !n.content.trim() && !n.image && !(n.checklist ?? []).some(i => i.text.trim())

function useNoteColor(value: string) {
  const theme = useThemeStore(st => st.theme)
  const c = COLORS.find(x => x.value === value)
  if (!value) return undefined
  if (!c) return value
  return theme === 'dark' ? c.dark : c.value
}

/* ── Color picker ── */
function ColorPicker({ value, onPick }: { value: string; onPick: (v: string) => void }) {
  const theme = useThemeStore(st => st.theme)
  return (
    <div className={s.palette} role="radiogroup" aria-label="Cor da nota" onClick={e => e.stopPropagation()}>
      {COLORS.map(c => (
        <button
          key={c.label}
          type="button"
          role="radio"
          aria-checked={value === c.value}
          title={c.label}
          aria-label={c.label}
          className={`${s.swatch} ${value === c.value ? s.swatchOn : ''} ${!c.value ? s.swatchNone : ''}`}
          style={c.value ? { background: theme === 'dark' ? c.dark : c.value } : undefined}
          onClick={() => onPick(c.value)}
        />
      ))}
    </div>
  )
}

/* ── Editor (used by the composer and the open-note modal) ── */
function NoteEditor({ note, onChange, autoFocus, onDelete, footerRight }: {
  note: Note
  onChange: (n: Note) => void
  autoFocus?: 'title' | 'body'
  onDelete?: () => void
  footerRight: React.ReactNode
}) {
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [labelInput, setLabelInput] = useState('')
  const [showLabel, setShowLabel] = useState(note.labels.length > 0)
  const [imgError, setImgError] = useState('')
  const imgRef = useRef<HTMLInputElement>(null)
  const bodyRef = useRef<HTMLTextAreaElement>(null)
  const set = (patch: Partial<Note>) => onChange({ ...note, ...patch })

  useEffect(() => {
    const el = bodyRef.current
    if (el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px' }
  }, [note.content])

  function toggleChecklist() {
    if (note.checklist) {
      set({ content: note.checklist.map(i => i.text).filter(Boolean).join('\n'), checklist: undefined })
    } else {
      const lines = note.content.split('\n').map(l => l.replace(/^\s*[-*•]\s*/, '')).filter(l => l.trim())
      set({ checklist: (lines.length ? lines : ['']).map(text => ({ id: newId(), text, done: false })), content: '' })
    }
  }

  function updateItem(id: string, patch: Partial<CheckItem>) {
    set({ checklist: (note.checklist ?? []).map(i => i.id === id ? { ...i, ...patch } : i) })
  }
  function addItemAfter(id: string | null) {
    const list = note.checklist ?? []
    const item = { id: newId(), text: '', done: false }
    const idx = id ? list.findIndex(i => i.id === id) : list.length - 1
    const next = [...list.slice(0, idx + 1), item, ...list.slice(idx + 1)]
    set({ checklist: next })
    setTimeout(() => (document.querySelector(`[data-check="${item.id}"]`) as HTMLInputElement | null)?.focus(), 0)
  }
  function removeItem(id: string) {
    set({ checklist: (note.checklist ?? []).filter(i => i.id !== id) })
  }
  function addLabel(raw: string) {
    const t = raw.replace(/^#+/, '').trim()
    if (t && !note.labels.includes(t)) set({ labels: [...note.labels, t] })
    setLabelInput('')
  }
  async function onImage(file: File | undefined) {
    if (!file) return
    setImgError('')
    try { set({ image: await imageToDataUrl(file) }) } catch (err) { setImgError((err as Error).message) }
  }

  const open = (note.checklist ?? []).filter(i => !i.done)
  const done = (note.checklist ?? []).filter(i => i.done)

  return (
    <div className={s.editor}>
      {note.image && (
        <div className={s.editorImg}>
          <img src={note.image} alt="" />
          <button type="button" className={s.imgRemove} onClick={() => set({ image: undefined })} aria-label="Remover imagem"><X size={14} /></button>
        </div>
      )}
      <div className={s.editorHead}>
        <input
          className={s.titleInput}
          placeholder="Título"
          value={note.title}
          autoFocus={autoFocus === 'title'}
          onChange={e => set({ title: e.target.value })}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); note.checklist ? addItemAfter(null) : bodyRef.current?.focus() } }}
        />
        <button type="button" className={s.iconBtn} onClick={() => set({ pinned: !note.pinned })} title={note.pinned ? 'Desafixar' : 'Fixar no topo'} aria-label={note.pinned ? 'Desafixar' : 'Fixar no topo'} aria-pressed={note.pinned}>
          {note.pinned ? <PinOff size={17} /> : <Pin size={17} />}
        </button>
      </div>

      {note.checklist ? (
        <div className={s.checklist}>
          {open.map(i => (
            <div key={i.id} className={s.checkRow}>
              <input type="checkbox" checked={false} onChange={() => updateItem(i.id, { done: true })} aria-label="Concluir item" />
              <input
                data-check={i.id}
                className={s.checkText}
                value={i.text}
                placeholder="Item da lista"
                onChange={e => updateItem(i.id, { text: e.target.value })}
                onKeyDown={e => {
                  if (e.key === 'Enter') { e.preventDefault(); addItemAfter(i.id) }
                  if (e.key === 'Backspace' && !i.text) { e.preventDefault(); removeItem(i.id) }
                }}
              />
              <button type="button" className={s.checkDel} onClick={() => removeItem(i.id)} aria-label="Remover item"><X size={13} /></button>
            </div>
          ))}
          <button type="button" className={s.addCheck} onClick={() => addItemAfter(null)}>+ Item da lista</button>
          {done.length > 0 && (
            <details className={s.doneBox} open>
              <summary>{done.length} {done.length === 1 ? 'item concluído' : 'itens concluídos'}</summary>
              {done.map(i => (
                <div key={i.id} className={`${s.checkRow} ${s.checkDone}`}>
                  <input type="checkbox" checked onChange={() => updateItem(i.id, { done: false })} aria-label="Desmarcar item" />
                  <input className={s.checkText} value={i.text} onChange={e => updateItem(i.id, { text: e.target.value })} />
                  <button type="button" className={s.checkDel} onClick={() => removeItem(i.id)} aria-label="Remover item"><X size={13} /></button>
                </div>
              ))}
            </details>
          )}
        </div>
      ) : (
        <textarea
          ref={bodyRef}
          className={s.bodyInput}
          placeholder="Criar uma nota…"
          value={note.content}
          autoFocus={autoFocus === 'body'}
          rows={2}
          onChange={e => set({ content: e.target.value })}
        />
      )}

      {(showLabel || note.labels.length > 0) && (
        <div className={s.labelRow}>
          {note.labels.map(l => (
            <span key={l} className={s.label}>{l}<button type="button" onClick={() => set({ labels: note.labels.filter(x => x !== l) })} aria-label={`Remover marcador ${l}`}><X size={11} /></button></span>
          ))}
          <input
            className={s.labelInput}
            placeholder="Adicionar marcador…"
            value={labelInput}
            onChange={e => setLabelInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addLabel(labelInput) } }}
            onBlur={() => labelInput.trim() && addLabel(labelInput)}
          />
        </div>
      )}
      {imgError && <p className={s.imgError}>{imgError}</p>}

      <div className={s.toolbar}>
        <div className={s.tools}>
          <div className={s.paletteWrap}>
            <button type="button" className={s.iconBtn} onClick={() => setPaletteOpen(v => !v)} title="Cor" aria-label="Cor" aria-expanded={paletteOpen}><Palette size={16} /></button>
            {paletteOpen && <ColorPicker value={note.color} onPick={v => { set({ color: v }); setPaletteOpen(false) }} />}
          </div>
          <button type="button" className={s.iconBtn} onClick={() => imgRef.current?.click()} title="Adicionar imagem" aria-label="Adicionar imagem"><ImageIcon size={16} /></button>
          <input ref={imgRef} type="file" accept="image/*" hidden onChange={e => { onImage(e.target.files?.[0]); e.target.value = '' }} />
          <button type="button" className={s.iconBtn} onClick={toggleChecklist} title={note.checklist ? 'Voltar para texto' : 'Transformar em lista'} aria-label={note.checklist ? 'Voltar para texto' : 'Transformar em lista'}>
            {note.checklist ? <Type size={16} /> : <ListChecks size={16} />}
          </button>
          <button type="button" className={s.iconBtn} onClick={() => setShowLabel(true)} title="Marcadores" aria-label="Marcadores"><Tag size={16} /></button>
          {onDelete && <button type="button" className={s.iconBtn} onClick={onDelete} title="Apagar nota" aria-label="Apagar nota"><Trash2 size={16} /></button>}
        </div>
        {footerRight}
      </div>
    </div>
  )
}

/* ── Card in the grid ── */
function NoteCard({ item, onOpen, onPatch, onDelete }: {
  item: ContentItem
  onOpen: () => void
  onPatch: (n: Note) => void
  onDelete: () => void
}) {
  const note = readNote(item)
  const bg = useNoteColor(note.color)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const open = (note.checklist ?? []).filter(i => !i.done)
  const doneCount = (note.checklist ?? []).length - open.length

  return (
    <article
      className={`${s.card} ${bg ? s.colored : ''}`}
      style={bg ? { background: bg, borderColor: bg } : undefined}
      onClick={onOpen}
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter') onOpen() }}
      aria-label={note.title || 'Nota'}
    >
      <button
        className={`${s.pin} ${note.pinned ? s.pinOn : ''}`}
        onClick={e => { e.stopPropagation(); onPatch({ ...note, pinned: !note.pinned }) }}
        title={note.pinned ? 'Desafixar' : 'Fixar no topo'}
        aria-label={note.pinned ? 'Desafixar' : 'Fixar no topo'}
      >{note.pinned ? <PinOff size={15} /> : <Pin size={15} />}</button>

      {note.image && <img className={s.cardImg} src={note.image} alt="" />}
      {note.title && <h3 className={s.cardTitle}>{note.title}</h3>}
      {note.checklist ? (
        <ul className={s.cardList}>
          {open.slice(0, 8).map(i => (
            <li key={i.id}>
              <input type="checkbox" checked={false} onClick={e => e.stopPropagation()}
                onChange={() => onPatch({ ...note, checklist: note.checklist!.map(x => x.id === i.id ? { ...x, done: true } : x) })}
                aria-label={`Concluir ${i.text}`} />
              <span>{i.text}</span>
            </li>
          ))}
          {open.length > 8 && <li className={s.more}>+ {open.length - 8} itens</li>}
          {doneCount > 0 && <li className={s.more}>+ {doneCount} {doneCount === 1 ? 'concluído' : 'concluídos'}</li>}
        </ul>
      ) : note.content && <p className={s.cardBody}>{note.content}</p>}
      {!note.title && !note.content && !note.checklist && !note.image && <p className={s.cardEmpty}>Nota vazia</p>}

      {note.labels.length > 0 && (
        <div className={s.cardLabels}>{note.labels.map(l => <span key={l} className={s.label}>{l}</span>)}</div>
      )}

      <div className={s.cardTools} onClick={e => e.stopPropagation()}>
        <div className={s.paletteWrap}>
          <button className={s.iconBtn} onClick={() => setPaletteOpen(v => !v)} title="Cor" aria-label="Cor"><Palette size={15} /></button>
          {paletteOpen && <ColorPicker value={note.color} onPick={v => { onPatch({ ...note, color: v }); setPaletteOpen(false) }} />}
        </div>
        <button className={s.iconBtn} onClick={onDelete} title="Apagar nota" aria-label="Apagar nota"><Trash2 size={15} /></button>
      </div>
    </article>
  )
}

/* ── Module ── */
export default function KeepNotes({ module, workspaceId, items, addItem, updateItem, removeItem }: ModuleProps) {
  const EMPTY: Note = { title: '', content: '', color: '', labels: [], pinned: false }
  const [composing, setComposing] = useState(false)
  const [draft, setDraft] = useState<Note>(EMPTY)
  const [openId, setOpenId] = useState<string | null>(null)
  const [openDraft, setOpenDraft] = useState<Note | null>(null)
  const [query, setQuery] = useState('')
  const [label, setLabel] = useState<string | null>(null)
  const [undo, setUndo] = useState<ContentItem | null>(null)
  const composerRef = useRef<HTMLDivElement>(null)
  const saveTimer = useRef<number | null>(null)

  const labels = useMemo(() => [...new Set(items.flatMap(i => readNote(i).labels))].sort((a, b) => a.localeCompare(b)), [items])

  const visible = useMemo(() => {
    const tokens = normalize(query).split(/\s+/).filter(Boolean)
    return items
      .filter(i => {
        const n = readNote(i)
        if (label && !n.labels.includes(label)) return false
        if (!tokens.length) return true
        const hay = normalize([n.title, n.content, ...(n.checklist ?? []).map(c => c.text), ...n.labels].join(' '))
        return tokens.every(t => hay.includes(t))
      })
      .sort((a, b) => (b.updatedAt || b.createdAt).localeCompare(a.updatedAt || a.createdAt))
  }, [items, query, label])
  const pinned = visible.filter(i => i.starred)
  const others = visible.filter(i => !i.starred)

  function saveComposer() {
    if (!isEmpty(draft)) {
      const p = toPatch({ ...draft, checklist: draft.checklist?.filter(i => i.text.trim()) })
      addItem({ workspaceId, moduleId: module.id, contentType: 'notes', data: p.data!, tags: p.tags!, starred: !!p.starred })
    }
    setDraft(EMPTY)
    setComposing(false)
  }

  // Keep saves when you click outside the composer.
  useEffect(() => {
    if (!composing) return
    const onDown = (e: MouseEvent) => { if (!composerRef.current?.contains(e.target as Node)) saveComposer() }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  })

  function patchItem(id: string, n: Note) { updateItem(id, toPatch(n)) }

  function openNote(item: ContentItem) { setOpenId(item.id); setOpenDraft(readNote(item)) }
  function changeOpen(n: Note) {
    setOpenDraft(n)
    if (saveTimer.current) window.clearTimeout(saveTimer.current)
    const id = openId
    saveTimer.current = window.setTimeout(() => { if (id) patchItem(id, n) }, 350)
  }
  function closeOpen() {
    if (saveTimer.current) window.clearTimeout(saveTimer.current)
    if (openId && openDraft) {
      if (isEmpty(openDraft)) removeItem(openId)
      else patchItem(openId, { ...openDraft, checklist: openDraft.checklist?.filter(i => i.text.trim()) })
    }
    setOpenId(null); setOpenDraft(null)
  }

  function deleteNote(item: ContentItem) {
    if (openId === item.id) { if (saveTimer.current) window.clearTimeout(saveTimer.current); setOpenId(null); setOpenDraft(null) }
    removeItem(item.id)
    setUndo(item)
  }
  useEffect(() => {
    if (!undo) return
    const t = window.setTimeout(() => setUndo(null), 6000)
    return () => window.clearTimeout(t)
  }, [undo])
  function restore() {
    if (!undo) return
    addItem({ workspaceId: undo.workspaceId, moduleId: undo.moduleId, contentType: undo.contentType, data: undo.data, tags: undo.tags, starred: undo.starred })
    setUndo(null)
  }

  const openItem = openId ? items.find(i => i.id === openId) : null
  const openBg = useNoteColor(openDraft?.color ?? '')
  const draftBg = useNoteColor(draft.color)

  const grid = (list: ContentItem[]) => (
    <div className={s.masonry}>
      {list.map(i => (
        <NoteCard key={i.id} item={i} onOpen={() => openNote(i)} onPatch={n => patchItem(i.id, n)} onDelete={() => deleteNote(i)} />
      ))}
    </div>
  )

  return (
    <div className={s.page}>
      <div
        ref={composerRef}
        className={`${s.composer} ${composing ? s.composerOpen : ''}`}
        style={composing && draftBg ? { background: draftBg, borderColor: draftBg } : undefined}
      >
        {composing ? (
          <NoteEditor
            note={draft}
            onChange={setDraft}
            autoFocus={draft.checklist ? undefined : 'body'}
            footerRight={<button type="button" className={s.closeBtn} onClick={saveComposer}>Fechar</button>}
          />
        ) : (
          <div className={s.composerIdle}>
            <button className={s.composerHint} onClick={() => setComposing(true)}>Criar uma nota…</button>
            <button className={s.iconBtn} onClick={() => { setDraft({ ...EMPTY, checklist: [{ id: newId(), text: '', done: false }] }); setComposing(true) }} title="Nova lista" aria-label="Nova lista"><ListChecks size={18} /></button>
          </div>
        )}
      </div>

      {(items.length > 0) && (
        <div className={s.filters}>
          <label className={s.search}>
            <Search size={14} aria-hidden="true" />
            <input id="keep-search" placeholder="Buscar nas notas" value={query} onChange={e => setQuery(e.target.value)} />
          </label>
          {labels.length > 0 && (
            <div className={s.labelFilter}>
              <button className={`${s.chip} ${!label ? s.chipOn : ''}`} onClick={() => setLabel(null)}>Todas</button>
              {labels.map(l => <button key={l} className={`${s.chip} ${label === l ? s.chipOn : ''}`} onClick={() => setLabel(label === l ? null : l)}>{l}</button>)}
            </div>
          )}
        </div>
      )}

      {items.length === 0 ? (
        <div className={s.empty}>
          <p className={s.emptyTitle}>Suas notas aparecem aqui</p>
          <p>Clique em "Criar uma nota…" para escrever, ou no ícone de lista para uma lista de tarefas.</p>
        </div>
      ) : visible.length === 0 ? (
        <p className={s.noMatch}>Nenhuma nota com esse filtro.</p>
      ) : (
        <>
          {pinned.length > 0 && <><h2 className={s.section}>Fixadas</h2>{grid(pinned)}</>}
          {others.length > 0 && <>{pinned.length > 0 && <h2 className={s.section}>Outras</h2>}{grid(others)}</>}
        </>
      )}

      {openItem && openDraft && (
        <div className={s.backdrop} onClick={closeOpen}>
          <div
            className={s.modal}
            style={openBg ? { background: openBg, borderColor: openBg } : undefined}
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-label={openDraft.title || 'Nota'}
          >
            <NoteEditor
              note={openDraft}
              onChange={changeOpen}
              onDelete={() => deleteNote(openItem)}
              footerRight={<button type="button" className={s.closeBtn} onClick={closeOpen}>Fechar</button>}
            />
          </div>
        </div>
      )}

      {undo && (
        <div className={s.toast} role="status">
          Nota apagada
          <button onClick={restore}>Desfazer</button>
        </div>
      )}
    </div>
  )
}
