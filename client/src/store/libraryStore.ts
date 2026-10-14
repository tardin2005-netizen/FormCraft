import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { normList, normPattern } from './normalize'
import { auth, db } from '../firebase'
import { doc, setDoc, deleteDoc, getDoc, arrayUnion } from 'firebase/firestore'

export const PATTERN_CATEGORIES = ['Hover', 'Motion', 'Texto', 'Card', 'Fundo', 'Layout', 'Navegação', 'Vídeo', 'PWA', 'Design System', 'Outro'] as const
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
  hubId?: string
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
  ondeUsar: 'Celular e sites com muitos itens de menu. Para 3 a 5 destinos principais, uma barra inferior (bottom nav) costuma funcionar melhor, porque o hambúrguer esconde as opções; é o que o Formcraft usa no celular, com o botão "Mais".',
  tags: ['hambúrguer', 'menu', 'sidebar', 'drawer', 'mobile', 'navegação', 'responsivo'],
  exemploCodigo: '<button class="burger" aria-label="Abrir menu" aria-expanded="false">☰</button>\n<aside class="drawer">…links…</aside>\n\n.drawer {\n  position: fixed; inset: 0 auto 0 0; width: 280px;\n  transform: translateX(-100%); transition: transform .25s ease;\n}\n.drawer.open { transform: translateX(0); }\n@media (min-width: 768px) {\n  .burger { display: none; }\n  .drawer { position: sticky; transform: none; }\n}',
}

// Shipped after the first seed, like the hamburger menu: upgradeDefaults() adds it to existing libraries.
const RESIZE_HANDLE: DesignPatternInput = {
    nomePrincipal: 'Resize Handle',
    sinonimos: ['Alça de redimensionamento', 'Drag to resize', 'Panel resizer', 'Gripper', 'Redimensionador de painel'],
    categoria: 'Layout',
    oQueE: 'Elemento visual de interface que permite ao utilizador alterar o tamanho de uma janela, painel, imagem, caixa de texto ou objeto ao clicar e arrastar. Ao passar o cursor sobre ele, o ponteiro muda para uma seta dupla, indicando a direção do redimensionamento disponível.',
    comoFunciona: 'Cursor indicativo: ao passar o rato sobre o handle, o ponteiro muda para col-resize (↔ horizontal), row-resize (↕ vertical) ou nwse-resize (↗ diagonal), sinalizando que o objeto pode ser redimensionado.\nClicar e arrastar: o utilizador pressiona o botão do rato sobre o handle e arrasta para aumentar ou diminuir o elemento em tempo real.\nTipos comuns:\n• Cantos e bordas — pequenos quadrados, círculos ou pontos ao redor de um objeto selecionado (Word, Photoshop, PowerPoint).\n• Gripper — três linhas diagonais no canto inferior direito de caixas de texto na web ou janelas do sistema operativo.\n• Barras divisórias — linhas que separam painéis (editores de código, apps de email), permitindo dar mais espaço a uma secção e reduzi-lo noutra.\nSnap opcional: muitas implementações têm limiares que colapsam o painel automaticamente se arrastado abaixo de um tamanho mínimo.',
    ondeUsar: 'Painéis laterais (sidebars), editores de código (VS Code, IDEs), clientes de email, janelas do sistema operativo, caixas de texto em editores como Word e Notion, divisores de layout em dashboards.',
    tags: ['resize', 'drag', 'painel', 'sidebar', 'layout', 'interação', 'arrastar', 'handle', 'redimensionar', 'col-resize', 'gripper'],
    exemploCodigo: '/* Handle horizontal — cursor e indicador visual */\n.resize-handle {\n  width: 6px;\n  cursor: col-resize;\n  position: relative;\n}\n.resize-handle::after {\n  content: "";\n  position: absolute;\n  inset: 0; left: 2px; width: 2px;\n  background: var(--accent);\n  opacity: 0;\n  transition: opacity .18s;\n}\n.resize-handle:hover::after { opacity: .55; }\n\n/* Lógica de drag em JS */\nhandle.addEventListener("mousedown", e => {\n  const startX = e.clientX;\n  const startW = panel.offsetWidth;\n  const onMove = ev => panel.style.width = startW + (ev.clientX - startX) + "px";\n  const onUp = () => document.removeEventListener("mousemove", onMove);\n  document.addEventListener("mousemove", onMove);\n  document.addEventListener("mouseup", onUp, { once: true });\n});',
}

const UPGRADE_IDS = ['v2-menu-hamburguer', 'v3-design-system'] as const
const sameName = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase()
const addMissing = (list: string[], extra: string[]) => [...list, ...extra.filter(x => !list.some(y => sameName(x, y)))]

const DS_PATTERNS: DesignPatternInput[] = [
  {
    nomePrincipal: 'Tipografia',
    sinonimos: ['Typography', 'Escala tipográfica', 'Type scale', 'Hierarquia de texto'],
    categoria: 'Design System',
    oQueE: 'A escolha das fontes, tamanhos e pesos do texto. Ela organiza a leitura: o olho vai primeiro no que é maior e mais pesado, depois no que é menor e mais leve.',
    comoFunciona: 'Display: o texto de maior impacto, usado em capas e números grandes (ex.: 40 px, ExtraBold).\nHeadline: título de página ou seção (ex.: 28 px, Bold).\nSubheading: subtítulo ou nome de bloco (ex.: 20 px, SemiBold).\nBody: o texto corrido, que o usuário realmente lê (ex.: 16 px, Regular).\nCaption: apoio, legenda, dica abaixo do campo (ex.: 13 px, Medium, em cinza).\n\nRegra de ouro: quanto maior e mais pesado, mais importante. Se tudo grita, nada é lido.',
    ondeUsar: 'Toda tela do produto. Com poucos níveis bem definidos, qualquer tela fica legível sem esforço. O título da página é Headline, o rótulo do campo é Body em negrito, a dica embaixo do campo é Caption.',
    tags: ['tipografia', 'fonte', 'hierarquia', 'texto', 'design-system', 'escala'],
  },
  {
    nomePrincipal: 'Cores',
    sinonimos: ['Colors', 'Paleta de cores', 'Color palette', 'Tokens de cor'],
    categoria: 'Design System',
    oQueE: 'A paleta do produto. Cada cor tem um papel (o que ela significa) e uma escala (do tom mais escuro ao mais claro, normalmente 10 tons).',
    comoFunciona: 'Primária (índigo): ação e marca — botão "Enviar", campo em foco.\nNeutra (cinzas): texto, bordas, fundos — rótulos, linhas de separação.\nSucesso (verde): deu certo — campo válido, "Publicado".\nErro (vermelho): deu errado ou é perigoso — validação, botão de excluir.\nAlerta (âmbar): atenção — "Pendente", aviso antes de sair.\nInformação (azul): dica neutra — tooltip, link, aviso informativo.\n\nComo ler a escala: tons escuros → texto e hover, tom do meio → botão e destaque, claros → fundos e bordas suaves.\nAcessibilidade: nunca deixe só a cor carregar o significado. Use sempre cor + ícone ou texto.',
    ondeUsar: 'Todos os elementos visuais do produto. Se mudar a cor primária, todos os botões mudam juntos. Consistência e velocidade saem de graça.',
    tags: ['cores', 'paleta', 'primária', 'semântica', 'design-system', 'acessibilidade'],
  },
  {
    nomePrincipal: 'Componentes',
    sinonimos: ['Components', 'Peças prontas', 'UI Components', 'Blocos reutilizáveis'],
    categoria: 'Design System',
    oQueE: 'As peças prontas que juntam tipografia e cor em algo reutilizável. Você monta a tela com elas em vez de desenhar tudo do zero.',
    comoFunciona: 'Botão: dispara uma ação. Primário (preenchido), secundário (só borda) e só ícone. Estados: padrão, hover, foco, pressionado, desabilitado.\nCampo de texto: onde o usuário digita. Estados: vazio, em foco (borda índigo), erro (borda vermelha com mensagem). Sempre com rótulo visível.\nBadge e chip: etiquetas pequenas de status ("Rascunho", "Publicado", "Pendente", "Erro"). Mostram estado de relance.\nTag: parecido com badge, mas pra classificar ou filtrar (categorias, marcadores).\nTooltip: dica que aparece ao passar o mouse, pra explicar algo sem ocupar espaço.',
    ondeUsar: 'Toda tela do produto. Se mudar a cor primária, todos os componentes mudam juntos. Tipografia + Cores são as regras. Componentes são as peças feitas com essas regras.',
    tags: ['componentes', 'botão', 'campo', 'badge', 'design-system', 'reutilizável'],
  },
  {
    nomePrincipal: 'Botão',
    sinonimos: ['Button', 'CTA', 'Call to action', 'Botão de ação'],
    categoria: 'Design System',
    oQueE: 'Elemento que dispara uma ação quando clicado. Existem o primário (preenchido, ação principal), o secundário (só com borda) e o só ícone.',
    comoFunciona: 'Padrão: estado de repouso, com cor de fundo (primário) ou só borda (secundário).\nHover: cor escurece levemente ao passar o mouse, sinalizando interatividade.\nFoco: borda de destaque para navegação por teclado (Tab).\nPresionado: cor mais escura momentaneamente ao clicar.\nDesabilitado: opacidade reduzida, cursor not-allowed, sem resposta ao clique.\n\nPrimário: ação mais importante da tela (salvar, enviar). Secundário: ação alternativa (cancelar, voltar). Só ícone: ações compactas (fechar, editar).',
    ondeUsar: 'Formulários, modais, barras de ação, cards. Use apenas um primário por grupo — se tudo é primário, nada se destaca.',
    tags: ['botão', 'primário', 'secundário', 'estados', 'design-system', 'ação'],
    exemploCodigo: '.btn {\n  padding: 10px 20px; border-radius: 8px;\n  font-weight: 600; cursor: pointer;\n  transition: all .15s;\n}\n.btn-primary {\n  background: var(--accent); color: #fff; border: none;\n}\n.btn-primary:hover { filter: brightness(.9); }\n.btn-primary:disabled { opacity: .5; cursor: not-allowed; }\n.btn-secondary {\n  background: transparent; border: 1px solid var(--border);\n  color: var(--text);\n}\n.btn-secondary:hover { border-color: var(--accent); color: var(--accent); }',
  },
  {
    nomePrincipal: 'Campo de texto',
    sinonimos: ['Input field', 'Text input', 'Text field', 'Campo de entrada'],
    categoria: 'Design System',
    oQueE: 'Elemento onde o usuário digita informação. É o coração de um formulário — sempre com um rótulo visível que diz o que preencher.',
    comoFunciona: 'Vazio: borda neutra, rótulo acima, placeholder em cinza claro.\nEm foco: borda muda para a cor primária (índigo), indicando que está ativo.\nErro: borda vermelha com mensagem de erro abaixo ("Informe um e-mail válido").\nPreenchido: texto do usuário substitui o placeholder.\n\nSempre use rótulo visível (label), nunca só placeholder — ele some ao digitar e o usuário esquece o que era.',
    ondeUsar: 'Formulários de cadastro, login, busca, configurações. O campo é a peça mais usada de qualquer app que coleta dados.',
    tags: ['campo', 'input', 'formulário', 'foco', 'erro', 'design-system'],
    exemploCodigo: '.input {\n  width: 100%; padding: 10px 14px;\n  border: 1px solid var(--border); border-radius: 8px;\n  font-size: 14px; color: var(--text);\n  background: var(--surface);\n  transition: border-color .15s;\n}\n.input:focus { border-color: var(--accent); outline: none; }\n.input-error { border-color: var(--error); }\n.input-msg { font-size: 12px; color: var(--error); margin-top: 4px; }',
  },
  {
    nomePrincipal: 'Badge e Tag',
    sinonimos: ['Badge', 'Tag', 'Chip', 'Status label', 'Etiqueta de status'],
    categoria: 'Design System',
    oQueE: 'Etiquetas pequenas que mostram status (badge) ou classificam conteúdo (tag). Servem pra o usuário entender o estado de algo de relance.',
    comoFunciona: 'Badge de status: fundo colorido + texto curto. Rascunho (amarelo), Publicado (verde), Pendente (laranja), Erro (vermelho).\nChip com borda: apenas borda e texto, sem fundo preenchido. Menos chamativo, ideal para metadados.\nTag: geralmente com # na frente, usada para classificar. Pode ser clicável para filtrar.\n\nA cor do badge é semântica (verde = sucesso, vermelho = erro) — separada da cor de destaque (accent) do produto.',
    ondeUsar: 'Listas de formulários (status), cards de conteúdo (categorias), tabelas, kanban boards.',
    tags: ['badge', 'tag', 'chip', 'status', 'etiqueta', 'design-system'],
  },
  {
    nomePrincipal: 'Tooltip',
    sinonimos: ['Dica flutuante', 'Hover tip', 'Title attribute', 'Info popup'],
    categoria: 'Design System',
    oQueE: 'Pequena caixa de texto que aparece ao passar o mouse sobre um elemento, para explicar algo sem poluir a tela.',
    comoFunciona: 'Gatilho: hover do mouse (desktop) ou long-press (mobile).\nPosicionamento: aparece acima, abaixo ou ao lado do elemento, com uma setinha apontando para ele.\nConteúdo: texto curto (1-2 frases). Se precisar de mais, use um popover ou modal.\nAnimação: fade-in suave (200ms) com pequeno delay (300ms) para não disparar acidentalmente.\n\nDica ao passar o mouse, sem poluir a tela. Marcado como "Campo obrigatório", por exemplo.',
    ondeUsar: 'Ícones sem rótulo, abreviações, campos com regras especiais, botões de ação que precisam de contexto extra.',
    tags: ['tooltip', 'dica', 'hover', 'informação', 'design-system'],
    exemploCodigo: '.tooltip-wrap { position: relative; }\n.tooltip {\n  position: absolute; bottom: calc(100% + 8px); left: 50%;\n  transform: translateX(-50%);\n  background: var(--text); color: var(--bg); \n  padding: 6px 10px; border-radius: 6px;\n  font-size: 12px; white-space: nowrap;\n  opacity: 0; pointer-events: none;\n  transition: opacity .2s .3s;\n}\n.tooltip-wrap:hover .tooltip { opacity: 1; }',
  },
]

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
    ondeUsar: 'Qualquer site que deve ser instalável como app (como o próprio Formcraft).',
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
  RESIZE_HANDLE,
  ...DS_PATTERNS,
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
      // Runs once per account (flag in users/{uid}/meta/library): only adds the hamburger and resize-handle patterns and
      // appends text to the existing sidebar one, never removes or overwrites what is there.
      upgradeDefaults: async () => {
        const uid = auth.currentUser?.uid
        if (!uid || upgrading === uid) return
        upgrading = uid
        try {
          const metaRef = doc(db, 'users', uid, 'meta', 'library')
          const meta = await getDoc(metaRef)
          const done = meta.data()?.upgrades ?? []

          // v2: hamburger + resize-handle + sidebar extras
          if (!done.includes('v2-menu-hamburguer')) {
            const { patterns } = get()
            for (const extra of [HAMBURGER, RESIZE_HANDLE]) {
              if (!patterns.some(p => sameName(p.nomePrincipal, extra.nomePrincipal))) get().addPattern(extra)
            }
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
            await setDoc(metaRef, { upgrades: arrayUnion('v2-menu-hamburguer') }, { merge: true })
          }

          // v3: design system patterns
          if (!done.includes('v3-design-system')) {
            const { patterns } = get()
            for (const ds of DS_PATTERNS) {
              if (!patterns.some(p => sameName(p.nomePrincipal, ds.nomePrincipal))) get().addPattern(ds)
            }
            await setDoc(metaRef, { upgrades: arrayUnion('v3-design-system') }, { merge: true })
          }
        } catch { upgrading = null }
      },
      hydrate: (patterns) => set({ patterns: normList(patterns, normPattern) as any, seeded: true }),
    }),
    { name: 'formcraft-library', merge: (p: any, c) => ({ ...c, ...p, patterns: normList(p?.patterns, normPattern) as any }) }
  )
)
