import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Collection {
  id: string
  name: string
  emoji: string
  color: string
  desc: string
  itemIds: string[]
  createdAt: number
}

const DEFAULT: Collection[] = [
  {
    id: 'col-1', name: 'Referências de UX', emoji: '🎨', color: '#a259ff',
    desc: 'Artigos, heurísticas e guias de design de interfaces.',
    itemIds: ['demo-1', 'demo-2', 'demo-5'], createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'col-2', name: 'Dev Tools', emoji: '⚙️', color: '#3178c6',
    desc: 'Bibliotecas, documentações e snippets de desenvolvimento.',
    itemIds: ['demo-3', 'demo-7', 'demo-8'], createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'col-3', name: 'Prompts de IA', emoji: '🤖', color: '#7c3aed',
    desc: 'Prompts reutilizáveis para geração de conteúdo e código.',
    itemIds: ['demo-6'], createdAt: Date.now() - 86400000,
  },
  {
    id: 'col-4', name: 'TCC & Faculdade', emoji: '🎓', color: '#f59e0b',
    desc: 'Material de estudo, artigos e rascunhos do trabalho de conclusão.',
    itemIds: ['demo-4'], createdAt: Date.now() - 3600000 * 12,
  },
]

interface CollectionsStore {
  collections: Collection[]
  addCollection: (c: Omit<Collection, 'id' | 'createdAt'>) => void
  removeCollection: (id: string) => void
  addItemToCollection: (colId: string, itemId: string) => void
  removeItemFromCollection: (colId: string, itemId: string) => void
}

export const useCollectionsStore = create<CollectionsStore>()(
  persist(
    (set, get) => ({
      collections: get?.()?.collections?.length ? get().collections : DEFAULT,
      addCollection: (c) => set(s => ({
        collections: [...s.collections, { ...c, id: `col-${Date.now()}`, createdAt: Date.now() }]
      })),
      removeCollection: (id) => set(s => ({ collections: s.collections.filter(c => c.id !== id) })),
      addItemToCollection: (colId, itemId) => set(s => ({
        collections: s.collections.map(c =>
          c.id === colId && !c.itemIds.includes(itemId)
            ? { ...c, itemIds: [...c.itemIds, itemId] }
            : c
        )
      })),
      removeItemFromCollection: (colId, itemId) => set(s => ({
        collections: s.collections.map(c =>
          c.id === colId ? { ...c, itemIds: c.itemIds.filter(i => i !== itemId) } : c
        )
      })),
    }),
    {
      name: 'formcraft-collections',
      onRehydrateStorage: () => (state) => {
        if (state && state.collections.length === 0) state.collections = DEFAULT
      },
    }
  )
)
