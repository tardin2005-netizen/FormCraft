import { useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../firebase'
import { collection, onSnapshot, query, orderBy, doc } from 'firebase/firestore'
import { useLinksStore } from '../store/linksStore'
import { useCollectionsStore } from '../store/collectionsStore'
import { useAreasStore } from '../store/areasStore'
import { useAreaItemsStore } from '../store/areaItemsStore'
import { useHubsStore } from '../store/hubsStore'
import { useSavedToolsStore } from '../store/savedToolsStore'
import { useWorkspacesStore } from '../store/workspacesStore'
import { useContentItemsStore } from '../store/contentItemsStore'

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

    function safe<T>(key: string, docs: T[], fn: (data: T[]) => void) {
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
        snap => safe('links', snap.docs.map(d => d.data() as any), d => useLinksStore.getState().hydrate(d))
      ),
      onSnapshot(
        collection(db, 'users', uid, 'collections'),
        snap => safe('collections', snap.docs.map(d => d.data() as any), d => useCollectionsStore.getState().hydrate(d))
      ),
      onSnapshot(
        collection(db, 'users', uid, 'areas'),
        snap => safe('areas', snap.docs.map(d => d.data() as any), d => useAreasStore.getState().hydrate(d))
      ),
      onSnapshot(
        collection(db, 'users', uid, 'areaItems'),
        snap => safe('areaItems', snap.docs.map(d => d.data() as any), d => useAreaItemsStore.getState().hydrate(d))
      ),
      onSnapshot(
        collection(db, 'users', uid, 'hubs'),
        snap => safe('hubs', snap.docs.map(d => d.data() as any), d => useHubsStore.getState().hydrateHubs(d))
      ),
      onSnapshot(
        collection(db, 'users', uid, 'hubSemesters'),
        snap => safe('hubSemesters', snap.docs.map(d => d.data() as any), d => useHubsStore.getState().hydrateSemesters(d))
      ),
      onSnapshot(
        collection(db, 'users', uid, 'hubSubjects'),
        snap => safe('hubSubjects', snap.docs.map(d => d.data() as any), d => useHubsStore.getState().hydrateSubjects(d))
      ),
      onSnapshot(
        collection(db, 'users', uid, 'hubClasses'),
        snap => safe('hubClasses', snap.docs.map(d => d.data() as any), d => useHubsStore.getState().hydrateClasses(d))
      ),
      onSnapshot(
        collection(db, 'users', uid, 'hubContents'),
        snap => safe('hubContents', snap.docs.map(d => d.data() as any), d => useHubsStore.getState().hydrateContents(d))
      ),
      onSnapshot(
        doc(db, 'users', uid, 'meta', 'savedTools'),
        snap => {
          if (snap.exists()) useSavedToolsStore.getState().hydrate(snap.data().saved ?? [])
        }
      ),
      onSnapshot(
        collection(db, 'users', uid, 'workspaces'),
        snap => safe('workspaces', snap.docs.map(d => d.data() as any), d => useWorkspacesStore.getState().hydrate(d))
      ),
      onSnapshot(
        collection(db, 'users', uid, 'contentItems'),
        snap => safe('contentItems', snap.docs.map(d => d.data() as any), d => useContentItemsStore.getState().hydrate(d))
      ),
    ]

    return () => unsubs.forEach(u => u())
  }, [user?.uid])

  return null
}
