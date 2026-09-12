import { initializeApp, getApps } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

// ⚠️  Preencha com as credenciais do seu projeto no Firebase Console
// https://console.firebase.google.com  →  Configurações do projeto  →  SDK
const firebaseConfig = {
  apiKey:            'AIzaSyBuxbDmXScjOLBhXCKIVNeL6M3Ko_fo3c0',
  authDomain:        'formcraft-52279.firebaseapp.com',
  projectId:         'formcraft-52279',
  storageBucket:     'formcraft-52279.firebasestorage.app',
  messagingSenderId: '1064130114255',
  appId:             '1:1064130114255:web:1a1943a05d9c814e0dfdba',
  measurementId:     'G-Y4KJ8GSSRT',
}

// Evita reinicializar se já foi feito (hot-reload)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

export const db   = getFirestore(app)
export const auth = getAuth(app)
export default app
