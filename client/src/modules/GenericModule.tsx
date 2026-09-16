import { useState } from 'react'
import type { ModuleProps } from './moduleProps'
import s from './GenericModule.module.css'
import DeleteBtn from './DeleteBtn'

interface NoteData {
  title: string
  content: string
  color: string
  tags: string
}

const KEEP_COLORS = [
  { label: 'Padrão',    value: '' },
  { label: 'Amarelo',   value: '#fff9c4' },
  { label: 'Verde',     value: '#ccff90' },
  { label: 'Verde água',value: '#a7ffeb' },
  { label: 'Azul claro',value: '#cbf0f8' },
  { label: 'Azul',      value: '#aecbfa' },
  { label: 'Lavanda',   value: '#d7aefb' },
  { label: 'Rosa',      value: '#fdcfe8' },
  { label: 'Laranja',   value: '#fbbc04' },
  { label: 'Vermelho',  value: '#f28b82' },
  { label: 'Bege',      value: '#e6c9a8' },
  { label: 'Cinza',     value: '#e8eaed' },
]

const EMPTY: NoteData = { title: '', content: '', color: '', tags: '' }

function isLight(hex: string) {
  if (!hex) return false
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16)
  return (r*299+g*587+b*114)/1000 > 160
}

function NoteModal({
  initial, title: modalTitle, onClose, onSave,
}: {
  initial: NoteData
  title: string
  onClose: () => void
  onSave: (data: NoteData) => void
}) {
  const [form, setForm] = useState<NoteData>({ ...initial })
  const light = isLight(form.color)
  const textCss = light ? { color: '#202124' } : {}

  function save() {
    if (!form.title.trim() && !form.content.trim()) return
    onSave(form)
    onClose()
  }

  return (
    <div className={s.backdrop} onClick={e => { if (e.target === e.currentTarget) { save(); } }}>
      <div
        className={s.modal}
        style={{ background: form.color || 'var(--surface)', ...(form.color ? { border: 'none' } : {}) }}
        onClick={e => e.stopPropagation()}
      >
        <input
          className={s.modalTitle}
          style={textCss}
          placeholder="Título"
          value={form.title}
          onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
          autoFocus
        />
        <textarea
          className={s.modalContent}
          style={textCss}
          placeholder="Fazer anotação..."
          value={form.content}
          onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
          rows={6}
        />
        <input
          className={s.modalTags}
          style={textCss}
          placeholder="Tags (separadas por vírgula)"
          value={form.tags}
          onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
        />

        <div className={s.modalFooter}>
          <div className={s.colorRow}>
            {KEEP_COLORS.map(c => (
              <button
                key={c.value}
                className={`${s.colorDot} ${form.color === c.value ? s.colorDotActive : ''}`}
                style={{ background: c.value || 'var(--surface2)', border: c.value ? 'none' : '1px solid var(--border)' }}
                title={c.label}
                onClick={() => setForm(p => ({ ...p, color: c.value }))}
              />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className={s.cancelBtn} onClick={() => { save(); }}>Fechar</button>
            <button className={s.saveBtn} onClick={save} disabled={!form.title.trim() && !form.content.trim()}>
              {modalTitle === 'Editar' ? 'Salvar' : 'Adicionar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function GenericModule({ module, workspaceId, items, addItem, updateItem, removeItem, toggleStar }: ModuleProps) {
  const [addOpen,  setAddOpen]  = useState(false)
  const [editItem, setEditItem] = useState<string | null>(null)
  const [quickTitle, setQuickTitle] = useState('')

  function handleAdd(data: NoteData) {
    addItem({
      workspaceId,
      moduleId: module.id,
      contentType: module.type as 'notes',
      data: data as unknown as Record<string, unknown>,
      tags: data.tags.split(',').map(t => t.trim()).filter(Boolean),
      starred: false,
    })
  }

  function handleEdit(id: string, data: NoteData) {
    updateItem(id, {
      data: data as unknown as Record<string, unknown>,
      tags: data.tags.split(',').map(t => t.trim()).filter(Boolean),
    })
  }

  function openEdit(id: string) { setEditItem(id) }

  const pinnedItems = items.filter(i => i.starred)
  const otherItems  = items.filter(i => !i.starred)

  return (
    <div className={s.page}>
      {/* Quick-add bar */}
      <div className={s.quickBar} onClick={() => { if (!addOpen) setAddOpen(true) }}>
        <input
          className={s.quickInput}
          placeholder="Fazer anotação..."
          value={quickTitle}
          onChange={e => setQuickTitle(e.target.value)}
          onFocus={() => setAddOpen(true)}
          readOnly
        />
        <button className={s.addBtn} onClick={e => { e.stopPropagation(); setAddOpen(true) }}>+ Adicionar</button>
      </div>

      {items.length === 0 && (
        <div className={s.empty}>
          <div className={s.emptyIcon}>{module.icon}</div>
          <div className={s.emptyTitle}>Nenhuma nota ainda</div>
          <div className={s.emptyDesc}>Clique em "+ Adicionar" para criar a primeira nota.</div>
        </div>
      )}

      {pinnedItems.length > 0 && (
        <>
          <div className={s.sectionLabel}>📌 Fixadas</div>
          <div className={s.grid}>
            {pinnedItems.map(item => {
              const d = item.data as unknown as NoteData
              const light = isLight(d.color)
              const tc = light ? { color: '#202124' } : {}
              return (
                <div
                  key={item.id}
                  className={s.card}
                  style={{ background: d.color || 'var(--surface)', ...(d.color ? { border: 'none' } : {}) }}
                  onClick={() => openEdit(item.id)}
                  title={`${d.title}${d.content ? ' — ' + d.content.slice(0, 80) : ''}`}
                >
                  {d.title && <div className={s.cardTitle} style={tc}>{d.title}</div>}
                  {d.content && <div className={s.cardContent} style={tc}>{d.content}</div>}
                  {item.tags.length > 0 && (
                    <div className={s.cardTags}>
                      {item.tags.map(t => <span key={t} className={s.tag} style={light ? { background: 'rgba(0,0,0,.08)', color: '#202124' } : {}}>#{t}</span>)}
                    </div>
                  )}
                  <div className={s.cardActions} onClick={e => e.stopPropagation()}>
                    <button className={s.pinBtn} onClick={() => toggleStar(item.id)} title="Desafixar">📌</button>
                    <DeleteBtn onConfirm={() => removeItem(item.id)} />
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {otherItems.length > 0 && (
        <>
          {pinnedItems.length > 0 && <div className={s.sectionLabel}>Outras</div>}
          <div className={s.grid}>
            {otherItems.map(item => {
              const d = item.data as unknown as NoteData
              const light = isLight(d.color)
              const tc = light ? { color: '#202124' } : {}
              return (
                <div
                  key={item.id}
                  className={s.card}
                  style={{ background: d.color || 'var(--surface)', ...(d.color ? { border: 'none' } : {}) }}
                  onClick={() => openEdit(item.id)}
                  title={`${d.title}${d.content ? ' — ' + d.content.slice(0, 80) : ''}`}
                >
                  {d.title && <div className={s.cardTitle} style={tc}>{d.title}</div>}
                  {d.content && <div className={s.cardContent} style={tc}>{d.content}</div>}
                  {item.tags.length > 0 && (
                    <div className={s.cardTags}>
                      {item.tags.map(t => <span key={t} className={s.tag} style={light ? { background: 'rgba(0,0,0,.08)', color: '#202124' } : {}}>#{t}</span>)}
                    </div>
                  )}
                  <div className={s.cardActions} onClick={e => e.stopPropagation()}>
                    <button className={s.pinBtn} onClick={() => toggleStar(item.id)} title="Fixar">☆</button>
                    <DeleteBtn onConfirm={() => removeItem(item.id)} />
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {addOpen && (
        <NoteModal
          initial={{ ...EMPTY, title: quickTitle }}
          title="Nova nota"
          onClose={() => { setAddOpen(false); setQuickTitle('') }}
          onSave={handleAdd}
        />
      )}

      {editItem && (() => {
        const item = items.find(i => i.id === editItem)
        if (!item) return null
        const d = item.data as unknown as NoteData
        return (
          <NoteModal
            initial={{ title: d.title || '', content: d.content || '', color: d.color || '', tags: item.tags.join(', ') }}
            title="Editar"
            onClose={() => setEditItem(null)}
            onSave={data => handleEdit(editItem, data)}
          />
        )
      })()}
    </div>
  )
}
