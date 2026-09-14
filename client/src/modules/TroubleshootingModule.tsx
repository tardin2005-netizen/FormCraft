import { useState } from 'react'
import type { ModuleProps } from './moduleProps'
import s from './modules.module.css'
import d from './TroubleshootingModule.module.css'
import DeleteBtn from './DeleteBtn'

type Severidade = 'critico' | 'alto' | 'medio' | 'baixo'
type Status = 'aberto' | 'investigando' | 'resolvido'

interface TroubleshootData {
  title: string
  severidade: Severidade
  status: Status
  sistema: string
  ambiente: string
  problema: string
  causa: string
  solucao: string
  prevencao: string
  links: string
  tags: string
}

const SEVERIDADES: { key: Severidade; label: string; color: string }[] = [
  { key:'critico', label:'Crítico', color:'#dc2626' },
  { key:'alto', label:'Alto', color:'#f43f5e' },
  { key:'medio', label:'Médio', color:'#f59e0b' },
  { key:'baixo', label:'Baixo', color:'#10b981' },
]

const STATUSES: { key: Status; label: string; color: string }[] = [
  { key:'aberto', label:'Aberto', color:'#f43f5e' },
  { key:'investigando', label:'Investigando', color:'#f59e0b' },
  { key:'resolvido', label:'Resolvido', color:'#10b981' },
]

const EMPTY: TroubleshootData = {
  title:'', severidade:'medio', status:'aberto', sistema:'', ambiente:'',
  problema:'', causa:'', solucao:'', prevencao:'', links:'', tags:'',
}

export default function TroubleshootingModule({ module, workspaceId, items, addItem, removeItem, toggleStar }: ModuleProps) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<TroubleshootData>({...EMPTY})
  const [filterStatus, setFilterStatus] = useState<string>('todos')
  const [filterSev, setFilterSev] = useState<string>('todos')
  const [expanded, setExpanded] = useState<string|null>(null)

  function set(patch: Partial<TroubleshootData>) { setForm(p=>({...p,...patch})) }

  function handleAdd() {
    if (!form.title.trim()||!form.problema.trim()) return
    addItem({
      workspaceId, moduleId: module.id, contentType: 'troubleshooting',
      data: form as unknown as Record<string,unknown>,
      tags: form.tags.split(',').map(t=>t.trim()).filter(Boolean),
      starred: false,
    })
    setShowForm(false)
    setForm({...EMPTY})
  }

  let visible = items
  if(filterStatus!=='todos') visible = visible.filter(i=>(i.data as unknown as TroubleshootData).status===filterStatus)
  if(filterSev!=='todos') visible = visible.filter(i=>(i.data as unknown as TroubleshootData).severidade===filterSev)

  const severidades = [...new Set(items.map(i=>(i.data as unknown as TroubleshootData).severidade))]

  return (
    <div>
      <div className={s.moduleHeader}>
        <h2 className={s.moduleTitle}>{module.name}</h2>
        <button className={s.addBtn} onClick={()=>setShowForm(true)}>+ Novo problema</button>
      </div>

      {items.length>0 && (
        <>
          <div className={s.filterRow}>
            {STATUSES.map(st=>{
              const cnt = items.filter(i=>(i.data as unknown as TroubleshootData).status===st.key).length
              if(!cnt) return null
              return (
                <button key={st.key}
                  className={`${s.filterBtn} ${filterStatus===st.key?s.active:''}`}
                  onClick={()=>setFilterStatus(filterStatus===st.key?'todos':st.key)}
                  style={filterStatus===st.key?{background:`color-mix(in srgb,${st.color} 15%,transparent)`,borderColor:st.color,color:st.color}:{}}>
                  {st.label} <span style={{opacity:.6,fontSize:10}}>({cnt})</span>
                </button>
              )
            })}
          </div>
          {severidades.length>1 && (
            <div className={s.filterRow} style={{marginTop:4}}>
              <button className={`${s.filterBtn} ${filterSev==='todos'?s.active:''}`} onClick={()=>setFilterSev('todos')}>Todas</button>
              {severidades.map(sv=>{
                const svInfo = SEVERIDADES.find(x=>x.key===sv)
                return (
                  <button key={sv} className={`${s.filterBtn} ${filterSev===sv?s.active:''}`} onClick={()=>setFilterSev(sv)}
                    style={filterSev===sv&&svInfo?{borderColor:svInfo.color,color:svInfo.color}:{}}>
                    {svInfo?.label||sv}
                  </button>
                )
              })}
            </div>
          )}
        </>
      )}

      {visible.length===0 ? (
        <div className={s.empty}>
          <div className={s.emptyIcon}>⚡</div>
          <div className={s.emptyTitle}>Nenhum problema registrado</div>
          <div className={s.emptyDesc}>Documente problemas, causas raiz e soluções para referência futura.</div>
        </div>
      ) : (
        <div className={d.list}>
          {visible.map(item=>{
            const data = item.data as unknown as TroubleshootData
            const isOpen = expanded===item.id
            const sevInfo = SEVERIDADES.find(x=>x.key===data.severidade)
            const stInfo = STATUSES.find(x=>x.key===data.status)
            const resolved = data.status==='resolvido'
            return (
              <div key={item.id} className={`${d.card} ${item.starred?d.starred:''} ${resolved?d.resolved:''}`}
                style={sevInfo?{borderLeft:`3px solid ${sevInfo.color}`}:{}}>

                <div className={d.cardTop} onClick={()=>setExpanded(isOpen?null:item.id)}>
                  <div className={d.badges}>
                    {sevInfo && <span className={d.sevBadge} style={{background:`color-mix(in srgb,${sevInfo.color} 15%,transparent)`,color:sevInfo.color}}>{sevInfo.label}</span>}
                    {stInfo && <span className={d.statusBadge} style={{background:`color-mix(in srgb,${stInfo.color} 10%,transparent)`,color:stInfo.color}}>{stInfo.label}</span>}
                    {data.sistema && <span className={d.systemChip}>{data.sistema}</span>}
                    {data.ambiente && <span className={d.envChip}>{data.ambiente}</span>}
                  </div>
                  <div className={d.cardActions}>
                    <button className={`${s.starBtn} ${item.starred?s.starActive:''}`} onClick={e=>{e.stopPropagation();toggleStar(item.id)}}>{item.starred?'★':'☆'}</button>
                    <DeleteBtn onConfirm={()=>removeItem(item.id)}/>
                    <span className={d.chevron}>{isOpen?'↑':'↓'}</span>
                  </div>
                </div>

                <div className={d.cardTitle}>{data.title}</div>

                {/* Three-column problem/cause/solution */}
                <div className={d.columns}>
                  <div className={d.col}>
                    <div className={d.colLabel} style={{color:'#f43f5e'}}>Problema</div>
                    <div className={d.colText}>{data.problema || '—'}</div>
                  </div>
                  <div className={d.col}>
                    <div className={d.colLabel} style={{color:'#f59e0b'}}>Causa</div>
                    <div className={d.colText}>{data.causa || '—'}</div>
                  </div>
                  <div className={d.col}>
                    <div className={d.colLabel} style={{color:'#10b981'}}>Solução</div>
                    <div className={d.colText}>{data.solucao || '—'}</div>
                  </div>
                </div>

                {isOpen && (
                  <div className={d.expanded}>
                    {data.prevencao && <div className={d.section}><div className={d.sLabel}>Prevenção</div><p className={d.sText}>{data.prevencao}</p></div>}
                    {data.links && (
                      <div className={d.section}>
                        <div className={d.sLabel}>Links / Referências</div>
                        {data.links.split('\n').map((l,i)=>l.trim()&&(
                          <a key={i} href={l.trim()} target="_blank" rel="noopener noreferrer" className={d.link} onClick={e=>e.stopPropagation()}>{l.trim()}</a>
                        ))}
                      </div>
                    )}
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
          <div className={s.formModal} style={{width:620}}>
            <h3 className={s.formTitle}>Novo problema</h3>
            <div className={s.formGrid}>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Título / Descrição curta *</label>
                <input className={s.input} value={form.title} onChange={e=>set({title:e.target.value})} placeholder="Ex: Deploy falha no ambiente de produção" autoFocus/>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Severidade</label>
                <select className={s.input} value={form.severidade} onChange={e=>set({severidade:e.target.value as Severidade})}>
                  {SEVERIDADES.map(sv=><option key={sv.key} value={sv.key}>{sv.label}</option>)}
                </select>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Status</label>
                <select className={s.input} value={form.status} onChange={e=>set({status:e.target.value as Status})}>
                  {STATUSES.map(st=><option key={st.key} value={st.key}>{st.label}</option>)}
                </select>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Sistema / Serviço</label>
                <input className={s.input} value={form.sistema} onChange={e=>set({sistema:e.target.value})} placeholder="API, Frontend, Banco de dados..."/>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Ambiente</label>
                <input className={s.input} value={form.ambiente} onChange={e=>set({ambiente:e.target.value})} placeholder="Prod, Staging, Dev"/>
              </div>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Descrição do problema *</label>
                <textarea className={s.textarea} value={form.problema} onChange={e=>set({problema:e.target.value})} rows={3} placeholder="O que está acontecendo, sintomas, mensagens de erro..."/>
              </div>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Causa raiz</label>
                <textarea className={s.textarea} value={form.causa} onChange={e=>set({causa:e.target.value})} rows={2} placeholder="Por que o problema ocorre..."/>
              </div>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Solução</label>
                <textarea className={s.textarea} value={form.solucao} onChange={e=>set({solucao:e.target.value})} rows={3} placeholder="Passo a passo para resolver..."/>
              </div>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Prevenção</label>
                <textarea className={s.textarea} value={form.prevencao} onChange={e=>set({prevencao:e.target.value})} rows={2} placeholder="Como evitar que aconteça novamente..."/>
              </div>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Links / Referências (um por linha)</label>
                <textarea className={s.textarea} value={form.links} onChange={e=>set({links:e.target.value})} rows={2} placeholder="https://docs.exemplo.com/erro-123"/>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Tags</label>
                <input className={s.input} value={form.tags} onChange={e=>set({tags:e.target.value})} placeholder="deploy, ci, timeout"/>
              </div>
            </div>
            <div className={s.formFooter}>
              <button className={s.cancelBtn} onClick={()=>setShowForm(false)}>Cancelar</button>
              <button className={s.saveBtn} onClick={handleAdd} disabled={!form.title.trim()||!form.problema.trim()}>Salvar problema</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
