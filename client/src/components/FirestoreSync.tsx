import { useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../firebase'
import { collection, onSnapshot, query, orderBy, doc, type QuerySnapshot } from 'firebase/firestore'
import { useLinksStore } from '../store/linksStore'
import { useCollectionsStore } from '../store/collectionsStore'
import { useAreasStore } from '../store/areasStore'
import { useAreaItemsStore } from '../store/areaItemsStore'
import { useHubsStore } from '../store/hubsStore'
import { useSavedToolsStore } from '../store/savedToolsStore'
import { useContentItemsStore } from '../store/contentItemsStore'
import { useTasksStore } from '../store/tasksStore'
import { useLibraryStore } from '../store/libraryStore'
import { useRescueStore } from '../store/rescueStore'

const LOCAL: Record<string, () => unknown[]> = {
  links: () => useLinksStore.getState().links,
  collections: () => useCollectionsStore.getState().collections,
  areas: () => useAreasStore.getState().areas,
  areaItems: () => useAreaItemsStore.getState().items,
  hubs: () => useHubsStore.getState().hubs,
  hubSemesters: () => useHubsStore.getState().semesters,
  hubSubjects: () => useHubsStore.getState().subjects,
  hubClasses: () => useHubsStore.getState().classes,
  hubContents: () => useHubsStore.getState().contents,
  hubChats: () => useHubsStore.getState().hubChats,
  hubChatMessages: () => useHubsStore.getState().hubChatMessages,
  hubConcepts: () => useHubsStore.getState().concepts,
  contentItems: () => useContentItemsStore.getState().items,
  tasks: () => useTasksStore.getState().tasks,
  designPatterns: () => useLibraryStore.getState().patterns,
}

export default function FirestoreSync() {
  const { user } = useAuth()

  useEffect(() => {
    if (!user?.uid) return
    const uid = user.uid

    // Track which collections have received their first snapshot.
    // On first snapshot: only hydrate if Firestore has data (prevents wiping
    // localStorage data that was never uploaded to Firestore).
    // On subsequent snapshots: always hydrate so deletions propagate correctly.
    const initialized = new Set<string>()
    const checked = new Set<string>()
    useRescueStore.getState().load(uid)

    // Before the cloud data replaces this browser's cache, keep a copy of items that exist only here
    // (writes that never reached Firestore). The user decides whether to send them to the cloud.
    function detectLocalOnly(key: string, snap: QuerySnapshot, docs: { id: string }[]) {
      if (checked.has(key) || snap.metadata.fromCache || snap.metadata.hasPendingWrites) return
      checked.add(key)
      const serverIds = new Set(docs.map(d => d.id))
      const local = (LOCAL[key]?.() ?? []) as { id?: string }[]
      const orphans = local.filter(i => i && typeof i.id === 'string' && !serverIds.has(i.id))
      useRescueStore.getState().add(uid, key, orphans as never)
    }

    function safe(key: string, snap: QuerySnapshot, fn: (data: any[]) => void) {
      const docs = snap.docs.map(d => ({ ...d.data(), id: d.id }))
      detectLocalOnly(key, snap, docs)
      if (initialized.has(key)) {
        fn(docs)
      } else {
        initialized.add(key)
        if (docs.length > 0) fn(docs)
      }
    }

    const unsubs = [
      onSnapshot(
        query(collection(db, 'users', uid, 'links'), orderBy('savedAt', 'desc')),
        snap => safe('links', snap, d => useLinksStore.getState().hydrate(d))
      ),
      onSnapshot(
        collection(db, 'users', uid, 'collections'),
        snap => safe('collections', snap, d => useCollectionsStore.getState().hydrate(d))
      ),
      onSnapshot(
        collection(db, 'users', uid, 'areas'),
        snap => safe('areas', snap, d => useAreasStore.getState().hydrate(d))
      ),
      onSnapshot(
        collection(db, 'users', uid, 'areaItems'),
        snap => safe('areaItems', snap, d => useAreaItemsStore.getState().hydrate(d))
      ),
      onSnapshot(
        collection(db, 'users', uid, 'hubs'),
        snap => safe('hubs', snap, d => useHubsStore.getState().hydrateHubs(d))
      ),
      onSnapshot(
        collection(db, 'users', uid, 'hubSemesters'),
        snap => safe('hubSemesters', snap, d => useHubsStore.getState().hydrateSemesters(d))
      ),
      onSnapshot(
        collection(db, 'users', uid, 'hubSubjects'),
        snap => safe('hubSubjects', snap, d => useHubsStore.getState().hydrateSubjects(d))
      ),
      onSnapshot(
        collection(db, 'users', uid, 'hubClasses'),
        snap => safe('hubClasses', snap, d => useHubsStore.getState().hydrateClasses(d))
      ),
      onSnapshot(
        collection(db, 'users', uid, 'hubContents'),
        snap => safe('hubContents', snap, d => useHubsStore.getState().hydrateContents(d))
      ),
      onSnapshot(
        collection(db, 'users', uid, 'hubChats'),
        snap => safe('hubChats', snap, d => useHubsStore.getState().hydrateChats(d))
      ),
      onSnapshot(
        query(collection(db, 'users', uid, 'hubChatMessages'), orderBy('createdAt', 'asc')),
        snap => safe('hubChatMessages', snap, d => useHubsStore.getState().hydrateChatMessages(d))
      ),
      onSnapshot(
        collection(db, 'users', uid, 'hubConcepts'),
        snap => safe('hubConcepts', snap, d => useHubsStore.getState().hydrateConcepts(d))
      ),
      onSnapshot(
        collection(db, 'users', uid, 'designPatterns'),
        snap => {
          const lib = useLibraryStore.getState()
          const docs = snap.docs.map(d => ({ ...d.data(), id: d.id }) as any)
          detectLocalOnly('designPatterns', snap, docs)
          if (docs.length > 0) {
            lib.hydrate(docs)
            if (!snap.metadata.fromCache) lib.upgradeDefaults()
            return
          }
          if (snap.metadata.fromCache) return
          if (lib.seeded) lib.hydrate([])
          else lib.seedDefaults()
        }
      ),
      onSnapshot(
        doc(db, 'users', uid, 'meta', 'savedTools'),
        snap => {
          if (snap.exists()) useSavedToolsStore.getState().hydrate(snap.data().saved ?? [])
        }
      ),
      onSnapshot(
        collection(db, 'users', uid, 'contentItems'),
        snap => safe('contentItems', snap, d => useContentItemsStore.getState().hydrate(d))
      ),
      onSnapshot(
        collection(db, 'users', uid, 'tasks'),
        snap => safe('tasks', snap, d => useTasksStore.getState().hydrate(d))
      ),
    ]

    return () => unsubs.forEach(u => u())
  }, [user?.uid])

  return null
}
