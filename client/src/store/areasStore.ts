import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Area {
  id: string
  emoji: string
  title: string
  desc: string
  count: number
  color: string
}

const INITIAL: Area[] = [
  { id: 'ux',         emoji: '🎨', title: 'UX & Design',    desc: 'Referências, sistemas, tipografia', count: 24, color: '#7c6ef7' },
  { id: 'dev',        emoji: '💻', title: 'Desenvolvimento', desc: 'Docs, snippets, repositórios',       count: 18, color: '#4f8ef7' },
  { id: 'faculdade',  emoji: '📚', title: 'Faculdade',       desc: 'Aulas, briefings, ADOs',             count: 31, color: '#3ecf8e' },
  { id: 'musica',     emoji: '🎵', title: 'Música',          desc: 'Referências, playlists',             count:  9, color: '#f78c4f' },
  { id: 'negocios',   emoji: '💼', title: 'Negócios',        desc: 'Estratégia, mercado',                count: 15, color: '#e46ef7' },
  { id: 'pessoal',    emoji: '🌱', title: 'Pessoal',         desc: 'Objetivos, reflexões',               count:  7, color: '#facc15' },
]

interface AreasStore {
  areas: Area[]
  addArea: (a: Omit<Area, 'id' | 'count'>) => void
}

export const useAreasStore = create<AreasStore>()(
  persist(
    (set) => ({
      areas: INITIAL,
      addArea: (a) =>
        set((state) => ({
          areas: [
            ...state.areas,
            { ...a, id: a.title.toLowerCase().replace(/\s+/g, '-'), count: 0 },
          ],
        })),
    }),
    { name: 'formcraft-areas' }
  )
)
