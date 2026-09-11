import { useState, useRef, useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useThemeStore, ACCENT_COLORS } from '../store/themeStore'
import { useAreasStore } from '../store/areasStore'
import type { Accent } from '../store/themeStore'
import SearchPalette from './SearchPalette'
import s from './Layout.module.css'

type ToolCategory = 'Todas' | 'IA & Pesquisa' | 'Imagem & Design' | 'Criar vídeo' | 'Áudio & Voz' | 'Métricas'

const ALL_TOOLS = [
  { name: 'Perplexity',    cat: 'IA & Pesquisa',   pricing: 'FREEMIUM',   color: '#1BA1E2', letter: 'P', url: 'https://perplexity.ai' },
  { name: 'Gemini',        cat: 'IA & Pesquisa',   pricing: 'FREEMIUM',   color: '#4285F4', letter: 'G', url: 'https://gemini.google.com' },
  { name: 'Claude',        cat: 'IA & Pesquisa',   pricing: 'FREEMIUM',   color: '#D97757', letter: 'C', url: 'https://claude.ai' },
  { name: 'ChatGPT',       cat: 'IA & Pesquisa',   pricing: 'FREEMIUM',   color: '#10A37F', letter: 'G', url: 'https://chatgpt.com' },
  { name: 'Figma',         cat: 'Imagem & Design', pricing: 'FREEMIUM',   color: '#A259FF', letter: 'F', url: 'https://figma.com' },
  { name: 'Canva',         cat: 'Imagem & Design', pricing: 'FREEMIUM',   color: '#00C4CC', letter: 'C', url: 'https://canva.com' },
  { name: 'Midjourney',    cat: 'Imagem & Design', pricing: 'ASSINATURA', color: '#2D3277', letter: 'M', url: 'https://midjourney.com' },
  { name: 'Adobe Firefly', cat: 'Imagem & Design', pricing: 'FREEMIUM',   color: '#FF0000', letter: 'A', url: 'https://firefly.adobe.com' },
  { name: 'RunwayML',      cat: 'Criar vídeo',     pricing: 'ASSINATURA', color: '#FF4081', letter: 'R', url: 'https://runwayml.com' },
  { name: 'Sora',          cat: 'Criar vídeo',     pricing: 'ASSINATURA', color: '#10A37F', letter: 'S', url: 'https://sora.openai.com' },
  { name: 'Pika',          cat: 'Criar vídeo',     pricing: 'FREEMIUM',   color: '#6366F1', letter: 'P', url: 'https://pika.art' },
  { name: 'ElevenLabs',    cat: 'Áudio & Voz',     pricing: 'FREEMIUM',   color: '#7B61FF', letter: 'E', url: 'https://elevenlabs.io' },
  { name: 'Suno',          cat: 'Áudio & Voz',     pricing: 'FREEMIUM',   color: '#F59E0B', letter: 'S', url: 'https://suno.com' },
  { name: 'Udio',          cat: 'Áudio & Voz',     pricing: 'FREEMIUM',   color: '#EC4899', letter: 'U', url: 'https://udio.com' },
  { name: 'Google Analytics', cat: 'Métricas',     pricing: 'GRATUITO',   color: '#F4B400', letter: 'G', url: 'https://analytics.google.com' },
  { name: 'Hotjar',        cat: 'Métricas',        pricing: 'FREEMIUM',   color: '#FD3A5C', letter: 'H', url: 'https://hotjar.com' },
]

const TOOL_CATS: ToolCategory[] = ['Todas','IA & Pesquisa','Imagem & Design','Criar vídeo','Áudio & Voz','Métricas']
const CAT_ICONS: Record<ToolCategory, string> = {
  'Todas': '✦', 'IA & Pesquisa': '🤖', 'Imagem & Design': '🎨',
  'Criar vídeo': '🎬', 'Áudio & Voz': '🔊', 'Métricas': '📊',
}
const PRICING_COLOR: Record<string, string> = { FREEMIUM: '#f59e0b', GRATUITO: '#3ecf8e', ASSINATURA: '#e46ef7' }

const ACCENT_LABELS: Record<Accent, string> = {
  violet: 'Violeta', blue: 'Azul', green: 'Verde', orange: 'Laranja', pink: 'Rosa',
}

const NAV_ITEMS = [
  { to: '/',          icon: '🏠', label: 'Dashboard' },
  { to: '/inbox',     icon: '📥', label: 'Inbox' },
  { to: '/colecoes',  icon: '🗂️', label: 'Coleções' },
  { to: '/settings',  icon: '⚙️', label: 'Config.' },
]

export default function Layout() {
  const { theme, toggle, accent, setAccent } = useThemeStore()
  const { areas } = useAreasStore()
  const navigate = useNavigate()

  const [leftCollapsed,  setLeftCollapsed]  = useState(false)
  const [rightCollapsed, setRightCollapsed] = useState(false)
  const [searchOpen,     setSearchOpen]     = useState(false)
  const [settingsOpen,   setSettingsOpen]   = useState(false)
  const [toolCat,        setToolCat]        = useState<ToolCategory>('Todas')
  const [toolSearch,     setToolSearch]     = useState('')

  const avatarRef = useRef<HTMLButtonElement>(null)
  const settingsRef = useRef<HTMLDivElement>(null)

  // ⌘K global
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(v => !v) }
      if (e.key === 'Escape') { setSearchOpen(false); setSettingsOpen(false) }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  // Close settings on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (
        settingsRef.current && !settingsRef.current.contains(e.target as Node) &&
        avatarRef.current  && !avatarRef.current.contains(e.target as Node)
      ) setSettingsOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const filteredTools = ALL_TOOLS.filter(t =>
    (toolCat === 'Todas' || t.cat === toolCat) &&
    t.name.toLowerCase().includes(toolSearch.toLowerCase())
  )

  return (
    <div className={s.shell}>
      {/* ── Left Sidebar ── */}
      <aside className={`${s.left} ${leftCollapsed ? s.leftCollapsed : ''}`}>
        <div className={s.leftHeader}>
          {!leftCollapsed && <span className={s.logo}>⬡ FormCraft</span>}
          {leftCollapsed  && <span className={s.logoMini}>⬡</span>}
          <button
            className={s.collapseBtn}
            onClick={() => setLeftCollapsed(v => !v)}
            title={leftCollapsed ? 'Expandir' : 'Recolher'}
          >
            {leftCollapsed ? '›' : '‹'}
          </button>
        </div>

        <nav className={s.leftNav}>
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `${s.navItem} ${isActive ? s.navActive : ''} ${leftCollapsed ? s.navCollapsed : ''}`
              }
              title={leftCollapsed ? item.label : undefined}
            >
              <span className={s.navIcon}>{item.icon}</span>
              {!leftCollapsed && <span className={s.navLabel}>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {!leftCollapsed && (
          <div className={s.areasSection}>
            <div className={s.areasLabel}>Áreas</div>
            {areas.map(a => (
              <NavLink
                key={a.id}
                to={`/area/${a.id}`}
                className={({ isActive }) => `${s.areaItem} ${isActive ? s.navActive : ''}`}
              >
                <span>{a.emoji}</span>
                <span className={s.areaItemTitle}>{a.title}</span>
                <span className={s.areaItemCount}>{a.count}</span>
              </NavLink>
            ))}
            <button className={s.addAreaBtn} onClick={() => navigate('/?nova-area=1')}>
              + Nova área
            </button>
          </div>
        )}

        {leftCollapsed && (
          <div className={s.areasIconsOnly}>
            {areas.map(a => (
              <NavLink
                key={a.id}
                to={`/area/${a.id}`}
                className={({ isActive }) => `${s.areaIconItem} ${isActive ? s.navActive : ''}`}
                title={a.title}
              >
                {a.emoji}
              </NavLink>
            ))}
          </div>
        )}

        <div className={s.leftBottom}>
          {!leftCollapsed ? (
            <>
              <button className={s.searchBtn} onClick={() => setSearchOpen(true)}>
                🔎 Buscar <kbd>⌘K</kbd>
              </button>
              <button className={s.themeBtn} onClick={toggle}>
                {theme === 'dark' ? '☀️ Modo claro' : '🌙 Modo escuro'}
              </button>
            </>
          ) : (
            <>
              <button className={s.iconBtn} onClick={() => setSearchOpen(true)} title="Buscar">🔎</button>
              <button className={s.iconBtn} onClick={toggle} title="Tema">
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
            </>
          )}
        </div>
      </aside>

      {/* ── Main wrapper ── */}
      <div className={s.mainWrapper}>
        {/* Top bar */}
        <header className={s.topBar}>
          <nav className={s.topNav}>
            {NAV_ITEMS.slice(0, 3).map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => `${s.topNavItem} ${isActive ? s.topNavActive : ''}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className={s.topActions}>
            <button className={s.topSearchBtn} onClick={() => setSearchOpen(true)}>
              🔎 Buscar <kbd className={s.topKbd}>⌘K</kbd>
            </button>
            <button
              className={`${s.topIconBtn} ${rightCollapsed ? '' : s.topIconActive}`}
              onClick={() => setRightCollapsed(v => !v)}
              title="Ferramentas"
            >
              <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="1" y="1" width="6" height="6" rx="1.5"/>
                <rect x="9" y="1" width="6" height="6" rx="1.5"/>
                <rect x="1" y="9" width="6" height="6" rx="1.5"/>
                <rect x="9" y="9" width="6" height="6" rx="1.5"/>
              </svg>
            </button>
            <button className={s.topIconBtn} onClick={toggle} title="Tema">
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <div className={s.avatarWrapper}>
              <button
                ref={avatarRef}
                className={s.avatar}
                onClick={() => setSettingsOpen(v => !v)}
                title="Configurações rápidas"
              >
                JT
              </button>
              {settingsOpen && (
                <div ref={settingsRef} className={s.settingsPopup}>
                  <div className={s.settingsUser}>
                    <div className={s.settingsAvatar}>JT</div>
                    <div>
                      <div className={s.settingsName}>Charles</div>
                      <div className={s.settingsEmail}>tardin2005@gmail.com</div>
                    </div>
                  </div>
                  <div className={s.settingsDivider} />
                  <div className={s.settingsRow}>
                    <span className={s.settingsRowLabel}>Tema</span>
                    <div className={s.themeToggle}>
                      <button
                        className={`${s.themeOpt} ${theme === 'dark' ? s.themeOptActive : ''}`}
                        onClick={() => { useThemeStore.getState().setTheme('dark') }}
                      >🌙</button>
                      <button
                        className={`${s.themeOpt} ${theme === 'bw' ? s.themeOptActive : ''}`}
                        onClick={() => { useThemeStore.getState().setTheme('bw') }}
                      >☀️</button>
                    </div>
                  </div>
                  <div className={s.settingsRow}>
                    <span className={s.settingsRowLabel}>Cor de destaque</span>
                    <div className={s.accentPicker}>
                      {(Object.keys(ACCENT_COLORS) as Accent[]).map(a => (
                        <button
                          key={a}
                          className={`${s.accentDot} ${accent === a ? s.accentDotActive : ''}`}
                          style={{ background: ACCENT_COLORS[a].accent }}
                          onClick={() => useThemeStore.getState().setAccent(a)}
                          title={ACCENT_LABELS[a]}
                        />
                      ))}
                    </div>
                  </div>
                  <div className={s.settingsDivider} />
                  <NavLink to="/settings" className={s.settingsLink} onClick={() => setSettingsOpen(false)}>
                    ⚙️ Ver todas as configurações →
                  </NavLink>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className={s.content}>
          <Outlet context={{ onOpenSearch: () => setSearchOpen(true) }} />
        </main>
      </div>

      {/* ── Right Sidebar (Tools) ── */}
      <aside className={`${s.right} ${rightCollapsed ? s.rightCollapsed : ''}`}>
        {rightCollapsed ? (
          <div className={s.rightCollapsedInner}>
            <div className={s.rightCollapsedHeader} title="Ferramentas">🛠️</div>
            {TOOL_CATS.map(c => (
              <button
                key={c}
                className={`${s.catIconBtn} ${toolCat === c ? s.catIconActive : ''}`}
                title={c}
                onClick={() => { setToolCat(c); setRightCollapsed(false) }}
              >
                {CAT_ICONS[c]}
              </button>
            ))}
          </div>
        ) : (
          <>
            <div className={s.rightHeader}>
              <span className={s.rightTitle}>🛠️ Ferramentas</span>
              <button
                className={s.rightCollapseBtn}
                onClick={() => setRightCollapsed(true)}
                title="Recolher"
              >›</button>
            </div>

            <div className={s.toolCats}>
              {TOOL_CATS.map(c => (
                <button
                  key={c}
                  className={`${s.toolCatBtn} ${toolCat === c ? s.toolCatActive : ''}`}
                  onClick={() => setToolCat(c)}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className={s.toolSearchRow}>
              <input
                className={s.toolSearchInput}
                placeholder="🔍 Buscar ferramenta..."
                value={toolSearch}
                onChange={e => setToolSearch(e.target.value)}
              />
            </div>

            <div className={s.toolList}>
              {filteredTools.map(t => (
                <a
                  key={t.name}
                  href={t.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={s.toolItem}
                >
                  <span className={s.toolIcon} style={{ background: t.color }}>{t.letter}</span>
                  <span className={s.toolInfo}>
                    <span className={s.toolName}>{t.name}</span>
                    <span className={s.toolPricing} style={{ color: PRICING_COLOR[t.pricing] }}>
                      {t.pricing}
                    </span>
                  </span>
                </a>
              ))}
            </div>

            <div className={s.toolsFooter}>Ver todas as {ALL_TOOLS.length} ferramentas →</div>
          </>
        )}
      </aside>

      {searchOpen && <SearchPalette onClose={() => setSearchOpen(false)} />}
    </div>
  )
}
