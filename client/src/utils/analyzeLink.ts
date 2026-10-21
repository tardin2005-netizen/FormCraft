import { getFunctions, httpsCallable } from 'firebase/functions'
import app from '../firebase'

export interface LinkMeta { title: string; desc: string; image: string }

const analyzeLinkFn = httpsCallable<{ url: string }, LinkMeta>(getFunctions(app, 'us-central1'), 'analyzeLink')

/** Mesma análise do Inbox: título, descrição e imagem da página. Devolve null se falhar. */
export async function analyzeLink(url: string): Promise<LinkMeta | null> {
  if (!url.startsWith('http')) return null
  try {
    return (await analyzeLinkFn({ url })).data
  } catch {
    return null
  }
}
