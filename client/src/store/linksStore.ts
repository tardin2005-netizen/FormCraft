import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface SavedLink {
  id: string
  url: string
  title: string
  desc: string
  favicon: string
  areaId: string
  tags: string[]
  type: 'link' | 'pdf' | 'nota' | 'imagem' | 'prompt'
  savedAt: number
  color?: string
}

const DEMO_LINKS: SavedLink[] = [
  {
    id: 'demo-1', type: 'link', savedAt: Date.now() - 3600000 * 2,
    url: 'https://www.nngroup.com/articles/ten-usability-heuristics/',
    title: '10 Usability Heuristics — Nielsen Norman',
    desc: 'Jakob Nielsen\'s 10 general principles for interaction design.',
    favicon: 'https://www.google.com/s2/favicons?domain=nngroup.com&sz=32',
    areaId: 'ux', tags: ['ux', 'heurísticas', 'referência'], color: '#a259ff',
  },
  {
    id: 'demo-2', type: 'pdf', savedAt: Date.now() - 3600000 * 5,
    url: '#',
    title: 'Metodologia de Pesquisa UX.pdf',
    desc: 'Guia completo de métodos qualitativos e quantitativos para pesquisa com usuários.',
    favicon: '📄',
    areaId: 'ux', tags: ['pesquisa', 'ux', 'metodologia'], color: '#ff4081',
  },
  {
    id: 'demo-3', type: 'link', savedAt: Date.now() - 3600000 * 8,
    url: 'https://react.dev',
    title: 'React — The Library for Web and Native User Interfaces',
    desc: 'Documentação oficial do React 18. Hooks, composição e performance.',
    favicon: 'https://www.google.com/s2/favicons?domain=react.dev&sz=32',
    areaId: 'dev', tags: ['react', 'frontend', 'docs'], color: '#61dafb',
  },
  {
    id: 'demo-4', type: 'nota', savedAt: Date.now() - 3600000 * 24,
    url: '#',
    title: 'Ideias para apresentação do TCC',
    desc: 'Usar storytelling visual. Mostrar jornada do usuário antes/depois. Slides minimalistas, tipografia grande.',
    favicon: '📝',
    areaId: 'faculdade', tags: ['tcc', 'apresentação', 'ideia'], color: '#f59e0b',
  },
  {
    id: 'demo-5', type: 'imagem', savedAt: Date.now() - 3600000 * 26,
    url: 'https://dribbble.com',
    title: 'Moodboard — Dashboard Dark UI',
    desc: 'Referências visuais de dashboards escuros com acentos em roxo.',
    favicon: 'https://www.google.com/s2/favicons?domain=dribbble.com&sz=32',
    areaId: 'ux', tags: ['moodboard', 'dark ui', 'design'], color: '#ea4c89',
  },
  {
    id: 'demo-6', type: 'prompt', savedAt: Date.now() - 3600000 * 48,
    url: '#',
    title: 'Prompt — Gerador de paleta de cores',
    desc: 'Gere uma paleta com 5 cores para marca {tipo}. Retorne em HEX com nome e uso sugerido.',
    favicon: '🤖',
    areaId: 'ux', tags: ['prompt', 'ia', 'design'], color: '#7c3aed',
  },
  {
    id: 'demo-7', type: 'link', savedAt: Date.now() - 3600000 * 72,
    url: 'https://typescriptlang.org',
    title: 'TypeScript Handbook',
    desc: 'Documentação oficial. Tipos, interfaces, generics, utility types.',
    favicon: 'https://www.google.com/s2/favicons?domain=typescriptlang.org&sz=32',
    areaId: 'dev', tags: ['typescript', 'docs', 'frontend'], color: '#3178c6',
  },
  {
    id: 'demo-8', type: 'link', savedAt: Date.now() - 3600000 * 96,
    url: 'https://framer.com/motion',
    title: 'Framer Motion — Production-ready animation library',
    desc: 'Biblioteca de animação para React. spring, variants, AnimatePresence.',
    favicon: 'https://www.google.com/s2/favicons?domain=framer.com&sz=32',
    areaId: 'dev', tags: ['animação', 'react', 'framer'], color: '#0e0e0e',
  },
]

interface LinksStore {
  links: SavedLink[]
  addLink: (link: Omit<SavedLink, 'id' | 'savedAt'>) => void
  removeLink: (id: string) => void
}

export const useLinksStore = create<LinksStore>()(
  persist(
    (set, get) => ({
      links: get?.()?.links?.length ? get().links : DEMO_LINKS,
      addLink: (link) => set(s => ({
        links: [
          { ...link, id: Date.now().toString(), savedAt: Date.now() },
          ...s.links,
        ]
      })),
      removeLink: (id) => set(s => ({ links: s.links.filter(l => l.id !== id) })),
    }),
    {
      name: 'formcraft-links',
      onRehydrateStorage: () => (state) => {
        if (state && state.links.length === 0) {
          state.links = DEMO_LINKS
        }
      },
    }
  )
)
