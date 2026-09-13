import type { WorkspaceModule } from '../store/workspacesStore'
import type { ContentItem } from '../store/contentItemsStore'

export interface ModuleProps {
  module: WorkspaceModule
  workspaceId: string
  items: ContentItem[]
  addItem: (item: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt'>) => ContentItem
  removeItem: (id: string) => void
  toggleStar: (id: string) => void
}
