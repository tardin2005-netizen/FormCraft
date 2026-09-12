import { useState, useRef, useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useThemeStore, ACCENT_COLORS } from '../store/themeStore'
import { useAreasStore } from '../store/areasStore'
import type { Accent } from '../store/themeStore'
import { useAuth } from '../contexts/AuthContext'
import SearchPalette from './SearchPalette'
import SaveLinkModal from './SaveLinkModal'
import s from './Layout.module.css'

type ToolCategory = 'Todas' | 'IA & Pesquisa' | 'Imagem & Design' | 'Criar vídeo' | 'Áudio & Voz' | 'Métricas' | 'Banco de Imagens' | 'Ícones & SVG'

const ALL_TOOLS = [
  // IA & Pesquisa
  { name: 'Perplexity',       cat: 'IA & Pesquisa',    pricing: 'FREEMIUM',   color: '#1BA1E2', letter: 'P', url: 'https://perplexity.ai',                 desc: 'Busca com IA e respostas com fontes' },
  { name: 'Gemini',           cat: 'IA & Pesquisa',    pricing: 'FREEMIUM',   color: '#4285F4', letter: 'G', url: 'https://gemini.google.com',              desc: 'IA do Google com multimodalidade' },
  { name: 'Claude',           cat: 'IA & Pesquisa',    pricing: 'FREEMIUM',   color: '#D97757', letter: 'C', url: 'https://claude.ai',                      desc: 'IA da Anthropic, ótima para raciocínio' },
  { name: 'ChatGPT',          cat: 'IA & Pesquisa',    pricing: 'FREEMIUM',   color: '#10A37F', letter: 'G', url: 'https://chatgpt.com',                    desc: 'IA da OpenAI, popular e versátil' },
  { name: 'Grok',             cat: 'IA & Pesquisa',    pricing: 'FREEMIUM',   color: '#1D9BF0', letter: 'X', url: 'https://grok.com',                       desc: 'IA do xAI com acesso ao Twitter/X' },
  { name: 'DeepSeek',         cat: 'IA & Pesquisa',    pricing: 'GRATUITO',   color: '#4A90D9', letter: 'D', url: 'https://deepseek.com',                   desc: 'IA de alta performance com código aberto' },
  { name: 'Copilot',          cat: 'IA & Pesquisa',    pricing: 'FREEMIUM',   color: '#0078D4', letter: 'M', url: 'https://copilot.microsoft.com',          desc: 'Assistente IA integrado ao Microsoft 365' },
  // Imagem & Design
  { name: 'Figma',            cat: 'Imagem & Design',  pricing: 'FREEMIUM',   color: '#A259FF', letter: 'F', url: 'https://figma.com',                      desc: 'Design colaborativo e prototipagem na web' },
  { name: 'Canva',            cat: 'Imagem & Design',  pricing: 'FREEMIUM',   color: '#00C4CC', letter: 'C', url: 'https://canva.com',                      desc: 'Criação gráfica acessível para todos' },
  { name: 'Midjourney',       cat: 'Imagem & Design',  pricing: 'ASSINATURA', color: '#2D3277', letter: 'M', url: 'https://midjourney.com',                 desc: 'Geração de imagens de alta qualidade com IA' },
  { name: 'Adobe Firefly',    cat: 'Imagem & Design',  pricing: 'FREEMIUM',   color: '#FF0000', letter: 'A', url: 'https://firefly.adobe.com',              desc: 'IA generativa integrada ao ecossistema Adobe' },
  { name: 'Framer',           cat: 'Imagem & Design',  pricing: 'FREEMIUM',   color: '#0E0E0E', letter: 'F', url: 'https://framer.com',                     desc: 'Design e prototipagem com animações avançadas' },
  { name: 'Spline',           cat: 'Imagem & Design',  pricing: 'FREEMIUM',   color: '#5F6FFF', letter: 'S', url: 'https://spline.design',                  desc: 'Modelagem e animação 3D no navegador' },
  { name: 'Webflow',          cat: 'Imagem & Design',  pricing: 'FREEMIUM',   color: '#4353FF', letter: 'W', url: 'https://webflow.com',                    desc: 'Criação de sites sem código com CMS' },
  // Criar vídeo
  { name: 'RunwayML',         cat: 'Criar vídeo',      pricing: 'ASSINATURA', color: '#FF4081', letter: 'R', url: 'https://runwayml.com',                   desc: 'Edição e geração de vídeo com IA generativa' },
  { name: 'Sora',             cat: 'Criar vídeo',      pricing: 'ASSINATURA', color: '#10A37F', letter: 'S', url: 'https://sora.openai.com',                desc: 'Geração de vídeos realistas pela OpenAI' },
  { name: 'Pika',             cat: 'Criar vídeo',      pricing: 'FREEMIUM',   color: '#6366F1', letter: 'P', url: 'https://pika.art',                       desc: 'Criação de vídeos curtos com IA' },
  { name: 'Luma AI',          cat: 'Criar vídeo',      pricing: 'FREEMIUM',   color: '#FF6B35', letter: 'L', url: 'https://lumalabs.ai',                    desc: 'Geração de vídeos e cenas 3D com IA' },
  { name: 'CapCut',           cat: 'Criar vídeo',      pricing: 'FREEMIUM',   color: '#000000', letter: 'C', url: 'https://capcut.com',                     desc: 'Edição de vídeo simples para redes sociais' },
  // Áudio & Voz
  { name: 'ElevenLabs',       cat: 'Áudio & Voz',      pricing: 'FREEMIUM',   color: '#7B61FF', letter: 'E', url: 'https://elevenlabs.io',                  desc: 'Síntese de voz ultra-realista com IA' },
  { name: 'Suno',             cat: 'Áudio & Voz',      pricing: 'FREEMIUM',   color: '#F59E0B', letter: 'S', url: 'https://suno.com',                       desc: 'Criação de músicas completas com IA' },
  { name: 'Udio',             cat: 'Áudio & Voz',      pricing: 'FREEMIUM',   color: '#EC4899', letter: 'U', url: 'https://udio.com',                       desc: 'Geração de músicas com alta qualidade' },
  { name: 'Adobe Podcast',    cat: 'Áudio & Voz',      pricing: 'FREEMIUM',   color: '#9C27B0', letter: 'A', url: 'https://podcast.adobe.com',              desc: 'Edição de áudio com IA para podcasters' },
  // Métricas
  { name: 'Google Analytics', cat: 'Métricas',         pricing: 'GRATUITO',   color: '#F4B400', letter: 'G', url: 'https://analytics.google.com',           desc: 'Análise de tráfego e comportamento no site' },
  { name: 'Hotjar',           cat: 'Métricas',         pricing: 'FREEMIUM',   color: '#FD3A5C', letter: 'H', url: 'https://hotjar.com',                     desc: 'Mapas de calor e gravações de sessão' },
  { name: 'Mixpanel',         cat: 'Métricas',         pricing: 'FREEMIUM',   color: '#7C3AED', letter: 'M', url: 'https://mixpanel.com',                   desc: 'Analytics de produto e funis de conversão' },
  // Banco de Imagens
  { name: 'Unsplash',         cat: 'Banco de Imagens', pricing: 'GRATUITO',   color: '#111111', letter: 'U', url: 'https://unsplash.com',                   desc: 'Banco de fotos gratuito de alta qualidade' },
  { name: 'Pexels',           cat: 'Banco de Imagens', pricing: 'GRATUITO',   color: '#05A081', letter: 'P', url: 'https://pexels.com',                     desc: 'Fotos e vídeos gratuitos para projetos web' },
  { name: 'Pixabay',          cat: 'Banco de Imagens', pricing: 'GRATUITO',   color: '#2EC66B', letter: 'P', url: 'https://pixabay.com',                    desc: 'Fotos, ilustrações, vetores e vídeos livres' },
  { name: 'FoodiesFeed',      cat: 'Banco de Imagens', pricing: 'FREEMIUM',   color: '#F59E0B', letter: 'F', url: 'https://foodiesfeed.com',                desc: 'Banco especializado em fotografia de comida' },
  { name: 'Freepik',          cat: 'Banco de Imagens', pricing: 'FREEMIUM',   color: '#1273EB', letter: 'F', url: 'https://freepik.com',                    desc: 'Fotos, vetores e templates gráficos' },
  { name: 'Adobe Stock',      cat: 'Banco de Imagens', pricing: 'ASSINATURA', color: '#FF0000', letter: 'A', url: 'https://stock.adobe.com',                desc: 'Banco premium integrado ao Creative Cloud' },
  { name: 'Shutterstock',     cat: 'Banco de Imagens', pricing: 'ASSINATURA', color: '#E8132A', letter: 'S', url: 'https://shutterstock.com',               desc: 'Maior banco de imagens premium do mundo' },
  { name: 'Envato Elements',  cat: 'Banco de Imagens', pricing: 'ASSINATURA', color: '#82BC03', letter: 'E', url: 'https://elements.envato.com',            desc: 'Templates, fontes, fotos e assets ilimitados' },
  { name: 'StockSnap',        cat: 'Banco de Imagens', pricing: 'GRATUITO',   color: '#3C8EF9', letter: 'S', url: 'https://stocksnap.io',                   desc: 'Fotos gratuitas com licença CC0' },
  { name: 'Kaboompics',       cat: 'Banco de Imagens', pricing: 'GRATUITO',   color: '#E91E8C', letter: 'K', url: 'https://kaboompics.com',                 desc: 'Lifestyle, interiores e fotografia estética' },
  { name: 'Openverse',        cat: 'Banco de Imagens', pricing: 'GRATUITO',   color: '#0073A8', letter: 'O', url: 'https://openverse.org',                  desc: 'Mecanismo para mídia com licenças abertas' },
  // Ícones & SVG
  { name: 'Iconify',          cat: 'Ícones & SVG',     pricing: 'GRATUITO',   color: '#1769AA', letter: 'I', url: 'https://iconify.design',                 desc: '200+ coleções e 300K+ ícones em uma API' },
  { name: 'SVG Repo',         cat: 'Ícones & SVG',     pricing: 'GRATUITO',   color: '#6C63FF', letter: 'S', url: 'https://svgrepo.com',                    desc: 'Repositório com SVGs prontos para uso' },
  { name: 'Lucide Icons',     cat: 'Ícones & SVG',     pricing: 'GRATUITO',   color: '#F56565', letter: 'L', url: 'https://lucide.dev',                     desc: 'Ícones limpos e consistentes, open source' },
  { name: 'Phosphor Icons',   cat: 'Ícones & SVG',     pricing: 'GRATUITO',   color: '#805AD5', letter: 'P', url: 'https://phosphoricons.com',              desc: 'Família flexível com 6 estilos de ícones' },
  { name: 'Tabler Icons',     cat: 'Ícones & SVG',     pricing: 'GRATUITO',   color: '#0CA5E9', letter: 'T', url: 'https://tabler.io/icons',                desc: '+5000 ícones SVG open source com stroke' },
  { name: 'Heroicons',        cat: 'Ícones & SVG',     pricing: 'GRATUITO',   color: '#6366F1', letter: 'H', url: 'https://heroicons.com',                  desc: 'Ícones do Tailwind UI, outline e solid' },
  { name: 'Material Symbols', cat: 'Ícones & SVG',     pricing: 'GRATUITO',   color: '#4285F4', letter: 'M', url: 'https://fonts.google.com/icons',         desc: 'Ícones do Material Design 3 (Google)' },
  { name: 'Remix Icon',       cat: 'Ícones & SVG',     pricing: 'GRATUITO',   color: '#0EA5E9', letter: 'R', url: 'https://remixicon.com',                  desc: '+2800 ícones neutros e versáteis' },
  { name: 'Bootstrap Icons',  cat: 'Ícones & SVG',     pricing: 'GRATUITO',   color: '#7952B3', letter: 'B', url: 'https://icons.getbootstrap.com',         desc: '+2000 ícones do framework Bootstrap' },
  { name: 'Hugeicons',        cat: 'Ícones & SVG',     pricing: 'FREEMIUM',   color: '#FF6B00', letter: 'H', url: 'https://hugeicons.com',                  desc: '+36K ícones premium com estilo consistente' },
  { name: 'Font Awesome',     cat: 'Ícones & SVG',     pricing: 'FREEMIUM',   color: '#528DD3', letter: 'F', url: 'https://fontawesome.com',                desc: 'Biblioteca de ícones mais usada da web' },
  { name: 'Simple Icons',     cat: 'Ícones & SVG',     pricing: 'GRATUITO',   color: '#111111', letter: 'S', url: 'https://simpleicons.org',                desc: 'Logos SVG de marcas e tecnologias populares' },
  { name: 'unDraw',           cat: 'Ícones & SVG',     pricing: 'GRATUITO',   color: '#6C63FF', letter: 'U', url: 'https://undraw.co',                      desc: 'Ilustrações SVG gratuitas e customizáveis' },
]

const TOOL_CATS: ToolCategory[] = ['Todas','IA & Pesquisa','Imagem & Design','Criar vídeo','Áudio & Voz','Métricas','Banco de Imagens','Ícones & SVG']
const CAT_ICONS: Record<ToolCategory, string> = {
  'Todas': '✦', 'IA & Pesquisa': '🤖', 'Imagem & Design': '🎨',
  'Criar vídeo': '🎬', 'Áudio & Voz': '🔊', 'Métricas': '📊',
  'Banco de Imagens': '🖼️', 'Ícones & SVG': '◈',
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

const LEFT_EXPANDED  = 220
const LEFT_COLLAPSED = 56
const RIGHT_EXPANDED  = 260
const RIGHT_COLLAPSED = 36

export default function Layout() {
  const { theme, toggle, accent, setAccent } = useThemeStore()
  const { areas } = useAreasStore()
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  function getInitials(name: string | null) {
    if (!name) return '?'
    return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
  }

  const [leftCollapsed,  setLeftCollapsed]  = useState(false)
  const [rightCollapsed, setRightCollapsed] = useState(true)
  const [searchOpen,     setSearchOpen]     = useState(false)
  const [saveLinkOpen,   setSaveLinkOpen]   = useState(false)
  const [settingsOpen,   setSettingsOpen]   = useState(false)
  const [toolCat,        setToolCat]        = useState<ToolCategory>('Todas')
  const [toolSearch,     setToolSearch]     = useState('')

  const avatarRef  = useRef<HTMLButtonElement>(null)
  const settingsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(v => !v) }
      if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); setSaveLinkOpen(v => !v) }
      if (e.key === 'Escape') { setSearchOpen(false); setSettingsOpen(false); setSaveLinkOpen(false) }
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

  const filteredTools = ALL_TOOLS.filter(t =>
    (toolCat === 'Todas' || t.cat === toolCat) &&
    (t.name.toLowerCase().includes(toolSearch.toLowerCase()) ||
     t.desc.toLowerCase().includes(toolSearch.toLowerCase()))
  )

  const showDesc = toolSearch.trim().length > 0

  return (
    <div className={s.shell}>
      {/* ── Left Sidebar ── */}
      <motion.aside
        className={s.left}
        animate={{ width: leftCollapsed ? LEFT_COLLAPSED : LEFT_EXPANDED }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
      >
        <div className={s.leftHeader}>
          <AnimatePresence initial={false}>
            {!leftCollapsed && (
              <motion.span
                className={s.logo}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: .15 }}
              >
                ⬡ FormCraft
              </motion.span>
            )}
          </AnimatePresence>
          {leftCollapsed && <span className={s.logoMini}>⬡</span>}
          <button
            className={s.collapseBtn}
            onClick={() => setLeftCollapsed(v => !v)}
            title={leftCollapsed ? 'Expandir' : 'Recolher'}
          >
            <motion.span animate={{ rotate: leftCollapsed ? 0 : 180 }} transition={{ duration: .2 }}>›</motion.span>
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
              <AnimatePresence initial={false}>
                {!leftCollapsed && (
                  <motion.span
                    className={s.navLabel}
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: .15 }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          ))}
        </nav>

        <AnimatePresence initial={false}>
          {!leftCollapsed && (
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
          <AnimatePresence initial={false} mode="wait">
            {!leftCollapsed ? (
              <motion.div
                key="expanded"
                className={s.leftBottomExpanded}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: .15 }}
              >
                <button className={s.searchBtn} onClick={() => setSearchOpen(true)}>
                  🔎 Buscar <kbd>⌘K</kbd>
                </button>
                <button className={s.saveLinkBtn} onClick={() => setSaveLinkOpen(true)}>
                  🔗 Salvar link <kbd>⌘S</kbd>
                </button>
                <button className={s.themeBtn} onClick={toggle}>
                  {theme === 'dark' ? '☀️ Modo claro' : '🌙 Modo escuro'}
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="collapsed"
                className={s.leftBottomIcons}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: .15 }}
              >
                <button className={s.iconBtn} onClick={() => setSearchOpen(true)} title="Buscar">🔎</button>
                <button className={s.iconBtn} onClick={() => setSaveLinkOpen(true)} title="Salvar link">🔗</button>
                <button className={s.iconBtn} onClick={toggle} title="Tema">
                  {theme === 'dark' ? '☀️' : '🌙'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>

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
            <button className={s.topSaveLinkBtn} onClick={() => setSaveLinkOpen(true)} title="Salvar link (⌘S)">
              🔗
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
                    <div className={s.settingsDivider} />
                    <button
                      className={s.settingsLogout}
                      onClick={() => { signOut(); setSettingsOpen(false) }}
                    >
                      🚪 Sair da conta
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className={s.content}>
          <Outlet context={{ onOpenSearch: () => setSearchOpen(true), onOpenSaveLink: () => setSaveLinkOpen(true) }} />
        </main>
      </div>

      {/* ── Right Sidebar (Tools) ── */}
      <motion.aside
        className={s.right}
        animate={{ width: rightCollapsed ? RIGHT_COLLAPSED : RIGHT_EXPANDED }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
      >
        <AnimatePresence initial={false} mode="wait">
          {rightCollapsed ? (
            <motion.div
              key="collapsed"
              className={s.rightCollapsedInner}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: .15 }}
            >
              <button
                className={s.rightExpandBtn}
                onClick={() => setRightCollapsed(false)}
                title="Ferramentas"
              >
                <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="1" y="1" width="6" height="6" rx="1.5"/>
                  <rect x="9" y="1" width="6" height="6" rx="1.5"/>
                  <rect x="1" y="9" width="6" height="6" rx="1.5"/>
                  <rect x="9" y="9" width="6" height="6" rx="1.5"/>
                </svg>
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="expanded"
              className={s.rightExpanded}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: .15 }}
            >
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
                {filteredTools.map((t, i) => (
                  <motion.a
                    key={t.name}
                    href={t.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={s.toolItem}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * .025, duration: .2 }}
                    whileHover={{ backgroundColor: 'var(--surface2)' }}
                  >
                    <span className={s.toolIcon} style={{ background: t.color }}>{t.letter}</span>
                    <span className={s.toolInfo}>
                      <span className={s.toolName}>{t.name}</span>
                      {showDesc
                        ? <span className={s.toolDesc}>{t.desc}</span>
                        : <span className={s.toolPricing} style={{ color: PRICING_COLOR[t.pricing] }}>{t.pricing}</span>
                      }
                    </span>
                  </motion.a>
                ))}
              </div>

              <div className={s.toolsFooter}>{ALL_TOOLS.length} ferramentas disponíveis</div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.aside>

      {searchOpen && <SearchPalette onClose={() => setSearchOpen(false)} />}
      {saveLinkOpen && <SaveLinkModal onClose={() => setSaveLinkOpen(false)} />}
    </div>
  )
}
