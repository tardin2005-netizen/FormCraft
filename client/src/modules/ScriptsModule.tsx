import { useState } from 'react'
import type { ModuleProps } from './moduleProps'
import s from './modules.module.css'
import d from './ScriptsModule.module.css'
import DeleteBtn from './DeleteBtn'

type Lang = 'bash' | 'python' | 'javascript' | 'typescript' | 'sql' | 'powershell' | 'php' | 'go' | 'rust' | 'outro'
type Cat = 'automacao' | 'deploy' | 'backup' | 'monitoramento' | 'dados' | 'infra' | 'util' | 'outro'

interface ScriptData {
  title: string
  lang: Lang
  categoria: Cat
  descricao: string
  code: string
  uso: string
  dependencias: string
  so: string
  notas: string
  tags: string
}

const LANGS: { key: Lang; label: string; color: string }[] = [
  { key:'bash', label:'Bash', color:'#10b981' },
  { key:'python', label:'Python', color:'#3b82f6' },
  { key:'javascript', label:'JavaScript', color:'#f59e0b' },
  { key:'typescript', label:'TypeScript', color:'#6366f1' },
  { key:'sql', label:'SQL', color:'#f43f5e' },
  { key:'powershell', label:'PowerShell', color:'#3b82f6' },
  { key:'php', label:'PHP', color:'#8b5cf6' },
  { key:'go', label:'Go', color:'#06b6d4' },
  { key:'rust', label:'Rust', color:'#ef4444' },
  { key:'outro', label:'Outro', color:'#6b7280' },
]

const CATS: { key: Cat; label: string }[] = [
  { key:'automacao', label:'Automação' },
  { key:'deploy', label:'Deploy' },
  { key:'backup', label:'Backup' },
  { key:'monitoramento', label:'Monitoramento' },
  { key:'dados', label:'Dados' },
  { key:'infra', label:'Infra' },
  { key:'util', label:'Utilitário' },
  { key:'outro', label:'Outro' },
]

const EMPTY: ScriptData = {
  title:'', lang:'bash', categoria:'util', descricao:'', code:'',
  uso:'', dependencias:'', so:'', notas:'', tags:'',
}

export default function ScriptsModule({ module, workspaceId, items, addItem, removeItem, toggleStar }: ModuleProps) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<ScriptData>({...EMPTY})
  const [filterLang, setFilterLang] = useState<string>('todos')
  const [expanded, setExpanded] = useState<string|null>(null)
  const [copied, setCopied] = useState<string|null>(null)

  function set(patch: Partial<ScriptData>) { setForm(p=>({...p,...patch})) }

  function handleAdd() {
    if (!form.title.trim()||!form.code.trim()) return
    addItem({
      workspaceId, moduleId: module.id, contentType: 'scripts',
      data: form as unknown as Record<string,unknown>,
      tags: form.tags.split(',').map(t=>t.trim()).filter(Boolean),
      starred: false,
    })
    setShowForm(false)
    setForm({...EMPTY})
  }

  function copyCode(text: string, id: string) {
    navigator.clipboard.writeText(text).catch(()=>{})
    setCopied(id)
    setTimeout(()=>setCopied(null), 1800)
  }

  const langs = [...new Set(items.map(i=>(i.data as unknown as ScriptData).lang).filter(Boolean))]
  const visible = filterLang==='todos' ? items : items.filter(i=>(i.data as unknown as ScriptData).lang===filterLang)

  return (
    <div>
      <div className={s.moduleHeader}>
        <h2 className={s.moduleTitle}>{module.name}</h2>
        <button className={s.addBtn} onClick={()=>setShowForm(true)}>+ Novo script</button>
      </div>

      {langs.length>0 && (
        <div className={s.filterRow}>
          <button className={`${s.filterBtn} ${filterLang==='todos'?s.active:''}`} onClick={()=>setFilterLang('todos')}>Todos</button>
          {langs.map(l=>{
            const li = LANGS.find(x=>x.key===l)
            return (
              <button key={l} className={`${s.filterBtn} ${filterLang===l?s.active:''}`} onClick={()=>setFilterLang(l)}
                style={filterLang===l&&li?{borderColor:li.color,color:li.color}:{}}>
                {li?.label||l}
              </button>
            )
          })}
        </div>
      )}

      {visible.length===0 ? (
        <div className={s.empty}>
          <div className={s.emptyIcon}>{'</>'}</div>
          <div className={s.emptyTitle}>Nenhum script ainda</div>
          <div className={s.emptyDesc}>Salve scripts e comandos úteis com documentação e exemplos de uso.</div>
        </div>
      ) : (
        <div className={d.list}>
          {visible.map(item=>{
            const data = item.data as unknown as ScriptData
            const isOpen = expanded===item.id
            const langInfo = LANGS.find(l=>l.key===data.lang)
            const catInfo = CATS.find(c=>c.key===data.categoria)
            return (
              <div key={item.id} className={`${d.card} ${item.starred?d.starred:''}`}
                style={langInfo?{borderLeft:`3px solid ${langInfo.color}`}:{}}>

                <div className={d.cardTop} onClick={()=>setExpanded(isOpen?null:item.id)}>
                  <div className={d.badges}>
                    {langInfo && <span className={d.langBadge} style={{background:`color-mix(in srgb,${langInfo.color} 15%,transparent)`,color:langInfo.color}}>{langInfo.label}</span>}
                    {catInfo && <span className={d.catBadge}>{catInfo.label}</span>}
                    {data.so && <span className={d.osBadge}>{data.so}</span>}
                  </div>
                  <div className={d.cardActions}>
                    <button className={`${s.starBtn} ${item.starred?s.starActive:''}`} onClick={e=>{e.stopPropagation();toggleStar(item.id)}}>{item.starred?'★':'☆'}</button>
                    <DeleteBtn onConfirm={()=>removeItem(item.id)}/>
                    <span className={d.chevron}>{isOpen?'↑':'↓'}</span>
                  </div>
                </div>

                <div className={d.cardTitle}>{data.title}</div>
                {data.descricao && <div className={d.desc}>{data.descricao}</div>}

                {/* Code block — always visible, truncated */}
                <div className={d.codeBlock}>
                  <div className={d.codeHeader}>
                    <span className={d.codeLang}>{langInfo?.label||data.lang}</span>
                    <button className={s.copyPromptBtn} onClick={e=>{e.stopPropagation();copyCode(data.code, item.id)}}>
                      {copied===item.id ? '✓ Copiado' : 'Copiar'}
                    </button>
                  </div>
                  <pre className={d.code}>{isOpen ? data.code : (data.code.length>400 ? data.code.slice(0,400)+'…' : data.code)}</pre>
                </div>

                {isOpen && (
                  <div className={d.expanded}>
                    {data.uso && <div className={d.section}><div className={d.sLabel}>Exemplo de uso</div><pre className={d.usoPre}>{data.uso}</pre></div>}
                    {data.dependencias && <div className={d.section}><div className={d.sLabel}>Dependências</div><p className={d.sText}>{data.dependencias}</p></div>}
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
          <div className={s.formModal} style={{width:620}}>
            <h3 className={s.formTitle}>Novo script</h3>
            <div className={s.formGrid}>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Nome do script *</label>
                <input className={s.input} value={form.title} onChange={e=>set({title:e.target.value})} placeholder="Ex: Backup automático do banco" autoFocus/>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Linguagem</label>
                <select className={s.input} value={form.lang} onChange={e=>set({lang:e.target.value as Lang})}>
                  {LANGS.map(l=><option key={l.key} value={l.key}>{l.label}</option>)}
                </select>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Categoria</label>
                <select className={s.input} value={form.categoria} onChange={e=>set({categoria:e.target.value as Cat})}>
                  {CATS.map(c=><option key={c.key} value={c.key}>{c.label}</option>)}
                </select>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Sistema operacional</label>
                <input className={s.input} value={form.so} onChange={e=>set({so:e.target.value})} placeholder="Linux, macOS, Windows, Universal"/>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Dependências</label>
                <input className={s.input} value={form.dependencias} onChange={e=>set({dependencias:e.target.value})} placeholder="curl, jq, python 3.10+..."/>
              </div>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Descrição</label>
                <input className={s.input} value={form.descricao} onChange={e=>set({descricao:e.target.value})} placeholder="O que esse script faz..."/>
              </div>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Código *</label>
                <textarea className={`${s.textarea} ${d.codeTextarea}`} value={form.code} onChange={e=>set({code:e.target.value})} placeholder="#!/bin/bash&#10;# coloque o código aqui..." rows={8}/>
              </div>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Exemplo de uso</label>
                <textarea className={`${s.textarea} ${d.codeTextarea}`} value={form.uso} onChange={e=>set({uso:e.target.value})} rows={3} placeholder="./script.sh --param valor"/>
              </div>
              <div className={`${s.formGroup} ${s.fullWidth}`}>
                <label className={s.label}>Observações</label>
                <textarea className={s.textarea} value={form.notas} onChange={e=>set({notas:e.target.value})} rows={2} placeholder="Cuidados, limitações, versões testadas..."/>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Tags</label>
                <input className={s.input} value={form.tags} onChange={e=>set({tags:e.target.value})} placeholder="cron, database, prod"/>
              </div>
            </div>
            <div className={s.formFooter}>
              <button className={s.cancelBtn} onClick={()=>setShowForm(false)}>Cancelar</button>
              <button className={s.saveBtn} onClick={handleAdd} disabled={!form.title.trim()||!form.code.trim()}>Salvar script</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
