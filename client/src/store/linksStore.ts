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
  type: 'link' | 'pdf' | 'nota' | 'imagem'
  savedAt: number
}

interface LinksStore {
  links: SavedLink[]
  addLink: (link: Omit<SavedLink, 'id' | 'savedAt'>) => void
  removeLink: (id: string) => void
}

export const useLinksStore = create<LinksStore>()(
  persist(
    (set) => ({
      links: [],
      addLink: (link) => set(s => ({
        links: [
          { ...link, id: Date.now().toString(), savedAt: Date.now() },
          ...s.links,
        ]
      })),
      removeLink: (id) => set(s => ({ links: s.links.filter(l => l.id !== id) })),
    }),
    { name: 'formcraft-links' }
  )
)
