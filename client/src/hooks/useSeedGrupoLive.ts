import { useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useHubsStore } from '../store/hubsStore'
import { useContentItemsStore } from '../store/contentItemsStore'

export const GRUPO_LIVE_TAB = 'grupo-live'
const SEED_KEY = 'formcraft-seed-grupo-live-v1'
const HUB_ID = '83b8b5a9-3cad-45f5-b780-edcb97fd126c'

const EMAIL = 'Livstar.ag@gmail.com'
const PASS_A = 'Livstar@2026'
const PASS_B = 'Livstar@ag'

const login = (rede: string) =>
  `${rede} — Live Star\nE-mail: ${EMAIL}\nSenha possível 1: ${PASS_A}\nSenha possível 2: ${PASS_B}\nObs: testar as duas na usabilidade`

const SEEDS = [
  { title: 'Grupo Live — Live Star', category: 'Outro', tags: ['grupo live', 'agência'],
    body: 'Empresa dos projetos da faculdade: Grupo Live\nNome da agência: Live Star (Live, sem o "E" em Livstar nos acessos)' },
  { title: 'Gmail — Live Star', category: 'Acesso', tags: ['email', 'gmail', 'acesso'],
    body: `E-mail: ${EMAIL}\nSenha possível 1: ${PASS_A}\nSenha possível 2: ${PASS_B}\nUsado nas contas do Instagram e TikTok` },
  { title: 'Instagram — Live Star', category: 'Acesso', tags: ['instagram', 'acesso'], body: login('Instagram') },
  { title: 'TikTok — Live Star', category: 'Acesso', tags: ['tiktok', 'acesso'], body: login('TikTok') },
]

export function useSeedGrupoLive() {
  const { user } = useAuth()
  const subjects = useHubsStore(s => s.subjects)
  const { items, addItem } = useContentItemsStore()

  useEffect(() => {
    if (!user || localStorage.getItem(SEED_KEY)) return
    // Wait for Firestore hydration (faculdade hub has 15+ subjects)
    if (subjects.filter(s => s.hubId === HUB_ID).length < 15) return
    const moduleId = `hub-${HUB_ID}-${GRUPO_LIVE_TAB}`
    if (!items.some(i => i.moduleId === moduleId)) {
      for (const sd of SEEDS) {
        addItem({
          workspaceId: HUB_ID, moduleId, contentType: 'snippets',
          data: { title: sd.title, body: sd.body, category: sd.category, tags: sd.tags.join(', ') },
          tags: sd.tags, starred: false,
        })
      }
    }
    localStorage.setItem(SEED_KEY, '1')
  }, [user, subjects, items, addItem])
}
