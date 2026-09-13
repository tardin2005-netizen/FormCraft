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

export default function FirestoreSync() {
  const { user } = useAuth()

  useEffect(() => {
    if (!user?.uid) return
    const uid = user.uid

    const unsubs = [
      onSnapshot(
        query(collection(db, 'users', uid, 'links'), orderBy('savedAt', 'desc')),
        snap => useLinksStore.getState().hydrate(snap.docs.map(d => d.data() as any))
      ),
      onSnapshot(
        collection(db, 'users', uid, 'collections'),
        snap => useCollectionsStore.getState().hydrate(snap.docs.map(d => d.data() as any))
      ),
      onSnapshot(
        collection(db, 'users', uid, 'areas'),
        snap => useAreasStore.getState().hydrate(snap.docs.map(d => d.data() as any))
      ),
      onSnapshot(
        collection(db, 'users', uid, 'areaItems'),
        snap => useAreaItemsStore.getState().hydrate(snap.docs.map(d => d.data() as any))
      ),
      onSnapshot(
        collection(db, 'users', uid, 'hubs'),
        snap => useHubsStore.getState().hydrateHubs(snap.docs.map(d => d.data() as any))
      ),
      onSnapshot(
        collection(db, 'users', uid, 'hubSemesters'),
        snap => useHubsStore.getState().hydrateSemesters(snap.docs.map(d => d.data() as any))
      ),
      onSnapshot(
        collection(db, 'users', uid, 'hubSubjects'),
        snap => useHubsStore.getState().hydrateSubjects(snap.docs.map(d => d.data() as any))
      ),
      onSnapshot(
        collection(db, 'users', uid, 'hubClasses'),
        snap => useHubsStore.getState().hydrateClasses(snap.docs.map(d => d.data() as any))
      ),
      onSnapshot(
        collection(db, 'users', uid, 'hubContents'),
        snap => useHubsStore.getState().hydrateContents(snap.docs.map(d => d.data() as any))
      ),
      onSnapshot(
        doc(db, 'users', uid, 'meta', 'savedTools'),
        snap => {
          if (snap.exists()) useSavedToolsStore.getState().hydrate(snap.data().saved ?? [])
        }
      ),
    ]

    return () => unsubs.forEach(u => u())
  }, [user?.uid])

  return null
}
