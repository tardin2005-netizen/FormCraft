import { useState } from 'react'
import { Link } from 'react-router-dom'
import s from './Inbox.module.css'

type ViewMode = 'grid' | 'list' | 'compact'
type FilterType = 'Todos' | 'Links' | 'Notas' | 'Imagens' | 'PDFs' | 'Prompts'

const FILTER_ICONS: Record<FilterType, string> = {
  Todos: '✦', Links: '🔗', Notas: '📝', Imagens: '🖼️', PDFs: '📄', Prompts: '🤖',
}

const ITEMS = [
  { type: 'link', icon: '🔗', title: 'Guia de acessibilidade WCAG', url: 'w3.org', area: 'UX', time: '1h' },
  { type: 'pdf', icon: '📄', title: 'Design Systems Handbook.pdf', url: null, area: 'UX', time: '3h' },
  { type: 'note', icon: '📝', title: 'Ideias para redesign do app', url: null, area: 'Projetos', time: '5h' },
  { type: 'image', icon: '🖼️', title: 'Paleta de cores 2025', url: null, area: 'Design', time: '1d' },
  { type: 'prompt', icon: '🤖', title: 'Prompt: geração de personas', url: null, area: 'IA', time: '1d' },
  { type: 'link', icon: '🔗', title: 'React 19 Release Notes', url: 'react.dev', area: 'Dev', time: '2d' },
  { type: 'note', icon: '📝', title: 'Resumo: aula de tipografia', url: null, area: 'Faculdade', time: '3d' },
  { type: 'pdf', icon: '📄', title: 'Fundamentos de Branding.pdf', url: null, area: 'Marketing', time: '4d' },
]

const FILTER_MAP: Record<FilterType, string> = {
  Todos: '', Links: 'link', Notas: 'note', Imagens: 'image', PDFs: 'pdf', Prompts: 'prompt',
}

export default function Inbox() {
  const [view, setView] = useState<ViewMode>('grid')
  const [filter, setFilter] = useState<FilterType>('Todos')
  const [modalOpen, setModalOpen] = useState(false)

  const filtered = FILTER_MAP[filter]
    ? ITEMS.filter((i) => i.type === FILTER_MAP[filter])
    : ITEMS

  return (
    <div className={s.page}>
      <header className={s.header}>
        <div className={s.headerLeft}>
          <span className={s.logo}>⬡ FormCraft</span>
          <nav className={s.nav}>
            <Link to="/" className={s.navItem}>Dashboard</Link>
            <Link to="/inbox" className={`${s.navItem} ${s.navActive}`}>Inbox</Link>
            <Link to="/colecoes" className={s.navItem}>Coleções</Link>
          </nav>
        </div>
        <button className={s.addBtn} onClick={() => setModalOpen(true)}>+ Adicionar</button>
      </header>

      <div className={s.toolbar}>
        <div className={s.filters}>
          {(Object.keys(FILTER_ICONS) as FilterType[]).map((f) => (
            <button
              key={f}
              className={`${s.filterChip} ${filter === f ? s.filterActive : ''}`}
              onClick={() => setFilter(f)}
            >
              {FILTER_ICONS[f]} {f}
            </button>
          ))}
        </div>
        <div className={s.viewSwitch}>
          {(['grid', 'list', 'compact'] as ViewMode[]).map((v) => (
            <button
              key={v}
              className={`${s.viewBtn} ${view === v ? s.viewActive : ''}`}
              onClick={() => setView(v)}
              title={v}
            >
              {v === 'grid' ? '⊞' : v === 'list' ? '☰' : '≡'}
            </button>
          ))}
        </div>
      </div>

      <div className={`${s.grid} ${s[view]}`}>
        {filtered.map((item, i) => (
          <div key={i} className={s.card}>
            <div className={s.cardIcon}>{item.icon}</div>
            <div className={s.cardBody}>
              <div className={s.cardTitle}>{item.title}</div>
              {item.url && <div className={s.cardUrl}>{item.url}</div>}
              <div className={s.cardMeta}>
                <span className={s.typeBadge}>{item.area}</span>
                <span className={s.cardTime}>{item.time}</span>
              </div>
            </div>
            <button className={s.organizeBtn}>Organizar →</button>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className={s.backdrop} onClick={() => setModalOpen(false)}>
          <div className={s.modal} onClick={(e) => e.stopPropagation()}>
            <h3>Adicionar item</h3>
            <input className={s.modalInput} placeholder="Cole um link ou escreva uma nota..." autoFocus />
            <div className={s.modalBtns}>
              <button className={s.modalCancel} onClick={() => setModalOpen(false)}>Cancelar</button>
              <button className={s.modalSave} onClick={() => setModalOpen(false)}>Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
