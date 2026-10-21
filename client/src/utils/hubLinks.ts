import type { SavedLink } from '../store/linksStore'
import type { ContentItem } from '../store/contentItemsStore'

export type LinkData = { title?: string; content?: string; color?: string; tags?: string; desc?: string; ogImage?: string; metaTried?: boolean }

const normalizeUrl = (url: string) => (!url ? '' : url.startsWith('http') ? url : `https://${url}`)
const domainOf = (url: string) => {
  try { return new URL(normalizeUrl(url)).hostname.replace(/^www\./, '') } catch { return url }
}

/** Links guardados dentro de um hub viram "SavedLink" para aparecerem com o mesmo cartão do Inbox. */
export function isHubLink(item: Pick<ContentItem, 'contentType'>) {
  return (item.contentType as string) === 'links'
}

export function hubLinkToSaved(item: ContentItem): SavedLink {
  const d = item.data as LinkData
  const url = normalizeUrl(d.content || d.title || '')
  const domain = domainOf(url)
  return {
    id: item.id,
    url: url || '#',
    title: d.title || domain,
    desc: d.desc || '',
    ogImage: d.ogImage || undefined,
    favicon: domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64` : '',
    areaId: '',
    tags: item.tags,
    type: 'link',
    savedAt: Date.parse(item.createdAt) || Date.now(),
    color: d.color || undefined,
  }
}

/** Traduz o que o modal de edição do Inbox devolve para o formato guardado no hub. */
export function savedPatchToHubLink(item: ContentItem, patch: Partial<Omit<SavedLink, 'id' | 'savedAt'>>): Partial<ContentItem> {
  const d = item.data as LinkData
  const tags = (patch.tags ?? item.tags).map(t => t.replace(/^#+/, ''))
  return {
    data: { ...d, title: patch.title ?? d.title ?? '', content: patch.url ?? d.content ?? '', desc: patch.desc ?? d.desc ?? '' },
    tags,
  }
}
