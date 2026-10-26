import { useState } from 'react'
import type { ModuleProps } from './moduleProps'
import s from './modules.module.css'
import vs from './SnippetsModule.module.css'
import DeleteBtn from './DeleteBtn'
import Glyph from '../components/Glyph'
import ItemActions from './ItemActions'
import { uploadUserFile, deleteUserFile, MAX_UPLOAD_MB } from '../utils/fileUpload'

type SnippetCategory = 'Mensagem' | 'Endereço' | 'Preço' | 'Procedimento' | 'Servidor' | 'Acesso' | 'Outro'

interface SnippetData {
  title: string
  body: string
  category: SnippetCategory
  tags: string
  fileUrl?: string
  fileName?: string
  storagePath?: string
}

const CATEGORY_COLOR: Record<SnippetCategory, { bg: string; text: string }> = {
  'Mensagem':    { bg: '#7c6ef722', text: '#7c6ef7' },
  'Endereço':    { bg: '#3ecf8e22', text: '#3ecf8e' },
  'Preço':       { bg: '#f59e0b22', text: '#f59e0b' },
  'Procedimento':{ bg: '#4f8ef722', text: '#4f8ef7' },
  'Servidor':    { bg: '#06b6d422', text: '#0891b2' },
  'Acesso':      { bg: '#ec489922', text: '#db2777' },
  'Outro':       { bg: '#6b728022', text: '#6b7280' },
}

const CATEGORIES: SnippetCategory[] = ['Mensagem', 'Endereço', 'Preço', 'Procedimento', 'Servidor', 'Acesso', 'Outro']

const SERVER_TEMPLATE = 'Endereço: \nUsuário: \nGateway: \nPara que serve: \nSenha: guardada no gerenciador de senhas'

/** Divide um texto colado em blocos separados por linhas de traços; 1ª linha vira o título. */
export function parseAccessBlocks(text: string): { title: string; body: string }[] {
  return text
    .split(/\n\s*[—–_=-]{5,}\s*(?:\n|$)/)
    .map(block => block.replace(/^\s*[—–_=-]{5,}\s*\n?/, '').trim())
    .map(block => {
      const lines = block.split('\n')
      return { title: lines[0].trim(), body: lines.slice(1).join('\n').trim() }
    })
    .filter(b => b.title && b.body)
}

const EMPTY_FORM: SnippetData = { title: '', body: '', category: 'Outro', tags: '' }

export default function SnippetsModule({ module, workspaceId, items, addItem, removeItem, toggleStar }: ModuleProps) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<SnippetData>(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<SnippetCategory | 'Todos'>('Todos')
  const [importOpen, setImportOpen] = useState(false)
  const [importText, setImportText] = useState('')
  const [viewerId, setViewerId] = useState<string | null>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [upload, setUpload] = useState({ busy: false, pct: 0, error: '' })

  function copy(text: string, id: string) {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  function openNew() { setForm(EMPTY_FORM); setEditingId(null); setPendingFile(null); setUpload({ busy: false, pct: 0, error: '' }); setShowForm(true) }

  function openEdit(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    const item = items.find(i => i.id === id)
    if (!item) return
    const d = item.data as unknown as SnippetData
    setForm(d)
    setEditingId(id)
    setPendingFile(null)
    setUpload({ busy: false, pct: 0, error: '' })
    setShowForm(true)
  }

  async function handleSave() {
    if (!form.title.trim() || !form.body.trim() || upload.busy) return
    const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean)
    let data: SnippetData = form
    if (pendingFile) {
      setUpload({ busy: true, pct: 0, error: '' })
      try {
        const up = await uploadUserFile(pendingFile, pct => setUpload(u => ({ ...u, pct })))
        if (form.storagePath) void deleteUserFile(form.storagePath)
        data = { ...form, fileUrl: up.url, fileName: pendingFile.name, storagePath: up.storagePath }
      } catch (err) {
        setUpload({ busy: false, pct: 0, error: (err as Error).message })
        return
      }
    }
    if (editingId) {
      removeItem(editingId)
    }
    addItem({
      workspaceId,
      moduleId: module.id,
      contentType: 'snippets',
      data: data as unknown as Record<string, unknown>,
      tags,
      starred: false,
    })
    setUpload({ busy: false, pct: 0, error: '' })
    setPendingFile(null)
    setShowForm(false)
    setForm(EMPTY_FORM)
    setEditingId(null)
  }

  const importBlocks = parseAccessBlocks(importText)

  function handleImport() {
    for (const b of importBlocks) {
      addItem({
        workspaceId,
        moduleId: module.id,
        contentType: 'snippets',
        data: { title: b.title, body: b.body, category: 'Acesso', tags: 'acesso' } as unknown as Record<string, unknown>,
        tags: ['acesso'],
        starred: false,
      })
    }
    setImportText('')
    setImportOpen(false)
    setActiveCategory('Acesso')
  }

  function removeSnippet(id: string) {
    const d = items.find(i => i.id === id)?.data as unknown as SnippetData | undefined
    if (d?.storagePath) void deleteUserFile(d.storagePath)
    removeItem(id)
  }

  const expandedItem = expandedId ? items.find(i => i.id === expandedId) : null
  const expandedData = expandedItem ? (expandedItem.data as unknown as SnippetData) : null

  const visible = items
    .slice()
    .sort((a, b) => (b.starred ? 1 : 0) - (a.starred ? 1 : 0))
    .filter(item => {
      const d = item.data as unknown as SnippetData
      if (activeCategory !== 'Todos' && d.category !== activeCategory) return false
      if (search) {
        const q = search.toLowerCase()
        if (!d.title.toLowerCase().includes(q) && !d.body.toLowerCase().includes(q)) return false
      }
      return true
    })

  return (
    <div>
      <div className={s.moduleHeader}>
        <h2 className={s.moduleTitle}>{module.name || 'Snippets'}</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className={s.cancelBtn} onClick={() => setImportOpen(true)}>Importar acessos</button>
          <button className={s.addBtn} onClick={openNew}>+ Adicionar</button>
        </div>
      </div>

      {items.length > 0 && (
        <div className={vs.toolbar}>
          <div className={vs.searchWrap}>
            <span className={vs.searchIcon}><Glyph value="ph:magnifying-glass" size={15} /></span>
            <input
              className={vs.searchInput}
              placeholder="Buscar snippets…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className={vs.searchClear} onClick={() => setSearch('')}>✕</button>
            )}
          </div>
          <div className={vs.filters}>
            {(['Todos', ...CATEGORIES] as (SnippetCategory | 'Todos')[]).map(cat => (
              <button
                key={cat}
                className={`${vs.filterBtn} ${activeCategory === cat ? vs.filterActive : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className={vs.empty}>
          <div className={vs.emptyIcon}><Glyph value="ph:clipboard" size={32} /></div>
          <div className={vs.emptyTitle}>Nenhum snippet salvo</div>
          <div className={vs.emptyDesc}>
            Guarde mensagens prontas, endereços, tabelas de preço e procedimentos. Copie com um clique quando precisar.
          </div>
        </div>
      ) : visible.length === 0 ? (
        <div className={vs.empty}>
          <div className={vs.emptyIcon}><Glyph value="ph:magnifying-glass" size={32} /></div>
          <div className={vs.emptyTitle}>Nenhum resultado</div>
          <div className={vs.emptyDesc}>Tente ajustar o filtro ou a busca.</div>
        </div>
      ) : (
        <div className={vs.grid}>
          {visible.map(item => {
            const d = item.data as unknown as SnippetData
            const color = CATEGORY_COLOR[d.category] ?? CATEGORY_COLOR['Outro']
            const isCopied = copied === item.id
            return (
              <div
                key={item.id}
                className={`${vs.card} ${item.starred ? vs.starred : ''}`}
                onClick={() => setExpandedId(item.id)}
              >
                <div className={vs.cardTop}>
                  <span className={vs.badge} style={{ background: color.bg, color: color.text }}>
                    {d.category}
                  </span>
                  <div className={vs.actions}>
                    <button
                      className={`${s.starBtn} ${item.starred ? s.starActive : ''}`}
                      onClick={e => { e.stopPropagation(); toggleStar(item.id) }}
                    >
                      <Glyph value="ph:star" size={15} weight={item.starred ? 'fill' : 'bold'} />
                    </button>
                    <ItemActions onEdit={e => openEdit(item.id, e)} onDelete={() => removeSnippet(item.id)} />
                  </div>
                </div>

                <div className={vs.title}>{d.title}</div>
                <div className={`${vs.preview} ${d.category === 'Acesso' ? vs.secret : ''}`}>{d.body}</div>
                {d.category === 'Acesso' && <div className={vs.secretHint}><Glyph value="ph:lock" size={12} /> Passe o mouse para ver</div>}

                {item.tags.length > 0 && (
                  <div className={s.tags}>{item.tags.map(t => <span key={t} className={s.tag}>#{t}</span>)}</div>
                )}

                {d.fileUrl && (
                  <div className={vs.fileActions}>
                    <button
                      className={vs.fileBtn}
                      onClick={e => { e.stopPropagation(); setViewerId(item.id) }}
                      title={d.fileName}
                    ><Glyph value="ph:file-pdf" size={14} /> Abrir PDF</button>
                    <a
                      className={vs.fileBtn}
                      href={d.fileUrl}
                      download={d.fileName || 'procedimento.pdf'}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                    ><Glyph value="ph:download-simple" size={14} /> Baixar</a>
                  </div>
                )}
                <button
                  className={`${vs.copyBtn} ${isCopied ? vs.copied : ''}`}
                  onClick={e => { e.stopPropagation(); copy(d.body, item.id) }}
                >
                  {isCopied ? <><Glyph value="ph:check" size={13} /> Copiado!</> : <><Glyph value="ph:clipboard" size={13} /> Copiar</>}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Expand modal ── */}
      {expandedId && expandedData && (
        <div className={s.backdrop} onClick={() => setExpandedId(null)}>
          <div className={vs.expandModal} onClick={e => e.stopPropagation()}>
            <div className={vs.expandHeader}>
              <div>
                <span
                  className={vs.badge}
                  style={{
                    background: CATEGORY_COLOR[expandedData.category]?.bg,
                    color: CATEGORY_COLOR[expandedData.category]?.text,
                  }}
                >
                  {expandedData.category}
                </span>
                <div className={vs.expandTitle}>{expandedData.title}</div>
              </div>
              <button className={vs.expandClose} onClick={() => setExpandedId(null)}>✕</button>
            </div>
            <div className={vs.expandBody}>{expandedData.body}</div>
            <div className={vs.expandFooter}>
              {expandedData.fileUrl && (
                <>
                  <button className={vs.fileBtn} style={{ marginTop: 0, width: 'auto', padding: '9px 16px' }} onClick={() => setViewerId(expandedId)}>
                    <Glyph value="ph:file-pdf" size={14} /> Abrir PDF
                  </button>
                  <a className={vs.fileBtn} style={{ marginTop: 0, width: 'auto', padding: '9px 16px' }} href={expandedData.fileUrl} download={expandedData.fileName || 'procedimento.pdf'} target="_blank" rel="noopener noreferrer">
                    <Glyph value="ph:download-simple" size={14} /> Baixar
                  </a>
                </>
              )}
              <button
                className={`${vs.copyBtn} ${copied === expandedId ? vs.copied : ''}`}
                onClick={() => copy(expandedData.body, expandedId)}
              >
                {copied === expandedId ? <><Glyph value="ph:check" size={13} /> Copiado!</> : <><Glyph value="ph:clipboard" size={13} /> Copiar conteúdo</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Importar acessos ── */}
      {importOpen && (
        <div className={s.backdrop} onClick={e => { if (e.target === e.currentTarget) setImportOpen(false) }}>
          <div className={s.formModal}>
            <h3 className={s.formTitle}>Importar acessos</h3>
            <span className={s.hint}>Cole o texto. Cada bloco separado por uma linha de traços (————) vira um card na categoria Acesso; a primeira linha do bloco é o título.</span>
            <textarea
              className={s.textarea}
              rows={12}
              placeholder={'ADMINS RJ\nMac\nusuario\nsenha\n—————————\nSENHAS WIFI\nRede\nSENHA: ...'}
              value={importText}
              onChange={e => setImportText(e.target.value)}
              autoFocus
            />
            {importBlocks.length > 0 && (
              <div className={vs.importList}>
                {importBlocks.length} {importBlocks.length === 1 ? 'card será criado' : 'cards serão criados'}:
                {importBlocks.map((b, i) => <span key={i} className={vs.importChip}>{b.title}</span>)}
              </div>
            )}
            <div className={s.formFooter}>
              <button className={s.cancelBtn} onClick={() => { setImportOpen(false); setImportText('') }}>Cancelar</button>
              <button className={s.saveBtn} onClick={handleImport} disabled={importBlocks.length === 0}>
                Importar {importBlocks.length || ''}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PDF viewer ── */}
      {viewerId && (() => {
        const vd = items.find(i => i.id === viewerId)?.data as unknown as SnippetData | undefined
        if (!vd?.fileUrl) return null
        return (
          <div className={s.backdrop} onClick={() => setViewerId(null)}>
            <div className={vs.viewer} onClick={e => e.stopPropagation()}>
              <div className={vs.viewerBar}>
                <span className={vs.viewerTitle}>{vd.title}</span>
                <a className={vs.viewerBtn} href={vd.fileUrl} download={vd.fileName || 'procedimento.pdf'} target="_blank" rel="noopener noreferrer"><Glyph value="ph:download-simple" size={14} /> Baixar</a>
                <a className={vs.viewerBtn} href={vd.fileUrl} target="_blank" rel="noopener noreferrer">Abrir em nova aba</a>
                <button className={vs.expandClose} onClick={() => setViewerId(null)}>✕</button>
              </div>
              <iframe className={vs.viewerFrame} src={vd.fileUrl} title={vd.title} />
            </div>
          </div>
        )
      })()}

      {/* ── Form modal ── */}
      {showForm && (
        <div className={s.backdrop} onClick={e => { if (e.target === e.currentTarget) setShowForm(false) }}>
          <div className={s.formModal}>
            <h3 className={s.formTitle}>{editingId ? 'Editar snippet' : 'Novo snippet'}</h3>
            <div className={s.formGrid}>
              <div className={s.formGroup}>
                <label className={s.label}>Título *</label>
                <input
                  className={s.input}
                  placeholder="ex: Template Recebimento, Endereço Artplan…"
                  value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  autoFocus
                />
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Categoria</label>
                <select
                  className={s.input}
                  value={form.category}
                  onChange={e => setForm(p => ({ ...p, category: e.target.value as SnippetCategory, body: !p.body.trim() && e.target.value === 'Servidor' ? SERVER_TEMPLATE : p.body }))}
                >
                  <option>Mensagem</option>
                  <option>Endereço</option>
                  <option>Preço</option>
                  <option>Procedimento</option>
                  <option>Servidor</option>
                  <option>Acesso</option>
                  <option>Outro</option>
                </select>
              </div>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Conteúdo *</label>
                {form.category === 'Servidor' && <span className={s.hint}>Não guarde senhas aqui: escreva só onde ela está (gerenciador de senhas).</span>}
                <textarea
                  className={s.textarea}
                  placeholder="Cole o texto, endereço, tabela ou mensagem aqui…"
                  value={form.body}
                  onChange={e => setForm(p => ({ ...p, body: e.target.value }))}
                  rows={8}
                />
              </div>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>PDF ou arquivo do procedimento</label>
                {form.fileUrl && !pendingFile && (
                  <div className={vs.fileRow}>
                    <Glyph value="ph:paperclip" size={14} />
                    <a href={form.fileUrl} target="_blank" rel="noopener noreferrer">{form.fileName || 'Arquivo anexado'}</a>
                    <button type="button" onClick={() => setForm(p => ({ ...p, fileUrl: undefined, fileName: undefined }))}>remover</button>
                  </div>
                )}
                <input
                  className={s.input}
                  type="file"
                  accept=".pdf,image/*"
                  onChange={e => { setPendingFile(e.target.files?.[0] ?? null); setUpload({ busy: false, pct: 0, error: '' }) }}
                />
                <span className={s.hint}>Opcional · até {MAX_UPLOAD_MB} MB. Fica salvo junto com o snippet.</span>
                {upload.busy && <span className={s.hint}>Enviando… {upload.pct}%</span>}
                {upload.error && <span className={s.hint} style={{ color: '#ef4444' }}>{upload.error}</span>}
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Tags</label>
                <input
                  className={s.input}
                  placeholder="macbook, artplan, transportadora"
                  value={form.tags}
                  onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
                />
              </div>
            </div>
            <div className={s.formFooter}>
              <button className={s.cancelBtn} onClick={() => setShowForm(false)}>Cancelar</button>
              <button
                className={s.saveBtn}
                onClick={handleSave}
                disabled={!form.title.trim() || !form.body.trim() || upload.busy}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
