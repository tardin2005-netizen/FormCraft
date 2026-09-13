import { useState } from 'react'
import { ALL_TOOLS, TOOL_CATS, PRICING_COLOR, PRICING_LABEL, type ToolCategory } from '../data/tools'
import { useSavedToolsStore } from '../store/savedToolsStore'
import s from './ToolLibrary.module.css'

export default function ToolLibrary() {
  const [cat, setCat]       = useState<ToolCategory>('Todas')
  const [search, setSearch] = useState('')
  const { isSaved, saveTool, unsaveTool } = useSavedToolsStore()

  const filtered = ALL_TOOLS.filter(t =>
    (cat === 'Todas' || t.cat === cat) &&
    (t.name.toLowerCase().includes(search.toLowerCase()) ||
     t.desc.toLowerCase().includes(search.toLowerCase()) ||
     t.cat.toLowerCase().includes(search.toLowerCase()))
  )

  const saved = ALL_TOOLS.filter(t => isSaved(t.name))

  return (
    <div className={s.page}>
      <div className={s.pageHeader}>
        <div>
          <h1 className={s.title}>Biblioteca de Ferramentas</h1>
          <p className={s.sub}>{ALL_TOOLS.length} ferramentas curadas — salve as que você usa no painel lateral</p>
        </div>
      </div>

      {saved.length > 0 && (
        <section className={s.savedSection}>
          <div className={s.sectionLabel}>SUAS FERRAMENTAS</div>
          <div className={s.savedGrid}>
            {saved.map(t => (
              <a key={t.name} href={t.url} target="_blank" rel="noopener noreferrer" className={s.savedChip}>
                <span className={s.chipIcon} style={{ background: t.color }}>{t.letter}</span>
                <span>{t.name}</span>
              </a>
            ))}
          </div>
        </section>
      )}

      <div className={s.controls}>
        <div className={s.cats}>
          {TOOL_CATS.map(c => (
            <button
              key={c}
              className={`${s.catBtn} ${cat === c ? s.catActive : ''}`}
              onClick={() => setCat(c)}
            >{c}</button>
          ))}
        </div>
        <input
          className={s.searchInput}
          placeholder="Buscar ferramenta ou categoria..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className={s.grid}>
        {filtered.map(t => {
          const saved = isSaved(t.name)
          return (
            <div key={t.name} className={s.card}>
              <div className={s.cardTop}>
                <div className={s.cardIcon} style={{ background: t.color }}>{t.letter}</div>
                <div className={s.cardMeta}>
                  <span className={s.cardCat}>{t.cat}</span>
                  <span className={s.cardPricing} style={{ color: PRICING_COLOR[t.pricing] }}>
                    {PRICING_LABEL[t.pricing]}
                  </span>
                </div>
              </div>
              <div className={s.cardName}>{t.name}</div>
              <div className={s.cardDesc}>{t.desc}</div>
              <div className={s.cardActions}>
                <a
                  href={t.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={s.openBtn}
                >
                  Abrir →
                </a>
                <button
                  className={`${s.saveBtn} ${saved ? s.savedBtn : ''}`}
                  onClick={() => saved ? unsaveTool(t.name) : saveTool(t.name)}
                >
                  {saved ? '✓ Salva' : '+ Salvar'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className={s.empty}>
          <div className={s.emptyIcon}>🔍</div>
          <div>Nenhuma ferramenta encontrada para "{search}"</div>
        </div>
      )}
    </div>
  )
}
