import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useThemeStore } from '../store/themeStore'
import s from './Dashboard.module.css'

interface Props { onOpenSearch: () => void }

type SelectedType = 'pdf' | 'image' | 'none'

const AREAS = [
  { id: 'ux', emoji: '🎨', title: 'UX & Design', count: 24 },
  { id: 'dev', emoji: '💻', title: 'Desenvolvimento', count: 18 },
  { id: 'faculdade', emoji: '📚', title: 'Faculdade', count: 31 },
  { id: 'musica', emoji: '🎵', title: 'Música', count: 9 },
  { id: 'negocios', emoji: '💼', title: 'Negócios', count: 15 },
  { id: 'pessoal', emoji: '🌱', title: 'Pessoal', count: 7 },
]

const RECENT = [
  { type: 'pdf', icon: '📄', title: 'Princípios de Design Visual.pdf', area: 'UX & Design', time: '2h atrás' },
  { type: 'link', icon: '🔗', title: 'Figma Handbook', area: 'UX & Design', time: '5h atrás' },
  { type: 'note', icon: '📝', title: 'Ideias para o TCC', area: 'Faculdade', time: 'ontem' },
  { type: 'image', icon: '🖼️', title: 'Moodboard marca pessoal', area: 'Design', time: '2 dias' },
  { type: 'prompt', icon: '🤖', title: 'Prompt para geração de paleta', area: 'UX & Design', time: '3 dias' },
]

const CONTEXT_TOOLS: Record<string, { label: string; tools: string[] }> = {
  pdf: {
    label: 'PDF selecionado',
    tools: ['Resumir documento', 'Extrair tópicos', 'Criar flashcards', 'Buscar trecho'],
  },
  image: {
    label: 'Imagem selecionada',
    tools: ['Descrever imagem', 'Extrair paleta', 'Identificar fontes', 'Gerar variações'],
  },
}

export default function Dashboard({ onOpenSearch }: Props) {
  const { theme, toggle } = useThemeStore()
  const [selectedType, setSelectedType] = useState<SelectedType>('none')

  return (
    <div className={s.layout}>
      {/* Sidebar */}
      <aside className={s.sidebar}>
        <div className={s.logo}>⬡ FormCraft</div>

        <nav className={s.nav}>
          <Link to="/" className={`${s.navItem} ${s.navActive}`}>🏠 Dashboard</Link>
          <Link to="/inbox" className={s.navItem}>📥 Inbox</Link>
          <Link to="/colecoes" className={s.navItem}>🗂️ Coleções</Link>
          <Link to="/settings" className={s.navItem}>⚙️ Configurações</Link>
        </nav>

        <div className={s.sidebarSection}>
          <div className={s.sectionLabel}>Áreas</div>
          {AREAS.map((a) => (
            <Link key={a.id} to={`/area/${a.id}`} className={s.areaItem}>
              <span>{a.emoji}</span>
              <span className={s.areaTitle}>{a.title}</span>
              <span className={s.areaCount}>{a.count}</span>
            </Link>
          ))}
        </div>

        <div className={s.sidebarBottom}>
          {/* Contexto de ferramentas */}
          <div className={s.contextSwitch}>
            <button
              className={`${s.contextBtn} ${selectedType === 'none' ? s.contextActive : ''}`}
              onClick={() => setSelectedType('none')}
              title="Geral"
            >—</button>
            <button
              className={`${s.contextBtn} ${selectedType === 'pdf' ? s.contextActive : ''}`}
              onClick={() => setSelectedType(selectedType === 'pdf' ? 'none' : 'pdf')}
              title="PDF"
            >📄</button>
            <button
              className={`${s.contextBtn} ${selectedType === 'image' ? s.contextActive : ''}`}
              onClick={() => setSelectedType(selectedType === 'image' ? 'none' : 'image')}
              title="Imagem"
            >🖼️</button>
          </div>

          {selectedType !== 'none' ? (
            <div className={s.contextPanel}>
              <div className={s.contextLabel}>{CONTEXT_TOOLS[selectedType].label}</div>
              {CONTEXT_TOOLS[selectedType].tools.map((t) => (
                <button key={t} className={s.contextTool}>{t}</button>
              ))}
            </div>
          ) : (
            <button className={s.searchKbdBtn} onClick={onOpenSearch}>
              🔎 Buscar <kbd className={s.kbdHint}>⌘K</kbd>
            </button>
          )}

          <button className={s.themeBtn} onClick={toggle}>
            {theme === 'dark' ? '☀️ Modo claro' : '🌙 Modo escuro'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className={s.main}>
        <header className={s.header}>
          <div>
            <h1 className={s.greeting}>Olá, Charles 👋</h1>
            <p className={s.subtitle}>Seu hub de conhecimento pessoal</p>
          </div>
          <button className={s.addBtn} onClick={onOpenSearch}>+ Adicionar</button>
        </header>

        {/* Stats */}
        <div className={s.stats}>
          <div className={s.statCard}>
            <div className={s.statNum}>104</div>
            <div className={s.statLabel}>Itens salvos</div>
          </div>
          <div className={s.statCard}>
            <div className={s.statNum}>6</div>
            <div className={s.statLabel}>Áreas</div>
          </div>
          <div className={s.statCard}>
            <div className={s.statNum}>12</div>
            <div className={s.statLabel}>Esta semana</div>
          </div>
          <div className={s.statCard}>
            <div className={s.statNum}>3</div>
            <div className={s.statLabel}>Coleções</div>
          </div>
        </div>

        {/* Áreas Grid */}
        <section className={s.section}>
          <h2 className={s.sectionTitle}>Áreas de Conhecimento</h2>
          <div className={s.areasGrid}>
            {AREAS.map((a) => (
              <Link key={a.id} to={`/area/${a.id}`} className={s.areaCard}>
                <div className={s.areaCardEmoji}>{a.emoji}</div>
                <div className={s.areaCardTitle}>{a.title}</div>
                <div className={s.areaCardCount}>{a.count} itens</div>
              </Link>
            ))}
          </div>
        </section>

        {/* Recentes */}
        <section className={s.section}>
          <h2 className={s.sectionTitle}>Adicionados recentemente</h2>
          <div className={s.recentList}>
            {RECENT.map((r, i) => (
              <div key={i} className={s.recentItem}>
                <span className={s.recentIcon}>{r.icon}</span>
                <div className={s.recentInfo}>
                  <div className={s.recentTitle}>{r.title}</div>
                  <div className={s.recentMeta}>{r.area} · {r.time}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
