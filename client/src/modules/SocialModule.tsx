import { useState } from 'react'
import type { ModuleProps } from './moduleProps'
import s from './modules.module.css'
import d from './SocialModule.module.css'
import DeleteBtn from './DeleteBtn'

type Platform = 'Instagram' | 'LinkedIn' | 'TikTok' | 'YouTube' | 'Twitter/X' | 'Facebook' | 'Pinterest' | 'WhatsApp' | 'Outro'
type Status = 'ideia' | 'producao' | 'agendado' | 'publicado'

interface PostData {
  title: string
  platform: Platform
  status: Status
  data: string
  hora: string
  formato: string
  legenda: string
  hashtags: string
  link: string
  alcance: string
  engajamento: string
  notas: string
  tags: string
}

const PLATFORMS: { key: Platform; color: string; icon: string }[] = [
  { key:'Instagram', color:'#e1306c', icon:'◉' },
  { key:'LinkedIn', color:'#0077b5', icon:'◈' },
  { key:'TikTok', color:'#010101', icon:'◎' },
  { key:'YouTube', color:'#ff0000', icon:'▶' },
  { key:'Twitter/X', color:'#1da1f2', icon:'✕' },
  { key:'Facebook', color:'#1877f2', icon:'◉' },
  { key:'Pinterest', color:'#e60023', icon:'◉' },
  { key:'WhatsApp', color:'#25d366', icon:'◉' },
  { key:'Outro', color:'#6b7280', icon:'◉' },
]

const STATUSES: { key: Status; label: string; color: string }[] = [
  { key:'ideia', label:'Ideia', color:'#6b7280' },
  { key:'producao', label:'Em produção', color:'#f59e0b' },
  { key:'agendado', label:'Agendado', color:'#3b82f6' },
  { key:'publicado', label:'Publicado', color:'#10b981' },
]

const EMPTY: PostData = {
  title:'', platform:'Instagram', status:'ideia', data:'', hora:'',
  formato:'', legenda:'', hashtags:'', link:'', alcance:'', engajamento:'', notas:'', tags:'',
}

function fmtDate(v: string) {
  if(!v) return ''
  return new Date(v+'T00:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'})
}

export default function SocialModule({ module, workspaceId, items, addItem, removeItem, toggleStar }: ModuleProps) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<PostData>({...EMPTY})
  const [filterPlatform, setFilterPlatform] = useState<string>('todos')
  const [filterStatus, setFilterStatus] = useState<string>('todos')
  const [expanded, setExpanded] = useState<string|null>(null)

  function set(patch: Partial<PostData>) { setForm(p=>({...p,...patch})) }

  function handleAdd() {
    if (!form.title.trim()) return
    addItem({
      workspaceId, moduleId: module.id, contentType: 'social',
      data: form as unknown as Record<string,unknown>,
      tags: form.tags.split(',').map(t=>t.trim()).filter(Boolean),
      starred: false,
    })
    setShowForm(false)
    setForm({...EMPTY})
  }

  const platforms = [...new Set(items.map(i=>(i.data as unknown as PostData).platform).filter(Boolean))]

  let visible = items
  if(filterPlatform!=='todos') visible = visible.filter(i=>(i.data as unknown as PostData).platform===filterPlatform)
  if(filterStatus!=='todos') visible = visible.filter(i=>(i.data as unknown as PostData).status===filterStatus)

  function getPlatformInfo(p: Platform) { return PLATFORMS.find(x=>x.key===p) }
  function getStatusInfo(st: Status) { return STATUSES.find(x=>x.key===st) }

  return (
    <div>
      <div className={s.moduleHeader}>
        <h2 className={s.moduleTitle}>{module.name}</h2>
        <button className={s.addBtn} onClick={()=>setShowForm(true)}>+ Novo post</button>
      </div>

      {/* Filters */}
      {platforms.length>0 && (
        <div className={s.filterRow}>
          <button className={`${s.filterBtn} ${filterPlatform==='todos'?s.active:''}`} onClick={()=>setFilterPlatform('todos')}>Todos</button>
          {platforms.map(p=>(
            <button key={p} className={`${s.filterBtn} ${filterPlatform===p?s.active:''}`} onClick={()=>setFilterPlatform(p)}>{p}</button>
          ))}
        </div>
      )}

      {items.length>0 && (
        <div className={s.filterRow} style={{marginTop:4}}>
          {STATUSES.map(st=>{
            const count = items.filter(i=>(i.data as unknown as PostData).status===st.key).length
            if(count===0) return null
            return (
              <button key={st.key} className={`${s.filterBtn} ${filterStatus===st.key?s.active:''}`} onClick={()=>setFilterStatus(filterStatus===st.key?'todos':st.key)}
                style={filterStatus===st.key?{background:`color-mix(in srgb, ${st.color} 15%, transparent)`,borderColor:st.color,color:st.color}:{}}>
                {st.label} <span style={{opacity:.6,fontSize:10}}>({count})</span>
              </button>
            )
          })}
        </div>
      )}

      {visible.length===0 ? (
        <div className={s.empty}>
          <div className={s.emptyIcon}>◉</div>
          <div className={s.emptyTitle}>Nenhum post ainda</div>
          <div className={s.emptyDesc}>Planeje e acompanhe seus posts com legenda, hashtags e métricas.</div>
        </div>
      ) : (
        <div className={d.list}>
          {visible.map(item=>{
            const data = item.data as unknown as PostData
            const isOpen = expanded===item.id
            const plInfo = getPlatformInfo(data.platform)
            const stInfo = getStatusInfo(data.status)
            return (
              <div key={item.id} className={`${d.card} ${item.starred?d.starred:''}`}
                style={stInfo?{borderLeftColor:`color-mix(in srgb, ${stInfo.color} 60%, transparent)`}:{}}>

                <div className={d.cardTop} onClick={()=>setExpanded(isOpen?null:item.id)}>
                  <div className={d.badges}>
                    {plInfo && (
                      <span className={d.platBadge} style={{background:`color-mix(in srgb, ${plInfo.color} 12%, transparent)`,color:plInfo.color}}>
                        {data.platform}
                      </span>
                    )}
                    {stInfo && (
                      <span className={d.statusBadge} style={{background:`color-mix(in srgb, ${stInfo.color} 15%, transparent)`,color:stInfo.color}}>
                        {stInfo.label}
                      </span>
                    )}
                    {data.formato && <span className={d.fmtChip}>{data.formato}</span>}
                  </div>
                  <div className={d.cardActions}>
                    {(data.data||data.hora) && (
                      <span className={d.dateChip}>{fmtDate(data.data)}{data.hora?` ${data.hora}`:''}</span>
                    )}
                    <button className={`${s.starBtn} ${item.starred?s.starActive:''}`} onClick={e=>{e.stopPropagation();toggleStar(item.id)}}>{item.starred?'★':'☆'}</button>
                    <DeleteBtn onConfirm={()=>removeItem(item.id)}/>
                    <span className={d.chevron}>{isOpen?'↑':'↓'}</span>
                  </div>
                </div>

                <div className={d.cardTitle}>{data.title}</div>

                {data.legenda && <div className={d.legenda}>{data.legenda.length>160 ? data.legenda.slice(0,160)+'…' : data.legenda}</div>}

                {data.hashtags && (
                  <div className={d.hashtagRow}>
                    {data.hashtags.split(/[\s,]+/).filter(h=>h).map(h=>(
                      <span key={h} className={d.hashtag}>#{h.replace(/^#/,'')}</span>
                    ))}
                  </div>
                )}

                {isOpen && (
                  <div className={d.expanded}>
                    {data.link && (
                      <div className={d.section}>
                        <div className={d.sLabel}>Link</div>
                        <a href={data.link} target="_blank" rel="noopener noreferrer" className={d.link} onClick={e=>e.stopPropagation()}>{data.link}</a>
                      </div>
                    )}
                    {(data.alcance||data.engajamento) && (
                      <div className={d.metricsRow}>
                        {data.alcance && <div className={d.metric}><div className={d.metricVal}>{data.alcance}</div><div className={d.metricLabel}>Alcance</div></div>}
                        {data.engajamento && <div className={d.metric}><div className={d.metricVal}>{data.engajamento}</div><div className={d.metricLabel}>Engajamento</div></div>}
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
            <h3 className={s.formTitle}>Novo post</h3>
            <div className={s.formGrid}>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Título / Tema *</label>
                <input className={s.input} value={form.title} onChange={e=>set({title:e.target.value})} placeholder="Ex: Lançamento produto — carrossel" autoFocus/>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Plataforma</label>
                <select className={s.input} value={form.platform} onChange={e=>set({platform:e.target.value as Platform})}>
                  {PLATFORMS.map(p=><option key={p.key} value={p.key}>{p.key}</option>)}
                </select>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Status</label>
                <select className={s.input} value={form.status} onChange={e=>set({status:e.target.value as Status})}>
                  {STATUSES.map(st=><option key={st.key} value={st.key}>{st.label}</option>)}
                </select>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Formato</label>
                <input className={s.input} value={form.formato} onChange={e=>set({formato:e.target.value})} placeholder="Reels, Carrossel, Story, Feed..."/>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Data de publicação</label>
                <input className={s.input} type="date" value={form.data} onChange={e=>set({data:e.target.value})}/>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Horário</label>
                <input className={s.input} type="time" value={form.hora} onChange={e=>set({hora:e.target.value})}/>
              </div>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Legenda</label>
                <textarea className={s.textarea} style={{minHeight:80}} value={form.legenda} onChange={e=>set({legenda:e.target.value})} placeholder="Texto completo do post..."/>
              </div>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Hashtags</label>
                <input className={s.input} value={form.hashtags} onChange={e=>set({hashtags:e.target.value})} placeholder="#marketing #produto #lançamento"/>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Link</label>
                <input className={s.input} value={form.link} onChange={e=>set({link:e.target.value})} placeholder="https://..."/>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Alcance (pós-publicação)</label>
                <input className={s.input} value={form.alcance} onChange={e=>set({alcance:e.target.value})} placeholder="12.400"/>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Engajamento</label>
                <input className={s.input} value={form.engajamento} onChange={e=>set({engajamento:e.target.value})} placeholder="847 (6,8%)"/>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Tags</label>
                <input className={s.input} value={form.tags} onChange={e=>set({tags:e.target.value})} placeholder="campanha, produto, orgânico"/>
              </div>
            </div>
            <div className={s.formFooter}>
              <button className={s.cancelBtn} onClick={()=>setShowForm(false)}>Cancelar</button>
              <button className={s.saveBtn} onClick={handleAdd} disabled={!form.title.trim()}>Salvar post</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
