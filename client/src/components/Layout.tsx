import { useState, useRef, useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Hexagon, Inbox, BookMarked, Wrench, Settings,
  LogOut, Search, Link2, Sun, Moon, PanelLeft, Grid2X2,
} from 'lucide-react'
import { useThemeStore, ACCENT_COLORS } from '../store/themeStore'
import { useAreasStore } from '../store/areasStore'
import { useSidebarStore } from '../store/sidebarStore'
import { useSavedToolsStore } from '../store/savedToolsStore'
import type { Accent } from '../store/themeStore'
import { useAuth } from '../contexts/AuthContext'
import { ALL_TOOLS, TOOL_CATS, type ToolCategory } from '../data/tools'
import SearchPalette from './SearchPalette'
import SaveLinkModal from './SaveLinkModal'
import QuickNote from './QuickNote'
import s from './Layout.module.css'

const ACCENT_LABELS: Record<Accent, string> = {
  violet: 'Violeta', blue: 'Azul', green: 'Verde', orange: 'Laranja', pink: 'Rosa',
}

const NAV_ITEMS = [
  { to: '/',            Icon: LayoutDashboard, label: 'Início' },
  { to: '/hubs',        Icon: Hexagon,         label: 'Meus Hubs' },
  { to: '/inbox',       Icon: Inbox,           label: 'Inbox' },
  { to: '/colecoes',    Icon: BookMarked,      label: 'Coleções' },
  { to: '/ferramentas', Icon: Wrench,          label: 'Ferramentas' },
  { to: '/settings',    Icon: Settings,        label: 'Config.' },
]

const LEFT_W  = { expanded: 220, compact: 56, hidden: 0 }
const RIGHT_W = { expanded: 264, compact: 48, hidden: 0 }

export default function Layout() {
  const { theme, toggle, accent, setAccent } = useThemeStore()
  const { areas } = useAreasStore()
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const { leftState, rightState, cycleLeft, cycleRight, setLeft, setRight } = useSidebarStore()
  const { saved: savedToolNames, isSaved, saveTool, unsaveTool } = useSavedToolsStore()

  const [searchOpen,    setSearchOpen]    = useState(false)
  const [saveLinkOpen,  setSaveLinkOpen]  = useState(false)
  const [settingsOpen,  setSettingsOpen]  = useState(false)
  const [quickNoteOpen, setQuickNoteOpen] = useState(false)
  const [toolCat,      setToolCat]      = useState<ToolCategory>('Todas')
  const [toolSearch,   setToolSearch]   = useState('')

  const avatarRef   = useRef<HTMLButtonElement>(null)
  const settingsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(v => !v) }
      if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); setSaveLinkOpen(v => !v) }
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') { e.preventDefault(); setQuickNoteOpen(v => !v) }
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') { e.preventDefault(); cycleLeft() }
      if (e.key === 'Escape') { setSearchOpen(false); setSettingsOpen(false); setSaveLinkOpen(false); setQuickNoteOpen(false) }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

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

  function getInitials(name: string | null) {
    if (!name) return '?'
    return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
  }

  const filteredTools = (() => {
    const matches = ALL_TOOLS.filter(t =>
      (toolCat === 'Todas' || t.cat === toolCat) &&
      (t.name.toLowerCase().includes(toolSearch.toLowerCase()) ||
       t.desc.toLowerCase().includes(toolSearch.toLowerCase()))
    )
    const saved = matches.filter(t => isSaved(t.name))
    const rest  = matches.filter(t => !isSaved(t.name))
    return [...saved, ...rest]
  })()

  const leftW  = LEFT_W[leftState]
  const rightW = RIGHT_W[rightState]
  const isLeftHidden  = leftState  === 'hidden'
  const isRightHidden = rightState === 'hidden'

  return (
    <div className={s.shell}>

      {/* ── Left sidebar ── */}
      <motion.aside
        className={s.left}
        animate={{ width: leftW }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        style={{ overflow: 'hidden', flexShrink: 0 }}
      >
        {leftState !== 'hidden' && (
          <>
            <div className={s.leftHeader}>
              <AnimatePresence initial={false}>
                {leftState === 'expanded' && (
                  <motion.span
                    className={s.logo}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: .15 }}
                  >⬡ FormCraft</motion.span>
                )}
              </AnimatePresence>
              {leftState === 'compact' && <span className={s.logoMini}>⬡</span>}
              <button
                className={s.collapseBtn}
                onClick={cycleLeft}
                title={leftState === 'expanded' ? 'Compactar (⌘\\)' : 'Ocultar'}
              >
                <motion.span
                  animate={{ rotate: leftState === 'expanded' ? 180 : 0 }}
                  transition={{ duration: .2 }}
                >›</motion.span>
              </button>
            </div>

            <nav className={s.leftNav}>
              {NAV_ITEMS.map(({ to, Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `${s.navItem} ${isActive ? s.navActive : ''} ${leftState === 'compact' ? s.navCompact : ''}`
                  }
                  title={leftState === 'compact' ? label : undefined}
                >
                  <Icon size={16} className={s.navIcon} />
                  <AnimatePresence initial={false}>
                    {leftState === 'expanded' && (
                      <motion.span
                        className={s.navLabel}
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: .15 }}
                      >{label}</motion.span>
                    )}
                  </AnimatePresence>
                </NavLink>
              ))}
            </nav>

            <AnimatePresence initial={false}>
              {leftState === 'expanded' && (
                <motion.div
                  className={s.areasSection}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: .15 }}
                >
                  <div className={s.areasLabel}>Áreas</div>
                  {areas.map((a, i) => (
                    <motion.div
                      key={a.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * .04, duration: .2 }}
                    >
                      <NavLink
                        to={`/area/${a.id}`}
                        className={({ isActive }) => `${s.areaItem} ${isActive ? s.navActive : ''}`}
                      >
                        <span>{a.emoji}</span>
                        <span className={s.areaItemTitle}>{a.title}</span>
                        <span className={s.areaItemCount}>{a.count}</span>
                      </NavLink>
                    </motion.div>
                  ))}
                  <button className={s.addAreaBtn} onClick={() => navigate('/?nova-area=1')}>
                    + Nova área
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {leftState === 'compact' && (
              <div className={s.areasIconsOnly}>
                {areas.map(a => (
                  <NavLink
                    key={a.id}
                    to={`/area/${a.id}`}
                    className={({ isActive }) => `${s.areaIconItem} ${isActive ? s.navActive : ''}`}
                    title={a.title}
                  >{a.emoji}</NavLink>
                ))}
              </div>
            )}

            <div className={s.leftBottom}>
              <AnimatePresence initial={false} mode="wait">
                {leftState === 'expanded' ? (
                  <motion.div
                    key="exp"
                    className={s.userCard}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: .15 }}
                  >
                    <div
                      className={s.userAvatar}
                      style={user?.photoURL ? { padding: 0, overflow: 'hidden' } : {}}
                    >
                      {user?.photoURL
                        ? <img src={user.photoURL} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} referrerPolicy="no-referrer" />
                        : getInitials(user?.displayName ?? null)
                      }
                    </div>
                    <div className={s.userInfo}>
                      <div className={s.userName}>{user?.displayName ?? 'Usuário'}</div>
                      <div className={s.userEmail}>{user?.email ?? ''}</div>
                    </div>
                    <button className={s.userSignOut} onClick={signOut} title="Sair da conta">
                      <LogOut size={14} />
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="cmp"
                    className={s.userAvatarCompact}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: .15 }}
                  >
                    <div
                      className={s.userAvatarIcon}
                      style={user?.photoURL ? { padding: 0, overflow: 'hidden' } : {}}
                      title={user?.displayName ?? 'Usuário'}
                    >
                      {user?.photoURL
                        ? <img src={user.photoURL} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} referrerPolicy="no-referrer" />
                        : getInitials(user?.displayName ?? null)
                      }
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        )}
      </motion.aside>

      {/* Sliver: show left sidebar when hidden */}
      {isLeftHidden && (
        <div className={s.leftSliver} onClick={() => setLeft('compact')} title="Mostrar sidebar (⌘\\)" />
      )}

      {/* ── Main wrapper ── */}
      <div className={s.mainWrapper}>
        <header className={s.topBar}>
          <div className={s.topLeft}>
            {isLeftHidden && (
              <button
                className={s.topIconBtn}
                onClick={() => setLeft('compact')}
                title="Mostrar sidebar (⌘\\)"
              >
                <PanelLeft size={15} />
              </button>
            )}
            <span className={s.topLogo}>⬡ FormCraft</span>
          </div>

          <div className={s.topActions}>
            <button className={s.topSearchBtn} onClick={() => setSearchOpen(true)}>
              <Search size={13} /> Buscar <kbd className={s.topKbd}>⌘K</kbd>
            </button>
            <button className={s.topSaveLinkBtn} onClick={() => setSaveLinkOpen(true)} title="Salvar link (⌘S)">
              <Link2 size={15} />
            </button>
            <button
              className={`${s.topIconBtn} ${rightState !== 'hidden' ? s.topIconActive : ''}`}
              onClick={cycleRight}
              title={
                rightState === 'expanded' ? 'Compactar ferramentas' :
                rightState === 'compact'  ? 'Ocultar ferramentas' : 'Mostrar ferramentas'
              }
            >
              <Grid2X2 size={15} />
            </button>
            <button className={s.topIconBtn} onClick={toggle} title="Tema">
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <div className={s.avatarWrapper}>
              <button
                ref={avatarRef}
                className={s.avatar}
                onClick={() => setSettingsOpen(v => !v)}
                style={user?.photoURL ? { padding: 0, overflow: 'hidden' } : {}}
              >
                {user?.photoURL
                  ? <img src={user.photoURL} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} referrerPolicy="no-referrer" />
                  : getInitials(user?.displayName ?? null)
                }
              </button>
              <AnimatePresence>
                {settingsOpen && (
                  <motion.div
                    ref={settingsRef}
                    className={s.settingsPopup}
                    initial={{ opacity: 0, y: -8, scale: .96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: .96 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  >
                    <div className={s.settingsUser}>
                      <div className={s.settingsAvatar} style={user?.photoURL ? { padding: 0, overflow: 'hidden' } : {}}>
                        {user?.photoURL
                          ? <img src={user.photoURL} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} referrerPolicy="no-referrer" />
                          : getInitials(user?.displayName ?? null)
                        }
                      </div>
                      <div>
                        <div className={s.settingsName}>{user?.displayName ?? 'Usuário'}</div>
                        <div className={s.settingsEmail}>{user?.email ?? ''}</div>
                      </div>
                    </div>
                    <div className={s.settingsDivider} />
                    <div className={s.settingsRow}>
                      <span className={s.settingsRowLabel}>Tema</span>
                      <div className={s.themeToggle}>
                        <button className={`${s.themeOpt} ${theme === 'dark' ? s.themeOptActive : ''}`}
                          onClick={() => useThemeStore.getState().setTheme('dark')}>🌙</button>
                        <button className={`${s.themeOpt} ${theme === 'bw' ? s.themeOptActive : ''}`}
                          onClick={() => useThemeStore.getState().setTheme('bw')}>☀️</button>
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
                    <div className={s.settingsRow}>
                      <span className={s.settingsRowLabel}>Sidebar</span>
                      <div className={s.sidebarPills}>
                        {(['expanded','compact','hidden'] as const).map(st => (
                          <button
                            key={st}
                            className={`${s.sidebarPill} ${leftState === st ? s.sidebarPillActive : ''}`}
                            onClick={() => setLeft(st)}
                            title={st}
                          >
                            {st === 'expanded' ? '◧' : st === 'compact' ? '◫' : '□'}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className={s.settingsDivider} />
                    <NavLink to="/settings" className={s.settingsLink} onClick={() => setSettingsOpen(false)}>
                      ⚙️ Ver todas as configurações →
                    </NavLink>
                    <div className={s.settingsDivider} />
                    <button
                      className={s.settingsLogout}
                      onClick={() => { signOut(); setSettingsOpen(false) }}
                    >🚪 Sair da conta</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main className={s.content}>
          <Outlet context={{ onOpenSearch: () => setSearchOpen(true), onOpenSaveLink: () => setSaveLinkOpen(true) }} />
        </main>
      </div>

      {/* ── Right sidebar (Tools) ── */}
      <motion.aside
        className={s.right}
        animate={{ width: rightW }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        style={{ overflow: 'hidden', flexShrink: 0 }}
      >
        {rightState === 'compact' && (
          <motion.div
            key="compact"
            className={s.rightCompact}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: .15 }}
          >
            <button className={s.rightExpandBtn} onClick={() => setRight('expanded')} title="Expandir ferramentas">
              <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="1" y="1" width="6" height="6" rx="1.5"/>
                <rect x="9" y="1" width="6" height="6" rx="1.5"/>
                <rect x="1" y="9" width="6" height="6" rx="1.5"/>
                <rect x="9" y="9" width="6" height="6" rx="1.5"/>
              </svg>
            </button>
            {TOOL_CATS.filter(c => c !== 'Todas').map(c => (
              <button
                key={c}
                className={`${s.catIconBtn} ${toolCat === c ? s.catIconActive : ''}`}
                onClick={() => { setToolCat(c); setRight('expanded') }}
                title={c}
              >
                {c === 'IA & Pesquisa' ? '🤖' :
                 c === 'Imagem & Design' ? '🎨' :
                 c === 'Criar vídeo' ? '🎬' :
                 c === 'Áudio & Voz' ? '🔊' :
                 c === 'Métricas' ? '📊' :
                 c === 'Banco de Imagens' ? '🖼️' : '◈'}
              </button>
            ))}
          </motion.div>
        )}

        {rightState === 'expanded' && (
          <motion.div
            key="expanded"
            className={s.rightExpanded}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: .15 }}
          >
            <div className={s.rightHeader}>
              <span className={s.rightTitle}>🛠️ Ferramentas</span>
              <button className={s.rightCollapseBtn} onClick={cycleRight} title="Compactar">›</button>
            </div>

            <div className={s.toolCats}>
              {TOOL_CATS.map(c => (
                <button
                  key={c}
                  className={`${s.toolCatBtn} ${toolCat === c ? s.toolCatActive : ''}`}
                  onClick={() => setToolCat(c)}
                >{c}</button>
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
              {filteredTools.map((t, i) => (
                <motion.a
                  key={t.name}
                  href={t.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={s.toolItem}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * .02, duration: .18 }}
                  whileHover={{ backgroundColor: 'var(--surface2)' }}
                >
                  <span className={s.toolIcon} style={{ background: t.color }}>{t.letter}</span>
                  <span className={s.toolInfo}>
                    <span className={s.toolName}>
                      {isSaved(t.name) && <span className={s.toolStar}>★</span>}
                      {t.name}
                    </span>
                    <span className={s.toolDesc}>{t.desc}</span>
                  </span>
                  <button
                    className={`${s.toolSaveBtn} ${isSaved(t.name) ? s.toolSaved : ''}`}
                    onClick={e => {
                      e.preventDefault()
                      isSaved(t.name) ? unsaveTool(t.name) : saveTool(t.name)
                    }}
                    title={isSaved(t.name) ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
                  >
                    {isSaved(t.name) ? '★' : '☆'}
                  </button>
                </motion.a>
              ))}
            </div>

            <NavLink to="/ferramentas" className={s.toolsFooter}>
              Ver biblioteca completa →
            </NavLink>
          </motion.div>
        )}
      </motion.aside>

      {/* ── Mobile bottom nav ── */}
      <nav className={s.bottomNav}>
        {NAV_ITEMS.slice(0, 5).map(({ to, Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `${s.bottomNavItem} ${isActive ? s.bottomNavActive : ''}`}
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {searchOpen    && <SearchPalette onClose={() => setSearchOpen(false)} />}
      {saveLinkOpen  && <SaveLinkModal onClose={() => setSaveLinkOpen(false)} />}
      <AnimatePresence>{quickNoteOpen && <QuickNote onClose={() => setQuickNoteOpen(false)} />}</AnimatePresence>
    </div>
  )
}
