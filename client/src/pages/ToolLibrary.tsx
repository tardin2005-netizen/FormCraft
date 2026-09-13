import { useState } from 'react'
import { ALL_TOOLS, TOOL_CATS, PRICING_COLOR, PRICING_LABEL, type ToolCategory } from '../data/tools'
import { useSavedToolsStore } from '../store/savedToolsStore'
import s from './ToolLibrary.module.css'

export default function ToolLibrary() {
  const [cat, setCat]       = useState<ToolCategory>('Todas')
  const [search, setSearch] = useState('')
  const { isSaved, saveTool, unsaveTool } = useSavedToolsStore()

  const filtered = (() => {
    const matches = ALL_TOOLS.filter(t =>
      (cat === 'Todas' || t.cat === cat) &&
      (t.name.toLowerCase().includes(search.toLowerCase()) ||
       t.desc.toLowerCase().includes(search.toLowerCase()) ||
       t.cat.toLowerCase().includes(search.toLowerCase()))
    )
    const saved = matches.filter(t => isSaved(t.name))
    const rest  = matches.filter(t => !isSaved(t.name))
    return [...saved, ...rest]
  })()

  return (
    <div className={s.page}>
      <div className={s.pageHeader}>
        <div>
          <h1 className={s.title}>Biblioteca de Ferramentas</h1>
          <p className={s.sub}>{ALL_TOOLS.length} ferramentas curadas — salve as que você usa no painel lateral</p>
        </div>
        <input
          className={s.searchInput}
          placeholder="🔍 Buscar ferramenta..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className={s.cats}>
        {TOOL_CATS.map(c => (
          <button
            key={c}
            className={`${s.catBtn} ${cat === c ? s.catActive : ''}`}
            onClick={() => setCat(c)}
          >{c}</button>
        ))}
      </div>

      <div className={s.grid}>
        {filtered.map(t => {
          const saved = isSaved(t.name)
          return (
            <div key={t.name} className={s.card}>
              {/* Header */}
              <div className={s.cardHeader}>
                <div className={s.cardIcon} style={{ background: t.color }}>{t.letter}</div>
                <div className={s.cardMeta}>
                  <div className={s.cardName}>{t.name}</div>
                  <div className={s.cardCat}>Por {t.cat}</div>
                </div>
                {saved
                  ? <span className={s.savedStar}>★</span>
                  : <span className={s.pricingBadge} style={{ color: PRICING_COLOR[t.pricing], background: PRICING_COLOR[t.pricing] + '22' }}>{PRICING_LABEL[t.pricing]}</span>
                }
              </div>

              {/* Description */}
              <div className={s.cardDesc}>{t.desc}</div>

              {/* Actions */}
              <div className={s.cardActions}>
                <a
                  href={t.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={s.openBtn}
                >
                  + Abrir
                </a>
                <button
                  className={`${s.saveBtn} ${saved ? s.savedBtn : ''}`}
                  onClick={() => saved ? unsaveTool(t.name) : saveTool(t.name)}
                >
                  {saved ? '★ Salva' : '☆ Salvar'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className={s.empty}>
          <div>🔍</div>
          <div>Nenhuma ferramenta encontrada para "{search}"</div>
        </div>
      )}
    </div>
  )
}
