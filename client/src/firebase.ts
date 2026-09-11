import { initializeApp, getApps } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

// ⚠️  Preencha com as credenciais do seu projeto no Firebase Console
// https://console.firebase.google.com  →  Configurações do projeto  →  SDK
const firebaseConfig = {
  apiKey:            'COLE_AQUI',
  authDomain:        'COLE_AQUI',
  projectId:         'COLE_AQUI',
  storageBucket:     'COLE_AQUI',
  messagingSenderId: 'COLE_AQUI',
  appId:             'COLE_AQUI',
}

// Evita reinicializar se já foi feito (hot-reload)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

export const db   = getFirestore(app)
export const auth = getAuth(app)
export default app
