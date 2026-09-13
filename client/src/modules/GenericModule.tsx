import { useState, useEffect, useRef } from 'react'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { storage, auth } from '../firebase'
import type { ModuleProps } from './moduleProps'
import s from './modules.module.css'
import DeleteBtn from './DeleteBtn'

interface GenericData {
  title: string
  content: string
  url: string
  notes: string
  tags: string
  imageData?: string
  pdfUrl?: string
  pdfName?: string
}

function PdfViewer({ url, name }: { url: string; name?: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={s.pdfBlock}>
      <div className={s.pdfBar}>
        <span className={s.pdfIcon}>📄</span>
        <span className={s.pdfName}>{name ?? 'Arquivo PDF'}</span>
        <div className={s.pdfActions}>
          <button className={s.pdfToggle} onClick={() => setOpen(v => !v)}>
            {open ? '▲ Minimizar' : '▼ Ver PDF'}
          </button>
          <a href={url} target="_blank" rel="noreferrer" className={s.pdfOpenBtn}>↗ Abrir</a>
        </div>
      </div>
      {open && (
        <iframe
          src={url}
          className={s.pdfFrame}
          title={name ?? 'PDF'}
          allow="fullscreen"
        />
      )}
    </div>
  )
}

export default function GenericModule({ module, workspaceId, items, addItem, removeItem, toggleStar }: ModuleProps) {
  const [showForm, setShowForm]   = useState(false)
  const [form, setForm]           = useState<GenericData>({ title: '', content: '', url: '', notes: '', tags: '', imageData: '', pdfUrl: '', pdfName: '' })
  const [tab, setTab]             = useState<'text' | 'image' | 'pdf'>('text')
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress]   = useState(0)
  const [uploadErr, setUploadErr] = useState('')
  const imgInputRef = useRef<HTMLInputElement>(null)
  const pdfInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!showForm) return
    function onPaste(e: ClipboardEvent) {
      const clipItems = e.clipboardData?.items
      if (!clipItems) return
      for (let i = 0; i < clipItems.length; i++) {
        if (clipItems[i].type.startsWith('image/')) {
          const file = clipItems[i].getAsFile()
          if (!file) continue
          const reader = new FileReader()
          reader.onload = ev => { setForm(p => ({ ...p, imageData: ev.target?.result as string })); setTab('image') }
          reader.readAsDataURL(file)
          e.preventDefault()
          return
        }
      }
    }
    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
  }, [showForm])

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setForm(p => ({ ...p, imageData: ev.target?.result as string }))
    reader.readAsDataURL(file)
  }

  async function handlePdfChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== 'application/pdf') { setUploadErr('Selecione um arquivo PDF.'); return }
    setUploadErr('')
    setUploading(true)
    setProgress(0)
    const uid = auth.currentUser?.uid ?? 'anon'
    const path = `users/${uid}/workspaces/${workspaceId}/${module.id}/${Date.now()}_${file.name}`
    const storageRef = ref(storage, path)
    const task = uploadBytesResumable(storageRef, file)
    task.on(
      'state_changed',
      snap => setProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      () => { setUploadErr('Erro ao subir o PDF. Tente novamente.'); setUploading(false) },
      async () => {
        const url = await getDownloadURL(task.snapshot.ref)
        setForm(p => ({ ...p, pdfUrl: url, pdfName: file.name }))
        setUploading(false)
        setProgress(100)
      }
    )
  }

  function handleAdd() {
    if (!form.title.trim()) return
    addItem({
      workspaceId,
      moduleId: module.id,
      contentType: module.type as 'notes',
      data: form as unknown as Record<string, unknown>,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      starred: false,
    })
    setShowForm(false)
    resetForm()
  }

  function resetForm() {
    setForm({ title: '', content: '', url: '', notes: '', tags: '', imageData: '', pdfUrl: '', pdfName: '' })
    setTab('text')
    setProgress(0)
    setUploadErr('')
  }

  return (
    <div>
      <div className={s.moduleHeader}>
        <h2 className={s.moduleTitle}>{module.name}</h2>
        <button className={s.addBtn} onClick={() => setShowForm(true)}>+ Adicionar</button>
      </div>

      {items.length === 0 ? (
        <div className={s.empty}>
          <div className={s.emptyIcon}>{module.icon}</div>
          <div className={s.emptyTitle}>Nenhum item ainda</div>
          <div className={s.emptyDesc}>Adicione textos, imagens ou PDFs em {module.name.toLowerCase()}.</div>
        </div>
      ) : (
        <div className={s.genericList}>
          {items.map(item => {
            const d = item.data as unknown as GenericData
            return (
              <div key={item.id} className={`${s.genericItem} ${item.starred ? s.starred : ''}`}>
                {d.imageData && (
                  <img src={d.imageData} alt={d.title} className={s.genericThumb} />
                )}
                <div className={s.genericLeft} style={{ flex: 1, minWidth: 0 }}>
                  <div className={s.genericTitle}>{d.title}</div>
                  {d.content && <div className={s.genericContent}>{d.content}</div>}
                  {d.url && <a href={d.url} target="_blank" rel="noreferrer" className={s.genericUrl}>{d.url}</a>}
                  {d.notes && <div className={s.notes}>"{d.notes}"</div>}
                  {item.tags.length > 0 && (
                    <div className={s.tags}>{item.tags.map(t => <span key={t} className={s.tag}>#{t}</span>)}</div>
                  )}
                  {d.pdfUrl && <PdfViewer url={d.pdfUrl} name={d.pdfName} />}
                </div>
                <div style={{ display: 'flex', gap: 4, flexShrink: 0, alignItems: 'flex-start' }}>
                  <button className={`${s.starBtn} ${item.starred ? s.starActive : ''}`} onClick={() => toggleStar(item.id)}>{item.starred ? '★' : '☆'}</button>
                  <DeleteBtn onConfirm={() => removeItem(item.id)} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showForm && (
        <div className={s.backdrop} onClick={e => { if (e.target === e.currentTarget) { setShowForm(false); resetForm() } }}>
          <div className={s.formModal}>
            <h3 className={s.formTitle}>Adicionar em {module.name}</h3>

            {/* Title always visible */}
            <div className={s.formGrid}>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Título *</label>
                <input className={s.input} placeholder="Nome do item..." value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} autoFocus />
              </div>
            </div>

            {/* Content type tabs */}
            <div className={s.contentTabs}>
              {([
                { id: 'text',  icon: '📝', label: 'Texto' },
                { id: 'image', icon: '🖼️', label: 'Imagem' },
                { id: 'pdf',   icon: '📄', label: 'PDF' },
              ] as const).map(t => (
                <button
                  key={t.id}
                  className={`${s.contentTab} ${tab === t.id ? s.contentTabActive : ''}`}
                  onClick={() => setTab(t.id)}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            {tab === 'text' && (
              <div className={s.formGrid}>
                <div className={`${s.formGroup} ${s.fullWidth}`}>
                  <label className={s.label}>Conteúdo</label>
                  <textarea className={s.textarea} placeholder="Texto, anotação, descrição..." value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} rows={5} />
                </div>
                <div className={s.formGroup}>
                  <label className={s.label}>URL</label>
                  <input className={s.input} placeholder="https://..." value={form.url} onChange={e => setForm(p => ({ ...p, url: e.target.value }))} />
                </div>
                <div className={s.formGroup}>
                  <label className={s.label}>Tags</label>
                  <input className={s.input} placeholder="tag1, tag2" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} />
                </div>
                <div className={`${s.formGroup} ${s.fullWidth}`}>
                  <label className={s.label}>Notas</label>
                  <input className={s.input} placeholder="Observações rápidas..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
                </div>
              </div>
            )}

            {tab === 'image' && (
              <div className={s.formGrid}>
                <div className={`${s.formGroup} ${s.fullWidth}`}>
                  <label className={s.label}>Imagem <span style={{ fontWeight: 400, textTransform: 'none' }}>(cole ⌘V ou selecione)</span></label>
                  {form.imageData ? (
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <img src={form.imageData} alt="" style={{ maxHeight: 200, maxWidth: '100%', borderRadius: 8, display: 'block', border: '1px solid var(--border)' }} />
                      <button onClick={() => setForm(p => ({ ...p, imageData: '' }))}
                        style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,.5)', border: 'none', color: '#fff', borderRadius: 4, cursor: 'pointer', padding: '2px 6px', fontSize: 11 }}>
                        ✕ remover
                      </button>
                    </div>
                  ) : (
                    <div className={s.imageDrop} onClick={() => imgInputRef.current?.click()}>
                      <span>📋 Cole com ⌘V ou clique para selecionar</span>
                      <input ref={imgInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
                    </div>
                  )}
                </div>
              </div>
            )}

            {tab === 'pdf' && (
              <div className={s.formGrid}>
                <div className={`${s.formGroup} ${s.fullWidth}`}>
                  <label className={s.label}>Arquivo PDF</label>
                  {form.pdfUrl ? (
                    <div className={s.pdfUploaded}>
                      <span>✓ {form.pdfName}</span>
                      <button onClick={() => setForm(p => ({ ...p, pdfUrl: '', pdfName: '' }))} className={s.pdfRemoveBtn}>✕ remover</button>
                    </div>
                  ) : uploading ? (
                    <div className={s.pdfProgress}>
                      <div className={s.pdfProgressBar} style={{ width: `${progress}%` }} />
                      <span className={s.pdfProgressText}>Subindo PDF... {progress}%</span>
                    </div>
                  ) : (
                    <div className={s.imageDrop} onClick={() => pdfInputRef.current?.click()}>
                      <span>📄 Clique para selecionar um PDF</span>
                      <span style={{ fontSize: 11, color: 'var(--text2)' }}>O arquivo será salvo no Firebase Storage</span>
                      <input ref={pdfInputRef} type="file" accept="application/pdf" style={{ display: 'none' }} onChange={handlePdfChange} />
                    </div>
                  )}
                  {uploadErr && <div style={{ color: '#f43f5e', fontSize: 12, marginTop: 6 }}>{uploadErr}</div>}
                </div>
              </div>
            )}

            <div className={s.formFooter}>
              <button className={s.cancelBtn} onClick={() => { setShowForm(false); resetForm() }}>Cancelar</button>
              <button className={s.saveBtn} onClick={handleAdd} disabled={!form.title.trim() || uploading}>
                {uploading ? `Subindo ${progress}%...` : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
