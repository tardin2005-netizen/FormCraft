import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { normList, normPattern } from './normalize'
import { auth, db } from '../firebase'
import { doc, setDoc, deleteDoc, getDoc, arrayUnion } from 'firebase/firestore'

export const PATTERN_CATEGORIES = ['Hover', 'Motion', 'Texto', 'Card', 'Fundo', 'Layout', 'Navegação', 'PWA', 'Outro'] as const
export type PatternCategory = typeof PATTERN_CATEGORIES[number]

export interface DesignPattern {
  id: string
  nomePrincipal: string
  sinonimos: string[]
  categoria: PatternCategory
  oQueE: string
  comoFunciona: string
  ondeUsar: string
  tags: string[]
  exemploImagem?: string
  exemploCodigo?: string
  criadoEm: string
}

export type DesignPatternInput = Omit<DesignPattern, 'id' | 'criadoEm'>

interface LibraryStore {
  patterns: DesignPattern[]
  seeded: boolean
  addPattern: (p: DesignPatternInput) => void
  updatePattern: (id: string, p: DesignPatternInput) => void
  removePattern: (id: string) => void
  seedDefaults: () => void
  upgradeDefaults: () => Promise<void>
  hydrate: (p: DesignPattern[]) => void
}

function fs(item: DesignPattern) {
  const uid = auth.currentUser?.uid
  if (uid) setDoc(doc(db, 'users', uid, 'designPatterns', item.id), item).catch(() => {})
}

// Additions shipped after the first seed. upgradeDefaults() appends them to libraries that already exist.
const SIDEBAR_EXTRA = {
  sinonimos: ['Sidebar', 'Barra lateral', 'Menu lateral', 'Side navigation'],
  comoFunciona: '\nNo celular: a sidebar some da tela e passa a ser aberta pelo Menu hambúrguer (☰), deslizando da lateral por cima do conteúdo (drawer).',
  ondeUsar: ' No celular, combine com o Menu hambúrguer.',
  tags: ['hambúrguer', 'drawer', 'responsivo'],
}

const HAMBURGER: DesignPatternInput = {
  nomePrincipal: 'Menu hambúrguer',
  sinonimos: ['Hamburger menu', 'Ícone de três linhas', 'Botão ☰', 'Menu sanduíche', 'Off-canvas menu', 'Drawer'],
  categoria: 'Navegação',
  oQueE: 'Botão com três linhas horizontais (☰) que esconde a navegação; ao ser tocado, abre o menu, normalmente uma sidebar que desliza da lateral.',
  comoFunciona: 'Botão de abrir: o ícone ☰ fica num canto do topo e mostra o menu ao ser clicado.\nPainel deslizante (drawer): a sidebar entra pela lateral, por cima do conteúdo, com um fundo escurecido atrás.\nFechar: tocar fora do painel, apertar Esc ou no X (o ☰ costuma virar X quando aberto).\nAcessibilidade: o botão precisa de aria-label="Abrir menu" e aria-expanded dizendo se está aberto.\nResponsivo: no computador a sidebar fica sempre visível; abaixo de ~768px ela some e o hambúrguer assume.',
  ondeUsar: 'Celular e sites com muitos itens de menu. Para 3 a 5 destinos principais, uma barra inferior (bottom nav) costuma funcionar melhor, porque o hambúrguer esconde as opções; é o que o FormCraft usa no celular, com o botão "Mais".',
  tags: ['hambúrguer', 'menu', 'sidebar', 'drawer', 'mobile', 'navegação', 'responsivo'],
  exemploCodigo: '<button class="burger" aria-label="Abrir menu" aria-expanded="false">☰</button>\n<aside class="drawer">…links…</aside>\n\n.drawer {\n  position: fixed; inset: 0 auto 0 0; width: 280px;\n  transform: translateX(-100%); transition: transform .25s ease;\n}\n.drawer.open { transform: translateX(0); }\n@media (min-width: 768px) {\n  .burger { display: none; }\n  .drawer { position: sticky; transform: none; }\n}',
}

const UPGRADE_ID = 'v2-menu-hamburguer'
const sameName = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase()
const addMissing = (list: string[], extra: string[]) => [...list, ...extra.filter(x => !list.some(y => sameName(x, y)))]

export const DEFAULT_PATTERNS: DesignPatternInput[] = [
  {
    nomePrincipal: 'Hover',
    sinonimos: ['Efeito hover', 'Hover effect', 'Passar o mouse'],
    categoria: 'Hover',
    oQueE: 'Mudança visual em um elemento quando o cursor passa por cima dele, sinalizando que ele é interativo.',
    comoFunciona: 'Mudança de cor: o botão troca a cor de fundo ou do texto ao receber o cursor.\nAumento de tamanho: o item ganha um leve zoom ou se expande.\nSombra ou borda: aparece uma linha ou sombra para dar destaque.\nTexto em imagens: uma foto revela uma descrição quando o mouse passa por cima.',
    ondeUsar: 'Botões, links, cards clicáveis, galerias de imagem.',
    tags: ['interação', 'botão', 'link', 'microinteração'],
    exemploCodigo: '.btn { transition: transform .15s, box-shadow .15s; }\n.btn:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,.2); }',
  },
  {
    nomePrincipal: 'Motion',
    sinonimos: ['Motion design', 'Animação de interface', 'Movimento'],
    categoria: 'Motion',
    oQueE: 'Uso de animações em textos, imagens, botões e fundos para deixar a página dinâmica e guiar o olhar.',
    comoFunciona: 'Fade In / Slide In: blocos surgem suavemente ou deslizam para a tela no carregamento.\nParallax: o fundo se move em velocidade diferente do conteúdo ao rolar, criando profundidade.\nMicrointerações: pequenas reações em botões e ícones no hover ou clique.\nEfeitos de mouse: elementos acompanham levemente o cursor.',
    ondeUsar: 'Entrada de seções, hero, transições de página, feedback de clique.',
    tags: ['fade', 'slide', 'parallax', 'microinteração', 'scroll'],
  },
  {
    nomePrincipal: 'Animated Gradient Text',
    sinonimos: ['Gradient Sweep Effect', 'Texto com gradiente animado', 'Degradê animado no texto'],
    categoria: 'Texto',
    oQueE: 'Um degradê de cores se move continuamente sobre as letras, como uma onda de luz ou varredura colorida.',
    comoFunciona: 'Gradiente de fundo: degradê linear largo que repete as cores nas pontas para o loop fluir.\nTamanho ampliado: background-size bem maior que o texto (200% a 400%).\nRecorte no texto: -webkit-background-clip: text faz o gradiente aparecer só dentro das letras.\nTexto transparente: color: transparent revela o fundo em movimento.\nAnimação contínua: @keyframes altera background-position em loop infinito.',
    ondeUsar: 'Títulos de hero, identidades visuais futuristas, loaders estilizados, botões de destaque.',
    tags: ['gradiente', 'degradê', 'hero', 'título', 'keyframes'],
    exemploCodigo: '.grad {\n  background: linear-gradient(90deg, #7c6ef7, #3ecf8e, #7c6ef7);\n  background-size: 300% 100%;\n  -webkit-background-clip: text; background-clip: text;\n  color: transparent;\n  animation: sweep 4s linear infinite;\n}\n@keyframes sweep { to { background-position: 300% 0; } }',
  },
  {
    nomePrincipal: 'Floating Card Effect',
    sinonimos: ['Elevated Card', 'Floating UI Card', 'Hovering Card', 'Glassmorphism Card', 'Card flutuante', 'Card elevado'],
    categoria: 'Card',
    oQueE: 'Card que parece solto sobre o fundo, com borda, sombra e profundidade, criando hierarquia visual.',
    comoFunciona: 'Sombra suave e borda sutil destacam o card do background.\nGlassmorphism: se tiver transparência e desfoque (backdrop-filter).\nHovering: se ele sobe levemente ao passar o mouse.',
    ondeUsar: 'Destaque de informação principal, depoimentos, cards de produto sobre fundos com imagem.',
    tags: ['card', 'sombra', 'profundidade', 'glassmorphism', 'elevação'],
  },
  {
    nomePrincipal: 'Floating Element',
    sinonimos: ['Elemento flutuante', 'Decorative Floating Element', 'Floating Background Shape', 'Abstract Background Shape', 'Float Animation'],
    categoria: 'Fundo',
    oQueE: 'Forma decorativa solta no fundo da página; quando sobe e desce suavemente, chama-se Float Animation.',
    comoFunciona: 'Formas abstratas posicionadas atrás do conteúdo (position: absolute, z-index baixo).\nPara flutuar: @keyframes alterna translateY em loop com ease-in-out.',
    ondeUsar: 'Fundos de hero, landing pages, seções decorativas.',
    tags: ['decorativo', 'fundo', 'forma', 'background', 'float'],
    exemploCodigo: '.blob { animation: float 6s ease-in-out infinite; }\n@keyframes float { 50% { transform: translateY(-12px); } }',
  },
  {
    nomePrincipal: 'PWA — Progressive Web App',
    sinonimos: ['PWA', 'App instalável', 'Web app manifest'],
    categoria: 'PWA',
    oQueE: 'Ícone e nome definidos no manifesto do site que o fazem parecer um app quando instalado no celular ou computador.',
    comoFunciona: 'O nome aparece embaixo do ícone na tela inicial, na barra de tarefas ou no menu.\nFicam no manifest.json, que o navegador lê para saber qual imagem e nome usar na instalação.',
    ondeUsar: 'Qualquer site que deve ser instalável como app (como o próprio FormCraft).',
    tags: ['manifest', 'ícone', 'instalação', 'mobile'],
  },
  {
    nomePrincipal: 'Collapsed Sidebar',
    sinonimos: ['Barra lateral colapsada', 'Sidebar recolhida', 'Mini sidebar', ...SIDEBAR_EXTRA.sinonimos],
    categoria: 'Navegação',
    oQueE: 'Menu vertical reduzido ou recolhido na borda da tela para liberar espaço para o conteúdo principal.',
    comoFunciona: 'A sidebar alterna entre largura cheia (ícone + texto) e compacta (só ícones), geralmente com tooltip no hover.' + SIDEBAR_EXTRA.comoFunciona,
    ondeUsar: 'Dashboards, apps com muita navegação, telas pequenas.' + SIDEBAR_EXTRA.ondeUsar,
    tags: ['sidebar', 'menu', 'navegação', 'layout', ...SIDEBAR_EXTRA.tags],
  },
  HAMBURGER,
]

let upgrading: string | null = null

export const useLibraryStore = create<LibraryStore>()(
  persist(
    (set, get) => ({
      patterns: [],
      seeded: false,

      addPattern: (p) => {
        const pattern: DesignPattern = { ...p, id: crypto.randomUUID(), criadoEm: new Date().toISOString() }
        set(s => ({ patterns: [...s.patterns, pattern] }))
        fs(pattern)
      },
      updatePattern: (id, p) => {
        const current = get().patterns.find(x => x.id === id)
        if (!current) return
        const updated: DesignPattern = { ...current, ...p }
        set(s => ({ patterns: s.patterns.map(x => x.id === id ? updated : x) }))
        fs(updated)
      },
      removePattern: (id) => {
        set(s => ({ patterns: s.patterns.filter(x => x.id !== id) }))
        const uid = auth.currentUser?.uid
        if (uid) deleteDoc(doc(db, 'users', uid, 'designPatterns', id)).catch(() => {})
      },
      seedDefaults: () => {
        if (get().seeded) return
        set({ seeded: true })
        if (get().patterns.length > 0) return
        DEFAULT_PATTERNS.forEach(p => get().addPattern(p))
      },
      // Runs once per account (flag in users/{uid}/meta/library): only adds the hamburger pattern and
      // appends text to the existing sidebar one, never removes or overwrites what is there.
      upgradeDefaults: async () => {
        const uid = auth.currentUser?.uid
        if (!uid || upgrading === uid) return
        upgrading = uid
        try {
          const metaRef = doc(db, 'users', uid, 'meta', 'library')
          const meta = await getDoc(metaRef)
          if ((meta.data()?.upgrades ?? []).includes(UPGRADE_ID)) return
          const { patterns } = get()
          if (!patterns.some(p => sameName(p.nomePrincipal, HAMBURGER.nomePrincipal))) get().addPattern(HAMBURGER)
          const sidebar = patterns.find(p => sameName(p.nomePrincipal, 'Collapsed Sidebar'))
          if (sidebar && !sidebar.comoFunciona.includes('Menu hambúrguer')) {
            const { id: _id, criadoEm: _c, ...rest } = sidebar
            get().updatePattern(sidebar.id, {
              ...rest,
              sinonimos: addMissing(sidebar.sinonimos, SIDEBAR_EXTRA.sinonimos),
              tags: addMissing(sidebar.tags, SIDEBAR_EXTRA.tags),
              comoFunciona: sidebar.comoFunciona + SIDEBAR_EXTRA.comoFunciona,
              ondeUsar: sidebar.ondeUsar + SIDEBAR_EXTRA.ondeUsar,
            })
          }
          await setDoc(metaRef, { upgrades: arrayUnion(UPGRADE_ID) }, { merge: true })
        } catch { upgrading = null }
      },
      hydrate: (patterns) => set({ patterns: normList(patterns, normPattern) as any, seeded: true }),
    }),
    { name: 'formcraft-library', merge: (p: any, c) => ({ ...c, ...p, patterns: normList(p?.patterns, normPattern) as any }) }
  )
)
