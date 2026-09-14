import { useState } from 'react'
import type { ModuleProps } from './moduleProps'
import s from './modules.module.css'
import d from './CopywritingModule.module.css'
import DeleteBtn from './DeleteBtn'

type Format = 'headline' | 'cta' | 'email' | 'caption' | 'anuncio' | 'slogan' | 'descricao' | 'roteiro' | 'outro'
type Tom = 'profissional' | 'descontraido' | 'urgente' | 'inspiracional' | 'emocional' | 'educativo' | 'humoristico'

interface CopyData {
  title: string
  formato: Format
  tom: Tom
  objetivo: string
  publico: string
  copy: string
  variacao: string
  canal: string
  notas: string
  tags: string
}

const FORMATS: { key: Format; label: string }[] = [
  { key:'headline', label:'Headline' },
  { key:'cta', label:'CTA' },
  { key:'email', label:'E-mail' },
  { key:'caption', label:'Caption' },
  { key:'anuncio', label:'Anúncio' },
  { key:'slogan', label:'Slogan' },
  { key:'descricao', label:'Descrição' },
  { key:'roteiro', label:'Roteiro' },
  { key:'outro', label:'Outro' },
]

const TOMS: { key: Tom; label: string; color: string }[] = [
  { key:'profissional', label:'Profissional', color:'#6b7280' },
  { key:'descontraido', label:'Descontraído', color:'#10b981' },
  { key:'urgente', label:'Urgente', color:'#f43f5e' },
  { key:'inspiracional', label:'Inspiracional', color:'#f59e0b' },
  { key:'emocional', label:'Emocional', color:'#ec4899' },
  { key:'educativo', label:'Educativo', color:'#3b82f6' },
  { key:'humoristico', label:'Humorístico', color:'#8b5cf6' },
]

const EMPTY: CopyData = {
  title:'', formato:'headline', tom:'profissional', objetivo:'',
  publico:'', copy:'', variacao:'', canal:'', notas:'', tags:'',
}

export default function CopywritingModule({ module, workspaceId, items, addItem, removeItem, toggleStar }: ModuleProps) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<CopyData>({...EMPTY})
  const [filterFmt, setFilterFmt] = useState<string>('todos')
  const [expanded, setExpanded] = useState<string|null>(null)
  const [copied, setCopied] = useState<string|null>(null)

  function set(patch: Partial<CopyData>) { setForm(p=>({...p,...patch})) }

  function handleAdd() {
    if (!form.title.trim() || !form.copy.trim()) return
    addItem({
      workspaceId, moduleId: module.id, contentType: 'copywriting',
      data: form as unknown as Record<string,unknown>,
      tags: form.tags.split(',').map(t=>t.trim()).filter(Boolean),
      starred: false,
    })
    setShowForm(false)
    setForm({...EMPTY})
  }

  function copyCopy(text: string, id: string) {
    navigator.clipboard.writeText(text).catch(()=>{})
    setCopied(id)
    setTimeout(()=>setCopied(null), 1800)
  }

  const fmts = [...new Set(items.map(i=>(i.data as unknown as CopyData).formato).filter(Boolean))]
  const visible = filterFmt==='todos' ? items : items.filter(i=>(i.data as unknown as CopyData).formato===filterFmt)

  function getTomInfo(tom: Tom) { return TOMS.find(t=>t.key===tom) }

  return (
    <div>
      <div className={s.moduleHeader}>
        <h2 className={s.moduleTitle}>{module.name}</h2>
        <button className={s.addBtn} onClick={()=>setShowForm(true)}>+ Novo copy</button>
      </div>

      {fmts.length>0 && (
        <div className={s.filterRow}>
          <button className={`${s.filterBtn} ${filterFmt==='todos'?s.active:''}`} onClick={()=>setFilterFmt('todos')}>Todos</button>
          {fmts.map(f=>{
            const fmt = FORMATS.find(x=>x.key===f)
            return <button key={f} className={`${s.filterBtn} ${filterFmt===f?s.active:''}`} onClick={()=>setFilterFmt(f)}>{fmt?.label||f}</button>
          })}
        </div>
      )}

      {visible.length===0 ? (
        <div className={s.empty}>
          <div className={s.emptyIcon}>✍</div>
          <div className={s.emptyTitle}>Nenhum copy ainda</div>
          <div className={s.emptyDesc}>Salve headlines, CTAs, captions e roteiros para reutilizar.</div>
        </div>
      ) : (
        <div className={d.list}>
          {visible.map(item=>{
            const data = item.data as unknown as CopyData
            const isOpen = expanded===item.id
            const tomInfo = getTomInfo(data.tom)
            const fmt = FORMATS.find(x=>x.key===data.formato)
            return (
              <div key={item.id} className={`${d.card} ${item.starred?d.starred:''}`}>
                <div className={d.cardTop} onClick={()=>setExpanded(isOpen?null:item.id)}>
                  <div className={d.meta}>
                    {fmt && <span className={d.fmtBadge}>{fmt.label}</span>}
                    {tomInfo && <span className={d.tomBadge} style={{background:`color-mix(in srgb, ${tomInfo.color} 15%, transparent)`,color:tomInfo.color}}>{tomInfo.label}</span>}
                    {data.canal && <span className={d.canalBadge}>{data.canal}</span>}
                  </div>
                  <div className={d.cardActions}>
                    <button className={`${s.starBtn} ${item.starred?s.starActive:''}`} onClick={e=>{e.stopPropagation();toggleStar(item.id)}}>{item.starred?'★':'☆'}</button>
                    <DeleteBtn onConfirm={()=>removeItem(item.id)}/>
                    <span className={d.chevron}>{isOpen?'↑':'↓'}</span>
                  </div>
                </div>

                <div className={d.cardTitle}>{data.title}</div>

                {/* Main copy text — always visible */}
                <div className={d.copyBlock}>
                  <div className={d.copyBlockHeader}>
                    <span className={d.copyLabel}>Copy</span>
                    <button className={s.copyPromptBtn} onClick={e=>{e.stopPropagation();copyCopy(data.copy, item.id)}}>
                      {copied===item.id ? '✓ Copiado' : 'Copiar'}
                    </button>
                  </div>
                  <div className={d.copyText}>{data.copy}</div>
                </div>

                {isOpen && (
                  <div className={d.expanded}>
                    {data.objetivo && <div className={d.section}><div className={d.sLabel}>Objetivo</div><p className={d.sText}>{data.objetivo}</p></div>}
                    {data.publico && <div className={d.section}><div className={d.sLabel}>Público</div><p className={d.sText}>{data.publico}</p></div>}
                    {data.variacao && (
                      <div className={d.section}>
                        <div className={d.sLabel}>Variação / Alternativas</div>
                        <div className={d.copyBlock}>
                          <div className={d.copyText}>{data.variacao}</div>
                        </div>
                      </div>
                    )}
                    {data.notas && <div className={d.section}><div className={d.sLabel}>Observações</div><p className={d.sText}>{data.notas}</p></div>}
                    {item.tags.length>0 && <div className={s.tags}>{item.tags.map(t=><span key={t} className={s.tag}>#{t}</span>)}</div>}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {showForm && (
        <div className={s.backdrop} onClick={e=>{if(e.target===e.currentTarget)setShowForm(false)}}>
          <div className={s.formModal} style={{width:580}}>
            <h3 className={s.formTitle}>Novo copy</h3>
            <div className={s.formGrid}>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Título / Nome *</label>
                <input className={s.input} value={form.title} onChange={e=>set({title:e.target.value})} placeholder="Ex: Headline campanha lançamento" autoFocus/>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Formato</label>
                <select className={s.input} value={form.formato} onChange={e=>set({formato:e.target.value as Format})}>
                  {FORMATS.map(f=><option key={f.key} value={f.key}>{f.label}</option>)}
                </select>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Tom de voz</label>
                <select className={s.input} value={form.tom} onChange={e=>set({tom:e.target.value as Tom})}>
                  {TOMS.map(t=><option key={t.key} value={t.key}>{t.label}</option>)}
                </select>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Canal</label>
                <input className={s.input} value={form.canal} onChange={e=>set({canal:e.target.value})} placeholder="Instagram, E-mail, Landing page..."/>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Público-alvo</label>
                <input className={s.input} value={form.publico} onChange={e=>set({publico:e.target.value})} placeholder="Quem vai ler isso..."/>
              </div>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Objetivo</label>
                <input className={s.input} value={form.objetivo} onChange={e=>set({objetivo:e.target.value})} placeholder="Converter, engajar, informar..."/>
              </div>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Copy *</label>
                <textarea className={s.textarea} style={{minHeight:80}} value={form.copy} onChange={e=>set({copy:e.target.value})} placeholder="O texto principal..."/>
              </div>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Variações / Alternativas</label>
                <textarea className={s.textarea} value={form.variacao} onChange={e=>set({variacao:e.target.value})} rows={2} placeholder="Outras versões do mesmo copy..."/>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Tags</label>
                <input className={s.input} value={form.tags} onChange={e=>set({tags:e.target.value})} placeholder="produto, email, black-friday"/>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Observações</label>
                <input className={s.input} value={form.notas} onChange={e=>set({notas:e.target.value})} placeholder="Contexto adicional, resultados..."/>
              </div>
            </div>
            <div className={s.formFooter}>
              <button className={s.cancelBtn} onClick={()=>setShowForm(false)}>Cancelar</button>
              <button className={s.saveBtn} onClick={handleAdd} disabled={!form.title.trim()||!form.copy.trim()}>Salvar copy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
