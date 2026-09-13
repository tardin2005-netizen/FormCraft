export type WorkspaceContext =
  | 'design' | 'faculdade' | 'ux-ui' | 'marketing' | 'ti'
  | 'ecommerce' | 'projeto' | 'pesquisa' | 'custom'

export type ModuleType =
  | 'overview'
  | 'fonts' | 'colors' | 'references' | 'animations' | 'prompts'
  | 'ui-inspiration' | 'design-systems' | 'icons' | 'components' | 'design-styles'
  | 'disciplines' | 'assignments' | 'exams' | 'materials' | 'calendar'
  | 'tools-db' | 'scripts' | 'troubleshooting' | 'documentation'
  | 'campaigns' | 'personas' | 'social' | 'metrics' | 'copywriting'
  | 'user-flows' | 'wireframes' | 'accessibility' | 'heuristics'
  | 'notes' | 'links' | 'files'

export type ModuleLayout = 'grid' | 'list' | 'gallery' | 'table' | 'kanban'

export interface ModuleTemplate {
  type: ModuleType
  name: string
  icon: string
  description: string
  layout: ModuleLayout
  suggested: boolean
}

export interface ContextTemplate {
  context: WorkspaceContext
  label: string
  icon: string
  description: string
  color: string
  modules: ModuleTemplate[]
}

export const CONTEXT_TEMPLATES: ContextTemplate[] = [
  {
    context: 'design',
    label: 'Design',
    icon: '🎨',
    description: 'Fontes, cores, referências visuais e estilos',
    color: '#7c6ef7',
    modules: [
      { type: 'overview',      name: 'Visão geral',    icon: '⊞',  description: 'Resumo do workspace',                  layout: 'grid',    suggested: true },
      { type: 'fonts',         name: 'Fontes',         icon: 'Aa', description: 'Biblioteca visual de tipografia',       layout: 'grid',    suggested: true },
      { type: 'colors',        name: 'Cores',          icon: '◉',  description: 'Paletas, HEX, escalas tonais',          layout: 'grid',    suggested: true },
      { type: 'references',    name: 'Referências',    icon: '◈',  description: 'Screenshots e referências visuais',     layout: 'gallery', suggested: true },
      { type: 'ui-inspiration',name: 'UI Inspiration', icon: '◻',  description: 'Interfaces que te inspiram',           layout: 'gallery', suggested: false },
      { type: 'design-systems',name: 'Design Systems', icon: '⊡',  description: 'Sistemas de design para referência',   layout: 'list',    suggested: false },
      { type: 'icons',         name: 'Ícones',         icon: '◆',  description: 'Bibliotecas de ícones e recursos',     layout: 'grid',    suggested: false },
      { type: 'animations',    name: 'Animações',      icon: '◎',  description: 'Referências de animação de interface', layout: 'grid',    suggested: true },
      { type: 'prompts',       name: 'Prompts',        icon: '◈',  description: 'Prompts estruturados para IA',         layout: 'list',    suggested: true },
      { type: 'components',    name: 'Componentes',    icon: '⊞',  description: 'Componentes e padrões UI',             layout: 'grid',    suggested: false },
      { type: 'design-styles', name: 'Estilos',        icon: '◉',  description: 'Estilos visuais e referências',        layout: 'grid',    suggested: false },
      { type: 'notes',         name: 'Notas',          icon: '◻',  description: 'Anotações e rascunhos',                layout: 'list',    suggested: false },
    ],
  },
  {
    context: 'faculdade',
    label: 'Faculdade',
    icon: '📚',
    description: 'Disciplinas, trabalhos, provas e materiais',
    color: '#10b981',
    modules: [
      { type: 'overview',     name: 'Visão geral',  icon: '⊞', description: 'Resumo do semestre',             layout: 'grid',    suggested: true },
      { type: 'disciplines',  name: 'Disciplinas',  icon: '◉', description: 'Matérias com professor e notas', layout: 'kanban',  suggested: true },
      { type: 'assignments',  name: 'Trabalhos',    icon: '◈', description: 'Trabalhos e projetos',           layout: 'kanban',  suggested: true },
      { type: 'exams',        name: 'Provas',       icon: '◆', description: 'Provas e datas',                 layout: 'list',    suggested: true },
      { type: 'materials',    name: 'Materiais',    icon: '◻', description: 'PDFs, slides e apostilas',       layout: 'list',    suggested: true },
      { type: 'notes',        name: 'Anotações',    icon: '◎', description: 'Notas de aula e resumos',        layout: 'list',    suggested: true },
      { type: 'references',   name: 'Referências',  icon: '◈', description: 'Artigos e fontes bibliográficas',layout: 'list',    suggested: false },
      { type: 'calendar',     name: 'Calendário',   icon: '◻', description: 'Prazos e datas importantes',     layout: 'list',    suggested: false },
      { type: 'prompts',      name: 'Prompts IA',   icon: '◉', description: 'Prompts para estudo com IA',     layout: 'list',    suggested: false },
    ],
  },
  {
    context: 'ux-ui',
    label: 'UX / UI',
    icon: '◻',
    description: 'Pesquisa, personas, fluxos e testes',
    color: '#3b82f6',
    modules: [
      { type: 'overview',      name: 'Visão geral',    icon: '⊞', description: 'Resumo do workspace',                  layout: 'grid',    suggested: true },
      { type: 'references',    name: 'UX Research',    icon: '◈', description: 'Pesquisas e insights de usuário',      layout: 'list',    suggested: true },
      { type: 'personas',      name: 'Personas',       icon: '◉', description: 'Perfis de usuário',                   layout: 'grid',    suggested: true },
      { type: 'user-flows',    name: 'User Flows',     icon: '◆', description: 'Fluxos de navegação',                 layout: 'list',    suggested: true },
      { type: 'ui-inspiration',name: 'UI Inspiration', icon: '◻', description: 'Interfaces para referência',          layout: 'gallery', suggested: true },
      { type: 'design-systems',name: 'Design Systems', icon: '⊡', description: 'Sistemas de design',                  layout: 'list',    suggested: false },
      { type: 'components',    name: 'Componentes',    icon: '⊞', description: 'Padrões e componentes',               layout: 'grid',    suggested: false },
      { type: 'accessibility', name: 'Acessibilidade', icon: '◎', description: 'Critérios e boas práticas',           layout: 'list',    suggested: false },
      { type: 'heuristics',    name: 'Heurísticas',    icon: '◈', description: 'Princípios de Nielsen e outros',      layout: 'list',    suggested: false },
      { type: 'prompts',       name: 'Prompts',        icon: '◈', description: 'Prompts para geração de interfaces',  layout: 'list',    suggested: false },
    ],
  },
  {
    context: 'marketing',
    label: 'Marketing',
    icon: '📊',
    description: 'Campanhas, branding, social e métricas',
    color: '#f59e0b',
    modules: [
      { type: 'overview',    name: 'Visão geral', icon: '⊞', description: 'Resumo do workspace',       layout: 'grid',   suggested: true },
      { type: 'campaigns',   name: 'Campanhas',   icon: '◉', description: 'Campanhas com briefing',    layout: 'kanban', suggested: true },
      { type: 'references',  name: 'Referências', icon: '◈', description: 'Referências criativas',     layout: 'gallery',suggested: true },
      { type: 'copywriting', name: 'Copywriting', icon: '◆', description: 'Textos e roteiros',         layout: 'list',   suggested: true },
      { type: 'personas',    name: 'Personas',    icon: '◻', description: 'Perfis de público',         layout: 'grid',   suggested: false },
      { type: 'social',      name: 'Social Media',icon: '◎', description: 'Conteúdos por canal',       layout: 'kanban', suggested: false },
      { type: 'metrics',     name: 'Métricas',    icon: '◈', description: 'KPIs e resultados',         layout: 'table',  suggested: false },
      { type: 'prompts',     name: 'Prompts IA',  icon: '◈', description: 'Prompts de copy e criação', layout: 'list',   suggested: false },
    ],
  },
  {
    context: 'ti',
    label: 'TI',
    icon: '💻',
    description: 'Ferramentas, scripts, troubleshooting e docs',
    color: '#3178c6',
    modules: [
      { type: 'overview',        name: 'Visão geral',    icon: '⊞', description: 'Resumo do workspace',           layout: 'grid',  suggested: true },
      { type: 'tools-db',        name: 'Ferramentas',    icon: '◉', description: 'Ferramentas e softwares',       layout: 'grid',  suggested: true },
      { type: 'scripts',         name: 'Scripts',        icon: '◈', description: 'Scripts e automações',          layout: 'list',  suggested: true },
      { type: 'troubleshooting', name: 'Troubleshooting',icon: '◆', description: 'Problemas e soluções',          layout: 'table', suggested: true },
      { type: 'documentation',   name: 'Documentação',   icon: '◻', description: 'Docs e referências técnicas',   layout: 'list',  suggested: true },
      { type: 'notes',           name: 'Notas',          icon: '◎', description: 'Notas técnicas',                layout: 'list',  suggested: false },
      { type: 'references',      name: 'Referências',    icon: '◈', description: 'Links e artigos técnicos',      layout: 'list',  suggested: false },
    ],
  },
  {
    context: 'projeto',
    label: 'Projeto',
    icon: '🚀',
    description: 'Pesquisa, referências, tarefas e recursos',
    color: '#ec4899',
    modules: [
      { type: 'overview',   name: 'Visão geral', icon: '⊞', description: 'Resumo do projeto',          layout: 'grid',  suggested: true },
      { type: 'notes',      name: 'Notas',       icon: '◉', description: 'Ideias e rascunhos',          layout: 'list',  suggested: true },
      { type: 'references', name: 'Referências', icon: '◈', description: 'Referências e inspirações',   layout: 'gallery',suggested: true },
      { type: 'links',      name: 'Links',       icon: '◆', description: 'Links e recursos úteis',      layout: 'list',  suggested: true },
      { type: 'prompts',    name: 'Prompts',     icon: '◻', description: 'Prompts para o projeto',      layout: 'list',  suggested: false },
    ],
  },
  {
    context: 'custom',
    label: 'Personalizado',
    icon: '✦',
    description: 'Monte do zero com os módulos que quiser',
    color: '#6b7280',
    modules: [
      { type: 'overview', name: 'Visão geral', icon: '⊞', description: 'Resumo do workspace', layout: 'grid', suggested: true },
      { type: 'notes',    name: 'Notas',       icon: '◉', description: 'Anotações livres',    layout: 'list', suggested: true },
      { type: 'links',    name: 'Links',       icon: '◈', description: 'Links e referências', layout: 'list', suggested: true },
      { type: 'files',    name: 'Arquivos',    icon: '◆', description: 'Arquivos e PDFs',     layout: 'list', suggested: false },
    ],
  },
]

export function getTemplate(context: WorkspaceContext): ContextTemplate | undefined {
  return CONTEXT_TEMPLATES.find(t => t.context === context)
}
